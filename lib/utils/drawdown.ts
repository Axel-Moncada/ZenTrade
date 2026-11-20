/**
 * Cálculo de drawdown por tipo de cuenta.
 *
 * Bug corregido (QA 2026-11-20): el drawdown "trailing" se calculaba igual que el
 * estático (piso = balance inicial - drawdown máximo). En una cuenta trailing el
 * piso sube con el pico de balance, así que el trader veía más margen del real.
 *
 * Modelo usado:
 * - static:   piso = balanceInicial - drawdownMáximo
 * - trailing: piso = min(picoDeBalance - drawdownMáximo, balanceInicial)
 *   El piso sigue al pico y se congela al llegar al balance inicial (regla común
 *   de Topstep y Apex; Apex la fija en balance inicial + $100 → pendiente de
 *   parametrizar por prop firm). El pico se calcula con el balance después de cada
 *   trade cerrado (no con P&L flotante intradía, que Zentrade no registra).
 */

export type DrawdownType = 'trailing' | 'static';

export interface DrawdownInput {
  startingBalance: number;
  currentBalance: number;
  maxDrawdown: number;
  drawdownType: DrawdownType;
  /** Mayor balance alcanzado tras cerrar trades (incluye el balance inicial) */
  peakBalance: number;
}

export interface DrawdownStatus {
  /** Balance mínimo antes de perder la cuenta */
  floor: number;
  /** Dinero que queda antes de tocar el piso (puede ser negativo) */
  remaining: number;
  /** Porcentaje del drawdown máximo ya usado (0–100) */
  usedPercent: number;
}

export function computeDrawdownStatus(input: DrawdownInput): DrawdownStatus {
  const { startingBalance, currentBalance, maxDrawdown, drawdownType } = input;
  const peak = Number.isFinite(input.peakBalance) ? Math.max(input.peakBalance, startingBalance) : startingBalance;
  const floor = drawdownType === 'trailing'
    ? Math.min(peak - maxDrawdown, startingBalance)
    : startingBalance - maxDrawdown;
  const remaining = currentBalance - floor;
  const usedPercent = maxDrawdown > 0
    ? Math.min(100, Math.max(0, ((maxDrawdown - remaining) / maxDrawdown) * 100))
    : 0;
  return { floor, remaining, usedPercent };
}

export interface BalanceStep {
  trade_date: string;
  created_at: string;
  result: number | string | null;
}

/** Pico de balance recorriendo los trades en orden cronológico. */
export function computePeakBalance(startingBalance: number, trades: readonly BalanceStep[]): number {
  const ordered = [...trades].sort((a, b) =>
    a.trade_date === b.trade_date ? a.created_at.localeCompare(b.created_at) : a.trade_date.localeCompare(b.trade_date),
  );
  let balance = startingBalance;
  let peak = startingBalance;
  for (const t of ordered) {
    balance += Number(t.result) || 0;
    if (balance > peak) peak = balance;
  }
  return peak;
}
