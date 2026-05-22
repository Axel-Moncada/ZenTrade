import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { cancelSubscription } from '@/lib/paypal/client';

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { data: sub } = await supabaseAdmin
    .from('subscriptions')
    .select('id, processor_subscription_id')
    .eq('user_id', user.id)
    .in('status', ['active', 'on_trial'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!sub) return NextResponse.json({ error: 'No hay suscripción activa' }, { status: 404 });

  // Cancelar en PayPal si hay subscription ID
  if (sub.processor_subscription_id?.startsWith('I-')) {
    try {
      await cancelSubscription(sub.processor_subscription_id);
    } catch (err) {
      console.error('[billing/cancel] error cancelando en PayPal:', err);
    }
  }

  const { error } = await supabaseAdmin
    .from('subscriptions')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', sub.id);

  if (error) {
    console.error('[billing/cancel]', error);
    return NextResponse.json({ error: 'Error al cancelar suscripción' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
