import { GoogleGenerativeAI, type Tool } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

// ─── Types ────────────────────────────────────────────────────────────────────

export type NewsItemType =
  | "FED"
  | "BANCO_CENTRAL"
  | "EARNINGS"
  | "MACRO"
  | "INFLACIÓN"
  | "EMPLEO"
  | "GEOPOLÍTICA"
  | "GUERRA"
  | "POLÍTICA"
  | "COMMODITIES"
  | "OTRO";

export type ImpactType = "alcista" | "bajista" | "neutral" | "alta volatilidad";

export interface MarketNewsItem {
  type: NewsItemType;
  title: string;
  date: string;
  description: string;
  potentialImpact: ImpactType;
  affectedInstruments: string[];
}

export interface MarketPreviewData {
  intro: string;
  newsItems: MarketNewsItem[];
  closingNote: string;
}

// ─── Paso 1: búsqueda con Google Grounding ────────────────────────────────────

async function fetchRealWorldContext(
  weekStart: string,
  weekEnd: string
): Promise<string> {
  // gemini-1.5-flash tiene cuota free más alta + soporta Google Search Grounding
  // Si sigue dando 429, activa billing en Google AI Studio (mínimo $1 crédito)
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const groundingTool = { googleSearch: {} } as unknown as Tool;

  const prompt = `Busca y dame un resumen detallado y actualizado de los eventos más importantes para los mercados financieros globales durante la semana del ${weekStart} al ${weekEnd}. Necesito información REAL y ACTUAL sobre:

1. CALENDARIO ECONÓMICO USA: CPI, PPI, PCE, NFP, PIB, ventas minoristas, ISM, confianza del consumidor. Fechas exactas y estimados del consenso.

2. RESERVA FEDERAL: decisiones de tasas, minutas del FOMC, discursos de Powell. Bancos centrales globales: BCE, Banco de Japón, Banco de Inglaterra — cualquier decisión o comunicado de esa semana.

3. EARNINGS: reportes corporativos del S&P 500 y Nasdaq esa semana. Especialmente empresas grandes de tecnología, energía, finanzas.

4. GEOPOLÍTICA ACTUAL — ESTO ES OBLIGATORIO:
   - Estado actual de la guerra Israel-Gaza: escaladas, negociaciones, ataques, impacto en petróleo
   - Guerra Rusia-Ucrania: avances, negociaciones, sanciones nuevas
   - Tensiones USA-China: aranceles, tecnología, Taiwan
   - Conflictos en Medio Oriente y su impacto en el petróleo
   - Cualquier tensión geopolítica activa que mueva mercados

5. POLÍTICA Y ARANCELES: decisiones de Trump en la semana, nuevos aranceles anunciados, sanciones, impacto comercial global. Política de otros países con impacto en mercados.

6. PETRÓLEO Y COMMODITIES: reuniones OPEP+, inventarios EIA del miércoles, precio del petróleo y factores que lo afectan esa semana. Oro, gas natural.

7. CONTEXTO GENERAL DE MERCADO: qué pasó la semana anterior que sigue afectando mercados, niveles clave del S&P 500 y Nasdaq, sentimiento inversor.

Da respuestas CONCRETAS con fechas reales, cifras y contexto directo. Esta información se usará para preparar traders de futuros (NQ, ES, CL, GC) para la semana.`;

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    tools: [groundingTool],
  });

  return result.response.text();
}

// ─── Paso 2: estructurar en JSON ──────────────────────────────────────────────

async function structureAsJson(
  context: string,
  weekStart: string,
  weekEnd: string,
  instruments: string[]
): Promise<MarketPreviewData> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const instrumentList = instruments.length > 0 ? instruments.join(", ") : "ES, NQ, CL, GC";

  const prompt = `You are a senior financial markets and global geopolitics analyst. Based EXCLUSIVELY on the real news context provided below, generate the market radar for the week of ${weekStart} to ${weekEnd}.

TRADER'S INSTRUMENTS: ${instrumentList}

REAL CONTEXT (verified in real time via Google Search):
---
${context}
---

STRICT RULES:
1. Select between 6 and 9 events. Do NOT invent anything not present in the context.
2. MUST include at least 1-2 geopolitical events (wars, conflicts, tariffs) if they appear in the context. The Israel war, Trump tariffs, China tensions — ALL of that affects oil (CL), gold (GC), and indexes (NQ, ES).
3. For oil (CL): Middle East tensions are ALWAYS relevant.
4. For gold (GC): geopolitical risk events are bullish for gold.
5. For NQ/ES: tariffs and trade wars are relevant.
6. Impact is not always "alta volatilidad" — be specific: an escalation in Gaza is "alcista" for CL and GC, "bajista" for ES/NQ due to risk-off.
7. The intro should mention global geopolitical context if relevant for futures traders, not just economic data.

TYPES: FED | BANCO_CENTRAL | EARNINGS | MACRO | INFLACIÓN | EMPLEO | GEOPOLÍTICA | GUERRA | POLÍTICA | COMMODITIES | OTRO
INSTRUMENTS: ES, NQ, MNQ, MES, CL, GC, MGC, ZN, ZB, RTY

RESPOND ONLY WITH VALID JSON, no markdown blocks. ALL TEXT FIELDS (intro, title, description, closingNote, date) MUST BE IN ENGLISH:

{
  "intro": "2-3 sentences in HTML with <b>bold</b> for key data. Mention both economic and geopolitical context if relevant. Prepare the trader for what could move markets that week.",
  "newsItems": [
    {
      "type": "TYPE",
      "title": "Concise factual title (max 55 characters)",
      "date": "e.g.: Tuesday, April 8 · 8:30 AM ET — or 'Week of April 7' if no exact date",
      "description": "2-3 sentences: what it is, what's expected or happening, why it matters directly to the futures trader and how it could affect their session",
      "potentialImpact": "alcista|bajista|neutral|alta volatilidad",
      "affectedInstruments": ["CL", "GC"]
    }
  ],
  "closingNote": "One direct and motivational sentence for the trader"
}`;

  const result = await model.generateContent(prompt);
  const raw = result.response.text().trim();
  const clean = raw
    .replace(/^```(?:json)?\n?/, "")
    .replace(/\n?```$/, "")
    .trim();

  return JSON.parse(clean) as MarketPreviewData;
}

// ─── Función principal ────────────────────────────────────────────────────────

export async function generateMarketPreview(
  weekStart: string,
  weekEnd: string,
  instruments: string[]
): Promise<MarketPreviewData> {
  const realContext = await fetchRealWorldContext(weekStart, weekEnd);
  const preview = await structureAsJson(realContext, weekStart, weekEnd, instruments);
  return preview;
}
