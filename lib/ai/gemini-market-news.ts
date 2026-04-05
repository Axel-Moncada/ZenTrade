import { GoogleGenerativeAI } from "@google/generative-ai";

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
// Gemini busca en Google en tiempo real y devuelve contexto factual

async function fetchRealWorldContext(
  weekStart: string,
  weekEnd: string
): Promise<string> {
  const modelWithSearch = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    // @ts-expect-error — googleSearch grounding, soportado en runtime
    tools: [{ googleSearch: {} }],
  });

  const searchPrompt = `Busca y resume los eventos más importantes para los mercados financieros globales durante la semana del ${weekStart} al ${weekEnd}. Incluye:

1. CALENDARIO ECONÓMICO: publicaciones de CPI, PPI, PCE, NFP, PIB, ventas minoristas, ISM, confianza del consumidor y otros indicadores macro de USA. Fechas exactas y estimados del consenso si los hay.

2. RESERVA FEDERAL Y BANCOS CENTRALES: decisiones de tasas del FOMC, discursos de Powell o miembros del Fed, decisiones del BCE (Banco Central Europeo), Banco de Japón, Banco de Inglaterra u otros bancos centrales relevantes.

3. EARNINGS: reportes de resultados de empresas del S&P 500 y Nasdaq de esa semana. Especialmente empresas de tecnología, energía y finanzas.

4. GEOPOLÍTICA Y GUERRAS: estado actual del conflicto Israel-Gaza, guerra Rusia-Ucrania, tensiones USA-China, situación en Medio Oriente, cualquier escalada o acuerdo relevante que impacte mercados.

5. POLÍTICA Y ARANCELES: decisiones de la administración Trump, aranceles comerciales, sanciones, elecciones o cambios de gobierno en cualquier país con impacto en mercados.

6. COMMODITIES: eventos que afecten petróleo (reuniones OPEP+, inventarios EIA), oro, gas natural.

7. CONTEXTO DE MERCADO: qué pasó la semana anterior que tiene pendiente resolución (tendencias, niveles clave, sentimiento general).

Da respuestas concretas con fechas, cifras y contexto. Esta información se usará para preparar a traders de futuros (NQ, ES, CL, GC) para la semana.`;

  const result = await modelWithSearch.generateContent(searchPrompt);
  return result.response.text();
}

// ─── Paso 2: estructurar en JSON ──────────────────────────────────────────────
// Toma el contexto real y lo convierte al formato del email

async function structureAsJson(
  context: string,
  weekStart: string,
  weekEnd: string,
  instruments: string[]
): Promise<MarketPreviewData> {
  const structureModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const instrumentList = instruments.length > 0 ? instruments.join(", ") : "ES, NQ, CL, GC";

  const prompt = `Eres un analista senior de mercados financieros. Basándote EXCLUSIVAMENTE en el contexto de noticias reales que te doy abajo, genera el radar de mercado para la semana del ${weekStart} al ${weekEnd}.

INSTRUMENTOS DEL TRADER: ${instrumentList}

CONTEXTO REAL DE NOTICIAS (fuentes verificadas en tiempo real):
---
${context}
---

INSTRUCCIONES:
- Selecciona entre 5 y 8 eventos de mayor impacto del contexto anterior. NO inventes eventos.
- Prioriza los que afecten directamente los instrumentos del trader.
- Incluye SIEMPRE eventos geopolíticos relevantes (guerras, tensiones, aranceles) si los hay.
- Para eventos sin fecha exacta confirmada, usa "Semana del ${weekStart}" como fecha.
- El campo "intro" usa HTML solo con <b></b>. Menciona el evento más importante de la semana.
- Usa el contexto geopolítico para preparar al trader mentalmente, no solo técnicamente.

TIPOS DISPONIBLES: FED | BANCO_CENTRAL | EARNINGS | MACRO | INFLACIÓN | EMPLEO | GEOPOLÍTICA | GUERRA | POLÍTICA | COMMODITIES | OTRO

INSTRUMENTOS AFECTADOS disponibles: ES, NQ, MNQ, MES, CL, GC, MGC, ZN, ZB, RTY

RESPONDE SOLO CON JSON VÁLIDO, sin bloques markdown:

{
  "intro": "2-3 frases en HTML con <b>negrillas</b> preparando al trader para la semana, contexto macro Y geopolítico",
  "newsItems": [
    {
      "type": "TIPO",
      "title": "Título conciso (máx 55 caracteres)",
      "date": "Ej: Martes 8 de abril · 8:30 AM ET",
      "description": "2-3 frases: qué es, qué se espera, por qué importa al trader de futuros",
      "potentialImpact": "alcista|bajista|neutral|alta volatilidad",
      "affectedInstruments": ["NQ", "ES"]
    }
  ],
  "closingNote": "Una frase motivacional y directa para el trader"
}`;

  const result = await structureModel.generateContent(prompt);
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
  // Paso 1: obtener contexto real del mundo vía Google Search
  const realContext = await fetchRealWorldContext(weekStart, weekEnd);

  // Paso 2: estructurar en el formato del email
  const preview = await structureAsJson(realContext, weekStart, weekEnd, instruments);

  return preview;
}
