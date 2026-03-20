import { NextResponse } from "next/server";
import { render } from "@react-email/render";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { generateMarketPreview } from "@/lib/ai/gemini-market-news";
import { MarketPreviewEmail } from "@/lib/resend/emails/market-preview-email";
import { resend, FROM_EMAIL } from "@/lib/resend/client";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://zen-trader.com";
const ACTIVE_PLAN_STATUSES = ["active", "on_trial"];

/**
 * GET /api/cron/market-preview
 * Llamado por Vercel Cron cada domingo a las 19:00 UTC.
 * Solo envía a usuarios con plan ZenMode activo.
 *
 * Testing manual:
 *   curl -H "Authorization: Bearer <CRON_SECRET>" \
 *     "https://zen-trader.com/api/cron/market-preview?week_start=2026-03-23&week_end=2026-03-27"
 */
export async function GET(request: Request) {
  // Verificar secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Override de fechas para testing
  const { searchParams } = new URL(request.url);
  const overrideStart = searchParams.get("week_start");
  const overrideEnd = searchParams.get("week_end");
  const { weekStart, weekEnd } = overrideStart && overrideEnd
    ? { weekStart: overrideStart, weekEnd: overrideEnd }
    : getNextWeekRange();

  console.log(`[MarketPreviewCron] Iniciando preview semana ${weekStart} → ${weekEnd}`);

  // Obtener usuarios ZenMode activos
  const { data: subscriptions, error: subsError } = await supabaseAdmin
    .from("subscriptions")
    .select("user_id")
    .eq("plan_key", "zenmode")
    .in("status", ACTIVE_PLAN_STATUSES);

  if (subsError) {
    console.error("[MarketPreviewCron] Error fetching subscriptions:", subsError);
    return NextResponse.json({ error: "Failed to fetch subscriptions" }, { status: 500 });
  }

  if (!subscriptions?.length) {
    console.log("[MarketPreviewCron] No hay usuarios ZenMode activos");
    return NextResponse.json({ success: true, sent: 0, message: "No zenmode users" });
  }

  const zenModeUserIds = subscriptions.map((s) => s.user_id);

  // Obtener perfiles
  const { data: profiles, error: profilesError } = await supabaseAdmin
    .from("profiles")
    .select("id, email, full_name")
    .in("id", zenModeUserIds);

  if (profilesError || !profiles?.length) {
    console.error("[MarketPreviewCron] Error fetching profiles:", profilesError);
    return NextResponse.json({ success: true, sent: 0 });
  }

  // Recopilar instrumentos de todos los usuarios ZenMode (últimos 60 días + trading plans)
  const allInstruments = await getZenModeInstruments(zenModeUserIds);
  console.log(`[MarketPreviewCron] Instrumentos: ${allInstruments.join(", ")}`);

  // Generar preview con Gemini (una sola llamada para todos)
  let previewData;
  try {
    console.log("[MarketPreviewCron] Llamando Gemini...");
    previewData = await generateMarketPreview(weekStart, weekEnd, allInstruments);
    console.log(`[MarketPreviewCron] Gemini respondió con ${previewData.newsItems?.length ?? 0} eventos`);
  } catch (geminiError) {
    console.error("[MarketPreviewCron] Gemini error:", geminiError);
    return NextResponse.json({ error: "Failed to generate market preview" }, { status: 500 });
  }

  // Enviar email a cada usuario ZenMode
  const results = { sent: 0, errors: 0 };

  for (const profile of profiles) {
    if (!profile.email) continue;

    try {
      const html = await render(
        MarketPreviewEmail({
          userName: profile.full_name,
          weekStart,
          weekEnd,
          previewData,
          dashboardUrl: `${APP_URL}/dashboard`,
        })
      );

      const { error: emailError } = await resend.emails.send({
        from: FROM_EMAIL,
        to: profile.email,
        subject: `Radar de mercado · ${previewData.newsItems.length} eventos clave esta semana`,
        html,
      });

      if (emailError) {
        console.error(`[MarketPreviewCron] Email error para ${profile.email}:`, emailError);
        results.errors++;
      } else {
        console.log(`[MarketPreviewCron] ✓ Enviado a ${profile.email}`);
        results.sent++;
      }
    } catch (error) {
      console.error(`[MarketPreviewCron] Error procesando usuario ${profile.id}:`, error);
      results.errors++;
    }
  }

  console.log("[MarketPreviewCron] Completado:", results);
  return NextResponse.json({ success: true, weekStart, weekEnd, ...results });
}

/**
 * Calcula el rango de la próxima semana (lunes–viernes).
 * Se llama el domingo por la noche, por eso next Monday = mañana.
 */
function getNextWeekRange(): { weekStart: string; weekEnd: string } {
  const now = new Date();
  const dayOfWeek = now.getUTCDay(); // 0 = domingo
  const daysToNextMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;

  const nextMonday = new Date(now);
  nextMonday.setUTCDate(now.getUTCDate() + daysToNextMonday);
  nextMonday.setUTCHours(0, 0, 0, 0);

  const nextFriday = new Date(nextMonday);
  nextFriday.setUTCDate(nextMonday.getUTCDate() + 4);

  return {
    weekStart: nextMonday.toISOString().split("T")[0],
    weekEnd: nextFriday.toISOString().split("T")[0],
  };
}

/**
 * Obtiene la lista de instrumentos únicos que operan los usuarios ZenMode.
 * Combina: trades de los últimos 60 días + trading plans activos.
 */
async function getZenModeInstruments(userIds: string[]): Promise<string[]> {
  const { data: accounts } = await supabaseAdmin
    .from("accounts")
    .select("id")
    .in("user_id", userIds);

  const accountIds = (accounts ?? []).map((a) => a.id);

  if (accountIds.length === 0) {
    return ["ES", "NQ", "MNQ", "MES", "CL", "GC"];
  }

  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
  const dateStr = sixtyDaysAgo.toISOString().split("T")[0];

  const [tradesResult, plansResult] = await Promise.all([
    supabaseAdmin
      .from("trades")
      .select("instrument:instrument_specs(symbol)")
      .in("account_id", accountIds)
      .gte("trade_date", dateStr),
    supabaseAdmin
      .from("trading_plans")
      .select("allowed_instruments")
      .in("account_id", accountIds)
      .eq("is_active", true),
  ]);

  const fromTrades = (tradesResult.data ?? [])
    .map((t) => (t.instrument as { symbol: string } | null)?.symbol)
    .filter((s): s is string => Boolean(s));

  const fromPlans = (plansResult.data ?? [])
    .flatMap((p) => (p.allowed_instruments as string[] | null) ?? [])
    .filter(Boolean);

  const unique = [...new Set([...fromTrades, ...fromPlans])];

  // Fallback a instrumentos populares si no hay datos
  return unique.length > 0 ? unique : ["ES", "NQ", "MNQ", "MES", "CL", "GC"];
}
