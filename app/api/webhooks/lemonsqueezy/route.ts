import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getPlanFromVariantId } from "@/lib/lemonsqueezy/client";
import { sendWelcomeEmail } from "@/lib/resend/send-welcome-email";
import type { Database } from "@/types/database.types";

type SubscriptionStatus =
  Database["public"]["Tables"]["subscriptions"]["Row"]["status"];

// ─── Tipos de payload LemonSqueezy ───────────────────────────────────────────

interface LemonSqueezySubscriptionAttributes {
  store_id: number;
  customer_id: number;
  order_id: number;
  order_item_id: number;
  product_id: number;
  variant_id: number;
  product_name: string;
  variant_name: string;
  user_name: string;
  user_email: string;
  status: string;
  status_formatted: string;
  pause: null | { mode: string; resumes_at: string };
  cancelled: boolean;
  trial_ends_at: string | null;
  billing_anchor: number;
  first_subscription_item: {
    id: number;
    subscription_id: number;
    price_id: number;
    quantity: number;
    is_usage_based: boolean;
    created_at: string;
    updated_at: string;
  } | null;
  urls: {
    update_payment_method: string;
    customer_portal: string;
    customer_portal_update_subscription: string;
  };
  renews_at: string | null;
  ends_at: string | null;
  created_at: string;
  updated_at: string;
  test_mode: boolean;
}

interface LemonSqueezyWebhookPayload {
  meta: {
    event_name: string;
    custom_data?: {
      user_id?: string;
    };
    webhook_id: string;
  };
  data: {
    id: string;
    type: string;
    attributes: LemonSqueezySubscriptionAttributes;
  };
}

// ─── Verificación de firma ────────────────────────────────────────────────────

function verifySignature(rawBody: string, signature: string): boolean {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[Webhook] LEMONSQUEEZY_WEBHOOK_SECRET no configurado");
    return false;
  }

  const hmac = crypto.createHmac("sha256", secret);
  const digest = hmac.update(rawBody).digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(digest, "hex"),
      Buffer.from(signature, "hex")
    );
  } catch {
    return false;
  }
}

// ─── Mapa de estados LemonSqueezy → Zentrade ─────────────────────────────────

function mapStatus(lsStatus: string): SubscriptionStatus {
  const map: Record<string, SubscriptionStatus> = {
    active: "active",
    cancelled: "cancelled",
    expired: "expired",
    paused: "paused",
    past_due: "past_due",
    unpaid: "unpaid",
    on_trial: "on_trial",
  };
  return map[lsStatus] ?? "expired";
}

// ─── Handlers por evento ──────────────────────────────────────────────────────

async function handleSubscriptionCreated(
  payload: LemonSqueezyWebhookPayload
): Promise<void> {
  const { meta, data } = payload;
  const attrs = data.attributes;
  const userId = meta.custom_data?.user_id;

  if (!userId) {
    console.error("[Webhook] subscription_created sin user_id en custom_data");
    return;
  }

  const variantId = String(attrs.variant_id);
  const planInfo = getPlanFromVariantId(variantId);

  if (!planInfo) {
    console.error("[Webhook] variant_id desconocido:", variantId);
    return;
  }

  const { error } = await supabaseAdmin.from("subscriptions").upsert(
    {
      user_id: userId,
      lemon_squeezy_subscription_id: data.id,
      lemon_squeezy_customer_id: String(attrs.customer_id),
      variant_id: variantId,
      plan_key: planInfo.plan,
      billing_interval: planInfo.interval,
      status: mapStatus(attrs.status),
      current_period_end: attrs.renews_at ?? attrs.ends_at ?? null,
      customer_portal_url: attrs.urls?.customer_portal ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "lemon_squeezy_subscription_id" }
  );

  if (error) {
    console.error("[Webhook] Error creando suscripción:", error);
    throw error;
  }

  console.log(`[Webhook] Suscripción creada para user ${userId} — plan ${planInfo.plan}/${planInfo.interval}`);

  // Enviar email de bienvenida (no bloqueante)
  sendWelcomeEmail({
    userEmail: attrs.user_email,
    userName: attrs.user_name,
    planKey: planInfo.plan,
    billingInterval: planInfo.interval,
  }).catch((err) => {
    console.error("[Webhook] Error enviando email de bienvenida:", err);
  });
}

async function handleSubscriptionUpdated(
  payload: LemonSqueezyWebhookPayload
): Promise<void> {
  const { data } = payload;
  const attrs = data.attributes;
  const variantId = String(attrs.variant_id);
  const planInfo = getPlanFromVariantId(variantId);

  const updateData: Database["public"]["Tables"]["subscriptions"]["Update"] = {
    status: mapStatus(attrs.status),
    current_period_end: attrs.renews_at ?? attrs.ends_at ?? null,
    customer_portal_url: attrs.urls?.customer_portal ?? null,
    updated_at: new Date().toISOString(),
  };

  // Si cambió de variante (upgrade/downgrade), actualizar plan también
  if (planInfo) {
    updateData.variant_id = variantId;
    updateData.plan_key = planInfo.plan;
    updateData.billing_interval = planInfo.interval;
  }

  const { error } = await supabaseAdmin
    .from("subscriptions")
    .update(updateData)
    .eq("lemon_squeezy_subscription_id", data.id);

  if (error) {
    console.error("[Webhook] Error actualizando suscripción:", error);
    throw error;
  }

  console.log(`[Webhook] Suscripción ${data.id} actualizada — estado: ${attrs.status}`);
}

// ─── Handler principal ────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-signature") ?? "";

    if (!verifySignature(rawBody, signature)) {
      console.warn("[Webhook] Firma inválida");
      return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody) as LemonSqueezyWebhookPayload;
    const eventName = payload.meta.event_name;

    console.log(`[Webhook] Evento recibido: ${eventName}`);

    switch (eventName) {
      case "subscription_created":
        await handleSubscriptionCreated(payload);
        break;

      case "subscription_updated":
      case "subscription_resumed":
      case "subscription_paused":
      case "subscription_unpaused":
      case "subscription_payment_success":
      case "subscription_payment_failed":
      case "subscription_payment_recovered":
        await handleSubscriptionUpdated(payload);
        break;

      case "subscription_cancelled":
      case "subscription_expired":
        await handleSubscriptionUpdated(payload);
        break;

      default:
        console.log(`[Webhook] Evento no manejado: ${eventName}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("[Webhook] Error inesperado:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
