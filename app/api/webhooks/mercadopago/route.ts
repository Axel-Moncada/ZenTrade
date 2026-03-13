import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getPlanFromPreapprovalPlanId } from "@/lib/mercadopago/client";
import { sendWelcomeEmail } from "@/lib/resend/send-welcome-email";
import type { Database } from "@/types/database.types";

type SubscriptionStatus =
  Database["public"]["Tables"]["subscriptions"]["Row"]["status"];

// ─── Verificación de firma ────────────────────────────────────────────────────
// MP envía: x-signature: ts=<epoch>,v1=<hmac_hex>
// Mensaje firmado: "id:<notif_id>;request-id:<x-request-id>;ts:<ts>;"

function verifySignature(
  notificationId: string,
  requestId: string,
  ts: string,
  v1: string
): boolean {
  const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[Webhook MP] MP_WEBHOOK_SECRET no configurado");
    return false;
  }

  const message = `id:${notificationId};request-id:${requestId};ts:${ts};`;
  const hmac = crypto.createHmac("sha256", secret);
  const digest = hmac.update(message).digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(digest, "hex"),
      Buffer.from(v1, "hex")
    );
  } catch {
    return false;
  }
}

// ─── Mapa de estados MP → Zentrade ────────────────────────────────────────────

function mapStatus(status: string): SubscriptionStatus {
  const map: Record<string, SubscriptionStatus> = {
    authorized: "active",
    pending:    "on_trial",
    paused:     "paused",
    cancelled:  "cancelled",
    expired:    "expired",
  };
  return map[status] ?? "expired";
}

// ─── Schemas Zod ──────────────────────────────────────────────────────────────

const notificationSchema = z.object({
  type: z.string(),
  action: z.string().optional(),
  data: z.object({ id: z.string() }),
  id: z.union([z.string(), z.number()]).transform(String),
  live_mode: z.boolean().optional(),
});

const preapprovalSchema = z.object({
  id: z.string(),
  status: z.enum(["authorized", "pending", "paused", "cancelled", "expired"]),
  payer_id: z.number().optional(),
  payer_email: z.string(),
  external_reference: z.string(),
  preapproval_plan_id: z.string(),
  next_payment_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
});

type PreapprovalDetail = z.infer<typeof preapprovalSchema>;

// ─── Obtener detalle del preapproval ─────────────────────────────────────────

async function fetchPreapprovalDetail(preapprovalId: string): Promise<PreapprovalDetail> {
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!accessToken) throw new Error("MERCADO_PAGO_ACCESS_TOKEN no configurado");

  const response = await fetch(`https://api.mercadopago.com/preapproval/${preapprovalId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`MercadoPago GET /preapproval/${preapprovalId} error ${response.status}`);
  }

  const json: unknown = await response.json();
  const parsed = preapprovalSchema.safeParse(json);

  if (!parsed.success) {
    throw new Error(`Preapproval detail inesperado: ${JSON.stringify(parsed.error.errors)}`);
  }

  return parsed.data;
}

// ─── Handler principal ────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();

    // Parsear y validar el body de la notificación
    const bodyParsed = notificationSchema.safeParse(JSON.parse(rawBody));
    if (!bodyParsed.success) {
      console.warn("[Webhook MP] Body inválido:", bodyParsed.error.errors);
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const notification = bodyParsed.data;

    // Solo procesar eventos de suscripción
    if (notification.type !== "preapproval") {
      console.log(`[Webhook MP] Tipo ignorado: ${notification.type}`);
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // Verificar firma
    const xSignature = request.headers.get("x-signature") ?? "";
    const xRequestId = request.headers.get("x-request-id") ?? "";

    const tsMatch = xSignature.match(/ts=([^,]+)/);
    const v1Match = xSignature.match(/v1=([^,]+)/);
    const ts = tsMatch?.[1] ?? "";
    const v1 = v1Match?.[1] ?? "";

    if (ts && v1 && !verifySignature(notification.id, xRequestId, ts, v1)) {
      console.warn("[Webhook MP] Firma inválida");
      return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
    }

    console.log(`[Webhook MP] Evento preapproval — id: ${notification.data.id} action: ${notification.action ?? "n/a"}`);

    // Obtener detalle completo del preapproval desde MP
    const preapproval = await fetchPreapprovalDetail(notification.data.id);

    // Resolver plan desde el preapproval_plan_id
    const planInfo = getPlanFromPreapprovalPlanId(preapproval.preapproval_plan_id);
    if (!planInfo) {
      console.error("[Webhook MP] preapproval_plan_id desconocido:", preapproval.preapproval_plan_id);
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // Resolver user_id: usar external_reference si viene, si no buscar por email
    let userId = preapproval.external_reference;
    if (!userId) {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("email", preapproval.payer_email)
        .maybeSingle();

      if (!profile) {
        console.error("[Webhook MP] No se encontró usuario para email:", preapproval.payer_email);
        return NextResponse.json({ received: true }, { status: 200 });
      }
      userId = profile.id;
    }

    const isNew = notification.action === "created";

    const { error } = await supabaseAdmin.from("subscriptions").upsert(
      {
        user_id: userId,
        processor_subscription_id: preapproval.id,
        processor_customer_id: String(preapproval.payer_id ?? ""),
        variant_id: preapproval.preapproval_plan_id,
        plan_key: planInfo.plan,
        billing_interval: planInfo.interval,
        status: mapStatus(preapproval.status),
        current_period_end: preapproval.next_payment_date ?? preapproval.end_date ?? null,
        customer_portal_url: null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "processor_subscription_id" }
    );

    if (error) {
      console.error("[Webhook MP] Error en upsert:", error);
      throw error;
    }

    console.log(
      `[Webhook MP] Suscripción ${preapproval.id} — user=${preapproval.external_reference} plan=${planInfo.plan}/${planInfo.interval} status=${preapproval.status}`
    );

    // Enviar email de bienvenida solo cuando se activa por primera vez
    if (isNew && preapproval.status === "authorized") {
      sendWelcomeEmail({
        userEmail: preapproval.payer_email,
        userName: preapproval.payer_email,
        planKey: planInfo.plan,
        billingInterval: planInfo.interval,
      }).catch((err) => {
        console.error("[Webhook MP] Error enviando email de bienvenida:", err);
      });
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("[Webhook MP] Error inesperado:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
