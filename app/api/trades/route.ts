import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createTradeSchema } from '@/lib/validations/trade.schema';
import { ZodError } from 'zod';

export async function GET(request: NextRequest) {
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

    // Obtener parámetros de búsqueda
    const searchParams = request.nextUrl.searchParams;
    const accountId = searchParams.get('account_id');
    const tradeDate = searchParams.get('trade_date');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    // Construir query base con JOIN al instrumento
    let query = supabase
      .from('trades')
      .select(`
        *,
        instrument:instrument_specs(symbol, name, tick_size, tick_value)
      `)
      .eq('user_id', user.id)
      .order('trade_date', { ascending: false })
      .order('created_at', { ascending: false });

    // Filtros opcionales
    if (accountId) {
      query = query.eq('account_id', accountId);
    }

    if (tradeDate) {
      query = query.eq('trade_date', tradeDate);
    } else if (startDate && endDate) {
      query = query.gte('trade_date', startDate).lte('trade_date', endDate);
    }

    const { data: trades, error } = await query;

    if (error) {
      console.error('Error fetching trades:', error);
      return NextResponse.json(
        { error: 'Error al obtener trades' },
        { status: 500 }
      );
    }

    return NextResponse.json({ trades });
  } catch (error) {
    console.error('Unexpected error in GET /api/trades:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    // Parsear y validar el body
    const body = await request.json();
    const validatedData = createTradeSchema.parse(body);

    // Verificar que la cuenta pertenece al usuario
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('id')
      .eq('id', validatedData.account_id)
      .eq('user_id', user.id)
      .single();

    if (accountError || !account) {
      return NextResponse.json(
        { error: 'Cuenta no encontrada o no autorizada' },
        { status: 404 }
      );
    }

    // Crear el trade (el trigger calculate_trade_pnl calculará gross_pnl y net_pnl)
    const { data: trade, error: insertError } = await supabase
      .from('trades')
      .insert({
        user_id: user.id,
        ...validatedData,
      })
      .select(`
        *,
        instrument:instrument_specs(symbol, name, tick_size, tick_value)
      `)
      .single();

    if (insertError) {
      console.error('Error creating trade:', insertError);
      return NextResponse.json(
        { error: 'Error al crear trade' },
        { status: 500 }
      );
    }

    return NextResponse.json({ trade }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Unexpected error in POST /api/trades:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
