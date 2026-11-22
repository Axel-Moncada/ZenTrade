// Atribución first-touch para la pauta: UTM + click IDs al aterrizar.
// Se guarda en localStorage (y cookie de respaldo) y se envía al registro.
import { z } from "zod";

const STORAGE_KEY = "zt_attribution";
const MAX_AGE_DAYS = 30;

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
  referrer: field,
  captured_at: field,
});

export type Attribution = z.infer<typeof attributionSchema>;

const PARAM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid"] as const;

function readStored(): Attribution | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = attributionSchema.safeParse(JSON.parse(raw));
      if (parsed.success) return parsed.data;
    }
  } catch {
    // localStorage bloqueado: probamos la cookie
  }
  const match = document.cookie.match(new RegExp(`(?:^|; )${STORAGE_KEY}=([^;]*)`));
  if (!match) return null;
  try {
    const parsed = attributionSchema.safeParse(JSON.parse(decodeURIComponent(match[1])));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

/** Guarda la atribución si la URL trae UTM o click IDs. First-touch: no pisa una existente. */
export function captureAttribution(): void {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  const hasParams = PARAM_KEYS.some((k) => params.get(k));
  if (!hasParams || readStored()) return;

  const data: Attribution = { landing_path: window.location.pathname, captured_at: new Date().toISOString() };
  for (const k of PARAM_KEYS) {
    const v = params.get(k);
    if (v) data[k] = v.slice(0, 200);
  }
  if (document.referrer) data.referrer = document.referrer.slice(0, 200);

  const json = JSON.stringify(data);
  try {
    window.localStorage.setItem(STORAGE_KEY, json);
  } catch {
    // sigue la cookie
  }
  document.cookie = `${STORAGE_KEY}=${encodeURIComponent(json)}; path=/; max-age=${MAX_AGE_DAYS * 86400}; SameSite=Lax`;
}

export function getAttribution(): Attribution | null {
  if (typeof window === "undefined") return null;
  return readStored();
}
