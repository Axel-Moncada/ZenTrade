import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { updateAccountSchema } from "@/lib/validations/account.schema";
import type { Database } from "@/types/database.types";

type AccountUpdate = Database["public"]["Tables"]["accounts"]["Update"];

// GET /api/accounts/[id] - Obtener cuenta específica
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await context.params;

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

    // Obtener cuenta (RLS automáticamente filtra por user_id)
    const { data: account, error } = await supabase
      .from("accounts")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !account) {
      return NextResponse.json(
        { error: "Cuenta no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ account }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error in GET /api/accounts/[id]:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// PATCH /api/accounts/[id] - Actualizar cuenta
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await context.params;

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

    // Verificar que la cuenta existe y pertenece al usuario
    const { data: existingAccount, error: fetchError } = await supabase
      .from("accounts")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existingAccount) {
      return NextResponse.json(
        { error: "Cuenta no encontrada" },
        { status: 404 }
      );
    }

    // Parsear body
    const body = await request.json();

    // Validar con Zod
    const validation = updateAccountSchema.safeParse(body);

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

    // Preparar datos para actualizar (solo campos que se enviaron)
    const updateData: AccountUpdate = {};

    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.account_type !== undefined)
      updateData.account_type = validatedData.account_type;
    if (validatedData.broker !== undefined)
      updateData.broker = validatedData.broker;
    if (validatedData.platform !== undefined)
      updateData.platform = validatedData.platform;
    if (validatedData.initial_balance !== undefined)
      updateData.initial_balance = validatedData.initial_balance;
    if (validatedData.starting_balance !== undefined)
      updateData.starting_balance = validatedData.starting_balance;
    if (validatedData.drawdown_type !== undefined)
      updateData.drawdown_type = validatedData.drawdown_type;
    if (validatedData.max_drawdown !== undefined)
      updateData.max_drawdown = validatedData.max_drawdown;
    if (validatedData.profit_target !== undefined)
      updateData.profit_target = validatedData.profit_target;
    if (validatedData.buffer_amount !== undefined)
      updateData.buffer_amount = validatedData.buffer_amount;
    if (validatedData.start_date !== undefined)
      updateData.start_date = validatedData.start_date;
    if (validatedData.status !== undefined)
      updateData.status = validatedData.status;
    if (validatedData.notes !== undefined)
      updateData.notes = validatedData.notes;
    if (validatedData.consistency_percent !== undefined)
      updateData.consistency_percent = validatedData.consistency_percent;

    // Actualizar en DB
    const { data: account, error } = await supabase
      .from("accounts")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating account:", error);

      // Error de unique constraint (nombre duplicado)
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Ya existe una cuenta con ese nombre" },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: "Error al actualizar la cuenta" },
        { status: 500 }
      );
    }

    return NextResponse.json({ account }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error in PATCH /api/accounts/[id]:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// DELETE /api/accounts/[id] - Eliminar cuenta
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await context.params;

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

    // Eliminar cuenta y sus relaciones en el orden correcto
    // 1. Primero eliminar trades (evita conflictos con triggers de balance)
    const { error: tradesError } = await supabase
      .from("trades")
      .delete()
      .eq("account_id", id)
      .eq("user_id", user.id);

    if (tradesError) {
      console.error("Error deleting trades:", tradesError);
      return NextResponse.json(
        { error: "Error al eliminar los trades de la cuenta" },
        { status: 500 }
      );
    }

    // 2. Eliminar daily_summaries
    const { error: summariesError } = await supabase
      .from("daily_summaries")
      .delete()
      .eq("account_id", id)
      .eq("user_id", user.id);

    if (summariesError) {
      console.error("Error deleting daily_summaries:", summariesError);
      return NextResponse.json(
        { error: "Error al eliminar los resúmenes diarios" },
        { status: 500 }
      );
    }

    // 3. Finalmente eliminar la cuenta (RLS verifica user_id)
    const { error } = await supabase
      .from("accounts")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting account:", error);
      return NextResponse.json(
        { error: "Error al eliminar la cuenta" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Cuenta eliminada correctamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Unexpected error in DELETE /api/accounts/[id]:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
