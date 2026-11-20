/**
 * Formato de montos con signo explícito.
 * Bug corregido (QA 2026-11-20): varias vistas hacían `${x >= 0 ? '+' : ''}$${Math.abs(x)}`
 * y las pérdidas se mostraban sin el signo menos (un P&L de -220 salía como "$220.00").
 */

interface FormatOptions {
  decimals?: number;
  /** Muestra "+" en positivos (por defecto true) */
  showPlus?: boolean;
  /** Separadores: 'en-US' → 1,234.56 */
  locale?: string;
}

export function formatSignedMoney(value: number | null | undefined, options: FormatOptions = {}): string {
  const { decimals = 2, showPlus = true, locale = 'en-US' } = options;
  const n = Number.isFinite(value) ? (value as number) : 0;
  const abs = Math.abs(n).toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  // -0.00 se muestra sin signo
  const isZero = Number(Math.abs(n).toFixed(decimals)) === 0;
  if (n < 0 && !isZero) return `-$${abs}`;
  if (showPlus && !isZero) return `+$${abs}`;
  return `$${abs}`;
}

/** Monto de una pérdida que ya se sabe negativa (máx. pérdida, peor día): siempre con "-". */
export function formatLoss(value: number | null | undefined, decimals = 0): string {
  const n = Number.isFinite(value) ? Math.abs(value as number) : 0;
  if (n === 0) return '$0';
  return `-$${n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
}
