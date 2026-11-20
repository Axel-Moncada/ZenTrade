import { describe, expect, it } from 'vitest';
import { detectDateOrder, normalizeCsvDate } from '@/lib/utils/csv-date';

describe('detectDateOrder', () => {
  it('detecta MM/DD cuando la segunda parte pasa de 12', () => {
    expect(detectDateOrder(['11/05/2026 9:35:12 AM', '11/13/2026 9:48:40 AM'])).toBe('MDY');
  });

  it('detecta DD/MM cuando la primera parte pasa de 12', () => {
    expect(detectDateOrder(['05/11/2026 09:35:12', '13/11/2026 10:00:00'])).toBe('DMY');
  });

  it('usa AM/PM como pista en archivos ambiguos', () => {
    expect(detectDateOrder(['11/05/2026 9:35:12 AM'])).toBe('MDY');
  });

  it('mantiene DD/MM por defecto en archivos ambiguos sin AM/PM', () => {
    expect(detectDateOrder(['11/05/2026 09:35:12'])).toBe('DMY');
  });
});

describe('normalizeCsvDate', () => {
  it('NinjaTrader US: 11/05/2026 es 5 de noviembre', () => {
    expect(normalizeCsvDate('11/05/2026 9:35:12 AM', 'MDY')).toBe('2026-11-05');
  });

  it('NinjaTrader US: 11/13/2026 ya no produce el mes 13', () => {
    expect(normalizeCsvDate('11/13/2026 9:48:40 AM', 'MDY')).toBe('2026-11-13');
  });

  it('NinjaTrader en español: 13/11/2026', () => {
    expect(normalizeCsvDate('13/11/2026 10:00:00', 'DMY')).toBe('2026-11-13');
  });

  it('respeta una fila inequívoca aunque contradiga el orden del archivo', () => {
    expect(normalizeCsvDate('11/13/2026', 'DMY')).toBe('2026-11-13');
  });

  it('acepta ISO, ISO con hora y formato compacto de Rithmic', () => {
    expect(normalizeCsvDate('2026-11-5', 'DMY')).toBe('2026-11-05');
    expect(normalizeCsvDate('2026-11-05T14:30:00Z', 'DMY')).toBe('2026-11-05');
    expect(normalizeCsvDate('20261105', 'DMY')).toBe('2026-11-05');
  });

  it('rechaza fechas imposibles en vez de inventarlas', () => {
    expect(normalizeCsvDate('31/02/2026', 'DMY')).toBe('');
    expect(normalizeCsvDate('2026-13-11', 'DMY')).toBe('');
    expect(normalizeCsvDate('basura', 'DMY')).toBe('');
    expect(normalizeCsvDate('', 'MDY')).toBe('');
  });
});
