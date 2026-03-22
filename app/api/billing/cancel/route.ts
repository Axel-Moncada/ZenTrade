import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/billing/cancel
 * Cancela la suscripción activa del usuario en Supabase.
 * El acceso al plan permanece hasta current_period_end.
 * (Wompi no tiene API de cancelación de suscripciones recurrentes — modelo de pago único)
 */
export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { error } = await supabase
    .from('subscriptions')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .in('status', ['active', 'on_trial']);

  if (error) {
    console.error('[billing/cancel]', error);
    return NextResponse.json({ error: 'Error al cancelar suscripción' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
