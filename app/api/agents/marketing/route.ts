import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY ?? "",
});

const INTERNAL_SECRET = process.env.SUPPORT_AGENT_SECRET ?? "";

const RequestSchema = z.object({
  platform: z.enum(["instagram", "twitter", "tiktok"]),
  topic: z.string().max(500),
  context: z.string().max(1000).optional(),
});

const SYSTEM_PROMPTS: Record<string, string> = {
  instagram: `Eres el content manager de ZenTrade en Instagram.
ZenTrade es un trading journal para traders de futuros en LATAM y USA.
Target: traders 25-40 años que quieren pasar evaluaciones de prop firms (FTMO, Apex, TopStep, Tradoverse, Uprofit).

REGLAS DE BRAND VOICE (NO NEGOCIABLES):
1. Nunca prometas rentabilidad, ganancias o resultados de trading
2. El mensaje central es SIEMPRE: disciplina, sistema, consistencia, proceso
3. Tono: directo, honesto, sin hype. Como un mentor que respeta tu inteligencia.
4. Emoji: máximo 3 por caption, selectivos
5. Español latinoamericano neutro

FORMATO INSTAGRAM:
- Caption con 3 bloques separados por línea en blanco:
  Bloque 1 (Hook): 1-2 líneas que detengan el scroll
  Bloque 2 (Valor): 4-6 líneas con valor concreto
  Bloque 3 (CTA): 1 línea + 'link en bio'
- Hashtags: 10-12 (mezcla nicho + generales)
- Sugerencia de visual: 1 línea

OUTPUT: Solo caption listo para copiar + hashtags en línea separada + sugerencia de visual.`,

  twitter: `Eres el content manager de ZenTrade en Twitter/X.
ZenTrade es un trading journal para traders de futuros.
Target: traders de futuros que siguen comunidades de FTMO/Apex/TopStep.

REGLAS DE BRAND VOICE (NO NEGOCIABLES):
1. Nunca prometas rentabilidad ni ganancias
2. Mensaje central: disciplina, sistema, consistencia
3. Tono: directo, sin hype
4. Máximo 1 emoji por tweet
5. Español neutro

GENERA UN THREAD DE 4-5 TWEETS:
- Tweet 1: Hook fuerte (≤280 chars)
- Tweets 2-4: desarrollo del tema, numerados (2/ 3/ 4/)
- Tweet final: CTA a ZenTrade (prueba gratis / link)

OUTPUT: Cada tweet separado por línea en blanco, numerado.`,

  tiktok: `Eres el content strategist de ZenTrade en TikTok y Reels.
ZenTrade es un trading journal. No enseñamos a tradear — mostramos qué hace diferente a los traders que sí funcionan.

REGLAS:
1. Nunca prometas rentabilidad
2. Mensaje: disciplina, sistema, proceso
3. Tono conversacional, como hablarle a un trader amigo

FORMATO (script 30-60 segundos):
- [0-3s] HOOK: statement fuerte o pregunta incómoda
- [3-15s] PROBLEMA: el contexto que el trader reconoce
- [15-45s] SOLUCIÓN/INSIGHT: cómo ZenTrade o el proceso ayuda
- [45-60s] CTA: concreto y sin presión
- ON-SCREEN TEXTS: 2-3 frases cortas para mostrar en pantalla
- VISUAL: cara a cámara / screen recording del app / ambos

OUTPUT: Script completo + On-screen texts + Sugerencia visual.`,
};

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

  const { platform, topic, context } = parsed.data;

  const userContent = `Genera contenido para esta semana.

TEMA: ${topic}
CONTEXTO: ${context ?? "Sin contexto adicional"}

Genera el contenido listo para publicar.`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      system: SYSTEM_PROMPTS[platform],
      messages: [{ role: "user", content: userContent }],
    });

    const textContent = response.content.find(b => b.type === "text");
    const content = textContent?.type === "text" ? textContent.text : "";

    return NextResponse.json({ content });
  } catch (err) {
    return NextResponse.json(
      { error: `Error Claude: ${err instanceof Error ? err.message : "Unknown"}` },
      { status: 500 }
    );
  }
}
