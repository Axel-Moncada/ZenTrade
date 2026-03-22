import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { chargePaymentSource } from '@/lib/wompi/client';
import type { PlanKey, BillingInterval } from '@/lib/lemonsqueezy/client';

/**
 * GET /api/cron/charge-subscriptions
 * Vercel Cron — diario a las 10:00 UTC.
 *
 * Flujo de suscripción recurrente:
 * 1. Busca suscripciones activas que expiran en las próximas 48 h y tienen payment_source_id
 * 2. Cobra vía Wompi usando el payment_source_id almacenado
 * 3. Si APPROVED → el webhook /api/webhooks/wompi extiende el período automáticamente
 * 4. Si DECLINED → marca la suscripción como past_due
 *
 * Suscripciones sin payment_source_id (pago por método no tokenizable):
 * Recibirán un email de renovación (a implementar) y caerán a Free al vencer.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now    = new Date();
  const in48h  = new Date(now.getTime() + 48 * 60 * 60 * 1000);

  // Suscripciones activas que expiran en las próximas 48 horas Y tienen payment source
  const { data: expiring, error } = await supabaseAdmin
    .from('subscriptions')
    .select('id, user_id, plan_key, billing_interval, processor_customer_id, wompi_payment_source_id')
    .in('status', ['active', 'on_trial'])
    .lt('current_period_end', in48h.toISOString())
    .gt('current_period_end', now.toISOString())
    .not('wompi_payment_source_id', 'is', null);

  if (error) {
    console.error('[charge-subscriptions]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const results = { charged: 0, declined: 0, errors: 0 };

  for (const sub of expiring ?? []) {
    try {
      const result = await chargePaymentSource({
        paymentSourceId: sub.wompi_payment_source_id!,
        plan:            sub.plan_key as PlanKey,
        interval:        sub.billing_interval as BillingInterval,
        userId:          sub.user_id,
        customerEmail:   sub.processor_customer_id,
      });

      if (result.status === 'APPROVED') {
        // El webhook /api/webhooks/wompi extenderá el período automáticamente
        results.charged++;
        console.log(`[charge-subscriptions] ✓ ${sub.user_id} → ${result.transactionId}`);
      } else if (result.status === 'DECLINED' || result.status === 'ERROR') {
        // El webhook lo marcará past_due, pero por si acaso lo marcamos aquí también
        await supabaseAdmin
          .from('subscriptions')
          .update({ status: 'past_due', updated_at: now.toISOString() })
          .eq('id', sub.id);
        results.declined++;
        console.warn(`[charge-subscriptions] ✗ ${sub.user_id} → ${result.status}`);
      } else {
        // PENDING: el webhook manejará el resultado cuando procese
        results.charged++;
      }
    } catch (err) {
      console.error(`[charge-subscriptions] error con ${sub.user_id}:`, err);
      results.errors++;
    }
  }

  return NextResponse.json({
    processed: (expiring ?? []).length,
    ...results,
  });
}
