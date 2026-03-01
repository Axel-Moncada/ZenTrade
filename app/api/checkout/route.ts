import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createCheckout } from "@lemonsqueezy/lemonsqueezy.js";
import { createClient } from "@/lib/supabase/server";
import {
  configureLemonSqueezy,
  LEMON_STORE_ID,
  PLAN_VARIANTS,
  type BillingInterval,
  type PlanKey,
} from "@/lib/lemonsqueezy/client";

const checkoutSchema = z.object({
  plan: z.enum(["starter", "pro"]),
  interval: z.enum(["monthly", "annual"]),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const validation = checkoutSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { plan, interval } = validation.data as {
      plan: PlanKey;
      interval: BillingInterval;
    };

    const variant = PLAN_VARIANTS[plan][interval];

    if (!variant.variantId) {
      return NextResponse.json(
        { error: "Variante de plan no configurada" },
        { status: 500 }
      );
    }

    configureLemonSqueezy();

    const { data: profile } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", user.id)
      .single();

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    console.log("[Checkout] APP_URL en uso:", appUrl);

    const checkout = await createCheckout(LEMON_STORE_ID, variant.variantId, {
      checkoutOptions: {
        embed: false,
        media: true,
        logo: true,
      },
      checkoutData: {
        email: profile?.email ?? user.email ?? "",
        name: profile?.full_name ?? undefined,
        custom: {
          user_id: user.id,
        },
      },
      productOptions: {
        enabledVariants: [Number(variant.variantId)],
        redirectUrl: `${appUrl}/dashboard/billing?success=true`,
        receiptButtonText: "Ir al Dashboard",
        receiptThankYouNote:
          "¡Gracias por suscribirte a Zentrade! Tu cuenta ya está activa.",
      },
    });

    if (checkout.error) {
      console.error("[Checkout] LemonSqueezy error:", checkout.error);
      return NextResponse.json(
        { error: "Error al crear el checkout" },
        { status: 500 }
      );
    }

    const checkoutUrl = checkout.data?.data.attributes.url;

    if (!checkoutUrl) {
      return NextResponse.json(
        { error: "No se pudo obtener la URL de checkout" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: checkoutUrl }, { status: 200 });
  } catch (error) {
    console.error("[Checkout] Unexpected error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
