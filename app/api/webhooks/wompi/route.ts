import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { validateWebhookChecksum } from '@/lib/wompi/client';
import type { WompiWebhookPayload } from '@/lib/wompi/client';
import type { PlanKey, BillingInterval } from '@/lib/lemonsqueezy/client';

/**
 * POST /api/webhooks/wompi
 *
 * Wompi genera su propia reference para payment links (ej: "NmsoyG_1774144150_lvOuF203u").
 * El primer segmento antes del "_" es el payment link ID.
 * Usamos la tabla pending_checkouts para mapear linkId → usuario+plan.
 */
export async function POST(req: NextRequest) {
  const payload = await req.json() as WompiWebhookPayload;

  if (!validateWebhookChecksum(payload)) {
    console.error('[wompi-webhook] checksum inválido');
    return NextResponse.json({ error: 'Invalid checksum' }, { status: 400 });
  }

  if (payload.event !== 'transaction.updated') {
    return NextResponse.json({ ok: true });
  }

  const { transaction } = payload.data;

  // Extraer payment link ID del reference (formato Wompi: "{linkId}_{timestamp}_{random}")
  const linkId = transaction.reference.split('_')[0];

  // Buscar el pending checkout para saber a qué usuario y plan corresponde
  const { data: pending } = await supabaseAdmin
    .from('pending_checkouts')
    .select('user_id, plan_key, billing_interval')
    .eq('id', linkId)
    .maybeSingle();

  if (!pending) {
    console.error('[wompi-webhook] no pending checkout para linkId:', linkId, '| ref:', transaction.reference);
    return NextResponse.json({ error: 'Unknown payment link' }, { status: 400 });
  }

  const { user_id: userId, plan_key: plan, billing_interval: interval } = pending;

  // Si el pago fue rechazado, marcar past_due
  if (transaction.status === 'DECLINED' || transaction.status === 'ERROR') {
    await supabaseAdmin
      .from('subscriptions')
      .update({ status: 'past_due', updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .in('status', ['active']);
    return NextResponse.json({ ok: true });
  }

  if (transaction.status !== 'APPROVED') {
    return NextResponse.json({ ok: true });
  }

  // Calcular fin del período
  const now = new Date();
  const periodEnd = new Date(now);
  if (interval === 'monthly') {
    periodEnd.setDate(periodEnd.getDate() + 30);
  } else {
    periodEnd.setDate(periodEnd.getDate() + 365);
  }

  const updateData = {
    plan_key:                  plan as PlanKey,
    billing_interval:          interval as BillingInterval,
    status:                    'active' as const,
    processor_subscription_id: transaction.id,
    processor_customer_id:     transaction.customer_email,
    variant_id:                `wompi-${plan}-${interval}`,
    current_period_end:        periodEnd.toISOString(),
    customer_portal_url:       null as string | null,
    ...(transaction.payment_source_id
      ? { wompi_payment_source_id: transaction.payment_source_id }
      : {}),
    updated_at: now.toISOString(),
  };

  // Upsert suscripción
  const { data: existing } = await supabaseAdmin
    .from('subscriptions')
    .select('id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) {
    const { error } = await supabaseAdmin
      .from('subscriptions')
      .update(updateData)
      .eq('id', existing.id);
    if (error) {
      console.error('[wompi-webhook] error actualizando:', error);
      return NextResponse.json({ error: 'DB error' }, { status: 500 });
    }
  } else {
    const { error } = await supabaseAdmin
      .from('subscriptions')
      .insert({ user_id: userId, ...updateData });
    if (error) {
      console.error('[wompi-webhook] error insertando:', error);
      return NextResponse.json({ error: 'DB error' }, { status: 500 });
    }
  }

  console.log(`[wompi-webhook] ✓ ${userId} → ${plan} (${interval}) hasta ${periodEnd.toISOString()}`);
  return NextResponse.json({ ok: true });
}
