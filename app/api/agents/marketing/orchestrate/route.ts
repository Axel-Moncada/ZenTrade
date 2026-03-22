import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY ?? "",
});

const INTERNAL_SECRET = process.env.SUPPORT_AGENT_SECRET ?? "";

const RequestSchema = z.object({
  topicOverride: z.string().max(300).optional(), // si está vacío, el strategist decide
});

// ─── 4-week Psychological Arc ────────────────────────────────────────────────
// Ciclo que se repite. Ancla: lunes 5 enero 2026
const CYCLE_ANCHOR = new Date("2026-01-05T00:00:00.000Z");

const CYCLE_WEEKS = [
  {
    id: "A",
    name: "Conciencia del Dolor",
    principle: "Loss Aversion + Problem Aware",
    brief: "El trader reconoce por qué sigue fallando evaluaciones. No es falta de estrategia — es falta de sistema y disciplina medible.",
    objective: "awareness" as const,
  },
  {
    id: "B",
    name: "Educación con Autoridad",
    principle: "Authority Bias + Interest",
    brief: "Datos concretos, métricas reales. Lo que los prop firms realmente miden: profit factor, consistency %, max drawdown diario. La mayoría de traders nunca los revisa.",
    objective: "consideration" as const,
  },
  {
    id: "C",
    name: "Prueba Social",
    principle: "Social Proof + Availability Heuristic",
    brief: "Patrones reales que ZenTrade detecta: revenge trading, horarios de pérdida, sesiones emocionales. Ver que otros traders similares tienen estos datos hace que parezca alcanzable.",
    objective: "consideration" as const,
  },
  {
    id: "D",
    name: "Conversión por Identidad",
    principle: "Commitment & Consistency + Identity",
    brief: "Quien ya consume 3 semanas de contenido sobre disciplina y métricas, se auto-identifica como 'trader serio'. No registrarse sería inconsistente con esa identidad. El CTA no es 'prueba la app' — es 'actúa consistente con quien ya decidiste ser'.",
    objective: "conversion" as const,
  },
] as const;

function getCurrentCycleWeek() {
  const now = new Date();
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const weeksSinceAnchor = Math.floor(
    (now.getTime() - CYCLE_ANCHOR.getTime()) / msPerWeek
  );
  const cycleIndex = ((weeksSinceAnchor % 4) + 4) % 4;
  return CYCLE_WEEKS[cycleIndex];
}

function getWeekInfo() {
  const now = new Date();
  const day = now.getDay() || 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - day + 1);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const year = now.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const weekNum = Math.ceil(
    ((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7
  );

  const fmt = (d: Date) => d.toISOString().split("T")[0];
  return {
    week: `${year}-W${String(weekNum).padStart(2, "0")}`,
    weekStart: fmt(monday),
    weekEnd: fmt(sunday),
  };
}

// ─── Strategist Persona (from zentrade-marketing-strategist agent) ───────────
const STRATEGIST_SYSTEM = `Eres el marketing strategist de ZenTrade, un SaaS trading journal para traders de futuros en LATAM y USA.

PRODUCTO:
- Target: traders 25-40 años que buscan pasar evaluaciones de prop firms (FTMO, Apex, TopStep, Tradoverse, Uprofit)
- Planes: Free ($0) | Starter ($9/mes) | Professional ($29/mes) | ZenMode ($59/mes)
- Diferenciadores clave: Revenge Trading Detection (IA, ZenMode), reporte semanal con IA (Pro+), benchmarking vs prop firms, KPIs avanzados (profit factor, equity curve, consistency %)
- Posicionamiento: "El journal de trading diseñado para traders que van en serio con las prop firms — con IA que te ayuda a no sabotearte."

PRINCIPIOS QUE APLICAS:
- Loss Aversion: los traders temen más perder la evaluación que el deseo de ganarla
- Authority Bias: datos concretos y métricas crean credibilidad instantánea
- Social Proof: ver que traders similares usan ZenTrade reduce el riesgo percibido
- Commitment & Consistency: quien tomó pasos hacia la disciplina quiere ser consistente con esa identidad
- Mere Exposure Effect: presencia semanal constante construye preferencia de marca
- Contrast Effect: mostrar "antes sin journal" vs "después con journal" hace el valor obvio

REGLAS DE CONTENIDO:
- Nunca prometas rentabilidad ni ganancias
- Lidera con el pain del trader, no con la feature del producto
- Tono: directo, sin hype, como un mentor que respeta tu inteligencia
- Español latinoamericano neutro
- Máximo 3 emojis por post

COMPETENCIA:
- TradeZella: sin foco LATAM, más caro, sin Spanish UI — ZenTrade gana en accesibilidad y precio
- Edgewonk: desktop-only, sin IA, UX anticuada — ZenTrade gana en modernidad y IA
- Tradervue: complejo para beginners, sin foco prop firms — ZenTrade gana en simplicidad y verticalizacion`;

// ─── Platform Content System Prompts ────────────────────────────────────────

function getInstagramPrompt(strategy: StrategyBrief) {
  return `${STRATEGIST_SYSTEM}

BRIEF ESTRATÉGICO DE ESTA SEMANA:
- Tema: ${strategy.topic}
- Ángulo psicológico: ${strategy.psychologicalAngle}
- Audiencia objetivo: ${strategy.targetAudience}
- Objetivo: ${strategy.conversionObjective}
- Contexto: ${strategy.contentContext}

Genera el post de Instagram aplicando exactamente el ángulo psicológico indicado.

FORMATO:
Caption con 3 bloques separados por línea en blanco:
  Bloque 1 (Hook): 1-2 líneas que detengan el scroll — usa el principio psicológico del brief
  Bloque 2 (Valor): 2-4 líneas con valor concreto y específico de trading/pruebas de fondeo — evita generalidades, da datos, ejemplos o insights accionables
  Bloque 3 (CTA): 1 línea + "link en bio" o similar — sin presión, orientada a la acción consistente con el brief invitando a concer zen-trader.com y ser rentable
Hashtags: 10-12 (mezcla nicho trading + pruebas de fondeo + generales)
Image Copy: texto corto que va como OVERLAY encima de la imagen (lo que se lee en el diseño antes de leer el caption)
  - MÁXIMO 2 líneas, máximo 7 palabras por línea — tiene que leerse en 1 segundo
  - Debe aplicar UNO de estos principios psicológicos según el ángulo del brief:
    * Pattern Interrupt: rompe el frame esperado ("No fue la estrategia.")
    * Loss Aversion: amenaza de pérdida concreta ("Tu mejor día = mayor riesgo.")
    * Curiosity Gap: pregunta que no puede ignorarse ("¿Cuándo más pierdes?")
    * Contrast Effect: antes vs después en pocas palabras ("Sin datos. Con datos.")
  - Tono: directo, sin hype, como un dato que te golpea
  - Sin emojis en la imagen
  - Ejemplo bueno: "El 90% falla por esto." / "No es la estrategia."
  - Ejemplo malo: "Descubre cómo mejorar tu trading con ZenTrade hoy!"

Image Prompt: prompt detallado en inglés para nano banana 2 o midjourney, que refleje el tema y ángulo psicológico de la semana
  - Estilo: Fondo para el post  que sean fotografias con mucha calidad publicitaria, realistas, con estética financiera (trading setups, pantallas con gráficos, traders analizando datos) o escenas que reflejen el dolor/insight del brief (frustración, revelación, superación) — evitar ilustraciones o estilos caricaturescos en su lugar buscar realismo y conexión emocional, con composición clara y espacio para texto legible. solo la imagen sin textos ni logos
  - Formato 1:1 para Instagram

Responde ÚNICAMENTE con JSON válido:
{
  "caption": "caption sin hashtags",
  "hashtags": "#hashtag1 #hashtag2 ... (10-12 en una línea)",
  "imageCopy": "línea 1 (máx 7 palabras)\nLínea 2 opcional (máx 7 palabras)",
  "imagePrompt": "prompt en inglés para Midjourney/DALL-E 3"
}`;
}

function getTwitterPrompt(strategy: StrategyBrief) {
  return `${STRATEGIST_SYSTEM}

BRIEF ESTRATÉGICO DE ESTA SEMANA:
- Tema: ${strategy.topic}
- Ángulo psicológico: ${strategy.psychologicalAngle}
- Audiencia objetivo: ${strategy.targetAudience}
- Objetivo: ${strategy.conversionObjective}
- Contexto: ${strategy.contentContext}

Genera un thread de Twitter/X aplicando el ángulo psicológico del brief.

FORMATO — Thread de 2-4 tweets:
- Tweet 1: Hook fuerte (≤280 chars) — aplica el principio psicológico del brief
- Tweets 2-4: desarrollo numerado (2/ 3/ 4/) con datos y valor concreto
- Tweet final: CTA a zen-trader.com
- Máximo 2 emoji por tweet

Responde ÚNICAMENTE con JSON válido:
{
  "tweets": [
    "Tweet 1 hook (≤280 chars)",
    "2/ segundo...",
    "3/ tercero...",
    "4/ CTA con zen-trader.com"
  ]
}`;
}

function getTikTokPrompt(strategy: StrategyBrief) {
  return `${STRATEGIST_SYSTEM}

BRIEF ESTRATÉGICO DE ESTA SEMANA:
- Tema: ${strategy.topic}
- Ángulo psicológico: ${strategy.psychologicalAngle}
- Audiencia objetivo: ${strategy.targetAudience}
- Objetivo: ${strategy.conversionObjective}
- Contexto: ${strategy.contentContext}

Genera un script de TikTok/Reels aplicando el ángulo psicológico del brief.

FORMATO — Script 30-60 segundos:
[0-3s] HOOK: usa el ángulo psicológico del brief — statement fuerte o pregunta incómoda
[3-15s] PROBLEMA: contexto que el trader de prop firms reconoce
[15-45s] SOLUCIÓN/INSIGHT: cómo ZenTrade o el proceso ayuda — específico
[45-60s] CTA: concreto y sin presión

ON-SCREEN TEXTS: 2-3 frases ≤5 palabras cada una
VIDEO PROMPT: prompt en inglés para flow y nanobanana
  - Describe la escena visual, movimiento de cámara, atmósfera
  - Estilo: cinematic, professional, finance aesthetic, de maximo 10 segundos cada escena y si la duracion es mayor a 60s, dividir en secciones en cada escena, evitando ilustraciones o estilos caricaturescos en su lugar buscar realismo y conexión emocional, con composición clara y espacio para texto legible. por ejemplo: si el video dura 60 segundos, haz un promt para cada escena de 10 segundos, describiendo la acción y atmósfera de cada una (frustración analizando gráficos, revelación al ver métricas claras, superación al mejorar resultados) — evitar ilustraciones o estilos caricaturescos en su lugar buscar realismo y conexión emocional, con composición clara y espacio para texto legible. y asi tendrias que generar 6 prompts para un video de 60 segundos, cada uno describiendo la escena y atmósfera de cada sección del video, asegurando que el estilo sea cinematic, profesional y con estética financiera. NO INCLUYAS TEXTO EN EL VIDEO PROMPT — SOLO LA DESCRIPCIÓN DE LAS ESCENAS Y ATMÓSFERA

Responde ÚNICAMENTE con JSON válido:
{
  "script": "script completo con timestamps",
  "onScreenTexts": ["Texto 1", "Texto 2", "Texto 3"],
  "videoPrompt": "prompt en inglés para flow y nanobanana"
}`;
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface StrategyBrief {
  topic: string;
  psychologicalAngle: string;
  targetAudience: string;
  conversionObjective: string;
  whyThisWeek: string;
  contentContext: string;
  cycleWeek: string;
  cycleName: string;
}

function parseJSON<T>(text: string, fallback: T): T {
  try {
    const cleaned = text.replace(/```(?:json)?\s*([\s\S]*?)```/g, "$1").trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) return fallback;
    const jsonStr = match[0];
    try {
      return JSON.parse(jsonStr) as T;
    } catch {
      // Claude sometimes emits literal newlines inside JSON strings — replace with spaces
      return JSON.parse(jsonStr.replace(/\r?\n/g, " ")) as T;
    }
  } catch {
    return fallback;
  }
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
    body = {};
  }

  const parsed = RequestSchema.safeParse(body ?? {});
  const topicOverride = parsed.success ? parsed.data.topicOverride : undefined;

  const { week, weekStart, weekEnd } = getWeekInfo();
  const cycleWeek = getCurrentCycleWeek();

  // ── Step 1: Marketing Strategist decides the brief ─────────────────────────
  let strategy: StrategyBrief;

  if (topicOverride) {
    // Manual override — strategist enriches with angle and context
    const overridePrompt = `${STRATEGIST_SYSTEM}

SEMANA DEL CICLO ACTUAL: ${cycleWeek.id} — ${cycleWeek.name}
Principio psicológico del ciclo: ${cycleWeek.principle}

El tema de esta semana ya está definido por el fundador:
"${topicOverride}"

Tu tarea: enriquece este tema con el ángulo psicológico correcto para la semana ${cycleWeek.id} del ciclo.
Define la audiencia objetivo específica y el contexto para generar el contenido.

Responde ÚNICAMENTE con JSON válido:
{
  "topic": "${topicOverride}",
  "psychologicalAngle": "cómo aplicar ${cycleWeek.principle} a este tema específico",
  "targetAudience": "segmento específico de la audiencia de prop firm traders para esta semana",
  "conversionObjective": "${cycleWeek.objective}",
  "whyThisWeek": "por qué este tema + principio es estratégicamente correcto ahora",
  "contentContext": "2-3 oraciones de contexto para guiar al generador de contenido"
}`;

    const res = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 512,
      system: STRATEGIST_SYSTEM,
      messages: [{ role: "user", content: overridePrompt }],
    });

    const text = res.content.find(b => b.type === "text")?.text ?? "";
    strategy = parseJSON<StrategyBrief>(text, {
      topic: topicOverride,
      psychologicalAngle: cycleWeek.principle,
      targetAudience: "Traders de futuros en evaluación de prop firms",
      conversionObjective: cycleWeek.objective,
      whyThisWeek: cycleWeek.brief,
      contentContext: cycleWeek.brief,
      cycleWeek: cycleWeek.id,
      cycleName: cycleWeek.name,
    });
  } else {
    // Full autonomy — strategist decides everything
    const strategyPrompt = `Eres el marketing strategist de ZenTrade.

SEMANA DEL CICLO PSICOLÓGICO: ${cycleWeek.id} — ${cycleWeek.name}
Principio de esta semana: ${cycleWeek.principle}
Contexto del ciclo: ${cycleWeek.brief}

Semana calendario: ${week} (${weekStart} al ${weekEnd})

Tu tarea: define el brief estratégico específico para esta semana.
El tema debe ser concreto y relevante para traders que buscan pasar evaluaciones de prop firms.
NO uses temas genéricos como "la importancia del journal" — sé específico y accionable.

Ejemplos de temas buenos (semana A):
- "El 87% de las evaluaciones fallidas ocurren después de un día verde: el patrón que no ves venir"
- "Por qué pierdes dinero en las primeras 2 horas del mercado sin saberlo"

Responde ÚNICAMENTE con JSON válido:
{
  "topic": "tema específico (máximo 100 chars, concreto, orientado al dolor o insight del trader)",
  "psychologicalAngle": "cómo aplicar ${cycleWeek.principle} — específico para este topic",
  "targetAudience": "segmento específico: (ej: 'traders en segunda o tercera evaluación, frustrados por no pasar')",
  "conversionObjective": "${cycleWeek.objective}",
  "whyThisWeek": "razón estratégica de 1-2 oraciones — por qué este tema en semana ${cycleWeek.id} del ciclo",
  "contentContext": "2-3 oraciones de contexto para guiar al generador — qué ángulo tomar, qué evitar, qué incluir"
}`;

    const res = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 512,
      system: STRATEGIST_SYSTEM,
      messages: [{ role: "user", content: strategyPrompt }],
    });

    const text = res.content.find(b => b.type === "text")?.text ?? "";
    strategy = {
      ...parseJSON<Omit<StrategyBrief, "cycleWeek" | "cycleName">>(text, {
        topic: cycleWeek.brief,
        psychologicalAngle: cycleWeek.principle,
        targetAudience: "Traders de futuros en evaluación de prop firms",
        conversionObjective: cycleWeek.objective,
        whyThisWeek: cycleWeek.brief,
        contentContext: cycleWeek.brief,
      }),
      cycleWeek: cycleWeek.id,
      cycleName: cycleWeek.name,
    };
  }

  // ── Step 2: Generate content for all 3 platforms in parallel ──────────────
  const userMsg = `Genera el contenido para esta semana. Sigue el brief estratégico y el formato del output JSON.`;

  const [igRes, twRes, ttRes] = await Promise.all([
    anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1200,
      system: getInstagramPrompt(strategy),
      messages: [{ role: "user", content: userMsg }],
    }),
    anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: getTwitterPrompt(strategy),
      messages: [{ role: "user", content: userMsg }],
    }),
    anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: getTikTokPrompt(strategy),
      messages: [{ role: "user", content: userMsg }],
    }),
  ]);

  const getText = (res: Anthropic.Message) =>
    res.content.find(b => b.type === "text")?.text ?? "";

  const instagram = parseJSON<{ caption: string; hashtags: string; imageCopy: string; imagePrompt: string }>(
    getText(igRes),
    { caption: "", hashtags: "", imageCopy: "", imagePrompt: "" }
  );

  const twitter = parseJSON<{ tweets: string[] }>(
    getText(twRes),
    { tweets: [getText(twRes)] }
  );

  const tiktok = parseJSON<{ script: string; onScreenTexts: string[]; videoPrompt: string }>(
    getText(ttRes),
    { script: getText(ttRes), onScreenTexts: [], videoPrompt: "" }
  );

  return NextResponse.json({
    week,
    weekStart,
    weekEnd,
    strategy,
    instagram,
    twitter,
    tiktok,
  });
}
