import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { configureLemonSqueezy } from '@/lib/lemonsqueezy/client';
import { createCheckout } from '@lemonsqueezy/lemonsqueezy.js';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { priceId, planSlug, interval } = await req.json() as {
      priceId: string;
      planSlug: string;
      interval: 'month' | 'year';
    };

    if (!priceId) {
      return NextResponse.json({ error: 'priceId requerido' }, { status: 400 });
    }

    const storeId = process.env.LEMONSQUEEZY_STORE_ID;
    if (!storeId) {
      return NextResponse.json({ error: 'LEMONSQUEEZY_STORE_ID no configurado' }, { status: 500 });
    }

    configureLemonSqueezy();

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

    const checkout = await createCheckout(storeId, priceId, {
      checkoutOptions: {
        embed: false,
        media: true,
        logo: true,
      },
      checkoutData: {
        email: user.email ?? undefined,
        custom: {
          user_id: user.id,
          plan_slug: planSlug,
          billing_interval: interval,
        },
      },
      productOptions: {
        enabledVariants: [Number(priceId)],
        redirectUrl: `${siteUrl}/dashboard/billing?success=true`,
        receiptButtonText: 'Ir al dashboard',
        receiptThankYouNote: '¡Gracias por suscribirte a Zentrade!',
      },
      expiresAt: null,
      preview: false,
      testMode: process.env.NODE_ENV !== 'production',
    });

    const url = checkout.data?.data?.attributes?.url;
    if (!url) {
      return NextResponse.json({ error: 'No se pudo crear el checkout' }, { status: 500 });
    }

    return NextResponse.json({ url });
  } catch (err) {
    console.error('[billing/checkout]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error interno' },
      { status: 500 }
    );
  }
}
