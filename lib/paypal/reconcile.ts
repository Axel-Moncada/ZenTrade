import { supabaseAdmin } from '@/lib/supabase/admin';
import { getSubscription } from '@/lib/paypal/client';

interface ExpiringRow {
  id: string;
  processor_subscription_id: string | null;
  billing_interval: 'monthly' | 'annual';
}

/**
 * Para las suscripciones de PayPal que ya pasaron su current_period_end,
 * pregunta a PayPal si siguen activas. Si lo están (cobro de renovación hecho
 * pero webhook perdido), extiende el período en vez de dejar que expiren.
 */
export async function reconcileExpiringSubscriptions(): Promise<{ extended: number }> {
  const now = new Date().toISOString();
  const { data, error } = await supabaseAdmin
    .from('subscriptions')
    .select('id, processor_subscription_id, billing_interval')
    .in('status', ['active', 'on_trial'])
    .lt('current_period_end', now)
    .like('processor_subscription_id', 'I-%');

  if (error || !data) {
    if (error) console.error('[reconcile] error leyendo suscripciones:', error);
    return { extended: 0 };
  }

  let extended = 0;
  for (const row of data as ExpiringRow[]) {
    if (!row.processor_subscription_id) continue;
    try {
      const details = await getSubscription(row.processor_subscription_id);
      if (details.status !== 'ACTIVE') continue;
      const next = details.billing_info?.next_billing_time
        ? new Date(details.billing_info.next_billing_time)
        : new Date(Date.now() + (row.billing_interval === 'annual' ? 365 : 30) * 24 * 60 * 60 * 1000);
      if (next.getTime() <= Date.now()) continue;
      const { error: updateError } = await supabaseAdmin
        .from('subscriptions')
        .update({ current_period_end: next.toISOString(), updated_at: new Date().toISOString() })
        .eq('id', row.id);
      if (!updateError) extended++;
    } catch (err) {
      console.error(`[reconcile] no se pudo consultar ${row.processor_subscription_id}:`, err);
    }
  }
  return { extended };
}
