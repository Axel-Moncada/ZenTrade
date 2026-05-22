import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createSubscription } from '@/lib/paypal/client';

const CheckoutSchema = z.object({
  plan:     z.enum(['starter', 'pro', 'zenmode']),
  interval: z.enum(['monthly', 'annual']),
});

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const body = await req.json() as unknown;
  const parsed = CheckoutSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });

  const { plan, interval } = parsed.data;

  const allowedOrigins = ['https://www.zen-trader.com', 'https://zen-trader.com'];
  const rawOrigin = req.headers.get('origin') ?? '';
  const origin = allowedOrigins.includes(rawOrigin)
    ? rawOrigin
    : (process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.zen-trader.com');

  try {
    const { approvalUrl } = await createSubscription({
      plan,
      interval,
      userId:    user.id,
      userEmail: user.email!,
      userName:  user.user_metadata?.full_name as string | undefined,
      returnUrl: `${origin}/dashboard/billing?success=true`,
      cancelUrl: `${origin}/dashboard/billing?cancelled=true`,
    });

    return NextResponse.json({ url: approvalUrl });
  } catch (err) {
    console.error('[checkout]', err);
    return NextResponse.json({ error: 'Error al crear suscripción' }, { status: 500 });
  }
}
