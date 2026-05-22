import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { verifyWebhookSignature } from '@/lib/paypal/client';
import type { PayPalWebhookEvent } from '@/lib/paypal/client';
import type { PlanKey, BillingInterval } from '@/lib/lemonsqueezy/client';

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  const headers: Record<string, string> = {
    'paypal-auth-algo':        req.headers.get('paypal-auth-algo')        ?? '',
    'paypal-cert-url':         req.headers.get('paypal-cert-url')         ?? '',
    'paypal-transmission-id':  req.headers.get('paypal-transmission-id')  ?? '',
    'paypal-transmission-sig': req.headers.get('paypal-transmission-sig') ?? '',
    'paypal-transmission-time':req.headers.get('paypal-transmission-time')?? '',
  };

  const isValid = await verifyWebhookSignature(headers, rawBody);
  if (!isValid) {
    console.error('[paypal-webhook] firma inválida');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const event    = JSON.parse(rawBody) as PayPalWebhookEvent;
  const resource = event.resource;

  console.log(`[paypal-webhook] ${event.event_type}`);

  switch (event.event_type) {
    case 'BILLING.SUBSCRIPTION.ACTIVATED':
      await handleActivated(resource);
      break;
    case 'PAYMENT.SALE.COMPLETED':
      await handlePaymentCompleted(resource);
      break;
    case 'BILLING.SUBSCRIPTION.CANCELLED':
    case 'BILLING.SUBSCRIPTION.EXPIRED':
    case 'BILLING.SUBSCRIPTION.SUSPENDED':
      await handleEnded(resource, event.event_type);
      break;
    default:
      // Evento no manejado — ignorar silenciosamente
      break;
  }

  return NextResponse.json({ ok: true });
}

// custom_id formato: "{userId}|{plan}|{interval}"
function parseCustomId(customId: string): { userId: string; plan: PlanKey; interval: BillingInterval } | null {
  const parts = customId.split('|');
  if (parts.length !== 3) return null;
  const [userId, plan, interval] = parts;
  if (!['starter', 'pro', 'zenmode'].includes(plan!)) return null;
  if (!['monthly', 'annual'].includes(interval!))      return null;
  return { userId: userId!, plan: plan as PlanKey, interval: interval as BillingInterval };
}

async function handleActivated(resource: Record<string, unknown>) {
  const subscriptionId = resource.id as string;
  const customId       = resource.custom_id as string;
  const subscriber     = resource.subscriber as { email_address: string; payer_id?: string };
  const billingInfo    = resource.billing_info as { next_billing_time?: string } | undefined;

  const parsed = parseCustomId(customId);
  if (!parsed) {
    console.error('[paypal-webhook] custom_id inválido:', customId);
    return;
  }

  const { userId, plan, interval } = parsed;
  const now = new Date();

  const periodEnd = billingInfo?.next_billing_time
    ? new Date(billingInfo.next_billing_time)
    : new Date(now.getTime() + (interval === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000);

  const updateData = {
    plan_key:                  plan,
    billing_interval:          interval,
    status:                    'active' as const,
    processor_subscription_id: subscriptionId,
    processor_customer_id:     subscriber.payer_id ?? subscriber.email_address,
    variant_id:                `paypal-${plan}-${interval}`,
    current_period_end:        periodEnd.toISOString(),
    customer_portal_url:       null as string | null,
    updated_at:                now.toISOString(),
  };

  const { data: existing } = await supabaseAdmin
    .from('subscriptions')
    .select('id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) {
    const { error } = await supabaseAdmin.from('subscriptions').update(updateData).eq('id', existing.id);
    if (error) console.error('[paypal-webhook] error actualizando:', error);
  } else {
    const { error } = await supabaseAdmin.from('subscriptions').insert({ user_id: userId, ...updateData });
    if (error) console.error('[paypal-webhook] error insertando:', error);
  }

  console.log(`[paypal-webhook] ✓ activated ${userId} → ${plan} (${interval}) hasta ${periodEnd.toISOString()}`);
}

async function handlePaymentCompleted(resource: Record<string, unknown>) {
  // billing_agreement_id = subscriptionId de PayPal en renovaciones
  const billingAgreementId = resource.billing_agreement_id as string | undefined;
  if (!billingAgreementId) return;

  const { data: sub } = await supabaseAdmin
    .from('subscriptions')
    .select('id, billing_interval')
    .eq('processor_subscription_id', billingAgreementId)
    .maybeSingle();

  if (!sub) {
    console.warn('[paypal-webhook] suscripción no encontrada para:', billingAgreementId);
    return;
  }

  const newEnd = new Date();
  newEnd.setDate(newEnd.getDate() + (sub.billing_interval === 'monthly' ? 30 : 365));

  await supabaseAdmin
    .from('subscriptions')
    .update({ status: 'active', current_period_end: newEnd.toISOString(), updated_at: new Date().toISOString() })
    .eq('id', sub.id);

  console.log(`[paypal-webhook] ✓ renovada ${billingAgreementId} hasta ${newEnd.toISOString()}`);
}

async function handleEnded(resource: Record<string, unknown>, eventType: string) {
  const subscriptionId = resource.id as string;
  const statusMap: Record<string, string> = {
    'BILLING.SUBSCRIPTION.CANCELLED':  'cancelled',
    'BILLING.SUBSCRIPTION.EXPIRED':    'expired',
    'BILLING.SUBSCRIPTION.SUSPENDED':  'past_due',
  };

  const { error } = await supabaseAdmin
    .from('subscriptions')
    .update({ status: statusMap[eventType] ?? 'cancelled', updated_at: new Date().toISOString() })
    .eq('processor_subscription_id', subscriptionId);

  if (error) console.error('[paypal-webhook] error actualizando estado:', error);
  else console.log(`[paypal-webhook] ✓ ${subscriptionId} → ${statusMap[eventType]}`);
}
