import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { confirmPayPalSubscriptionForUser } from '@/lib/paypal/activate-subscription';

const Body = z.object({
  subscription_id: z.string().regex(/^I-[A-Z0-9]+$/, 'Invalid PayPal subscription ID'),
});

/**
 * POST /api/paypal/confirm
 * Se llama al volver de PayPal (return_url trae ?subscription_id=I-...).
 * Consulta el estado real en PayPal y activa el plan sin depender del webhook.
 * Idempotente: si el webhook ya lo activó, solo confirma.
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const parsed = Body.safeParse(await req.json() as unknown);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });

  const result = await confirmPayPalSubscriptionForUser(parsed.data.subscription_id, user.id);

  if (result.ok) {
    return NextResponse.json({ ok: true, plan: result.plan, periodEnd: result.periodEnd });
  }

  const status = result.reason === 'NOT_OWNER' ? 403
    : result.reason === 'NOT_ACTIVE' ? 409
    : 502;
  return NextResponse.json({ ok: false, reason: result.reason }, { status });
}
