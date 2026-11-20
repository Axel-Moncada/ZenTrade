import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { reconcileExpiringSubscriptions } from '@/lib/paypal/reconcile';

/**
 * GET /api/cron/check-subscriptions
 * Llamado por Vercel Cron diariamente a las 00:30 UTC.
 * 1. Suscripciones de PayPal vencidas: se consulta PayPal antes de expirarlas.
 *    Si siguen ACTIVE (la renovación cobró pero el webhook no llegó), se extienden.
 * 2. El resto de vencidas se marca 'expired' (el usuario baja a Free).
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const reconciled = await reconcileExpiringSubscriptions();

  const now = new Date().toISOString();
  const { data, error } = await supabaseAdmin
    .from('subscriptions')
    .update({ status: 'expired', updated_at: now })
    .in('status', ['active', 'on_trial'])
    .lt('current_period_end', now)
    .select('id, user_id, plan_key');

  if (error) {
    console.error('[check-subscriptions]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const count = data?.length ?? 0;
  console.log(`[check-subscriptions] ${reconciled.extended} extendida(s) desde PayPal, ${count} expirada(s)`);

  return NextResponse.json({ extended: reconciled.extended, expired: count });
}
