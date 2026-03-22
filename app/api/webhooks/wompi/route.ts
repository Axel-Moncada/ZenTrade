import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { validateWebhookChecksum, parseReference } from '@/lib/wompi/client';
import type { WompiWebhookPayload } from '@/lib/wompi/client';

/**
 * POST /api/webhooks/wompi
 * Recibe eventos transaction.updated de Wompi.
 *
 * Flujo de suscripción:
 * 1ª compra (payment link):
 *   → webhook crea/actualiza la suscripción + guarda payment_source_id
 * Cobros recurrentes (cron charge-subscriptions):
 *   → mismo webhook detecta referencia ZT- y extiende el período
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

  if (transaction.status !== 'APPROVED') {
    // Si el cobro recurrente fue rechazado, marcar la suscripción como past_due
    if (transaction.status === 'DECLINED' || transaction.status === 'ERROR') {
      const parsed = parseReference(transaction.reference);
      if (parsed) {
        await supabaseAdmin
          .from('subscriptions')
          .update({ status: 'past_due', updated_at: new Date().toISOString() })
          .eq('user_id', parsed.userId)
          .in('status', ['active']);
      }
    }
    return NextResponse.json({ ok: true });
  }

  const parsed = parseReference(transaction.reference);
  if (!parsed) {
    console.error('[wompi-webhook] referencia inválida:', transaction.reference);
    return NextResponse.json({ error: 'Invalid reference' }, { status: 400 });
  }

  const { userId, plan, interval } = parsed;
  const now = new Date();

  // Calcular fin del nuevo período
  const periodEnd = new Date(now);
  if (interval === 'monthly') {
    periodEnd.setDate(periodEnd.getDate() + 30);
  } else {
    periodEnd.setDate(periodEnd.getDate() + 365);
  }

  const updateData = {
    plan_key:                  plan,
    billing_interval:          interval,
    status:                    'active' as const,
    processor_subscription_id: transaction.id,
    processor_customer_id:     transaction.customer_email,
    variant_id:                `wompi-${plan}-${interval}`,
    current_period_end:        periodEnd.toISOString(),
    customer_portal_url:       null as string | null,
    // Guardar payment_source_id si está disponible (permite cobros recurrentes)
    ...(transaction.payment_source_id
      ? { wompi_payment_source_id: transaction.payment_source_id }
      : {}),
    updated_at: now.toISOString(),
  };

  // Buscar suscripción existente del usuario
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

  console.log(
    `[wompi-webhook] ✓ ${userId} → ${plan} (${interval}) hasta ${periodEnd.toISOString()}`,
    transaction.payment_source_id ? `| ps: ${transaction.payment_source_id}` : '| sin payment_source',
  );

  return NextResponse.json({ ok: true });
}
