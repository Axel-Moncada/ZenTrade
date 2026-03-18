import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type { TradingPlan } from "@/types/trading-plan";

export interface ZenCoachMessage {
  role: "user" | "assistant";
  content: string;
}

// ─── Raw row types from DB ────────────────────────────────────────────────────

type AccountRow = Database["public"]["Tables"]["accounts"]["Row"];
type TradeRow = Database["public"]["Tables"]["trades"]["Row"];

interface TradeWithSymbol extends TradeRow {
  instrument: { symbol: string } | null;
}

// ─── Trade Stats ─────────────────────────────────────────────────────────────

interface TradeStats {
  totalTrades: number;
  wins: number;
  losses: number;
  totalPnl: number;
  winRate: number;
  profitFactor: number;
  avgWin: number;
  avgLoss: number;
  followedPlanRate: number;
  topEmotions: string[];
  recentTrades: Array<{
    date: string;
    result: number;
    followed_plan: boolean;
    emotions: string[];
    instrument: string;
  }>;
}

async function buildTradeStats(
  supabase: SupabaseClient<Database>,
  userId: string,
  accountId: string
): Promise<TradeStats> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const since = thirtyDaysAgo.toISOString().split("T")[0];

  const { data } = await supabase
    .from("trades")
    .select("*, instrument:instrument_specs(symbol)")
    .eq("account_id", accountId)
    .eq("user_id", userId)
    .gte("trade_date", since)
    .order("trade_date", { ascending: false })
    .limit(100);

  const trades = (data ?? []) as unknown as TradeWithSymbol[];

  if (trades.length === 0) {
    return {
      totalTrades: 0,
      wins: 0,
      losses: 0,
      totalPnl: 0,
      winRate: 0,
      profitFactor: 0,
      avgWin: 0,
      avgLoss: 0,
      followedPlanRate: 0,
      topEmotions: [],
      recentTrades: [],
    };
  }

  const wins = trades.filter((t) => t.result > 0);
  const losses = trades.filter((t) => t.result < 0);
  const totalPnl = trades.reduce((sum, t) => sum + t.result, 0);
  const grossWin = wins.reduce((sum, t) => sum + t.result, 0);
  const grossLoss = Math.abs(losses.reduce((sum, t) => sum + t.result, 0));

  // Emotion frequency
  const emotionCount: Record<string, number> = {};
  for (const t of trades) {
    for (const e of t.emotions ?? []) {
      emotionCount[e] = (emotionCount[e] ?? 0) + 1;
    }
  }
  const topEmotions = Object.entries(emotionCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([e]) => e);

  const recentTrades = trades.slice(0, 10).map((t) => ({
    date: t.trade_date,
    result: t.result,
    followed_plan: t.followed_plan,
    emotions: (t.emotions ?? []) as string[],
    instrument: t.instrument?.symbol ?? "N/A",
  }));

  return {
    totalTrades: trades.length,
    wins: wins.length,
    losses: losses.length,
    totalPnl,
    winRate: (wins.length / trades.length) * 100,
    profitFactor: grossLoss > 0 ? grossWin / grossLoss : grossWin > 0 ? Infinity : 0,
    avgWin: wins.length > 0 ? grossWin / wins.length : 0,
    avgLoss: losses.length > 0 ? grossLoss / losses.length : 0,
    followedPlanRate: (trades.filter((t) => t.followed_plan).length / trades.length) * 100,
    topEmotions,
    recentTrades,
  };
}

// ─── Context Builder ──────────────────────────────────────────────────────────

export async function buildZenCoachContext(
  supabase: SupabaseClient<Database>,
  userId: string,
  accountId: string
): Promise<string> {
  const [accountResult, planResult, stats] = await Promise.all([
    supabase
      .from("accounts")
      .select(
        "name, account_type, current_balance, profit_target, max_drawdown, consistency_percent, status"
      )
      .eq("id", accountId)
      .eq("user_id", userId)
      .single(),
    supabase
      .from("trading_plans")
      .select("*")
      .eq("account_id", accountId)
      .eq("user_id", userId)
      .maybeSingle(),
    buildTradeStats(supabase, userId, accountId),
  ]);

  const account = accountResult.data as Pick<
    AccountRow,
    "name" | "account_type" | "current_balance" | "profit_target" | "max_drawdown" | "consistency_percent" | "status"
  > | null;

  const plan = planResult.data as TradingPlan | null;

  const accountSection = account
    ? `CUENTA ACTIVA:
- Nombre: ${account.name}
- Tipo: ${account.account_type}
- Balance actual: $${account.current_balance?.toFixed(2) ?? "N/A"}
- Objetivo de ganancia: ${account.profit_target != null ? "$" + account.profit_target : "No definido"}
- Max drawdown: $${account.max_drawdown}
- Regla de consistencia: ${account.consistency_percent}%
- Estado: ${account.status}`
    : "CUENTA: No encontrada";

  const planSection = plan
    ? `TRADING PLAN:
- Daily loss limit: ${plan.daily_loss_limit != null ? "$" + plan.daily_loss_limit : "N/A"}
- Weekly loss limit: ${plan.weekly_loss_limit != null ? "$" + plan.weekly_loss_limit : "N/A"}
- Objetivo semanal: ${plan.weekly_profit_target != null ? "$" + plan.weekly_profit_target : "N/A"}
- Max trades/día: ${plan.max_daily_trades ?? "N/A"}
- Riesgo máx/trade: ${plan.max_risk_per_trade != null ? plan.max_risk_per_trade + "%" : "N/A"}
- R:R mínimo: ${plan.min_risk_reward_ratio ?? "N/A"}
- Horario: ${plan.trading_start_time ?? "N/A"} – ${plan.trading_end_time ?? "N/A"}
- Reglas de entrada: ${plan.entry_rules ? plan.entry_rules.slice(0, 300) : "No definidas"}
- Reglas de salida: ${plan.exit_rules ? plan.exit_rules.slice(0, 300) : "No definidas"}`
    : "TRADING PLAN: No configurado";

  const statsSection = `ESTADÍSTICAS ÚLTIMOS 30 DÍAS:
- Trades: ${stats.totalTrades} (${stats.wins}W / ${stats.losses}L)
- PnL total: $${stats.totalPnl.toFixed(2)}
- Win rate: ${stats.winRate.toFixed(1)}%
- Profit factor: ${stats.profitFactor === Infinity ? "∞" : stats.profitFactor.toFixed(2)}
- Avg win: $${stats.avgWin.toFixed(2)} | Avg loss: $${stats.avgLoss.toFixed(2)}
- Adherencia al plan: ${stats.followedPlanRate.toFixed(0)}%
- Emociones frecuentes: ${stats.topEmotions.join(", ") || "Sin datos"}`;

  const recentSection =
    stats.recentTrades.length > 0
      ? `ÚLTIMOS 10 TRADES:
${stats.recentTrades
  .map(
    (t) =>
      `${t.date} | ${t.instrument} | $${t.result.toFixed(2)} | Plan: ${t.followed_plan ? "✓" : "✗"} | ${t.emotions.join(", ") || "—"}`
  )
  .join("\n")}`
      : "ÚLTIMOS TRADES: Sin datos";

  return `${accountSection}

${planSection}

${statsSection}

${recentSection}`;
}

// ─── System Prompt ────────────────────────────────────────────────────────────

export function buildZenCoachSystemPrompt(context: string, userName: string): string {
  const today = new Date().toLocaleDateString("es-CO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "America/Bogota",
  });

  return `Eres ZenCoach, el coach de trading de ${userName} dentro de ZenTrade.

FECHA HOY: ${today}

ROL:
Eres un coach de trading directo, sin rodeos y profundamente analítico. No das palmaditas en la espalda. Das feedback honesto basado en datos. Tu objetivo es que el trader mejore su disciplina, su adherencia al plan y sus resultados — en ese orden.

RESTRICCIONES CRÍTICAS:
- NUNCA prometas rentabilidad ni predicas resultados futuros. El trading tiene riesgo.
- NUNCA sugieras instrumentos para operar o estrategias de entry/exit específicas. Eso es asesoría financiera.
- Sí puedes analizar patrones en los datos del trader (horas, emociones, adherencia al plan) y hacer observaciones concretas.
- Si te preguntan algo fuera de tu rol (soporte técnico, facturación, preguntas no relacionadas al trading), di que no es tu área.

TONO:
- Directo como un buen mentor, no como un chatbot corporativo
- Máximo 3 párrafos cortos por respuesta. Menos es más.
- Si hay datos concretos en el contexto, cítalos. No improvises.
- Si no hay datos suficientes para responder, dilo directamente.

DATOS DEL TRADER:
${context}

EJEMPLOS DE RESPUESTAS BUENAS:
- "Tu win rate es 58% pero tu profit factor es 0.8 — eso significa que tus pérdidas son más grandes que tus ganancias. El problema no es la dirección, es el sizing o el exit."
- "Operas con miedo en el 70% de tus trades con pérdida. ¿Tienes definido tu stop antes de entrar?"
- "No hay suficientes datos en los últimos 30 días para darte un análisis sólido. Registra más trades."`;
}
