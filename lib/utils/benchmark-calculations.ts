import type { PropFirm } from '@/lib/config/prop-firms'
import type { Trade } from '@/types/trade'
import type { Account } from '@/types/accounts'

export type RuleStatus = 'pass' | 'warning' | 'fail' | 'pending'

export interface RuleResult {
  id: string
  label: string
  description: string
  currentValue: number
  targetValue: number
  unit: '%' | 'días'
  status: RuleStatus
  /** progress hacia el objetivo (0–100) — solo para min_target */
  progress?: number
  /** cuánto margen queda antes del límite (0–100) — solo para max_limit */
  margin?: number
  /** info adicional para mostrar */
  detail?: string
}

export interface BenchmarkResult {
  firm: PropFirm
  rules: RuleResult[]
  overallStatus: RuleStatus
  summary: string
}

// ─── Calcular drawdown máximo desde trades ────────────────────────────────────

function calcMaxDrawdown(
  trades: Trade[],
  initialBalance: number,
  drawdownType: 'trailing' | 'static'
): number {
  if (trades.length === 0) return 0

  const sorted = [...trades].sort(
    (a, b) => new Date(a.trade_date).getTime() - new Date(b.trade_date).getTime()
  )

  let balance = initialBalance
  let peak = initialBalance
  let maxDD = 0

  for (const trade of sorted) {
    balance += trade.result ?? 0

    if (drawdownType === 'trailing') {
      if (balance > peak) peak = balance
      const dd = ((peak - balance) / initialBalance) * 100
      if (dd > maxDD) maxDD = dd
    } else {
      // static: solo desde el balance inicial
      const dd = ((initialBalance - balance) / initialBalance) * 100
      if (dd > maxDD) maxDD = dd
    }
  }

  return Math.max(0, maxDD)
}

// ─── Calcular peor día ────────────────────────────────────────────────────────

function calcWorstDayLossPct(trades: Trade[], initialBalance: number): number {
  if (trades.length === 0 || initialBalance <= 0) return 0

  const byDay = new Map<string, number>()
  for (const t of trades) {
    byDay.set(t.trade_date, (byDay.get(t.trade_date) ?? 0) + (t.result ?? 0))
  }

  const worstPnl = Math.min(...Array.from(byDay.values()))
  if (worstPnl >= 0) return 0

  return (Math.abs(worstPnl) / initialBalance) * 100
}

// ─── Calcular regla de consistencia ──────────────────────────────────────────

function calcConsistency(
  trades: Trade[],
  consistencyPct: number
): { passes: boolean; bestDayPct: number; netPnl: number } {
  if (trades.length === 0) return { passes: true, bestDayPct: 0, netPnl: 0 }

  const netPnl = trades.reduce((s, t) => s + (t.result ?? 0), 0)
  if (netPnl <= 0) return { passes: false, bestDayPct: 0, netPnl }

  const byDay = new Map<string, number>()
  for (const t of trades) {
    byDay.set(t.trade_date, (byDay.get(t.trade_date) ?? 0) + (t.result ?? 0))
  }

  const winDays = Array.from(byDay.values()).filter((v) => v > 0)
  if (winDays.length === 0) return { passes: true, bestDayPct: 0, netPnl }

  const bestDay = Math.max(...winDays)
  const bestDayPct = (bestDay / netPnl) * 100
  const passes = bestDayPct <= consistencyPct

  return { passes, bestDayPct, netPnl }
}

// ─── Calcular días únicos operados ───────────────────────────────────────────

function calcTradingDays(trades: Trade[]): number {
  return new Set(trades.map((t) => t.trade_date)).size
}

// ─── Status helpers ───────────────────────────────────────────────────────────

function maxLimitStatus(current: number, limit: number): RuleStatus {
  if (current >= limit) return 'fail'
  if (current >= limit * 0.8) return 'warning'
  return 'pass'
}

function minTargetStatus(current: number, target: number): RuleStatus {
  if (current >= target) return 'pass'
  if (current >= target * 0.5) return 'warning'
  return 'pending'
}

// ─── Función principal ────────────────────────────────────────────────────────

export function calculateBenchmark(
  firm: PropFirm,
  account: Account,
  trades: Trade[]
): BenchmarkResult {
  const initialBalance = account.initial_balance
  const firmRules = firm.rules

  const rules: RuleResult[] = []

  // 1. Profit target
  const totalPnl = trades.reduce((s, t) => s + (t.result ?? 0), 0)
  const profitPct = initialBalance > 0 ? (totalPnl / initialBalance) * 100 : 0
  rules.push({
    id: 'profit_target',
    label: 'Objetivo de ganancia',
    description: `Alcanzar +${firmRules.profitTarget}% del balance inicial`,
    currentValue: Math.round(profitPct * 100) / 100,
    targetValue: firmRules.profitTarget,
    unit: '%',
    status: minTargetStatus(profitPct, firmRules.profitTarget),
    progress: Math.min(100, Math.max(0, (profitPct / firmRules.profitTarget) * 100)),
    detail: `$${totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)} de $${((firmRules.profitTarget / 100) * initialBalance).toFixed(2)} requeridos`,
  })

  // 2. Max drawdown
  const maxDD = calcMaxDrawdown(trades, initialBalance, firmRules.drawdownType)
  rules.push({
    id: 'max_drawdown',
    label: 'Drawdown máximo',
    description: `No superar ${firmRules.maxDrawdown}% de drawdown (${firmRules.drawdownType === 'trailing' ? 'trailing' : 'estático'})`,
    currentValue: Math.round(maxDD * 100) / 100,
    targetValue: firmRules.maxDrawdown,
    unit: '%',
    status: maxLimitStatus(maxDD, firmRules.maxDrawdown),
    margin: Math.max(0, 100 - (maxDD / firmRules.maxDrawdown) * 100),
    detail: `Margen restante: ${Math.max(0, firmRules.maxDrawdown - maxDD).toFixed(2)}%`,
  })

  // 3. Daily loss limit (si aplica)
  if (firmRules.maxDailyLoss !== null) {
    const worstDayPct = calcWorstDayLossPct(trades, initialBalance)
    rules.push({
      id: 'daily_loss',
      label: 'Límite de pérdida diaria',
      description: `Ningún día puede superar -${firmRules.maxDailyLoss}% del balance`,
      currentValue: Math.round(worstDayPct * 100) / 100,
      targetValue: firmRules.maxDailyLoss,
      unit: '%',
      status: maxLimitStatus(worstDayPct, firmRules.maxDailyLoss),
      margin: Math.max(0, 100 - (worstDayPct / firmRules.maxDailyLoss) * 100),
      detail:
        worstDayPct === 0
          ? 'Sin días con pérdida'
          : `Peor día: -${worstDayPct.toFixed(2)}%`,
    })
  }

  // 4. Min trading days (si aplica)
  if (firmRules.minTradingDays !== null) {
    const days = calcTradingDays(trades)
    rules.push({
      id: 'trading_days',
      label: 'Días mínimos operados',
      description: `Operar al menos ${firmRules.minTradingDays} días diferentes`,
      currentValue: days,
      targetValue: firmRules.minTradingDays,
      unit: 'días',
      status: minTargetStatus(days, firmRules.minTradingDays),
      progress: Math.min(100, (days / firmRules.minTradingDays) * 100),
      detail: `${days} de ${firmRules.minTradingDays} días`,
    })
  }

  // 5. Regla de consistencia (si aplica)
  if (firmRules.consistencyRule) {
    const consistencyPct = account.consistency_percent ?? 30
    const { passes, bestDayPct, netPnl } = calcConsistency(trades, consistencyPct)
    rules.push({
      id: 'consistency',
      label: 'Regla de consistencia',
      description: `Ningún día puede superar el ${consistencyPct}% de la ganancia neta total`,
      currentValue: Math.round(bestDayPct * 100) / 100,
      targetValue: consistencyPct,
      unit: '%',
      status:
        netPnl <= 0 ? 'pending' : passes ? 'pass' : 'fail',
      margin: passes ? Math.max(0, consistencyPct - bestDayPct) : 0,
      detail:
        netPnl <= 0
          ? 'Sin ganancia neta aún'
          : `Mejor día: ${bestDayPct.toFixed(1)}% de la ganancia total`,
    })
  }

  // Overall status: peor de todos los rules
  const statusPriority: Record<RuleStatus, number> = {
    fail: 3,
    warning: 2,
    pending: 1,
    pass: 0,
  }
  const worstStatus = rules.reduce<RuleStatus>((worst, r) => {
    return statusPriority[r.status] > statusPriority[worst] ? r.status : worst
  }, 'pass')

  const summary =
    worstStatus === 'pass'
      ? '¡Pasarías esta evaluación!'
      : worstStatus === 'warning'
      ? 'En riesgo — estás cerca de algún límite'
      : worstStatus === 'pending'
      ? 'En progreso — sigue operando'
      : 'Fallarías — una o más reglas violadas'

  return { firm, rules, overallStatus: worstStatus, summary }
}
