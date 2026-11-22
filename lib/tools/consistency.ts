/**
 * Calculadora de la regla de consistencia de prop firms (función pura).
 * Regla: el mejor día (ganancia) debe ser menor que X% de la ganancia neta total.
 */

export interface ConsistencyResult {
  days: number;
  netProfit: number;
  bestDay: number;
  /** Mejor día / ganancia neta, en % (null si la ganancia neta <= 0) */
  bestDayShare: number | null;
  passes: boolean;
  /** Ganancia neta mínima para que el mejor día quede dentro del umbral */
  requiredNetProfit: number;
  /** Cuánto más hay que ganar (0 si ya cumple) */
  extraProfitNeeded: number;
}

/** Convierte texto libre ("250, -120\n400") en números de P&L diario. */
export function parseDailyPnl(input: string): number[] {
  return input
    .split(/[\s,;]+/)
    .map((v) => v.replace(/[$]/g, "").trim())
    .filter((v) => v.length > 0)
    .map((v) => Number(v))
    .filter((n) => Number.isFinite(n));
}

export function computeConsistency(dailyPnl: readonly number[], thresholdPercent: number): ConsistencyResult {
  const netProfit = dailyPnl.reduce((sum, v) => sum + v, 0);
  const bestDay = dailyPnl.length > 0 ? Math.max(0, ...dailyPnl) : 0;
  const threshold = thresholdPercent / 100;
  const bestDayShare = netProfit > 0 ? (bestDay / netProfit) * 100 : null;
  const requiredNetProfit = threshold > 0 ? bestDay / threshold : 0;
  const passes = netProfit > 0 && bestDay < netProfit * threshold;
  const extraProfitNeeded = passes ? 0 : Math.max(0, requiredNetProfit - netProfit);
  return { days: dailyPnl.length, netProfit, bestDay, bestDayShare, passes, requiredNetProfit, extraProfitNeeded };
}
