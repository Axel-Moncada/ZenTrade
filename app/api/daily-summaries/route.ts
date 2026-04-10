import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { updateDailySummarySchema } from "@/lib/validations/daily-summary.schema";

// GET /api/daily-summaries - Listar summaries filtrados
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

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

    // Obtener filtros de query params
    const searchParams = request.nextUrl.searchParams;
    const accountId = searchParams.get("account_id");
    const month = searchParams.get("month"); // 1-12
    const year = searchParams.get("year");

    if (!accountId) {
      return NextResponse.json(
        { error: "account_id es requerido" },
        { status: 400 }
      );
    }

    // Query base
    let query = supabase
      .from("daily_summaries")
      .select("*")
      .eq("user_id", user.id)
      .eq("account_id", accountId)
      .order("summary_date", { ascending: true });

    // Filtrar por mes/año si se proporcionan
    if (month && year) {
      const monthNum = parseInt(month);
      const yearNum = parseInt(year);
      
      // Calcular primer y último día del mes
      const firstDay = `${yearNum}-${String(monthNum).padStart(2, "0")}-01`;
      const lastDay = new Date(yearNum, monthNum, 0).getDate();
      const lastDayStr = `${yearNum}-${String(monthNum).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
      
      query = query.gte("summary_date", firstDay).lte("summary_date", lastDayStr);
    }

    const { data: summaries, error } = await query;

    if (error) {
      console.error("Error fetching summaries:", error);
      return NextResponse.json(
        { error: "Error al obtener los resúmenes diarios" },
        { status: 500 }
      );
    }

    return NextResponse.json({ summaries: summaries || [] }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error in GET /api/daily-summaries:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// PATCH /api/daily-summaries - Actualizar/crear summary (principalmente para notas)
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();

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

    // Parsear body
    const body = await request.json();
    const { account_id, summary_date, notes, micro_photo_path, macro_photo_path } = body;

    if (!account_id || !summary_date) {
      return NextResponse.json(
        { error: "account_id y summary_date son requeridos" },
        { status: 400 }
      );
    }

    // Validar con Zod
    const validation = updateDailySummarySchema.safeParse({ notes, micro_photo_path, macro_photo_path });

    if (!validation.success) {
      const errors = validation.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      return NextResponse.json(
        { error: "Datos inválidos", details: errors },
        { status: 400 }
      );
    }

    // Verificar que la cuenta pertenece al usuario
    const { data: account, error: accountError } = await supabase
      .from("accounts")
      .select("id")
      .eq("id", account_id)
      .eq("user_id", user.id)
      .single();

    if (accountError || !account) {
      return NextResponse.json(
        { error: "Cuenta no encontrada" },
        { status: 404 }
      );
    }

    // Construir datos del upsert (solo incluir campos presentes en el body)
    type UpsertData = {
      user_id: string;
      account_id: string;
      summary_date: string;
      notes?: string | null;
      micro_photo_path?: string | null;
      macro_photo_path?: string | null;
    };

    const upsertData: UpsertData = { user_id: user.id, account_id, summary_date };
    if (notes !== undefined) upsertData.notes = validation.data.notes;
    if (micro_photo_path !== undefined) upsertData.micro_photo_path = validation.data.micro_photo_path;
    if (macro_photo_path !== undefined) upsertData.macro_photo_path = validation.data.macro_photo_path;

    // Upsert: insertar o actualizar el summary
    const { data: summary, error } = await supabase
      .from("daily_summaries")
      .upsert(upsertData, { onConflict: "user_id,account_id,summary_date" })
      .select()
      .single();

    if (error) {
      console.error("Error updating summary:", error);
      return NextResponse.json(
        { error: "Error al actualizar el resumen" },
        { status: 500 }
      );
    }

    return NextResponse.json({ summary }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error in PATCH /api/daily-summaries:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
