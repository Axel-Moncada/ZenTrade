import { NextRequest, NextResponse } from "next/server";
import { resend, FROM_EMAIL } from "@/lib/resend/client";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

// ─── Config ───────────────────────────────────────────────────────────────────

const WEBHOOK_SECRET = process.env.RESEND_INBOUND_SECRET ?? "";
const ADMIN_EMAIL    = process.env.SUPPORT_ADMIN_EMAIL ?? "support@zen-trader.com";
const SUPPORT_EMAIL  = "support@zen-trader.com";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY ?? "" });

// ─── Resend Inbound payload schema ───────────────────────────────────────────

const ResendInboundSchema = z.object({
  from:    z.string(),
  to:      z.union([z.string(), z.array(z.string())]),
  subject: z.string().default("(sin asunto)"),
  text:    z.string().optional().default(""),
  html:    z.string().optional().default(""),
  headers: z.record(z.string()).optional(),
});

// ─── Support agent types ──────────────────────────────────────────────────────

type SupportCategory =
  | "billing" | "technical" | "feature_request"
  | "account" | "how_to" | "bug_report" | "other";

interface AgentResult {
  shouldAutoReply:   boolean;
  confidence:        number;
  category:          SupportCategory;
  reply:             string;
  draft:             string;
  escalationReason?: string;
}

// ─── System prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Eres el agente de soporte de ZenTrade, un trading journal para traders de futuros.
Tu trabajo: analizar emails de soporte y responder de forma clara, directa y útil.

REGLA PRINCIPAL: Si la pregunta puede responderse con el CONOCIMIENTO BASE de abajo, SIEMPRE responde automáticamente (shouldAutoReply: true, confidence >= 0.85). Esto incluye preguntas sobre planes, precios, features, cómo usar el producto, cancelación, importar trades, métodos de pago, y cualquier otra pregunta cubierta en las FAQ. El cuerpo del email puede estar vacío o incompleto — en ese caso, infiere la intención del asunto.

REGLAS DE ESCALACIÓN (solo estos casos, shouldAutoReply: false):
- Bug crítico con pérdida de datos reportada
- Tema legal, reembolso activo o disputa de pago
- Requiere revisar la cuenta específica del usuario para diagnosticar
- Usuario frustrado o enojado de forma seria

CONOCIMIENTO BASE:

PLANES Y PRECIOS:
- Free: $0 | 1 cuenta, registro manual, dashboard básico, export CSV
- Starter: $9/mes o $7/mes anual ($84/año) | 2 cuentas, todo Free + soporte email
- Professional: $29/mes o $21/mes anual ($249/año) | cuentas ilimitadas, CSV import, PDF export, dashboard avanzado, profit factor, equity curve, Trading Plan PDF, calendario emociones
- ZenMode: $59/mes o $42/mes anual ($499/año) | todo Pro + Revenge Trading Detection IA, alertas de riesgo, reporte semanal IA, radar de mercado

PREGUNTAS FRECUENTES:

P: ¿Cómo cancelo?
R: Dashboard → Facturación → Cancelar suscripción. Efectivo al final del período. Sin penalización.

P: ¿Cómo cambio de plan?
R: Dashboard → Facturación → Cambiar plan. Al subir es inmediato. Al bajar aplica al próximo período.

P: ¿Cómo importo trades (Rithmic/NinjaTrader/Tradovate)?
R: Dashboard → Trades → Importar CSV. Sube el archivo y mapea columnas. Disponible desde Professional.

P: ¿Puedo exportar mis datos?
R: Sí. Trades → Export CSV (todos los planes). Trading Plan PDF desde Professional.

P: ¿Qué es Revenge Trading Detection?
R: Feature ZenMode. Detecta entradas rápidas después de pérdidas (<30 min) y series de 3+ pérdidas consecutivas. Aparece como alerta en el dashboard.

P: ¿Cuántas cuentas puedo tener?
R: Free: 1. Starter: 2. Professional y ZenMode: ilimitadas.

P: ¿Cómo funciona la regla de consistencia?
R: Configurable por cuenta (20–50%). Tu mejor día no puede superar X% de la ganancia total. Igual que FTMO.

P: No recibo el email de confirmación.
R: Revisa spam. Si no aparece en 5 minutos escríbenos con tu email y lo activamos manualmente.

P: ¿Tienen app móvil?
R: No por ahora. Es desktop-first. App móvil está en el roadmap.

P: ¿Qué métodos de pago aceptan?
R: Wompi (tarjeta crédito/débito colombiana) para pagos en COP. Próximamente métodos internacionales.

TONO:
- Directo, claro, sin relleno. Español neutro latinoamericano.
- Máximo 150 palabras. Sin "¡Hola!", "¡Genial!", "¡Por supuesto!"
- Termina con un siguiente paso claro.

RESPONDE ÚNICAMENTE con JSON válido:
{
  "shouldAutoReply": boolean,
  "confidence": number,
  "category": "billing"|"technical"|"feature_request"|"account"|"how_to"|"bug_report"|"other",
  "reply": "texto listo para enviar al usuario",
  "draft": "mismo texto para que el humano edite si lo necesita",
  "escalationReason": "solo si shouldAutoReply es false"
}`;

// ─── AI processing ────────────────────────────────────────────────────────────

async function runSupportAgent(
  from: string,
  subject: string,
  body: string
): Promise<AgentResult> {
  const userContent = `EMAIL DE SOPORTE:\nDe: ${from}\nAsunto: ${subject}\n\nContenido:\n${body || "(sin cuerpo)"}`;

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userContent }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") throw new Error("No text in response");

  let raw = textBlock.text.trim();
  const codeBlock = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlock) raw = codeBlock[1].trim();
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON in response");

  const result = JSON.parse(jsonMatch[0]) as AgentResult;
  result.reply = result.reply ?? "";
  result.draft = result.draft ?? result.reply;
  return result;
}

// ─── Email HTML wrapper ───────────────────────────────────────────────────────

function wrapReply(text: string): string {
  const html = text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .split("\n")
    .filter((l) => l.trim())
    .map(
      (l) =>
        `<p style="margin:0 0 14px 0;color:#0D1F18;font-size:15px;line-height:1.8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${l}</p>`
    )
    .join("\n");

  return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#ededed;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#112510;">
    <tr><td align="center" style="padding:32px 24px 28px;">
      <img src="https://rsunvtanukainhbtnmlu.supabase.co/storage/v1/object/public/logo/logo-hori-white.png" alt="ZenTrade" width="160" style="display:block;" />
      <p style="margin:14px 0 0;font-size:11px;font-weight:700;color:#00C17C;letter-spacing:2.5px;text-transform:uppercase;">Soporte</p>
    </td></tr>
  </table>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#ededed;padding:32px 24px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr><td style="background:#fff;border:1px solid #D1E8DC;border-radius:14px;padding:36px 40px;">${html}</td></tr>
        <tr><td align="center" style="padding:28px 0 8px;">
          <a href="https://zen-trader.com" style="display:inline-block;background:#00C17C;color:#001B1F;font-size:14px;font-weight:700;text-decoration:none;padding:13px 32px;border-radius:10px;">Ir a ZenTrade →</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#112510;">
    <tr><td align="center" style="padding:28px 24px 32px;">
      <p style="margin:0 0 6px;font-size:14px;color:rgba(242,243,244,0.55);">ZenTrade · Trading Journal para Futuros</p>
      <a href="https://zen-trader.com" style="color:#00C17C;text-decoration:none;font-size:13px;">zen-trader.com</a>
    </td></tr>
  </table>
</body></html>`;
}

// Email de escalación para el admin
function buildEscalationEmail(
  from: string,
  subject: string,
  body: string,
  result: AgentResult
): string {
  return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#7c2d12;padding:24px;">
    <tr><td align="center">
      <p style="margin:0;color:#fff;font-size:16px;font-weight:700;">⚠️ Soporte — Escalación requerida</p>
    </td></tr>
  </table>
  <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;margin:24px auto;">
    <tr><td style="background:#fff;border-radius:12px;padding:32px;border:1px solid #e5e7eb;">
      <p style="margin:0 0 8px;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">De</p>
      <p style="margin:0 0 20px;font-size:15px;color:#111;">${from}</p>
      <p style="margin:0 0 8px;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">Asunto</p>
      <p style="margin:0 0 20px;font-size:15px;color:#111;">${subject}</p>
      <p style="margin:0 0 8px;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">Mensaje</p>
      <p style="margin:0 0 20px;font-size:15px;color:#111;white-space:pre-wrap;">${body || "(sin cuerpo)"}</p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;" />
      <p style="margin:0 0 8px;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">Motivo de escalación</p>
      <p style="margin:0 0 20px;font-size:14px;color:#dc2626;">${result.escalationReason ?? "Sin especificar"}</p>
      <p style="margin:0 0 8px;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">Borrador sugerido por IA</p>
      <p style="margin:0;font-size:14px;color:#374151;background:#f9fafb;padding:16px;border-radius:8px;white-space:pre-wrap;">${result.draft}</p>
    </td></tr>
  </table>
</body></html>`;
}

// ─── Webhook handler ──────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // Verificar secret — se configura como query param en la URL del webhook en Resend
  // Ej: https://zen-trader.com/api/webhooks/resend-inbound?secret=TU_SECRET
  const secret = request.nextUrl.searchParams.get("secret");
  if (!WEBHOOK_SECRET || secret !== WEBHOOK_SECRET) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const parsed = ResendInboundSchema.safeParse(rawBody);
  if (!parsed.success) {
    console.error("[Support] Payload inválido:", parsed.error.flatten());
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }

  const { from, subject, text, html } = parsed.data;
  // Preferir texto plano; si no hay, hacer strip del HTML
  const body = text?.trim() || html?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() || "";

  console.log(`[Support] Email recibido de ${from} — "${subject}"`);

  // Ejecutar agente IA
  let result: AgentResult;
  try {
    result = await runSupportAgent(from, subject, body);
  } catch (err) {
    console.error("[Support] Error en agente IA:", err);
    // Escalación de emergencia — notificar al admin
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `[SOPORTE] Error IA — respuesta manual requerida: ${subject}`,
      html: buildEscalationEmail(from, subject, body, {
        shouldAutoReply: false,
        confidence: 0,
        category: "other",
        reply: "",
        draft: "",
        escalationReason: `Error interno del agente: ${err instanceof Error ? err.message : "Unknown error"}`,
      }),
    });
    return NextResponse.json({ ok: true, action: "escalated_error" });
  }

  console.log(
    `[Support] Agente respondió — autoReply:${result.shouldAutoReply} confidence:${result.confidence} category:${result.category}`
  );

  if (result.shouldAutoReply && result.confidence >= 0.75) {
    // ── Auto-respuesta al usuario ────────────────────────────────────────────
    const { error } = await resend.emails.send({
      from: `ZenTrade Soporte <${SUPPORT_EMAIL}>`,
      to: from,
      replyTo: SUPPORT_EMAIL,
      subject: `Re: ${subject}`,
      html: wrapReply(result.reply),
    });

    if (error) {
      console.error("[Support] Error enviando auto-respuesta:", error);
    } else {
      console.log(`[Support] Auto-respuesta enviada a ${from}`);
    }

    return NextResponse.json({ ok: true, action: "auto_replied", category: result.category });
  } else {
    // ── Escalación al admin con draft de la IA ───────────────────────────────
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      replyTo: from,                   // Reply va directo al usuario
      subject: `[Soporte] ${subject}`,
      html: buildEscalationEmail(from, subject, body, result),
    });

    if (error) {
      console.error("[Support] Error enviando escalación:", error);
    } else {
      console.log(`[Support] Escalación enviada al admin — motivo: ${result.escalationReason}`);
    }

    return NextResponse.json({ ok: true, action: "escalated", reason: result.escalationReason });
  }
}
