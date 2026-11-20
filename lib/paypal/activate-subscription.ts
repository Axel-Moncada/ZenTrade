import { supabaseAdmin } from '@/lib/supabase/admin';
import { cancelSubscription, getSubscription } from '@/lib/paypal/client';
import type { PlanKey, BillingInterval } from '@/lib/lemonsqueezy/client';

/**
 * Activación de suscripciones de PayPal, compartida por:
 * - el webhook (BILLING.SUBSCRIPTION.ACTIVATED), y
 * - la confirmación al volver de PayPal (/api/paypal/confirm).
 *
 * Antes la activación dependía solo del webhook. Si el webhook fallaba
 * (firma, PAYPAL_WEBHOOK_ID, URL mal registrada), el cliente pagaba y su plan
 * no cambiaba. Con dos caminos idempotentes, basta con que uno funcione.
 */

export interface ParsedCustomId {
  userId: string;
  plan: PlanKey;
  interval: BillingInterval;
}

// custom_id formato: "{userId}|{plan}|{interval}"
export function parseCustomId(customId: string | undefined | null): ParsedCustomId | null {
  if (!customId) return null;
  const parts = customId.split('|');
  if (parts.length !== 3) return null;
  const [userId, plan, interval] = parts;
  if (!userId || !plan || !interval) return null;
  if (!['starter', 'pro', 'zenmode'].includes(plan)) return null;
  if (!['monthly', 'annual'].includes(interval)) return null;
  return { userId, plan: plan as PlanKey, interval: interval as BillingInterval };
}

export interface ActivationInput {
  subscriptionId: string;
  customId: string | undefined | null;
  payerId?: string | null;
  payerEmail?: string | null;
  nextBillingTime?: string | null;
}

export type ActivationResult =
  | { ok: true; userId: string; plan: PlanKey; interval: BillingInterval; periodEnd: string; alreadyActive: boolean }
  | { ok: false; reason: 'INVALID_CUSTOM_ID' | 'DB_ERROR' };

const PLAN_RANK: Record<string, number> = { free: 0, starter: 1, pro: 2, zenmode: 3 };

/**
 * Un admin puede subir a un cliente de plan a mano (variant_id 'manual_override…').
 * Los eventos de PayPal de esa suscripción extienden fechas, pero no bajan el plan.
 */
export function resolvePlanWithOverride(
  existing: { plan_key: string | null; variant_id: string | null } | null,
  incoming: PlanKey,
): { plan: PlanKey; keepVariant: boolean } {
  if (!existing?.variant_id?.startsWith('manual_override')) return { plan: incoming, keepVariant: false };
  const current = existing.plan_key ?? 'free';
  if ((PLAN_RANK[current] ?? 0) > (PLAN_RANK[incoming] ?? 0)) {
    return { plan: current as PlanKey, keepVariant: true };
  }
  return { plan: incoming, keepVariant: false };
}

function isPayPalSubscriptionId(id: string | null | undefined): id is string {
  return typeof id === 'string' && id.startsWith('I-');
}

export async function activatePayPalSubscription(input: ActivationInput): Promise<ActivationResult> {
  const parsed = parseCustomId(input.customId);
  if (!parsed) {
    console.error('[paypal] custom_id inválido:', input.customId);
    return { ok: false, reason: 'INVALID_CUSTOM_ID' };
  }
  const { userId, plan, interval } = parsed;
  const now = new Date();
  const periodEnd = input.nextBillingTime
    ? new Date(input.nextBillingTime)
    : new Date(now.getTime() + (interval === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000);

  // ¿Ya está registrada esta misma suscripción? (webhook y confirmación pueden llegar ambos)
  const { data: same } = await supabaseAdmin
    .from('subscriptions')
    .select('id, status, plan_key, variant_id')
    .eq('processor_subscription_id', input.subscriptionId)
    .maybeSingle();

  const updateData = {
    plan_key: plan,
    billing_interval: interval,
    status: 'active' as const,
    processor_subscription_id: input.subscriptionId,
    processor_customer_id: input.payerId ?? input.payerEmail ?? null,
    variant_id: `paypal-${plan}-${interval}`,
    current_period_end: periodEnd.toISOString(),
    customer_portal_url: null as string | null,
    updated_at: now.toISOString(),
  };

  if (same) {
    const resolved = resolvePlanWithOverride(same, plan);
    const alreadyActive = same.status === 'active' && same.plan_key === resolved.plan;
    const { error } = await supabaseAdmin.from('subscriptions').update({
      ...updateData,
      plan_key: resolved.plan,
      variant_id: resolved.keepVariant ? same.variant_id : updateData.variant_id,
    }).eq('id', same.id);
    if (error) {
      console.error('[paypal] error actualizando suscripción existente:', error);
      return { ok: false, reason: 'DB_ERROR' };
    }
    return { ok: true, userId, plan: resolved.plan, interval, periodEnd: periodEnd.toISOString(), alreadyActive };
  }

  // Suscripción nueva: se reutiliza la fila más reciente del usuario (upgrade/downgrade)
  const { data: previous } = await supabaseAdmin
    .from('subscriptions')
    .select('id, processor_subscription_id, status, plan_key, variant_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  let finalPlan: PlanKey = plan;
  if (previous) {
    // Solo se respeta el upgrade manual si la fila sigue vigente
    const stillActive = previous.status === 'active';
    const resolved = stillActive ? resolvePlanWithOverride(previous, plan) : { plan, keepVariant: false };
    finalPlan = resolved.plan;
    const { error } = await supabaseAdmin.from('subscriptions').update({
      ...updateData,
      plan_key: resolved.plan,
      variant_id: resolved.keepVariant ? previous.variant_id : updateData.variant_id,
    }).eq('id', previous.id);
    if (error) {
      console.error('[paypal] error actualizando:', error);
      return { ok: false, reason: 'DB_ERROR' };
    }
    // Evitar doble cobro: al cambiar de plan, cancelar la suscripción anterior en PayPal
    const oldId = previous.processor_subscription_id;
    if (isPayPalSubscriptionId(oldId) && oldId !== input.subscriptionId) {
      try {
        await cancelSubscription(oldId);
        console.log(`[paypal] suscripción anterior ${oldId} cancelada tras el cambio de plan`);
      } catch (err) {
        console.error(`[paypal] no se pudo cancelar la suscripción anterior ${oldId}:`, err);
      }
    }
  } else {
    const { error } = await supabaseAdmin.from('subscriptions').insert({ user_id: userId, ...updateData });
    if (error) {
      console.error('[paypal] error insertando:', error);
      return { ok: false, reason: 'DB_ERROR' };
    }
  }

  console.log(`[paypal] ✓ activada ${userId} → ${finalPlan} (${interval}) hasta ${periodEnd.toISOString()}`);
  return { ok: true, userId, plan: finalPlan, interval, periodEnd: periodEnd.toISOString(), alreadyActive: false };
}

/**
 * Consulta a PayPal el estado real de una suscripción y, si está activa,
 * la registra. Solo acepta suscripciones cuyo custom_id pertenece a `expectedUserId`.
 */
export async function confirmPayPalSubscriptionForUser(
  subscriptionId: string,
  expectedUserId: string,
): Promise<ActivationResult | { ok: false; reason: 'NOT_ACTIVE' | 'NOT_OWNER' | 'PAYPAL_ERROR' }> {
  let details;
  try {
    details = await getSubscription(subscriptionId);
  } catch (err) {
    console.error('[paypal] error consultando suscripción:', err);
    return { ok: false, reason: 'PAYPAL_ERROR' };
  }

  const parsed = parseCustomId(details.custom_id);
  if (!parsed || parsed.userId !== expectedUserId) return { ok: false, reason: 'NOT_OWNER' };
  if (details.status !== 'ACTIVE') return { ok: false, reason: 'NOT_ACTIVE' };

  return activatePayPalSubscription({
    subscriptionId: details.id,
    customId: details.custom_id,
    payerId: details.subscriber?.payer_id ?? null,
    payerEmail: details.subscriber?.email_address ?? null,
    nextBillingTime: details.billing_info?.next_billing_time ?? null,
  });
}
