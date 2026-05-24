import type { createClient } from '@/lib/supabase/server';

type ServerClient = Awaited<ReturnType<typeof createClient>>;

export interface ZenCoachContext {
  accountName: string;
  accountType: string;
  propFirm: string | null;
  initialBalance: number;
  currentBalance: number | null;
  planName: string | null;
  currency: string;
  timezone: string;
  tradingPlan: TradingPlanSummary | null;
  last30Days: PeriodStats;
  recentTrades: RecentTrade[];
  todayTrades: RecentTrade[];
  instruments: InstrumentInfo[];
}

interface TradingPlanSummary {
  dailyLossLimit: number | null;
  weeklyLossLimit: number | null;
  weeklyProfitTarget: number | null;
  maxDailyTrades: number | null;
  maxRiskPerTrade: number | null;
  minRR: number | null;
  tradingHours: string | null;
  tradingDays: string | null;
  allowedInstruments: string[];
  entryRules: string | null;
  exitRules: string | null;
}

interface PeriodStats {
  totalTrades: number;
  wins: number;
  losses: number;
  winRate: number;
  totalPnl: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  topEmotion: string | null;
}

interface RecentTrade {
  date: string;
  instrument: string;
  side: string;
  contracts: number;
  result: number | null;
  followedPlan: boolean;
  emotions: string[];
  exitReason: string | null;
  notes: string | null;
}

interface InstrumentInfo {
  id: string;
  symbol: string;
  name: string;
  tickSize: number;
  tickValue: number;
}

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export async function buildZenCoachContext(
  supabase: ServerClient,
  userId: string,
  accountId: string,
): Promise<ZenCoachContext | null> {
  const today = new Date().toISOString().slice(0, 10);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const { data: account } = await supabase
    .from('accounts')
    .select('name, account_type, broker, initial_balance, current_balance, max_drawdown, consistency_percent, drawdown_type, status')
    .eq('id', accountId)
    .eq('user_id', userId)
    .single();

  if (!account) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('currency, timezone')
    .eq('id', userId)
    .single();

  const { data: plan } = await supabase
    .from('trading_plans')
    .select('daily_loss_limit, weekly_loss_limit, weekly_profit_target, max_daily_trades, max_risk_per_trade, min_risk_reward_ratio, trading_start_time, trading_end_time, trading_days, allowed_instruments, entry_rules, exit_rules')
    .eq('user_id', userId)
    .eq('account_id', accountId)
    .maybeSingle();

  const { data: rawTrades } = await supabase
    .from('trades')
    .select('trade_date, side, contracts, result, followed_plan, emotions, exit_reason, notes, instrument_id')
    .eq('user_id', userId)
    .eq('account_id', accountId)
    .gte('trade_date', thirtyDaysAgo)
    .order('trade_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(100);

  const { data: instrumentsData } = await supabase
    .from('instrument_specs')
    .select('id, symbol, name, tick_size, tick_value')
    .order('symbol');

  const trades = rawTrades ?? [];
  const instruments: InstrumentInfo[] = (instrumentsData ?? []).map(i => ({
    id: i.id,
    symbol: i.symbol,
    name: i.name,
    tickSize: i.tick_size,
    tickValue: i.tick_value,
  }));

  // Stats last 30 days
  const wins = trades.filter(t => (t.result ?? 0) > 0);
  const losses = trades.filter(t => (t.result ?? 0) < 0);
  const totalPnl = trades.reduce((s, t) => s + (t.result ?? 0), 0);
  const avgWin = wins.length ? wins.reduce((s, t) => s + (t.result ?? 0), 0) / wins.length : 0;
  const avgLoss = losses.length ? losses.reduce((s, t) => s + (t.result ?? 0), 0) / losses.length : 0;
  const grossWins = wins.reduce((s, t) => s + (t.result ?? 0), 0);
  const grossLosses = Math.abs(losses.reduce((s, t) => s + (t.result ?? 0), 0));
  const profitFactor = grossLosses > 0 ? grossWins / grossLosses : grossWins > 0 ? 999 : 0;

  // Top emotion
  const emotionCount: Record<string, number> = {};
  for (const t of trades) {
    for (const e of (t.emotions ?? [])) {
      emotionCount[e] = (emotionCount[e] ?? 0) + 1;
    }
  }
  const topEmotion = Object.entries(emotionCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  // Build instrument lookup
  const instrumentById = new Map(instruments.map(i => [i.id, i.symbol]));

  // Map trades
  type TradeRow = typeof trades[number];
  function mapTrade(t: TradeRow): RecentTrade {
    return {
      date: t.trade_date,
      instrument: instrumentById.get(t.instrument_id) ?? 'N/A',
      side: t.side,
      contracts: t.contracts,
      result: t.result,
      followedPlan: t.followed_plan,
      emotions: (t.emotions as string[]) ?? [],
      exitReason: t.exit_reason,
      notes: t.notes,
    };
  }

  const todayTrades = trades.filter(t => t.trade_date === today).map(mapTrade);
  const recentTrades = trades.slice(0, 15).map(mapTrade);

  // Trading plan summary
  let tradingPlan: TradingPlanSummary | null = null;
  if (plan) {
    const tradingDays = Array.isArray(plan.trading_days) && plan.trading_days.length
      ? (plan.trading_days as number[]).map(d => DAY_NAMES[d]).join(', ')
      : null;
    tradingPlan = {
      dailyLossLimit: plan.daily_loss_limit ?? null,
      weeklyLossLimit: plan.weekly_loss_limit ?? null,
      weeklyProfitTarget: plan.weekly_profit_target ?? null,
      maxDailyTrades: plan.max_daily_trades ?? null,
      maxRiskPerTrade: plan.max_risk_per_trade ?? null,
      minRR: plan.min_risk_reward_ratio ?? null,
      tradingHours: (plan.trading_start_time && plan.trading_end_time)
        ? `${plan.trading_start_time} – ${plan.trading_end_time}`
        : null,
      tradingDays,
      allowedInstruments: Array.isArray(plan.allowed_instruments) ? plan.allowed_instruments as string[] : [],
      entryRules: plan.entry_rules ?? null,
      exitRules: plan.exit_rules ?? null,
    };
  }

  return {
    accountName: account.name,
    accountType: account.account_type,
    propFirm: account.broker ?? null,
    initialBalance: account.initial_balance,
    currentBalance: account.current_balance ?? null,
    planName: null,
    currency: profile?.currency ?? 'USD',
    timezone: profile?.timezone ?? 'America/Bogota',
    tradingPlan,
    last30Days: {
      totalTrades: trades.length,
      wins: wins.length,
      losses: losses.length,
      winRate: trades.length > 0 ? (wins.length / trades.length) * 100 : 0,
      totalPnl,
      avgWin,
      avgLoss,
      profitFactor,
      topEmotion,
    },
    recentTrades,
    todayTrades,
    instruments,
  };
}

export function buildSystemPrompt(ctx: ZenCoachContext): string {
  const plan = ctx.tradingPlan;
  const stats = ctx.last30Days;

  const tradingPlanSection = plan ? `
TRADING PLAN (${ctx.accountName}):
${plan.dailyLossLimit != null ? `- Límite pérdida diaria: $${plan.dailyLossLimit}` : ''}
${plan.weeklyLossLimit != null ? `- Límite pérdida semanal: $${plan.weeklyLossLimit}` : ''}
${plan.weeklyProfitTarget != null ? `- Objetivo ganancia semanal: $${plan.weeklyProfitTarget}` : ''}
${plan.maxDailyTrades != null ? `- Máx trades/día: ${plan.maxDailyTrades}` : ''}
${plan.maxRiskPerTrade != null ? `- Riesgo máx por trade: ${plan.maxRiskPerTrade}%` : ''}
${plan.minRR != null ? `- R:R mínimo: ${plan.minRR}` : ''}
${plan.tradingHours ? `- Horario: ${plan.tradingHours}` : ''}
${plan.tradingDays ? `- Días permitidos: ${plan.tradingDays}` : ''}
${plan.allowedInstruments.length ? `- Instrumentos: ${plan.allowedInstruments.join(', ')}` : ''}
${plan.entryRules ? `- Reglas entrada: ${plan.entryRules.slice(0, 300)}` : ''}
${plan.exitRules ? `- Reglas salida: ${plan.exitRules.slice(0, 300)}` : ''}
`.trim() : 'TRADING PLAN: No configurado.';

  const todaySection = ctx.todayTrades.length > 0
    ? `TRADES DE HOY:\n${ctx.todayTrades.map(t =>
        `  ${t.instrument} ${t.side.toUpperCase()} x${t.contracts} → $${t.result ?? 0} | ${t.emotions.join(', ') || 'sin emoción'}`
      ).join('\n')}`
    : 'TRADES DE HOY: Ninguno registrado.';

  const recentSection = ctx.recentTrades.length > 0
    ? `ÚLTIMOS TRADES (hasta 15):\n${ctx.recentTrades.slice(0, 15).map(t =>
        `  ${t.date} ${t.instrument} ${t.side.toUpperCase()} x${t.contracts} → $${t.result ?? 0} | Plan: ${t.followedPlan ? 'Sí' : 'No'} | ${t.emotions.join(', ') || '-'}`
      ).join('\n')}`
    : 'ÚLTIMOS TRADES: Ninguno.';

  return `Eres ZenCoach, el coach de trading IA integrado en Zentrade. Eres experto en trading de futuros, psicología del trading y evaluaciones de prop firms.

CUENTA ACTIVA: ${ctx.accountName} (${ctx.accountType}${ctx.propFirm ? ` / ${ctx.propFirm}` : ''})
Balance inicial: $${ctx.initialBalance} ${ctx.currency}${ctx.currentBalance != null ? ` | Balance actual: $${ctx.currentBalance}` : ''}
${ctx.planName ? `Plan/Tamaño: ${ctx.planName}` : ''}

${tradingPlanSection}

ESTADÍSTICAS (últimos 30 días):
- Total trades: ${stats.totalTrades} (${stats.wins}W / ${stats.losses}L)
- Win rate: ${stats.winRate.toFixed(1)}%
- PnL total: $${stats.totalPnl.toFixed(2)}
- Avg ganancia: $${stats.avgWin.toFixed(2)} | Avg pérdida: $${stats.avgLoss.toFixed(2)}
- Profit factor: ${stats.profitFactor === 999 ? '∞' : stats.profitFactor.toFixed(2)}
${stats.topEmotion ? `- Emoción más frecuente: ${stats.topEmotion}` : ''}

${todaySection}

${recentSection}

INSTRUMENTOS DISPONIBLES: ${ctx.instruments.map(i => i.symbol).join(', ')}

REGLAS PARA REGISTRAR TRADES:
- Cuando el usuario quiera registrar un trade (manual o por screenshot), usa la función register_trade.
- Si falta información crítica (instrumento, dirección, contratos, resultado), pregunta antes de llamar la función.
- Si el usuario sube una screenshot, analiza la imagen y extrae: instrumento, dirección (long/short), contratos, resultado en $, hora de entrada/salida.
- Confirma con el usuario los datos antes de registrar.

ESTILO:
- Responde en español, tono profesional pero cercano.
- Sé conciso. No uses listas excesivas. Máximo 3-4 párrafos cortos por respuesta.
- Siempre que des feedback, hazlo basándote en los datos reales del trader.
- Puedes hacer preguntas reflexivas sobre psicología y disciplina.`;
}
