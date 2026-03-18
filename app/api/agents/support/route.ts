import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

// ─── HTML Email Template ──────────────────────────────────────────────────────

function wrapInEmailTemplate(textContent: string): string {
  // Convertir markdown básico a HTML
  const html = textContent
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .split("\n")
    .map(line => {
      const trimmed = line.trim();
      if (!trimmed) return "";
      return `<p style="margin:0 0 12px 0;color:#374151;font-size:15px;line-height:1.6;">${trimmed}</p>`;
    })
    .filter(Boolean)
    .join("\n");

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#18181b 0%,#27272a 100%);border-radius:12px 12px 0 0;padding:28px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <span style="font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">Zen<span style="color:#a78bfa;">Trade</span></span>
                  </td>
                  <td align="right">
                    <span style="font-size:12px;color:#71717a;text-transform:uppercase;letter-spacing:1px;">Soporte</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:36px 40px;">
              ${html}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;border-top:1px solid #e5e7eb;border-radius:0 0 12px 12px;padding:20px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.5;">
                      ZenTrade · Trading Journal para Futuros<br>
                      <a href="https://www.zen-trader.com" style="color:#a78bfa;text-decoration:none;">zen-trader.com</a>
                    </p>
                  </td>
                  <td align="right">
                    <p style="margin:0;font-size:12px;color:#9ca3af;">
                      Responde a este email si tienes más preguntas.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
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
