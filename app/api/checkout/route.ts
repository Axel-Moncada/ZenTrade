import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { createPaymentLink, WOMPI_PRICES_CENTS } from '@/lib/wompi/client';

const CheckoutSchema = z.object({
  plan:           z.enum(['starter', 'pro', 'zenmode']),
  interval:       z.enum(['monthly', 'annual']),
  affiliate_code: z.string().max(30).optional(),
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

  const { plan, interval, affiliate_code } = parsed.data;

  // ── Resolver código de afiliado ────────────────────────────────────────────
  let discountPercent   = 0;
  let affiliateCodeId:  string | null = null;
  let normalizedCode:   string | null = null;

  if (affiliate_code) {
    const code = affiliate_code.toUpperCase().trim();
    const { data: aff } = await supabaseAdmin
      .from('affiliate_codes')
      .select('id, discount_percent, max_uses, uses_count')
      .eq('code', code)
      .eq('is_active', true)
      .maybeSingle();

    if (aff && (aff.max_uses === null || aff.uses_count < aff.max_uses)) {
      discountPercent  = aff.discount_percent;
      affiliateCodeId  = aff.id;
      normalizedCode   = code;
    }
  }

  // ── Calcular monto con descuento ───────────────────────────────────────────
  const originalAmount  = WOMPI_PRICES_CENTS[plan][interval];
  const discountedAmount = discountPercent > 0
    ? Math.round(originalAmount * (1 - discountPercent / 100))
    : originalAmount;

  const allowedOrigins = ['https://www.zen-trader.com', 'https://zen-trader.com'];
  const rawOrigin = req.headers.get('origin') ?? '';
  const origin = allowedOrigins.includes(rawOrigin)
    ? rawOrigin
    : (process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.zen-trader.com');
  const redirectUrl = `${origin}/dashboard/billing?success=true`;

  try {
    const { url, linkId } = await createPaymentLink({
      plan,
      interval,
      userId:         user.id,
      userEmail:      user.email!,
      userName:       user.user_metadata?.full_name as string | undefined,
      redirectUrl,
      amountOverride: discountPercent > 0 ? discountedAmount : undefined,
    });

    await supabaseAdmin.from('pending_checkouts').insert({
      id:                      linkId,
      user_id:                 user.id,
      plan_key:                plan,
      billing_interval:        interval,
      affiliate_code:          normalizedCode,
      discounted_amount_cents: discountPercent > 0 ? discountedAmount : null,
    });

    // Silenciar TypeScript — affiliateCodeId es informativo, no se usa en insert
    void affiliateCodeId;

    return NextResponse.json({ url });
  } catch (err) {
    console.error('[checkout]', err);
    return NextResponse.json({ error: 'Error al crear enlace de pago' }, { status: 500 });
  }
}
