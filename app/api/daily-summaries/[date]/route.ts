import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/daily-summaries/[date] - Obtener summary específico de una fecha
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ date: string }> }
) {
  try {
    const supabase = await createClient();
    const { date } = await context.params;

    // Verificar autenticación
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    // Obtener account_id de query params
    const searchParams = request.nextUrl.searchParams;
    const accountId = searchParams.get("account_id");

    if (!accountId) {
      return NextResponse.json(
        { error: "account_id es requerido" },
        { status: 400 }
      );
    }

    // Obtener summary (RLS automáticamente filtra por user_id)
    const { data: summary, error } = await supabase
      .from("daily_summaries")
      .select("*")
      .eq("account_id", accountId)
      .eq("summary_date", date)
      .maybeSingle();

    if (error) {
      console.error("Error fetching summary:", error);
      return NextResponse.json(
        { error: "Error al obtener el resumen" },
        { status: 500 }
      );
    }

    // Es válido que no exista summary (día sin trades)
    return NextResponse.json({ summary: summary || null }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error in GET /api/daily-summaries/[date]:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
