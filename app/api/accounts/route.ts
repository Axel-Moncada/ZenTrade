import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAccountSchema } from "@/lib/validations/account.schema";
import type { Database } from "@/types/database.types";

type AccountInsert = Database["public"]["Tables"]["accounts"]["Insert"];

// GET /api/accounts - Listar todas las cuentas del usuario
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
    const status = searchParams.get("status");

    // Query base
    let query = supabase
      .from("accounts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    // Aplicar filtro de estado si existe
    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const { data: accounts, error } = await query;

    if (error) {
      console.error("Error fetching accounts:", error);
      return NextResponse.json(
        { error: "Error al obtener las cuentas" },
        { status: 500 }
      );
    }

    return NextResponse.json({ accounts }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error in GET /api/accounts:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST /api/accounts - Crear nueva cuenta
export async function POST(request: NextRequest) {
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

    // Validar con Zod
    const validation = createAccountSchema.safeParse(body);

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

    const validatedData = validation.data;

    // Preparar datos para insertar
    const accountData: AccountInsert = {
      user_id: user.id,
      name: validatedData.name,
      account_type: validatedData.account_type,
      broker: validatedData.broker || null,
      platform: validatedData.platform || null,
      initial_balance: validatedData.initial_balance,
      starting_balance: validatedData.starting_balance,
      current_balance: validatedData.starting_balance, // Balance al iniciar = current balance al crear
      drawdown_type: validatedData.drawdown_type,
      max_drawdown: validatedData.max_drawdown,
      profit_target: validatedData.profit_target || null,
      buffer_amount: validatedData.buffer_amount || null,
      start_date: validatedData.start_date,
      status: validatedData.status,
      notes: validatedData.notes || null,
    };

    // Insertar en DB
    const { data: account, error } = await supabase
      .from("accounts")
      .insert(accountData)
      .select()
      .single();

    if (error) {
      console.error("Error creating account:", error);

      // Error de unique constraint (nombre duplicado)
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Ya existe una cuenta con ese nombre" },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: "Error al crear la cuenta" },
        { status: 500 }
      );
    }

    return NextResponse.json({ account }, { status: 201 });
  } catch (error) {
    console.error("Unexpected error in POST /api/accounts:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
