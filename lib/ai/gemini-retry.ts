/**
 * Reintentos y modelo de respaldo para Gemini.
 *
 * Causa real del error de ZenCoach (logs de Vercel, 2026-11-20):
 * "[503 Service Unavailable] This model is currently experiencing high demand".
 * Es un error transitorio de Google: se reintenta con espera y, si sigue, se usa
 * un modelo de respaldo para que el trader reciba respuesta.
 */

export const GEMINI_PRIMARY_MODEL = 'gemini-2.5-flash';
export const GEMINI_FALLBACK_MODEL = 'gemini-2.5-flash-lite';

/** Intentos en orden: principal, principal tras espera, respaldo. */
const ATTEMPTS: ReadonlyArray<{ model: string; delayMs: number }> = [
  { model: GEMINI_PRIMARY_MODEL, delayMs: 0 },
  { model: GEMINI_PRIMARY_MODEL, delayMs: 1200 },
  { model: GEMINI_FALLBACK_MODEL, delayMs: 300 },
];

function errorStatus(err: unknown): number | null {
  if (typeof err === 'object' && err !== null && 'status' in err) {
    const status = (err as { status: unknown }).status;
    if (typeof status === 'number') return status;
  }
  const msg = err instanceof Error ? err.message : String(err);
  const match = /\[(\d{3})[^\]]*\]/.exec(msg);
  return match ? Number(match[1]) : null;
}

/** 429 (cuota), 500/503/504 (sobrecarga) se reintentan; el resto no. */
export function isRetryableGeminiError(err: unknown): boolean {
  const status = errorStatus(err);
  if (status === null) {
    const msg = err instanceof Error ? err.message : String(err);
    return /fetch failed|ECONNRESET|ETIMEDOUT|overloaded|high demand/i.test(msg);
  }
  return status === 429 || status === 500 || status === 503 || status === 504;
}

const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

/**
 * Ejecuta `run(modelName)` con reintentos. `run` debe crear su propio modelo/chat
 * con el nombre recibido. Devuelve el resultado y el modelo que respondió.
 */
export async function withGeminiRetry<T>(
  run: (modelName: string) => Promise<T>,
  sleepFn: (ms: number) => Promise<void> = sleep,
): Promise<{ result: T; model: string }> {
  let lastError: unknown;
  for (const attempt of ATTEMPTS) {
    if (attempt.delayMs > 0) await sleepFn(attempt.delayMs);
    try {
      return { result: await run(attempt.model), model: attempt.model };
    } catch (err) {
      lastError = err;
      if (!isRetryableGeminiError(err)) throw err;
      console.warn(`[gemini] ${attempt.model} falló (reintentable):`, err instanceof Error ? err.message : err);
    }
  }
  throw lastError;
}
