import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { calculateDashboardStats } from '@/lib/utils/dashboard-calculations';

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

    // Obtener parámetros
    const searchParams = request.nextUrl.searchParams;
    const accountId = searchParams.get('account_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    if (!accountId) {
      return NextResponse.json(
        { error: 'account_id es requerido' },
        { status: 400 }
      );
    }

    // Verificar que la cuenta pertenece al usuario
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('id, name')
      .eq('id', accountId)
      .eq('user_id', user.id)
      .single();

    if (accountError || !account) {
      return NextResponse.json(
        { error: 'Cuenta no encontrada o no autorizada' },
        { status: 404 }
      );
    }

    // Construir query de trades
    let query = supabase
      .from('trades')
      .select(`
        *,
        instrument:instrument_specs(symbol, name, tick_size, tick_value)
      `)
      .eq('user_id', user.id)
      .eq('account_id', accountId)
      .order('trade_date', { ascending: true });

    // Aplicar filtros de fecha si existen
    if (startDate) {
      query = query.gte('trade_date', startDate);
    }
    if (endDate) {
      query = query.lte('trade_date', endDate);
    }

    const { data: trades, error: tradesError } = await query;

    if (tradesError) {
      console.error('Error fetching trades for dashboard:', tradesError);
      return NextResponse.json(
        { error: 'Error al obtener trades' },
        { status: 500 }
      );
    }

    // Calcular estadísticas
    const stats = calculateDashboardStats(trades || []);

    return NextResponse.json({ 
      stats,
      account: {
        id: account.id,
        name: account.name
      },
      period: {
        startDate: startDate || null,
        endDate: endDate || null
      }
    });

  } catch (error) {
    console.error('Unexpected error in GET /api/dashboard/stats:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
