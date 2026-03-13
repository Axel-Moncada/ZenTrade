import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getPlanFromPayPalPlanId, getAccessToken, PAYPAL_BASE } from "@/lib/paypal/client";
import { sendWelcomeEmail } from "@/lib/resend/send-welcome-email";
import type { Database } from "@/types/database.types";

type SubscriptionStatus =
  Database["public"]["Tables"]["subscriptions"]["Row"]["status"];

// ─── Verificación de webhook (PayPal Webhook Verification API) ────────────────

async function verifyWebhook(
  headers: Headers,
  rawBody: string
): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) {
    console.warn("[Webhook PP] PAYPAL_WEBHOOK_ID no configurado — omitiendo verificación");
    return true; // permitir en desarrollo
  }

  try {
    const token = await getAccessToken();

    const verifyBody = {
      auth_algo:         headers.get("paypal-auth-algo") ?? "",
      cert_url:          headers.get("paypal-cert-url") ?? "",
      transmission_id:   headers.get("paypal-transmission-id") ?? "",
      transmission_sig:  headers.get("paypal-transmission-sig") ?? "",
      transmission_time: headers.get("paypal-transmission-time") ?? "",
      webhook_id:        webhookId,
      webhook_event:     JSON.parse(rawBody),
    };

    const response = await fetch(
      `${PAYPAL_BASE}/v1/notifications/verify-webhook-signature`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(verifyBody),
      }
    );

    if (!response.ok) return false;
    const result = (await response.json()) as { verification_status: string };
    return result.verification_status === "SUCCESS";
  } catch {
    return false;
  }
}

// ─── Mapa de estados PayPal → Zentrade ───────────────────────────────────────

function mapStatus(status: string): SubscriptionStatus {
  const map: Record<string, SubscriptionStatus> = {
    ACTIVE:    "active",
    APPROVAL_PENDING: "on_trial",
    APPROVED:  "active",
    SUSPENDED: "paused",
    CANCELLED: "cancelled",
    EXPIRED:   "expired",
  };
  return map[status] ?? "expired";
}

// ─── Schema Zod ───────────────────────────────────────────────────────────────

const webhookEventSchema = z.object({
  id: z.string(),
  event_type: z.string(),
  resource_type: z.string().optional(),
  resource: z.object({
    id: z.string(),
    status: z.string().optional(),
    plan_id: z.string().optional(),
    custom_id: z.string().optional(),
    subscriber: z.object({
      email_address: z.string().optional(),
      name: z.object({
        given_name: z.string().optional(),
        surname: z.string().optional(),
      }).optional(),
    }).optional(),
    billing_info: z.object({
      next_billing_time: z.string().optional(),
    }).optional(),
  }),
});

type WebhookEvent = z.infer<typeof webhookEventSchema>;

// ─── Handler de suscripción ───────────────────────────────────────────────────

async function handleSubscriptionEvent(event: WebhookEvent): Promise<void> {
  const { resource } = event;
  const isActivation = event.event_type === "BILLING.SUBSCRIPTION.ACTIVATED";

  if (!resource.plan_id) {
    console.warn("[Webhook PP] Sin plan_id en resource");
    return;
  }

  const planInfo = getPlanFromPayPalPlanId(resource.plan_id);
  if (!planInfo) {
    console.error("[Webhook PP] plan_id desconocido:", resource.plan_id);
    return;
  }

  // Resolver user_id: usar custom_id si viene, si no buscar por email
  let userId = resource.custom_id ?? "";
  if (!userId) {
    const email = resource.subscriber?.email_address ?? "";
    if (!email) {
      console.error("[Webhook PP] Sin custom_id ni email en el evento");
      return;
    }
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (!profile) {
      console.error("[Webhook PP] No se encontró usuario para email:", email);
      return;
    }
    userId = profile.id;
  }

  const { error } = await supabaseAdmin.from("subscriptions").upsert(
    {
      user_id: userId,
      processor_subscription_id: resource.id,
      processor_customer_id: resource.subscriber?.email_address ?? "",
      variant_id: resource.plan_id,
      plan_key: planInfo.plan,
      billing_interval: planInfo.interval,
      status: mapStatus(resource.status ?? ""),
      current_period_end: resource.billing_info?.next_billing_time ?? null,
      customer_portal_url: null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "processor_subscription_id" }
  );

  if (error) {
    console.error("[Webhook PP] Error en upsert:", error);
    throw error;
  }

  console.log(
    `[Webhook PP] ${event.event_type} — user=${userId} plan=${planInfo.plan}/${planInfo.interval} status=${resource.status}`
  );

  // Email de bienvenida solo al activarse por primera vez
  if (isActivation) {
    const email = resource.subscriber?.email_address ?? "";
    const given = resource.subscriber?.name?.given_name ?? "";
    const surname = resource.subscriber?.name?.surname ?? "";
    const name = [given, surname].filter(Boolean).join(" ") || email;

    if (email) {
      sendWelcomeEmail({
        userEmail: email,
        userName: name,
        planKey: planInfo.plan,
        billingInterval: planInfo.interval,
      }).catch((err) => {
        console.error("[Webhook PP] Error enviando email de bienvenida:", err);
      });
    }
  }
}

// ─── Handler principal ────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();

    const isValid = await verifyWebhook(request.headers, rawBody);
    if (!isValid) {
      console.warn("[Webhook PP] Verificación fallida");
      return NextResponse.json({ error: "Verificación fallida" }, { status: 401 });
    }

    const parsed = webhookEventSchema.safeParse(JSON.parse(rawBody));
    if (!parsed.success) {
      console.warn("[Webhook PP] Evento con estructura inesperada");
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const event = parsed.data;
    console.log(`[Webhook PP] Evento: ${event.event_type}`);

    switch (event.event_type) {
      case "BILLING.SUBSCRIPTION.ACTIVATED":
      case "BILLING.SUBSCRIPTION.APPROVED":
      case "BILLING.SUBSCRIPTION.UPDATED":
      case "BILLING.SUBSCRIPTION.SUSPENDED":
      case "BILLING.SUBSCRIPTION.CANCELLED":
      case "BILLING.SUBSCRIPTION.EXPIRED":
      case "BILLING.SUBSCRIPTION.RENEWED":
        await handleSubscriptionEvent(event);
        break;

      default:
        console.log(`[Webhook PP] Evento ignorado: ${event.event_type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("[Webhook PP] Error inesperado:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
