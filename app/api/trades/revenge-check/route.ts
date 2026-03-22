import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserPlan } from "@/lib/lemonsqueezy/get-user-plan";
import { detectRevengeTradingPatterns } from "@/lib/utils/revenge-trading";
import type { TradeWithInstrument } from "@/types/trades";

/**
 * GET /api/trades/revenge-check?account_id=...&start_date=...&end_date=...
 *
 * Retorna un array de fechas (YYYY-MM-DD) donde se detectó revenge trading.
 * Solo disponible para usuarios con plan ZenMode activo.
 * Si se omite start_date/end_date, usa la fecha de hoy.
 */
export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // Plan gate — solo ZenMode
  const plan = await getUserPlan(supabase, user.id);
  if (!plan.isZenMode) {
    return NextResponse.json(
      { error: "La detección de revenge trading requiere el plan ZenMode." },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const accountId = searchParams.get("account_id");
  if (!accountId) {
    return NextResponse.json({ error: "account_id es requerido" }, { status: 400 });
  }

  const today = new Date().toISOString().split("T")[0];
  const startDate = searchParams.get("start_date") ?? today;
  const endDate = searchParams.get("end_date") ?? today;

  const { data: trades, error } = await supabase
    .from("trades")
    .select("*, instrument:instrument_specs(symbol, name, tick_size, tick_value)")
    .eq("account_id", accountId)
    .eq("user_id", user.id)
    .gte("trade_date", startDate)
    .lte("trade_date", endDate)
    .order("trade_date", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Agrupar por día
  const byDate = new Map<string, TradeWithInstrument[]>();
  for (const trade of (trades ?? []) as TradeWithInstrument[]) {
    const key = trade.trade_date;
    if (!byDate.has(key)) byDate.set(key, []);
    byDate.get(key)!.push(trade);
  }

  // Detectar revenge trading por día
  const revengeDates: string[] = [];
  for (const [date, dayTrades] of byDate.entries()) {
    const result = detectRevengeTradingPatterns(dayTrades);
    if (result.detected) {
      revengeDates.push(date);
    }
  }

  // Para el día de hoy, devolver también los detalles completos
  const todayResult = byDate.has(today)
    ? detectRevengeTradingPatterns(byDate.get(today)!)
    : { detected: false, patterns: [] };

  return NextResponse.json({
    revengeDates,
    today: todayResult,
  });
}
