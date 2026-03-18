import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY ?? "",
});

const INTERNAL_SECRET = process.env.SUPPORT_AGENT_SECRET ?? "";

const RequestSchema = z.object({
  recipientEmail: z.string().email(),
  subject: z.string().max(300),
  instructions: z.string().max(2000),
  originalContext: z.string().max(2000).optional(),
});

const SYSTEM_PROMPT = `Eres el agente de soporte de ZenTrade. Redacta emails de respuesta a usuarios en español latinoamericano neutro.

CONOCIMIENTO DE ZENTRADE:
Planes: Free ($0, 1 cuenta) | Starter ($9/mes, 2 cuentas) | Professional ($29/mes, ilimitadas + CSV import, PDF, dashboard avanzado) | ZenMode ($59/mes, todo Pro + IA: ZenCoach, Revenge Trading Detection, reportes IA).
Pasarela: PayPal (tarjeta, débito, cuenta PayPal).
Target: traders de futuros que quieren pasar evaluaciones de prop firms.

REGLAS DEL EMAIL:
- Saluda con 'Hola,' (sin nombre, no sabemos el nombre)
- Tono directo, cordial, profesional
- Sin markdown, sin asteriscos — solo texto plano
- Máximo 150 palabras
- Termina SIEMPRE con: 'Saludos,\nEquipo ZenTrade'
- NO incluyas asunto ni subject en el cuerpo
- Devuelve SOLO el cuerpo del email, nada más`;

export async function POST(request: Request) {
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
    return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 });
  }

  const { recipientEmail, subject, instructions, originalContext } = parsed.data;

  const userContent = `Redacta un email de soporte para: ${recipientEmail}

Contexto del email original que nos enviaron:
${originalContext ?? "(sin contexto)"}

Mis instrucciones para la respuesta:
${instructions}`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userContent }],
    });

    const textContent = response.content.find(b => b.type === "text");
    const emailBody = textContent?.type === "text" ? textContent.text : "";

    return NextResponse.json({ emailBody, subject });
  } catch (err) {
    return NextResponse.json(
      { error: `Error Claude: ${err instanceof Error ? err.message : "Unknown"}` },
      { status: 500 }
    );
  }
}
