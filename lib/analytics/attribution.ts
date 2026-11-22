// Atribución first-touch para la pauta: UTM + click IDs + país.
// La escribe el middleware en la cookie first-party `zt_attr` (90 días) y la leen
// el registro y el callback de auth para guardarla en `profiles`.
import { z } from "zod";

export const ATTRIBUTION_COOKIE = "zt_attr";
export const ATTRIBUTION_MAX_AGE = 90 * 24 * 60 * 60; // segundos

const field = z.string().trim().max(200).optional();

export const attributionSchema = z.object({
  utm_source: field,
  utm_medium: field,
  utm_campaign: field,
  utm_term: field,
  utm_content: field,
  gclid: field,
  fbclid: field,
  landing_path: field,
  country: z.string().trim().length(2).optional(),
  captured_at: field,
});

export type Attribution = z.infer<typeof attributionSchema>;

const PARAM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid"] as const;

export function parseAttribution(raw: string | undefined | null): Attribution | null {
  if (!raw) return null;
  try {
    const parsed = attributionSchema.safeParse(JSON.parse(decodeURIComponent(raw)));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function serializeAttribution(a: Attribution): string {
  return encodeURIComponent(JSON.stringify(a));
}

/**
 * Decide si hay que escribir la cookie para esta visita.
 * - First-touch: no se pisa una cookie existente…
 * - …salvo que llegue un gclid o fbclid nuevo (nuevo clic pagado).
 * - Si no hay cookie ni parámetros, igual se guarda el país y la página de entrada
 *   (tráfico orgánico/directo), para poder comparar contra la pauta.
 */
export function nextAttribution(
  existing: Attribution | null,
  params: URLSearchParams,
  pathname: string,
  country: string | null
): Attribution | null {
  const incoming: Attribution = {};
  for (const k of PARAM_KEYS) {
    const v = params.get(k);
    if (v) incoming[k] = v.slice(0, 200);
  }
  const hasParams = Object.keys(incoming).length > 0;
  const newClick =
    (incoming.gclid && incoming.gclid !== existing?.gclid) || (incoming.fbclid && incoming.fbclid !== existing?.fbclid);

  if (existing && !newClick) {
    // Completar el país si faltaba, sin tocar lo demás
    if (!existing.country && country) return { ...existing, country };
    return null;
  }
  if (!existing && !hasParams && !country) return null;

  return {
    ...incoming,
    landing_path: pathname.slice(0, 200),
    country: country && /^[A-Z]{2}$/.test(country) ? country : undefined,
    captured_at: new Date().toISOString(),
  };
}
