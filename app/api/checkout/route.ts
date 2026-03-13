import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  PAYPAL_PLANS,
  createSubscriptionUrl,
  type BillingInterval,
  type PlanKey,
} from "@/lib/paypal/client";

const checkoutSchema = z.object({
  plan: z.enum(["starter", "pro", "zenmode"]),
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

    const variant = PAYPAL_PLANS[plan][interval];

    const { data: profile } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", user.id)
      .single();

    const email = profile?.email ?? user.email ?? "";

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.zen-trader.com";
    const returnUrl = `${appUrl}/dashboard/billing?checkout=success`;
    const cancelUrl = `${appUrl}/dashboard/billing?checkout=cancelled`;

    const checkoutUrl = await createSubscriptionUrl({
      planId: variant.planId,
      subscriberEmail: email,
      userId: user.id,
      returnUrl,
      cancelUrl,
    });

    return NextResponse.json({ url: checkoutUrl }, { status: 200 });
  } catch (error) {
    console.error("[Checkout] Error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
