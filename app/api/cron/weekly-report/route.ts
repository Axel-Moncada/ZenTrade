import { NextResponse } from "next/server";
import { render } from "@react-email/render";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { generateWeeklyReport, getLastWeekRange } from "@/lib/reports/generate-weekly-report";
import { generateWeeklyAnalysis } from "@/lib/ai/gemini";
import { WeeklyReportEmail } from "@/lib/resend/emails/weekly-report-email";
import { resend, FROM_EMAIL } from "@/lib/resend/client";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://zen-trader.com";
const ACTIVE_PLAN_STATUSES = ["active", "on_trial"];

/**
 * GET /api/cron/weekly-report
 * Llamado por Vercel Cron cada lunes a las 10:00 UTC.
 * También se puede invocar manualmente con:
 *   curl -H "Authorization: Bearer <CRON_SECRET>" https://zen-trader.com/api/cron/weekly-report
 */
export async function GET(request: Request) {
  // Verificar secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Permitir override para testing: ?week_start=2026-02-24&week_end=2026-03-02
  const { searchParams } = new URL(request.url);
  const overrideStart = searchParams.get("week_start");
  const overrideEnd = searchParams.get("week_end");
  const { weekStart: defaultStart, weekEnd: defaultEnd } = getLastWeekRange();
  const weekStart = overrideStart ?? defaultStart;
  const weekEnd = overrideEnd ?? defaultEnd;
  console.log(`[WeeklyCron] Iniciando reporte semana ${weekStart} → ${weekEnd}`);

  // Obtener todas las cuentas activas
  const { data: accounts, error: accountsError } = await supabaseAdmin
    .from("accounts")
    .select("id, user_id, name")
    .eq("status", "active");

  if (accountsError || !accounts) {
    console.error("[WeeklyCron] Error fetching accounts:", accountsError);
    return NextResponse.json({ error: "Failed to fetch accounts" }, { status: 500 });
  }

  // Obtener planes activos de todos los usuarios únicos
  const userIds = [...new Set(accounts.map((a) => a.user_id))];

  const { data: subscriptions } = await supabaseAdmin
    .from("subscriptions")
    .select("user_id, plan_key, status")
    .in("user_id", userIds)
    .in("status", ACTIVE_PLAN_STATUSES);

  // Mapa user_id → plan_key
  const userPlanMap = new Map<string, string>();
  for (const sub of subscriptions ?? []) {
    userPlanMap.set(sub.user_id, sub.plan_key);
  }

  const results = { sent: 0, skipped: 0, errors: 0 };

  for (const account of accounts) {
    const planKey = userPlanMap.get(account.user_id) ?? "free";

    // Free no recibe reporte
    if (planKey === "free") {
      results.skipped++;
      continue;
    }

    try {
      const reportData = await generateWeeklyReport(account.id, weekStart, weekEnd);

      if (!reportData || !reportData.hasActivity) {
        results.skipped++;
        continue;
      }

      const isPro = planKey === "pro" || planKey === "zenmode";
      let aiAnalysis: string | null = null;

      if (isPro && process.env.GEMINI_API_KEY) {
        try {
          console.log("[WeeklyCron] Llamando Gemini para cuenta:", account.name);
          aiAnalysis = await generateWeeklyAnalysis({
            totalPnl: reportData.stats.totalPnl,
            winRate: reportData.stats.winRate,
            totalTrades: reportData.stats.totalTrades,
            bestDay: reportData.stats.bestDay,
            worstDay: reportData.stats.worstDay,
            profitFactor: reportData.stats.profitFactor,
            planAdherenceRate: reportData.stats.planAdherenceRate,
            emotionStats: reportData.emotionStats,
            hourStats: reportData.hourStats,
            tradingPlan: reportData.tradingPlan,
          });
          console.log("[WeeklyCron] Gemini respondió:", aiAnalysis?.slice(0, 80));
        } catch (geminiError) {
          console.warn("[WeeklyCron] Gemini error:", geminiError);
        }
      } else {
        console.log("[WeeklyCron] Gemini skipped — isPro:", isPro, "| KEY existe:", !!process.env.GEMINI_API_KEY);
      }

      const html = await render(
        WeeklyReportEmail({
          userName: reportData.userName,
          accountName: reportData.account.name,
          weekStart: reportData.weekStart,
          weekEnd: reportData.weekEnd,
          totalPnl: reportData.stats.totalPnl,
          winRate: reportData.stats.winRate,
          totalTrades: reportData.stats.totalTrades,
          profitFactor: reportData.stats.profitFactor,
          planAdherenceRate: reportData.stats.planAdherenceRate,
          bestDay: reportData.stats.bestDay,
          worstDay: reportData.stats.worstDay,
          topWin: reportData.topWinTrade
            ? {
                result: reportData.topWinTrade.result,
                instrument: reportData.topWinTrade.instrument.symbol,
                date: reportData.topWinTrade.trade_date,
              }
            : null,
          topLoss: reportData.topLossTrade
            ? {
                result: reportData.topLossTrade.result,
                instrument: reportData.topLossTrade.instrument.symbol,
                date: reportData.topLossTrade.trade_date,
              }
            : null,
          aiAnalysis,
          dashboardUrl: `${APP_URL}/dashboard`,
          accountType: reportData.account.account_type,
          profitTarget: reportData.account.profit_target ?? null,
          currentBalance: reportData.account.current_balance,
          initialBalance: reportData.account.initial_balance,
        })
      );

      const pnlSign = reportData.stats.totalPnl >= 0 ? "+" : "";
      const { error: emailError } = await resend.emails.send({
        from: FROM_EMAIL,
        to: reportData.userEmail,
        subject: `Tu semana en ${reportData.account.name} — ${pnlSign}$${Math.abs(reportData.stats.totalPnl).toFixed(2)}`,
        html,
      });

      if (emailError) {
        console.error(`[WeeklyCron] Email error para ${reportData.userEmail}:`, emailError);
        results.errors++;
      } else {
        console.log(`[WeeklyCron] ✓ Enviado a ${reportData.userEmail} — cuenta ${reportData.account.name}`);
        results.sent++;
      }
    } catch (error) {
      console.error(`[WeeklyCron] Error procesando cuenta ${account.id}:`, error);
      results.errors++;
    }
  }

  console.log(`[WeeklyCron] Completado:`, results);
  return NextResponse.json({ success: true, weekStart, weekEnd, ...results });
}
