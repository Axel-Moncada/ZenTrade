import { geminiFlash } from "./gemini";

export type NewsItemType =
  | "FED"
  | "EARNINGS"
  | "MACRO"
  | "INFLACIÓN"
  | "EMPLEO"
  | "GEOPOLÍTICA"
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

/**
 * Genera un preview de mercado para la semana indicada usando Gemini.
 * instruments: lista de símbolos que opera el usuario (ej: ["ES","NQ","CL"]).
 */
export async function generateMarketPreview(
  weekStart: string,
  weekEnd: string,
  instruments: string[]
): Promise<MarketPreviewData> {
  const instrumentList =
    instruments.length > 0 ? instruments.join(", ") : "ES, NQ, MNQ, MES, CL, GC";

  const prompt = `Eres un analista senior de mercados financieros especializado en futuros de CME. Genera un radar de mercado para la semana del ${weekStart} al ${weekEnd}.

Instrumentos que opera el trader: ${instrumentList}

INSTRUCCIONES:
- Genera entre 4 y 6 eventos/noticias de alto impacto para esa semana específica.
- Incluye: earnings de empresas S&P 500 relevantes, decisiones/minutas/discursos del FOMC o Fed, publicaciones macro (CPI, PPI, NFP, PCE, PIB, ventas minoristas), y otros catalizadores de volatilidad.
- Usa fechas reales aproximadas para esa semana (día de la semana + fecha específica).
- Prioriza eventos que impacten directamente los instrumentos del trader.
- El campo "intro" usa HTML solo con etiquetas <b></b> para negrillas, sin ninguna otra etiqueta.
- El campo "closingNote" es una sola frase motivacional en español, sin HTML.

RESPONDE SOLO CON JSON VÁLIDO, sin bloques markdown, sin comentarios:

{
  "intro": "2-3 frases en HTML (<b>texto</b>) preparando al trader para la semana, mencionando los eventos más relevantes",
  "newsItems": [
    {
      "type": "FED|EARNINGS|MACRO|INFLACIÓN|EMPLEO|GEOPOLÍTICA|OTRO",
      "title": "Título conciso del evento (máx 55 caracteres)",
      "date": "Ej: Martes 25 de marzo · 8:30 AM ET",
      "description": "1-2 frases explicando qué es y por qué importa para el trader de futuros",
      "potentialImpact": "alcista|bajista|neutral|alta volatilidad",
      "affectedInstruments": ["ES", "NQ"]
    }
  ],
  "closingNote": "Una frase de cierre motivacional para el trader"
}`;

  const result = await geminiFlash.generateContent(prompt);
  const raw = result.response.text().trim();
  const clean = raw
    .replace(/^```(?:json)?\n?/, "")
    .replace(/\n?```$/, "")
    .trim();

  return JSON.parse(clean) as MarketPreviewData;
}
