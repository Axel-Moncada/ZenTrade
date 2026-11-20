/**
 * Normalización de fechas de CSVs de plataformas de trading.
 *
 * Problema que resuelve: NinjaTrader y Tradovate exportan "11/05/2026" en
 * formato US (MM/DD) o local (DD/MM) según el idioma del Windows del trader.
 * Antes se asumía siempre DD/MM, así que un trade del 5 de noviembre (US)
 * entraba como 11 de mayo y "11/13/2026" producía el mes 13.
 *
 * Estrategia:
 * 1. Se detecta el orden a nivel de archivo: si alguna fila tiene la primera
 *    parte > 12 es DD/MM; si alguna tiene la segunda parte > 12 es MM/DD.
 * 2. Si el archivo es ambiguo (todas las partes ≤ 12), se usa AM/PM como pista
 *    (formato US) y, si no hay, DD/MM (comportamiento previo para LATAM).
 * 3. Toda fecha resultante se valida (mes 1–12, día real del mes). Si no es
 *    válida se devuelve '' para que la fila se descarte en vez de corromper datos.
 */

export type DateOrder = 'MDY' | 'DMY';

const SLASH_OR_DASH_DATE = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/;

function datePart(raw: string): string {
  const trimmed = raw.trim().replace(/^"|"$/g, '');
  if (trimmed.includes('T')) return trimmed.split('T')[0] ?? '';
  return trimmed.split(' ')[0] ?? '';
}

function hasMeridiem(raw: string): boolean {
  return /\b(AM|PM)\b/i.test(raw);
}

/** Detecta el orden día/mes de todo el archivo a partir de sus valores de fecha. */
export function detectDateOrder(values: readonly string[]): DateOrder {
  let sawMeridiem = false;
  for (const value of values) {
    if (!value) continue;
    if (hasMeridiem(value)) sawMeridiem = true;
    const match = SLASH_OR_DASH_DATE.exec(datePart(value));
    if (!match) continue;
    const first = Number(match[1]);
    const second = Number(match[2]);
    if (first > 12 && second <= 12) return 'DMY';
    if (second > 12 && first <= 12) return 'MDY';
  }
  return sawMeridiem ? 'MDY' : 'DMY';
}

function isValidYmd(year: number, month: number, day: number): boolean {
  if (month < 1 || month > 12 || day < 1) return false;
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return day <= daysInMonth;
}

function toIso(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/**
 * Convierte una fecha de CSV a YYYY-MM-DD. Devuelve '' si no es una fecha válida.
 */
export function normalizeCsvDate(raw: string, order: DateOrder): string {
  if (!raw) return '';
  const part = datePart(raw);

  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(part);
  if (iso) {
    const [y, m, d] = [Number(iso[1]), Number(iso[2]), Number(iso[3])];
    return isValidYmd(y, m, d) ? toIso(y, m, d) : '';
  }

  const compact = /^(\d{4})(\d{2})(\d{2})$/.exec(part);
  if (compact) {
    const [y, m, d] = [Number(compact[1]), Number(compact[2]), Number(compact[3])];
    return isValidYmd(y, m, d) ? toIso(y, m, d) : '';
  }

  const local = SLASH_OR_DASH_DATE.exec(part);
  if (local) {
    const a = Number(local[1]);
    const b = Number(local[2]);
    const y = Number(local[3]);
    // Si una fila contradice el orden del archivo pero es inequívoca, se respeta la fila.
    let month = order === 'MDY' ? a : b;
    let day = order === 'MDY' ? b : a;
    if (month > 12 && day <= 12) [month, day] = [day, month];
    return isValidYmd(y, month, day) ? toIso(y, month, day) : '';
  }

  return '';
}
