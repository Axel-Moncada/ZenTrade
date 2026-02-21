import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

    // Obtener parámetros de búsqueda opcionales
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');

    // Construir query
    let query = supabase
      .from('instrument_specs')
      .select('*')
      .order('symbol', { ascending: true });

    // Filtrar por categoría si se proporciona
    if (category) {
      query = query.eq('category', category);
    }

    const { data: instruments, error } = await query;

    if (error) {
      console.error('Error fetching instruments:', error);
      return NextResponse.json(
        { error: 'Error al obtener instrumentos' },
        { status: 500 }
      );
    }

    return NextResponse.json({ instruments });
  } catch (error) {
    console.error('Unexpected error in GET /api/instruments:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
