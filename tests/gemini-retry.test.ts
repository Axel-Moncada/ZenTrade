import { describe, expect, it } from 'vitest';
import { isRetryableGeminiError, withGeminiRetry, GEMINI_FALLBACK_MODEL, GEMINI_PRIMARY_MODEL } from '@/lib/ai/gemini-retry';

const noSleep = () => Promise.resolve();
const overloaded = Object.assign(new Error('[GoogleGenerativeAI Error]: ... [503 Service Unavailable] This model is currently experiencing high demand.'), { status: 503 });

describe('isRetryableGeminiError', () => {
  it('reintenta 503 por alta demanda y 429', () => {
    expect(isRetryableGeminiError(overloaded)).toBe(true);
    expect(isRetryableGeminiError({ status: 429 })).toBe(true);
  });
  it('no reintenta errores de request', () => {
    expect(isRetryableGeminiError({ status: 400 })).toBe(false);
    expect(isRetryableGeminiError(new Error('[400 Bad Request] invalid'))).toBe(false);
  });
});

describe('withGeminiRetry', () => {
  it('responde con el modelo principal si funciona', async () => {
    const r = await withGeminiRetry(async m => `ok:${m}`, noSleep);
    expect(r.model).toBe(GEMINI_PRIMARY_MODEL);
  });

  it('cae al modelo de respaldo si el principal sigue saturado', async () => {
    const calls: string[] = [];
    const r = await withGeminiRetry(async m => {
      calls.push(m);
      if (m === GEMINI_PRIMARY_MODEL) throw overloaded;
      return 'respuesta';
    }, noSleep);
    expect(calls).toEqual([GEMINI_PRIMARY_MODEL, GEMINI_PRIMARY_MODEL, GEMINI_FALLBACK_MODEL]);
    expect(r).toEqual({ result: 'respuesta', model: GEMINI_FALLBACK_MODEL });
  });

  it('no reintenta un error no transitorio', async () => {
    let calls = 0;
    await expect(withGeminiRetry(async () => { calls++; throw { status: 400 }; }, noSleep)).rejects.toEqual({ status: 400 });
    expect(calls).toBe(1);
  });
});
