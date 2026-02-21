import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { updateTradeSchema } from '@/lib/validations/trade.schema';
import { ZodError } from 'zod';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const supabase = await createClient();

    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const params = await context.params;
    const tradeId = params.id;

    // Obtener el trade con JOIN al instrumento
    const { data: trade, error } = await supabase
      .from('trades')
      .select(`
        *,
        instrument:instrument_specs(symbol, name, tick_size, tick_value)
      `)
      .eq('id', tradeId)
      .eq('user_id', user.id)
      .single();

    if (error || !trade) {
      return NextResponse.json(
        { error: 'Trade no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ trade });
  } catch (error) {
    console.error('Unexpected error in GET /api/trades/[id]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const supabase = await createClient();

    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const params = await context.params;
    const tradeId = params.id;

    // Parsear y validar el body
    const body = await request.json();
    const validatedData = updateTradeSchema.parse(body);

    // Actualizar el trade (el trigger recalculará PNL si cambió algo relevante)
    const { data: trade, error: updateError } = await supabase
      .from('trades')
      .update(validatedData)
      .eq('id', tradeId)
      .eq('user_id', user.id)
      .select(`
        *,
        instrument:instrument_specs(symbol, name, tick_size, tick_value)
      `)
      .single();

    if (updateError || !trade) {
      console.error('Error updating trade:', updateError);
      return NextResponse.json(
        { error: 'Trade no encontrado o error al actualizar' },
        { status: 404 }
      );
    }

    return NextResponse.json({ trade });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Unexpected error in PATCH /api/trades/[id]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const supabase = await createClient();

    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const params = await context.params;
    const tradeId = params.id;

    // Eliminar el trade
    const { error: deleteError } = await supabase
      .from('trades')
      .delete()
      .eq('id', tradeId)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Error deleting trade:', deleteError);
      return NextResponse.json(
        { error: 'Error al eliminar trade' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Trade eliminado correctamente' });
  } catch (error) {
    console.error('Unexpected error in DELETE /api/trades/[id]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
