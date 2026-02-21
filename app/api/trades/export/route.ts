import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Trade } from '@/types/trade'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const accountId = searchParams.get('account_id')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const instrument = searchParams.get('instrument')
    const side = searchParams.get('side')
    const exitReason = searchParams.get('exit_reason')
    const followedPlan = searchParams.get('followed_plan')
    const emotion = searchParams.get('emotion')
    const winnersOnly = searchParams.get('winners_only') === 'true'
    const losersOnly = searchParams.get('losers_only') === 'true'

    // Query base
    let query = supabase
      .from('trades')
      .select(`
        *,
        instrument:instrument_specs(symbol, name)
      `)
      .eq('user_id', user.id)
      .order('trade_date', { ascending: false })
      .order('created_at', { ascending: false })

    // Aplicar filtros
    if (accountId) query = query.eq('account_id', accountId)
    if (startDate) query = query.gte('trade_date', startDate)
    if (endDate) query = query.lte('trade_date', endDate)
    if (instrument) query = query.eq('instrument_id', instrument)
    if (side) query = query.eq('side', side)
    if (exitReason) query = query.eq('exit_reason', exitReason)
    if (followedPlan) query = query.eq('followed_plan', followedPlan === 'true')
    if (emotion) query = query.contains('emotions', [emotion])
    if (winnersOnly) query = query.gt('result', 0)
    if (losersOnly) query = query.lt('result', 0)

    const { data: trades, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Generar CSV
    const headers = [
      'Fecha',
      'Instrumento',
      'Lado',
      'Contratos',
      'Resultado',
      'Razón Salida',
      'Siguió Plan',
      'Emociones',
      'Notas'
    ]

    const rows = trades.map((trade: any) => [
      trade.trade_date,
      trade.instrument?.symbol || '',
      trade.side === 'long' ? 'Largo' : 'Corto',
      trade.contracts,
      trade.result || 0,
      trade.exit_reason || '',
      trade.followed_plan ? 'Sí' : 'No',
      Array.isArray(trade.emotions) ? trade.emotions.join(', ') : '',
      (trade.notes || '').replace(/"/g, '""') // Escapar comillas
    ])

    // Construir CSV con BOM UTF-8 para correcta visualización de caracteres especiales
    const csvContent = '\uFEFF' + [
      headers.join(','),
      ...rows.map((row: any[]) => 
        row.map((cell: any) => 
          typeof cell === 'string' && (cell.includes(',') || cell.includes('"') || cell.includes('\n'))
            ? `"${cell}"` 
            : cell
        ).join(',')
      )
    ].join('\n')

    // Generar filename
    const accountName = accountId ? `cuenta-${accountId.slice(0, 8)}` : 'todas'
    const dateStr = new Date().toISOString().split('T')[0]
    const filename = `zentrade-trades-${accountName}-${dateStr}.csv`

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Error exporting trades:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
