import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createPaymentLink } from '@/lib/wompi/client';

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
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }

  const { plan, interval } = parsed.data;

  const origin = req.headers.get('origin')
    ?? process.env.NEXT_PUBLIC_APP_URL
    ?? 'https://zen-trader.com';
  const redirectUrl = `${origin}/dashboard/billing?success=true`;

  try {
    const checkoutUrl = await createPaymentLink({
      plan,
      interval,
      userId:    user.id,
      userEmail: user.email!,
      userName:  user.user_metadata?.full_name as string | undefined,
      redirectUrl,
    });

    return NextResponse.json({ url: checkoutUrl });
  } catch (err) {
    console.error('[checkout]', err);
    return NextResponse.json({ error: 'Error al crear enlace de pago' }, { status: 500 });
  }
}
