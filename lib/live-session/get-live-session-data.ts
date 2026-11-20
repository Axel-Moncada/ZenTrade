import { computePeakBalance } from "@/lib/utils/drawdown";
import type { createClient } from "@/lib/supabase/server";
import { getZonedDate } from "./discipline-rules";
import type { LiveInstrument, LiveSessionData, LiveTrade } from "./types";

type ServerClient = Awaited<ReturnType<typeof createClient>>;

interface TradeRow {
  id: string;
  trade_date: string;
  result: number;
  contracts: number;
  side: "long" | "short";
  followed_plan: boolean;
  created_at: string;
  entry_time: string | null;
  exit_time: string | null;
  instrument: { symbol: string } | null;
}

/**
 * Carga todo lo que necesita el copiloto para una cuenta.
 * Usa el cliente con sesión del usuario ⇒ RLS garantiza aislamiento,
 * y además filtramos por user_id explícitamente.
 * Retorna null si la cuenta no existe o no pertenece al usuario.
 */
export async function getLiveSessionData(
  supabase: ServerClient,
  userId: string,
  accountId: string
): Promise<LiveSessionData | null> {
  const [accountRes, planRes, profileRes] = await Promise.all([
    supabase
      .from("accounts")
      .select(
        "id, name, account_type, starting_balance, current_balance, max_drawdown, drawdown_type, profit_target, consistency_percent"
      )
      .eq("id", accountId)
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("trading_plans")
      .select(
        "daily_loss_limit, daily_profit_target, max_daily_trades, trading_start_time, trading_end_time, trading_days, allowed_instruments"
      )
      .eq("account_id", accountId)
      .eq("user_id", userId)
      .eq("is_active", true)
      .maybeSingle(),
    supabase.from("profiles").select("currency, timezone").eq("id", userId).maybeSingle(),
  ]);

  const account = accountRes.data;
  if (!account) return null;

  const timezone = profileRes.data?.timezone || "America/Bogota";
  const currency = profileRes.data?.currency || "USD";
  const today = getZonedDate(new Date(), timezone);

  const { data: tradeRows } = await supabase
    .from("trades")
    .select(
      "id, trade_date, result, contracts, side, followed_plan, created_at, entry_time, exit_time, instrument:instrument_specs(symbol)"
    )
    .eq("account_id", accountId)
    .eq("user_id", userId)
    .returns<TradeRow[]>();

  const rows = tradeRows ?? [];
  const pnlByDay = new Map<string, number>();
  let accountNetProfit = 0;
  for (const row of rows) {
    accountNetProfit += Number(row.result) || 0;
    pnlByDay.set(row.trade_date, (pnlByDay.get(row.trade_date) ?? 0) + (Number(row.result) || 0));
  }
  let bestPreviousDay = 0;
  for (const [day, pnl] of pnlByDay) {
    if (day !== today && pnl > bestPreviousDay) bestPreviousDay = pnl;
  }

  const todayTrades: LiveTrade[] = rows
    .filter((r) => r.trade_date === today)
    .map((r) => ({
      id: r.id,
      result: Number(r.result) || 0,
      contracts: r.contracts,
      side: r.side,
      symbol: r.instrument?.symbol ?? "—",
      followedPlan: r.followed_plan,
      createdAt: r.created_at,
      entryTime: r.entry_time,
      exitTime: r.exit_time,
    }))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  const plan = planRes.data;

  return {
    account: {
      id: account.id,
      name: account.name,
      accountType: account.account_type,
      startingBalance: Number(account.starting_balance) || 0,
      currentBalance: Number(account.current_balance) || 0,
      maxDrawdown: Number(account.max_drawdown) || 0,
      drawdownType: account.drawdown_type,
      peakBalance: computePeakBalance(Number(account.starting_balance) || 0, rows),
      profitTarget: account.profit_target !== null ? Number(account.profit_target) : null,
      consistencyPercent: Number(account.consistency_percent) || 0,
    },
    plan: plan
      ? {
          dailyLossLimit: plan.daily_loss_limit !== null ? Number(plan.daily_loss_limit) : null,
          dailyProfitTarget: plan.daily_profit_target !== null ? Number(plan.daily_profit_target) : null,
          maxDailyTrades: plan.max_daily_trades,
          tradingStartTime: plan.trading_start_time,
          tradingEndTime: plan.trading_end_time,
          tradingDays: plan.trading_days,
          allowedInstruments: plan.allowed_instruments,
        }
      : null,
    todayTrades,
    today,
    timezone,
    currency,
    accountNetProfit,
    bestPreviousDay,
  };
}

export async function getLiveInstruments(supabase: ServerClient): Promise<LiveInstrument[]> {
  const { data } = await supabase
    .from("instrument_specs")
    .select("id, symbol, name")
    .order("symbol", { ascending: true });
  return (data ?? []).map((i) => ({ id: i.id, symbol: i.symbol, name: i.name }));
}
