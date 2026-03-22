import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserPlan } from '@/lib/lemonsqueezy/get-user-plan'

const MAX_TRADES_PER_IMPORT = 50

// Función para convertir diferentes formatos de fecha a YYYY-MM-DD
function parseDate(dateStr: string): string {
  // Si ya está en formato YYYY-MM-DD, retornarlo
  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(dateStr)) {
    const [year, month, day] = dateStr.split('-')
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }

  // Formato DD/MM/YYYY o D/M/YYYY
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
    const [day, month, year] = dateStr.split('/')
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }

  // Formato DD-MM-YYYY o D-M-YYYY
  if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(dateStr)) {
    const [day, month, year] = dateStr.split('-')
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }

  // Si no coincide con ningún formato, intentar parsear como fecha
  const date = new Date(dateStr)
  if (!isNaN(date.getTime())) {
    return date.toISOString().split('T')[0]
  }

  // Si todo falla, retornar el original
  return dateStr
}

export async function POST(request: NextRequest) {
  try {
    console.log('[Import API] Iniciando importación...')
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.log('[Import API] Error de autenticación')
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Plan gating: Import CSV requiere Professional o superior
    const plan = await getUserPlan(supabase, user.id)
    if (!plan.isPro && !plan.isZenMode) {
      return NextResponse.json(
        { error: 'La importación CSV requiere el plan Professional o superior.', code: 'UPGRADE_REQUIRED' },
        { status: 403 }
      )
    }

    const { account_id, trades } = await request.json()
    console.log(`[Import API] Recibidos ${trades?.length} trades para cuenta ${account_id}`)

    if (!account_id || !Array.isArray(trades)) {
      console.log('[Import API] Datos inválidos')
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
    }

    if (trades.length === 0) {
      return NextResponse.json({ error: 'No hay trades para importar' }, { status: 400 })
    }

    if (trades.length > MAX_TRADES_PER_IMPORT) {
      return NextResponse.json({ 
        error: `Máximo ${MAX_TRADES_PER_IMPORT} trades por importación` 
      }, { status: 400 })
    }

    // Verificar que la cuenta pertenece al usuario
    console.log('[Import API] Verificando cuenta...')
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('id')
      .eq('id', account_id)
      .eq('user_id', user.id)
      .single()

    if (accountError || !account) {
      console.log('[Import API] Cuenta no encontrada:', accountError)
      return NextResponse.json({ error: 'Cuenta no encontrada' }, { status: 404 })
    }

    // Obtener o crear instrumentos
    console.log('[Import API] Procesando instrumentos...')
    const symbols = [...new Set(trades.map((t: Record<string, unknown>) => t.instrument_symbol as string))]
    console.log('[Import API] Símbolos únicos:', symbols)
    
    const { data: existingInstruments } = await supabase
      .from('instrument_specs')
      .select('id, symbol, name, tick_size, tick_value, category')
      .in('symbol', symbols)

    console.log('[Import API] Instrumentos existentes:', existingInstruments?.length || 0)

    const existingSymbols = new Set(existingInstruments?.map(i => i.symbol) || [])
    const instrumentsMap = new Map(existingInstruments?.map(i => [i.symbol, i.id]) || [])

    // Crear instrumentos faltantes (con valores por defecto)
    const newInstruments = symbols
      .filter(symbol => !existingSymbols.has(symbol))
      .map(symbol => ({ 
        symbol, 
        name: symbol,
        tick_size: 0.25,
        tick_value: 0.50,
        category: 'custom'
      }))

    if (newInstruments.length > 0) {
      console.log('[Import API] Creando instrumentos nuevos:', newInstruments.length)
      const { data: createdInstruments, error: createError } = await supabase
        .from('instrument_specs')
        .insert(newInstruments)
        .select()

      if (createError) {
        console.log('[Import API] Error creando instrumentos:', createError)
        return NextResponse.json({ error: createError.message }, { status: 500 })
      }

      console.log('[Import API] Instrumentos creados:', createdInstruments?.length || 0)
      createdInstruments?.forEach(inst => {
        instrumentsMap.set(inst.symbol, inst.id)
      })
    }

    // Preparar trades para insertar
    console.log('[Import API] Preparando trades para insertar...')
    const tradesToInsert = trades.map((trade: Record<string, unknown>) => {
      // Convertir formato de fecha
      const tradeDate = parseDate(String(trade.trade_date ?? ''))
      
      // Procesar emociones: convertir string separado por comas a array
      let emotions = null
      if (trade.emotions && typeof trade.emotions === 'string') {
        emotions = trade.emotions.split(',').map((e: string) => e.trim()).filter(Boolean)
      } else if (Array.isArray(trade.emotions)) {
        emotions = trade.emotions
      }

      const contracts = typeof trade.contracts === 'number' ? trade.contracts : parseInt(trade.contracts)
      const result = typeof trade.result === 'number' ? trade.result : parseFloat(trade.result)
      
      // Validar que result y contracts sean números válidos
      if (isNaN(contracts) || isNaN(result)) {
        return null
      }
      
      return {
        user_id: user.id,
        account_id,
        instrument_id: instrumentsMap.get(trade.instrument_symbol),
        trade_date: tradeDate,
        side: trade.side,
        contracts,
        result,
        exit_reason: trade.exit_reason || null,
        followed_plan: trade.followed_plan === 'si' || trade.followed_plan === 'Si' || trade.followed_plan === 'Sí' || trade.followed_plan === true,
        emotions,
        notes: trade.notes || null,
      }
    }).filter(trade => trade !== null)

    if (tradesToInsert.length === 0) {
      console.log('[Import API] No hay trades válidos para importar')
      return NextResponse.json({ error: 'No hay trades válidos para importar. Verifica que los campos de resultado y contratos no estén vacíos.' }, { status: 400 })
    }

    // Insertar trades
    console.log('[Import API] Insertando', tradesToInsert.length, 'trades...')
    const { data: insertedTrades, error: insertError } = await supabase
      .from('trades')
      .insert(tradesToInsert)
      .select()

    if (insertError) {
      console.log('[Import API] Error insertando trades:', insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    console.log('[Import API] Trades insertados exitosamente:', insertedTrades.length)
    return NextResponse.json({
      success: true,
      imported: insertedTrades.length,
      trades: insertedTrades
    })
  } catch (error) {
    console.error('Error importing trades:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
