import { GoogleGenerativeAI } from "@google/generative-ai";
import type { EmotionStat, HourStat } from "@/lib/reports/generate-weekly-report";
import type { TradingPlan } from "@/types/trading-plan";

if (!process.env.GEMINI_API_KEY) {
  console.warn("[Gemini] GEMINI_API_KEY no configurado");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");
export const geminiFlash = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export interface WeeklyTradeData {
  totalPnl: number;
  winRate: number;
  totalTrades: number;
  bestDay: { date: string; pnl: number } | null;
  worstDay: { date: string; pnl: number } | null;
  profitFactor: number;
  planAdherenceRate: number;
  emotionStats: EmotionStat[];
  hourStats: HourStat[];
  tradingPlan: TradingPlan | null;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function buildTradingPlanSection(plan: TradingPlan | null): string {
  if (!plan) return "  (no trading plan configured)";

  const lines: string[] = [];

  if (plan.daily_loss_limit != null)
    lines.push(`  - Daily loss limit: $${plan.daily_loss_limit}`);
  if (plan.weekly_loss_limit != null)
    lines.push(`  - Weekly loss limit: $${plan.weekly_loss_limit}`);
  if (plan.weekly_profit_target != null)
    lines.push(`  - Weekly profit target: $${plan.weekly_profit_target}`);
  if (plan.max_daily_trades != null)
    lines.push(`  - Max trades per day: ${plan.max_daily_trades}`);
  if (plan.max_risk_per_trade != null)
    lines.push(`  - Max risk per trade: ${plan.max_risk_per_trade}%`);
  if (plan.min_risk_reward_ratio != null)
    lines.push(`  - Min required R:R: ${plan.min_risk_reward_ratio}`);
  if (plan.trading_start_time && plan.trading_end_time)
    lines.push(`  - Allowed hours: ${plan.trading_start_time} – ${plan.trading_end_time}`);
  if (plan.trading_days?.length)
    lines.push(`  - Allowed days: ${plan.trading_days.map(d => DAY_NAMES[d]).join(", ")}`);
  if (plan.allowed_instruments?.length)
    lines.push(`  - Allowed instruments: ${plan.allowed_instruments.join(", ")}`);
  if (plan.entry_rules)
    lines.push(`  - Entry rules: ${plan.entry_rules.slice(0, 200)}`);
  if (plan.exit_rules)
    lines.push(`  - Exit rules: ${plan.exit_rules.slice(0, 200)}`);

  return lines.length > 0 ? lines.join("\n") : "  (trading plan has no rules configured)";
}

/**
 * Genera un análisis narrativo de la semana de trading.
 * ~300-400 tokens. Usa gemini-2.5-flash (free tier).
 */
export async function generateWeeklyAnalysis(data: WeeklyTradeData): Promise<string> {
  // Emociones
  const emotionLines = data.emotionStats.length > 0
    ? data.emotionStats
        .slice(0, 5)
        .map(e => `  - ${e.emotion}: ${e.count} trades, PnL promedio $${e.avgPnl.toFixed(2)} (${e.wins}W/${e.losses}L)`)
        .join("\n")
    : "  (sin datos de emociones)";

  // Horas — top 3 mejores y peores
  const sortedByPnl = [...data.hourStats].sort((a, b) => b.avgPnl - a.avgPnl);
  const bestHours = sortedByPnl.slice(0, 3).map(h => `${h.hour}:00 (avg $${h.avgPnl.toFixed(2)})`).join(", ");
  const worstHours = sortedByPnl.slice(-3).reverse().map(h => `${h.hour}:00 (avg $${h.avgPnl.toFixed(2)})`).join(", ");
  const hourLines = data.hourStats.length > 0
    ? `  Mejores horas: ${bestHours}\n  Peores horas: ${worstHours}`
    : "  (sin datos de horario)";

  // Trading plan
  const planSection = buildTradingPlanSection(data.tradingPlan);

  const prompt = `You are a professional trading coach analyzing a trader's week. Write a concrete and actionable analysis in English, in 4-5 sentences.

FORMAT INSTRUCTIONS:
- Use HTML tags <b>text</b> to highlight key numbers, emotions, and important conclusions.
- Only use <b> and </b>, no other HTML tags.
- Do not use asterisks (**), markdown, or lists.
- Reply only with the analysis paragraph, no title or prefix.

CONTENT INSTRUCTIONS:
- Compare actual execution vs the trading plan (if one exists). Explicitly mention whether rules were followed or broken.
- Identify the most relevant emotional pattern and its correlation with results.
- Mention the best and worst performing hours with exact numbers.
- End with a specific, actionable recommendation for next week.

WEEK DATA:
Total PnL: $${data.totalPnl.toFixed(2)}
Win rate: ${data.winRate.toFixed(1)}%
Total trades: ${data.totalTrades}
Profit factor: ${data.profitFactor === Infinity ? "∞" : data.profitFactor.toFixed(2)}
Plan adherence: ${data.planAdherenceRate.toFixed(0)}%
${data.bestDay ? `Best day: ${data.bestDay.date} ($${data.bestDay.pnl.toFixed(2)})` : ""}
${data.worstDay ? `Worst day: ${data.worstDay.date} ($${data.worstDay.pnl.toFixed(2)})` : ""}

LOGGED EMOTIONS:
${emotionLines}

PERFORMANCE BY HOUR:
${hourLines}

ACCOUNT TRADING PLAN:
${planSection}`;

  const result = await geminiFlash.generateContent(prompt);
  return result.response.text().trim();
}
