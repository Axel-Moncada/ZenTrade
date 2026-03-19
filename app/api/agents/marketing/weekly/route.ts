import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY ?? "",
});

const INTERNAL_SECRET = process.env.SUPPORT_AGENT_SECRET ?? "";

const RequestSchema = z.object({
  topic: z.string().max(500),
  context: z.string().max(1000).optional(),
});

// ─── Helpers ────────────────────────────────────────────────────────────────

function getWeekInfo(): { week: string; weekStart: string; weekEnd: string } {
  const now = new Date();
  const year = now.getFullYear();
  // ISO week number
  const startOfYear = new Date(year, 0, 1);
  const weekNum = Math.ceil(
    ((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7
  );

  // Monday of current week
  const monday = new Date(now);
  const day = now.getDay() || 7;
  monday.setDate(now.getDate() - day + 1);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const fmt = (d: Date) => d.toISOString().split("T")[0];

  return {
    week: `${year}-W${String(weekNum).padStart(2, "0")}`,
    weekStart: fmt(monday),
    weekEnd: fmt(sunday),
  };
}

function parseJSON<T>(text: string, fallback: T): T {
  try {
    // Remove markdown code blocks if present
    const cleaned = text.replace(/```(?:json)?\s*([\s\S]*?)```/g, "$1").trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return fallback;
    return JSON.parse(jsonMatch[0]) as T;
  } catch {
    return fallback;
  }
}

// ─── System Prompts ──────────────────────────────────────────────────────────

const INSTAGRAM_PROMPT = `Eres el content manager de ZenTrade en Instagram.
ZenTrade es un trading journal para traders de futuros en LATAM y USA.
Target: traders 25-40 años que quieren pasar evaluaciones de prop firms (FTMO, Apex, TopStep, Tradoverse, Uprofit).

BRAND VOICE (NO NEGOCIABLES):
- Nunca prometas rentabilidad ni ganancias
- Mensaje central: disciplina, sistema, consistencia, proceso
- Tono: directo, honesto, sin hype. Como un mentor que respeta tu inteligencia.
- Máximo 3 emojis por caption, selectivos
- Español latinoamericano neutro

FORMATO:
Caption con 3 bloques separados por línea en blanco:
  Bloque 1 (Hook): 1-2 líneas que detengan el scroll
  Bloque 2 (Valor): 4-6 líneas con valor concreto
  Bloque 3 (CTA): 1 línea + "link en bio"
Hashtags: 10-12 (mezcla nicho + generales, en una sola línea)
Image Prompt: prompt detallado en inglés para generar la imagen con Midjourney o DALL-E 3.
  - Estilo: clean, professional, dark finance aesthetic
  - Sin personas — solo datos, gráficos, conceptos visuales
  - Formato: cuadrado 1:1

Responde ÚNICAMENTE con JSON válido, sin markdown, sin explicación:
{
  "caption": "texto completo del caption sin hashtags",
  "hashtags": "#hashtag1 #hashtag2 #hashtag3 (10-12 en una línea)",
  "imagePrompt": "prompt en inglés para Midjourney/DALL-E 3"
}`;

const TWITTER_PROMPT = `Eres el content manager de ZenTrade en Twitter/X.
ZenTrade es un trading journal para traders de futuros.
Target: traders que siguen comunidades de FTMO/Apex/TopStep en Twitter/X.

BRAND VOICE (NO NEGOCIABLES):
- Nunca prometas rentabilidad ni ganancias
- Mensaje central: disciplina, sistema, consistencia
- Tono: directo, sin hype
- Máximo 1 emoji por tweet
- Español neutro

FORMATO — Thread de 4-5 tweets:
- Tweet 1: Hook fuerte (≤280 chars, sin número)
- Tweets 2-4: desarrollo numerado (2/ 3/ 4/)
- Tweet final: CTA a ZenTrade con "zen-trader.com"

Responde ÚNICAMENTE con JSON válido, sin markdown, sin explicación:
{
  "tweets": [
    "Tweet 1 hook (≤280 chars)",
    "2/ segundo tweet...",
    "3/ tercer tweet...",
    "4/ CTA a zen-trader.com"
  ]
}`;

const TIKTOK_PROMPT = `Eres el content strategist de ZenTrade en TikTok y Reels.
ZenTrade es un trading journal. No enseñamos a tradear — mostramos qué hace diferente a los traders que sí funcionan.

REGLAS:
- Nunca prometas rentabilidad
- Mensaje: disciplina, sistema, proceso
- Tono conversacional, como hablarle a un trader amigo

FORMATO — Script 30-60 segundos:
[0-3s] HOOK: statement fuerte o pregunta incómoda
[3-15s] PROBLEMA: contexto que el trader reconoce
[15-45s] SOLUCIÓN/INSIGHT: cómo ZenTrade o el proceso ayuda
[45-60s] CTA: concreto y sin presión

ON-SCREEN TEXTS: 2-3 frases cortas (máximo 5 palabras cada una)
VISUAL: cara a cámara / screen recording del app / ambos

VIDEO PROMPT: prompt en inglés para generar el video con Runway ML, Kling AI o Pika.
  - Describe la escena: qué se ve en pantalla, movimiento de cámara, atmósfera
  - Estilo: cinematic, professional, finance aesthetic
  - Duración: 30-60 segundos
  - Sin texto en el video (se añade en edición)

Responde ÚNICAMENTE con JSON válido, sin markdown, sin explicación:
{
  "script": "Script completo con timestamps [0-3s] etc.",
  "onScreenTexts": ["Texto 1", "Texto 2", "Texto 3"],
  "videoPrompt": "prompt en inglés para Runway ML / Kling AI"
}`;

// ─── Types ───────────────────────────────────────────────────────────────────

interface InstagramContent {
  caption: string;
  hashtags: string;
  imagePrompt: string;
}

interface TwitterContent {
  tweets: string[];
}

interface TikTokContent {
  script: string;
  onScreenTexts: string[];
  videoPrompt: string;
}

// ─── Route ───────────────────────────────────────────────────────────────────

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

  const { topic, context } = parsed.data;
  const { week, weekStart, weekEnd } = getWeekInfo();

  const userMsg = `Genera contenido para esta semana.

TEMA: ${topic}
CONTEXTO: ${context ?? "Sin contexto adicional"}`;

  // Generate all 3 platforms in parallel
  const [igRes, twRes, ttRes] = await Promise.all([
    anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: INSTAGRAM_PROMPT,
      messages: [{ role: "user", content: userMsg }],
    }),
    anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: TWITTER_PROMPT,
      messages: [{ role: "user", content: userMsg }],
    }),
    anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: TIKTOK_PROMPT,
      messages: [{ role: "user", content: userMsg }],
    }),
  ]);

  const getText = (res: Anthropic.Message) => {
    const block = res.content.find(b => b.type === "text");
    return block?.type === "text" ? block.text : "";
  };

  const instagram = parseJSON<InstagramContent>(getText(igRes), {
    caption: getText(igRes),
    hashtags: "",
    imagePrompt: "",
  });

  const twitter = parseJSON<TwitterContent>(getText(twRes), {
    tweets: [getText(twRes)],
  });

  const tiktok = parseJSON<TikTokContent>(getText(ttRes), {
    script: getText(ttRes),
    onScreenTexts: [],
    videoPrompt: "",
  });

  return NextResponse.json({
    week,
    weekStart,
    weekEnd,
    topic,
    instagram,
    twitter,
    tiktok,
  });
}
