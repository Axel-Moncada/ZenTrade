import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

// ─── HTML Email Template ──────────────────────────────────────────────────────

function wrapInEmailTemplate(textContent: string): string {
  const html = textContent
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .split("\n")
    .map(line => {
      const trimmed = line.trim();
      if (!trimmed) return "";
      return `<p style="margin:0 0 14px 0;color:#0D1F18;font-size:15px;line-height:1.8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${trimmed}</p>`;
    })
    .filter(Boolean)
    .join("\n");

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#ededed;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">

  <!-- Header oscuro -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#112510;">
    <tr>
      <td align="center" style="padding:32px 24px 28px;">
        <img src="https://rsunvtanukainhbtnmlu.supabase.co/storage/v1/object/public/logo/logo-hori-white.png"
             alt="ZenTrade" width="160"
             style="display:block;margin:0 auto;height:auto;" />
        <p style="margin:14px 0 0 0;font-size:11px;font-weight:700;color:#00C17C;letter-spacing:2.5px;text-transform:uppercase;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
          Soporte
        </p>
      </td>
    </tr>
  </table>

  <!-- Contenido claro -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ededed;padding:32px 24px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

          <!-- Card blanca con el mensaje -->
          <tr>
            <td style="background:#FFFFFF;border:1px solid #D1E8DC;border-radius:14px;padding:36px 40px;">
              ${html}
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td align="center" style="padding:28px 0 8px;">
              <a href="https://www.zen-trader.com"
                 style="display:inline-block;background-color:#00C17C;color:#001B1F;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;font-weight:700;text-decoration:none;padding:13px 32px;border-radius:10px;letter-spacing:0.3px;">
                Ir a ZenTrade →
              </a>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

  <!-- Footer oscuro -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#112510;">
    <tr>
      <td align="center" style="padding:28px 24px 32px;">
        <p style="margin:0 0 6px 0;font-size:14px;color:rgba(242,243,244,0.55);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
          ZenTrade · Trading Journal para Futuros
        </p>
        <a href="https://www.zen-trader.com"
           style="color:#00C17C;text-decoration:none;font-size:13px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
          zen-trader.com
        </a>
        <p style="margin:14px 0 0 0;font-size:12px;color:rgba(242,243,244,0.25);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
          Responde a este email si tienes más preguntas.
        </p>
      </td>
    </tr>
  </table>

</body>
</html>`;
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY ?? "",
});

// n8n llama este endpoint con un Bearer token interno
const INTERNAL_SECRET = process.env.SUPPORT_AGENT_SECRET ?? "";

const RequestSchema = z.object({
  from: z.string().email(),
  subject: z.string().max(300),
  body: z.string().max(4000),
  /** Historial de emails previos en este hilo (opcional) */
  threadHistory: z.string().max(2000).optional(),
});

export interface SupportAgentResponse {
  shouldAutoReply: boolean;
  confidence: number; // 0–1
  category: SupportCategory;
  reply: string;
  draft: string; // siempre hay draft, aunque se auto-responda
  escalationReason?: string;
}

type SupportCategory =
  | "billing"
  | "technical"
  | "feature_request"
  | "account"
  | "how_to"
  | "bug_report"
  | "other";

const SYSTEM_PROMPT = `Eres el agente de soporte de ZenTrade, un trading journal para traders de futuros.
Tu trabajo: analizar emails de soporte y responder de forma clara, directa y útil.

REGLA PRINCIPAL: Si la pregunta puede responderse con el CONOCIMIENTO BASE de abajo, SIEMPRE responde automáticamente (shouldAutoReply: true, confidence >= 0.85). Esto incluye preguntas sobre planes, precios, features, cómo usar el producto, cancelación, importar trades, métodos de pago, y cualquier otra pregunta cubierta en las FAQ. El cuerpo del email puede estar vacío o incompleto — en ese caso, infiere la intención del asunto.

REGLAS DE ESCALACIÓN (solo estos casos):
- Escala al equipo humano (shouldAutoReply: false) únicamente si:
  * El usuario reporta un bug crítico con pérdida de datos
  * El tema es legal, reembolsos o disputas de pago activa
  * La pregunta requiere revisar la cuenta específica del usuario para diagnosticar un problema técnico
  * El usuario parece frustrado o enojado de forma seria

CONOCIMIENTO BASE:

PLANES Y PRECIOS:
- Free: $0 | 1 cuenta, registro manual, dashboard básico, export CSV
- Starter: $9/mes o $7/mes anual ($84/año) | 2 cuentas, todo lo del Free + soporte por email
- Professional: $29/mes o $21/mes anual ($249/año) | cuentas ilimitadas + CSV import, PDF export, dashboard avanzado, profit factor, equity curve, filtros avanzados, Trading Plan PDF, calendario emociones
- ZenMode: $59/mes o $42/mes anual ($499/año) | todo lo de Pro + features IA: Revenge Trading Detection, alertas de riesgo, reporte semanal IA, ZenCoach in-app

PREGUNTAS FRECUENTES:

P: ¿Cómo cancelo mi suscripción?
R: Puedes cancelar desde el dashboard → Configuración → Billing → Cancelar suscripción. La cancelación es efectiva al final del período facturado. No hay penalización.

P: ¿Cómo cambio mi plan?
R: Dashboard → Configuración → Billing → Cambiar plan. Los cambios son inmediatos al subir de plan. Al bajar de plan, el cambio se aplica al próximo período.

P: ¿Cómo importo trades desde Rithmic/NinjaTrader/Tradoverse?
R: Dashboard → Trades → Importar CSV. Sube el archivo y mapea las columnas. Soporta los formatos estándar de Rithmic, NinjaTrader y Tradovate. El CSV import está disponible desde el plan Professional.

P: ¿Puedo exportar mis datos?
R: Sí. Trades → Export CSV (disponible en todos los planes). Trading Plan PDF está disponible desde Professional.

P: ¿Qué es el Revenge Trading Detection?
R: Es una feature de ZenMode que analiza automáticamente tus trades y detecta patrones de trading emocional: entradas rápidas después de pérdidas (<30 min) y series de 3+ pérdidas consecutivas. Aparece como alerta naranja en tu dashboard.

P: ¿ZenCoach es real o solo un chatbot?
R: ZenCoach es un asistente de IA que tiene acceso a tus datos reales de trading (últimos 30 días, trading plan, estadísticas). No es asesoría financiera, es coaching de disciplina y patrones.

P: ¿Puedo tener múltiples cuentas?
R: Free: 1 cuenta. Starter: 2 cuentas. Professional y ZenMode: ilimitadas.

P: ¿Cómo funciona la regla de consistencia?
R: Es configurable por cuenta (20%–50%). Significa que tu día más rentable no puede representar más del X% de tu ganancia total del período. Común en prop firms como FTMO.

P: No recibo el email de confirmación al registrarme.
R: Revisa la carpeta de spam. Si no aparece, escríbenos con el email con el que intentaste registrarte y lo activamos manualmente.

P: ¿Tienen app móvil?
R: Por ahora no. ZenTrade es desktop-first (optimizado para 1280px+). La app móvil está en el roadmap.

P: ¿Cuándo sale X feature?
R: Si es ZenMode, probablemente está en construcción. Para otras features, no tenemos fechas comprometidas. Puedes dejar tu sugerencia y la consideramos para el roadmap.

P: ¿Aceptan Mercado Pago / PayPal / tarjeta?
R: Aceptamos PayPal (tarjeta de crédito, débito y cuenta PayPal).

TONO:
- Directo, claro, sin relleno
- Español neutro (latinoamericano)
- Máximo 150 palabras por respuesta
- No uses "¡Hola!", "¡Genial!", "¡Por supuesto!" ni frases corporativas vacías
- Termina siempre con un siguiente paso claro para el usuario

FORMATO DE RESPUESTA (JSON estricto):
Debes responder ÚNICAMENTE con un objeto JSON válido con esta estructura exacta:
{
  "shouldAutoReply": boolean,
  "confidence": number (0.0 a 1.0),
  "category": "billing" | "technical" | "feature_request" | "account" | "how_to" | "bug_report" | "other",
  "reply": "texto listo para enviar al usuario",
  "draft": "misma respuesta pero con posibilidad de que el humano edite",
  "escalationReason": "solo si shouldAutoReply es false — por qué escalar"
}`;

/**
 * POST /api/agents/support
 *
 * Llamado por n8n cuando llega un email a support@zen-trader.com.
 * Requiere header Authorization: Bearer {SUPPORT_AGENT_SECRET}
 *
 * Retorna SupportAgentResponse.
 */
export async function POST(request: Request) {
  // Auth — solo n8n puede llamar esto
  const auth = request.headers.get("authorization");
  if (!INTERNAL_SECRET || auth !== `Bearer ${INTERNAL_SECRET}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Parámetros inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { from, subject, body: emailBody, threadHistory } = parsed.data;

  const userContent = `EMAIL DE SOPORTE:
De: ${from}
Asunto: ${subject}

Contenido:
${emailBody}
${threadHistory ? `\nHistorial del hilo:\n${threadHistory}` : ""}`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userContent }],
    });

    const textContent = response.content.find(b => b.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text content in response");
    }

    // Parse JSON response
    // Extraer JSON — Claude a veces lo envuelve en ```json ... ```
    let rawText = textContent.text.trim();
    const codeBlockMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) rawText = codeBlockMatch[1].trim();

    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const agentResponse = JSON.parse(jsonMatch[0]) as SupportAgentResponse;

    // Validate minimum shape
    if (typeof agentResponse.shouldAutoReply !== "boolean") {
      throw new Error("Invalid agent response shape");
    }
    // Normalize nulls to empty strings
    agentResponse.reply = agentResponse.reply ?? "";
    agentResponse.draft = agentResponse.draft ?? agentResponse.reply;

    // Convertir reply a HTML con el template de ZenTrade
    agentResponse.reply = wrapInEmailTemplate(agentResponse.reply);

    return NextResponse.json(agentResponse);
  } catch (err) {
    // If parsing fails, always escalate
    const fallback: SupportAgentResponse = {
      shouldAutoReply: false,
      confidence: 0,
      category: "other",
      reply: "",
      draft: `Hola,\n\nGracias por escribirnos. Hemos recibido tu mensaje y te responderemos a la brevedad.\n\nEquipo ZenTrade`,
      escalationReason: `Error interno del agente: ${err instanceof Error ? err.message : "Unknown error"}`,
    };
    return NextResponse.json(fallback, { status: 200 }); // 200 para que n8n pueda procesar
  }
}
