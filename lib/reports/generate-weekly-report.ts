import { supabaseAdmin } from "@/lib/supabase/admin";
import { calculateDashboardStats } from "@/lib/utils/dashboard-calculations";
import type { TradeWithInstrument } from "@/types/trades";
import type { Account } from "@/types/accounts";
import type { TradingPlan } from "@/types/trading-plan";

export interface EmotionStat {
  emotion: string;
  count: number;
  avgPnl: number;
  totalPnl: number;
  wins: number;
  losses: number;
}

export interface HourStat {
  hour: number; // 0-23
  count: number;
  avgPnl: number;
  wins: number;
  losses: number;
}

export interface WeeklyReportData {
  account: Account;
  userEmail: string;
  userName: string | null;
  weekStart: string;
  weekEnd: string;
  stats: ReturnType<typeof calculateDashboardStats>;
  topWinTrade: TradeWithInstrument | null;
  topLossTrade: TradeWithInstrument | null;
  totalTradesWeek: number;
  hasActivity: boolean;
  emotionStats: EmotionStat[];
  hourStats: HourStat[];
  tradingPlan: TradingPlan | null;
}

function computeEmotionStats(trades: TradeWithInstrument[]): EmotionStat[] {
  const map = new Map<string, { pnls: number[]; wins: number; losses: number }>();

  for (const trade of trades) {
    if (!trade.emotions?.length) continue;
    for (const emotion of trade.emotions) {
      if (!map.has(emotion)) map.set(emotion, { pnls: [], wins: 0, losses: 0 });
      const stat = map.get(emotion)!;
      stat.pnls.push(trade.result);
      if (trade.result >= 0) stat.wins++;
      else stat.losses++;
    }
  }

  return Array.from(map.entries())
    .map(([emotion, { pnls, wins, losses }]) => ({
      emotion,
      count: pnls.length,
      totalPnl: pnls.reduce((a, b) => a + b, 0),
      avgPnl: pnls.reduce((a, b) => a + b, 0) / pnls.length,
      wins,
      losses,
    }))
    .sort((a, b) => b.count - a.count);
}

function computeHourStats(trades: TradeWithInstrument[]): HourStat[] {
  const map = new Map<number, { pnls: number[]; wins: number; losses: number }>();

  for (const trade of trades) {
    if (!trade.entry_time) continue;
    // entry_time is "HH:MM" or "HH:MM:SS"
    const hour = parseInt(trade.entry_time.split(":")[0], 10);
    if (isNaN(hour)) continue;
    if (!map.has(hour)) map.set(hour, { pnls: [], wins: 0, losses: 0 });
    const stat = map.get(hour)!;
    stat.pnls.push(trade.result);
    if (trade.result >= 0) stat.wins++;
    else stat.losses++;
  }

  return Array.from(map.entries())
    .map(([hour, { pnls, wins, losses }]) => ({
      hour,
      count: pnls.length,
      avgPnl: pnls.reduce((a, b) => a + b, 0) / pnls.length,
      wins,
      losses,
    }))
    .sort((a, b) => a.hour - b.hour);
}

/**
 * Genera los datos del reporte semanal para una cuenta.
 * weekStart y weekEnd en formato YYYY-MM-DD.
 */
export async function generateWeeklyReport(
  accountId: string,
  weekStart: string,
  weekEnd: string
): Promise<WeeklyReportData | null> {
  // Obtener cuenta
  const { data: account, error: accountError } = await supabaseAdmin
    .from("accounts")
    .select("*")
    .eq("id", accountId)
    .single();

  if (accountError || !account) {
    console.error("[WeeklyReport] Account not found:", accountId);
    return null;
  }

  // Obtener perfil del usuario
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("email, full_name")
    .eq("id", account.user_id)
    .single();

  if (!profile) {
    console.error("[WeeklyReport] Profile not found for user:", account.user_id);
    return null;
  }

  // Obtener trades de la semana con join de instrumento
  const { data: trades, error: tradesError } = await supabaseAdmin
    .from("trades")
    .select("*, instrument:instrument_specs(symbol, name, tick_size, tick_value)")
    .eq("account_id", accountId)
    .gte("trade_date", weekStart)
    .lte("trade_date", weekEnd)
    .order("trade_date", { ascending: true });

  if (tradesError) {
    console.error("[WeeklyReport] Trades error:", tradesError);
    return null;
  }

  const weekTrades = (trades ?? []) as TradeWithInstrument[];
  const hasActivity = weekTrades.length > 0;

  const stats = calculateDashboardStats(weekTrades);

  const topWinTrade = weekTrades.length > 0
    ? weekTrades.reduce((best, t) => t.result > best.result ? t : best, weekTrades[0])
    : null;

  const topLossTrade = weekTrades.filter(t => t.result < 0).length > 0
    ? weekTrades
        .filter(t => t.result < 0)
        .reduce((worst, t) => t.result < worst.result ? t : worst, weekTrades.filter(t => t.result < 0)[0])
    : null;

  // Obtener trading plan activo de la cuenta
  const { data: tradingPlan } = await supabaseAdmin
    .from("trading_plans")
    .select("*")
    .eq("account_id", accountId)
    .eq("is_active", true)
    .maybeSingle();

  return {
    account,
    userEmail: profile.email,
    userName: profile.full_name,
    weekStart,
    weekEnd,
    stats,
    topWinTrade,
    topLossTrade,
    totalTradesWeek: weekTrades.length,
    hasActivity,
    emotionStats: computeEmotionStats(weekTrades),
    hourStats: computeHourStats(weekTrades),
    tradingPlan: (tradingPlan as TradingPlan | null) ?? null,
  };
}

/**
 * Calcula weekStart (lunes) y weekEnd (domingo) de la semana anterior.
 */
export function getLastWeekRange(): { weekStart: string; weekEnd: string } {
  const now = new Date();
  const dayOfWeek = now.getUTCDay(); // 0=domingo, 1=lunes...
  const daysToLastMonday = dayOfWeek === 0 ? 6 : dayOfWeek + 6;

  const lastMonday = new Date(now);
  lastMonday.setUTCDate(now.getUTCDate() - daysToLastMonday);

  const lastSunday = new Date(lastMonday);
  lastSunday.setUTCDate(lastMonday.getUTCDate() + 6);

  return {
    weekStart: lastMonday.toISOString().split("T")[0],
    weekEnd: lastSunday.toISOString().split("T")[0],
  };
}
