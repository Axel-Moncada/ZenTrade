import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getPlanFromProductPath } from "@/lib/fastspring/client";
import { sendWelcomeEmail } from "@/lib/resend/send-welcome-email";
import type { Database } from "@/types/database.types";

type SubscriptionStatus =
  Database["public"]["Tables"]["subscriptions"]["Row"]["status"];

// ─── Tipos de payload FastSpring ────────────────────────────────────────────

interface FastSpringAccount {
  id: string;
  contact?: {
    email?: string;
    first?: string;
    last?: string;
  };
}

interface FastSpringSubscriptionData {
  id: string;
  account: string | FastSpringAccount;
  product: string;
  state: string;
  begin: string | null;
  next: string | null;
  end: string | null;
  tags?: Record<string, string>;
  management?: {
    url?: string;
  };
}

interface FastSpringEvent {
  id: string;
  type: string;
  live: boolean;
  processed: boolean;
  created: number;
  data: FastSpringSubscriptionData;
}

interface FastSpringWebhookPayload {
  events: FastSpringEvent[];
}

// ─── Verificación de firma ────────────────────────────────────────────────────

function verifySignature(rawBody: string, signature: string): boolean {
  const secret = process.env.FASTSPRING_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[Webhook FS] FASTSPRING_WEBHOOK_SECRET no configurado");
    return false;
  }

  const hmac = crypto.createHmac("sha256", secret);
  const digest = hmac.update(rawBody).digest("base64");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(digest, "base64"),
      Buffer.from(signature, "base64")
    );
  } catch {
    return false;
  }
}

// ─── Mapa de estados FastSpring → Zentrade ────────────────────────────────────

function mapState(state: string): SubscriptionStatus {
  const map: Record<string, SubscriptionStatus> = {
    active:      "active",
    trial:       "on_trial",
    overdue:     "past_due",
    canceled:    "cancelled",
    deactivated: "expired",
    paused:      "paused",
  };
  return map[state] ?? "expired";
}

// ─── Handler: suscripción activada (nueva o reactivada) ──────────────────────

async function handleActivated(event: FastSpringEvent): Promise<void> {
  const { data } = event;

  const userId = data.tags?.user_id;
  if (!userId) {
    console.error("[Webhook FS] subscription.activated sin user_id en tags");
    return;
  }

  const planInfo = getPlanFromProductPath(data.product);
  if (!planInfo) {
    console.error("[Webhook FS] producto desconocido:", data.product);
    return;
  }

  const accountId =
    typeof data.account === "string" ? data.account : data.account.id;

  const contactEmail =
    typeof data.account === "object" ? data.account.contact?.email : undefined;
  const contactFirst =
    typeof data.account === "object" ? data.account.contact?.first : undefined;
  const contactLast =
    typeof data.account === "object" ? data.account.contact?.last : undefined;

  const { error } = await supabaseAdmin.from("subscriptions").upsert(
    {
      user_id: userId,
      processor_subscription_id: data.id,
      processor_customer_id: accountId,
      variant_id: data.product,
      plan_key: planInfo.plan,
      billing_interval: planInfo.interval,
      status: mapState(data.state),
      current_period_end: data.next ?? data.end ?? null,
      customer_portal_url: data.management?.url ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "processor_subscription_id" }
  );

  if (error) {
    console.error("[Webhook FS] Error creando suscripción:", error);
    throw error;
  }

  console.log(
    `[Webhook FS] Suscripción activada — user=${userId} plan=${planInfo.plan}/${planInfo.interval}`
  );

  if (contactEmail) {
    sendWelcomeEmail({
      userEmail: contactEmail,
      userName: [contactFirst, contactLast].filter(Boolean).join(" ") || contactEmail,
      planKey: planInfo.plan,
      billingInterval: planInfo.interval,
    }).catch((err) => {
      console.error("[Webhook FS] Error enviando email de bienvenida:", err);
    });
  }
}

// ─── Handler: suscripción actualizada (renovación, cambio de estado) ─────────

async function handleUpdated(event: FastSpringEvent): Promise<void> {
  const { data } = event;

  const planInfo = getPlanFromProductPath(data.product);

  const updateData: Database["public"]["Tables"]["subscriptions"]["Update"] = {
    status: mapState(data.state),
    current_period_end: data.next ?? data.end ?? null,
    customer_portal_url: data.management?.url ?? null,
    updated_at: new Date().toISOString(),
  };

  if (planInfo) {
    updateData.variant_id = data.product;
    updateData.plan_key = planInfo.plan;
    updateData.billing_interval = planInfo.interval;
  }

  const { error } = await supabaseAdmin
    .from("subscriptions")
    .update(updateData)
    .eq("processor_subscription_id", data.id);

  if (error) {
    console.error("[Webhook FS] Error actualizando suscripción:", error);
    throw error;
  }

  console.log(
    `[Webhook FS] Suscripción ${data.id} actualizada — estado: ${data.state}`
  );
}

// ─── Handler principal ────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-fs-signature") ?? "";

    if (!verifySignature(rawBody, signature)) {
      console.warn("[Webhook FS] Firma inválida");
      return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody) as FastSpringWebhookPayload;

    for (const event of payload.events) {
      console.log(`[Webhook FS] Evento: ${event.type}`);

      switch (event.type) {
        case "subscription.activated":
          await handleActivated(event);
          break;

        case "subscription.updated":
        case "subscription.charge.completed":
        case "subscription.charge.failed":
        case "subscription.deactivated":
        case "subscription.canceled":
          await handleUpdated(event);
          break;

        default:
          console.log(`[Webhook FS] Evento ignorado: ${event.type}`);
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("[Webhook FS] Error inesperado:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
