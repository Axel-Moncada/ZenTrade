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

  const groundingTool: Tool = { googleSearch: {} };

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

  const prompt = `Eres un analista senior de mercados financieros y geopolítica global. Basándote EXCLUSIVAMENTE en el contexto real de noticias que te doy abajo, genera el radar de mercado para la semana del ${weekStart} al ${weekEnd}.

INSTRUMENTOS DEL TRADER: ${instrumentList}

CONTEXTO REAL (fuentes verificadas en tiempo real mediante Google Search):
---
${context}
---

REGLAS ESTRICTAS:
1. Selecciona entre 6 y 9 eventos. NO inventes nada que no esté en el contexto.
2. OBLIGATORIO incluir al menos 1-2 eventos geopolíticos (guerras, conflictos, aranceles) si existen en el contexto. La guerra de Israel, los aranceles de Trump, tensiones con China — TODO eso afecta el petróleo (CL), el oro (GC) y los índices (NQ, ES).
3. Para el petróleo (CL): si hay tensiones en Medio Oriente, es relevante SIEMPRE.
4. Para el oro (GC): eventos de riesgo geopolítico son alcistas para el oro.
5. Para NQ/ES: aranceles y guerras comerciales son relevantes.
6. El impacto no siempre es "alta volatilidad" — sé específico: una escalada en Gaza es "alcista" para CL y GC, "bajista" para ES/NQ por risk-off.
7. El intro debe mencionar el contexto geopolítico global si es relevante para traders de futuros, no solo los datos económicos.

TIPOS: FED | BANCO_CENTRAL | EARNINGS | MACRO | INFLACIÓN | EMPLEO | GEOPOLÍTICA | GUERRA | POLÍTICA | COMMODITIES | OTRO
INSTRUMENTOS: ES, NQ, MNQ, MES, CL, GC, MGC, ZN, ZB, RTY

RESPONDE SOLO CON JSON VÁLIDO, sin bloques markdown:

{
  "intro": "2-3 frases en HTML con <b>negrillas</b>. Menciona tanto el contexto económico como el geopolítico si es relevante. Prepara al trader para lo que puede mover los mercados esa semana.",
  "newsItems": [
    {
      "type": "TIPO",
      "title": "Título conciso y factual (máx 55 caracteres)",
      "date": "Ej: Martes 8 de abril · 8:30 AM ET — o 'Semana del 7 de abril' si no hay fecha exacta",
      "description": "2-3 frases: qué es, qué se espera o qué está pasando, por qué importa directamente al trader de futuros y cómo puede afectar su sesión",
      "potentialImpact": "alcista|bajista|neutral|alta volatilidad",
      "affectedInstruments": ["CL", "GC"]
    }
  ],
  "closingNote": "Una frase directa y motivacional para el trader"
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
