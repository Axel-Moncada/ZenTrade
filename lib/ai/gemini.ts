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

const DAY_NAMES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

function buildTradingPlanSection(plan: TradingPlan | null): string {
  if (!plan) return "  (sin trading plan configurado)";

  const lines: string[] = [];

  if (plan.daily_loss_limit != null)
    lines.push(`  - Límite de pérdida diaria: $${plan.daily_loss_limit}`);
  if (plan.weekly_loss_limit != null)
    lines.push(`  - Límite de pérdida semanal: $${plan.weekly_loss_limit}`);
  if (plan.weekly_profit_target != null)
    lines.push(`  - Objetivo de ganancia semanal: $${plan.weekly_profit_target}`);
  if (plan.max_daily_trades != null)
    lines.push(`  - Máximo de trades por día: ${plan.max_daily_trades}`);
  if (plan.max_risk_per_trade != null)
    lines.push(`  - Riesgo máximo por trade: ${plan.max_risk_per_trade}%`);
  if (plan.min_risk_reward_ratio != null)
    lines.push(`  - R:R mínimo requerido: ${plan.min_risk_reward_ratio}`);
  if (plan.trading_start_time && plan.trading_end_time)
    lines.push(`  - Horario permitido: ${plan.trading_start_time} – ${plan.trading_end_time}`);
  if (plan.trading_days?.length)
    lines.push(`  - Días permitidos: ${plan.trading_days.map(d => DAY_NAMES[d]).join(", ")}`);
  if (plan.allowed_instruments?.length)
    lines.push(`  - Instrumentos permitidos: ${plan.allowed_instruments.join(", ")}`);
  if (plan.entry_rules)
    lines.push(`  - Reglas de entrada: ${plan.entry_rules.slice(0, 200)}`);
  if (plan.exit_rules)
    lines.push(`  - Reglas de salida: ${plan.exit_rules.slice(0, 200)}`);

  return lines.length > 0 ? lines.join("\n") : "  (trading plan sin reglas configuradas)";
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

  const prompt = `Eres un coach de trading profesional analizando la semana de un trader. Escribe un análisis concreto y accionable en español, en 4-5 frases.

INSTRUCCIONES DE FORMATO:
- Usa etiquetas HTML <b>texto</b> para resaltar datos numéricos clave, emociones y conclusiones importantes.
- Solo usa <b> y </b>, ninguna otra etiqueta HTML.
- No uses asteriscos (**), markdown, ni listas.
- Responde solo con el párrafo de análisis, sin título ni prefijos.

INSTRUCCIONES DE CONTENIDO:
- Compara la ejecución real vs el trading plan (si existe). Menciona explícitamente si se respetaron o violaron las reglas.
- Identifica el patrón emocional más relevante y su correlación con los resultados.
- Menciona las horas de mejor y peor rendimiento con los números exactos.
- Termina con una recomendación específica y accionable para la próxima semana.

DATOS DE LA SEMANA:
PnL total: $${data.totalPnl.toFixed(2)}
Win rate: ${data.winRate.toFixed(1)}%
Total trades: ${data.totalTrades}
Profit factor: ${data.profitFactor === Infinity ? "∞" : data.profitFactor.toFixed(2)}
Adherencia al plan: ${data.planAdherenceRate.toFixed(0)}%
${data.bestDay ? `Mejor día: ${data.bestDay.date} ($${data.bestDay.pnl.toFixed(2)})` : ""}
${data.worstDay ? `Peor día: ${data.worstDay.date} ($${data.worstDay.pnl.toFixed(2)})` : ""}

EMOCIONES REGISTRADAS:
${emotionLines}

RENDIMIENTO POR HORA:
${hourLines}

TRADING PLAN DE LA CUENTA:
${planSection}`;

  const result = await geminiFlash.generateContent(prompt);
  return result.response.text().trim();
}
