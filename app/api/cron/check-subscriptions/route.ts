import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

/**
 * GET /api/cron/check-subscriptions
 * Llamado por Vercel Cron diariamente a las 00:30 UTC.
 * Detecta suscripciones vencidas y las marca como 'expired'.
 * El usuario baja al plan Free automáticamente (getUserPlan devuelve free si no hay suscripción activa).
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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
  console.log(`[check-subscriptions] ${count} suscripción(es) expirada(s)`);

  return NextResponse.json({ expired: count, subscriptions: data });
}
