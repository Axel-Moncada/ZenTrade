import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const accountId = searchParams.get('account_id')
    const status = searchParams.get('status')

    // Query base
    let query = supabase
      .from('withdrawals')
      .select(`
        *,
        account:accounts(name, broker, currency)
      `)
      .eq('user_id', user.id)
      .order('withdrawal_date', { ascending: false })
      .order('created_at', { ascending: false })

    // Aplicar filtros
    if (accountId) query = query.eq('account_id', accountId)
    if (status) query = query.eq('status', status)

    const { data: withdrawals, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ withdrawals })
  } catch (error) {
    console.error('Error fetching withdrawals:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { account_id, amount, withdrawal_date, notes } = await request.json()

    // Validaciones
    if (!account_id || !amount || !withdrawal_date) {
      return NextResponse.json({ 
        error: 'Campos requeridos: account_id, amount, withdrawal_date' 
      }, { status: 400 })
    }

    if (amount <= 0) {
      return NextResponse.json({ error: 'El monto debe ser mayor a 0' }, { status: 400 })
    }

    // Obtener cuenta y verificar pertenencia al usuario
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('id, initial_balance, current_balance, manual_adjustments')
      .eq('id', account_id)
      .eq('user_id', user.id)
      .single()

    if (accountError || !account) {
      return NextResponse.json({ error: 'Cuenta no encontrada' }, { status: 404 })
    }

    // Validar regla del 30%
    const threshold = account.initial_balance * 1.30
    const maxWithdrawal = account.current_balance - threshold

    if (amount > maxWithdrawal) {
      return NextResponse.json({ 
        error: `El monto excede el máximo disponible ($${maxWithdrawal.toFixed(2)})` 
      }, { status: 400 })
    }

    // Crear retiro
    const { data: withdrawal, error: insertError } = await supabase
      .from('withdrawals')
      .insert({
        user_id: user.id,
        account_id,
        amount,
        withdrawal_date,
        status: 'completed', // Marcar como completado inmediatamente
        notes,
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    // Actualizar manual_adjustments de la cuenta (restar el retiro)
    const newManualAdjustments = (account.manual_adjustments || 0) - amount

    const { error: updateError } = await supabase
      .from('accounts')
      .update({ 
        manual_adjustments: newManualAdjustments,
        updated_at: new Date().toISOString()
      })
      .eq('id', account_id)

    if (updateError) {
      // Si falla la actualización, borrar el retiro creado
      await supabase.from('withdrawals').delete().eq('id', withdrawal.id)
      return NextResponse.json({ 
        error: 'Error al actualizar la cuenta' 
      }, { status: 500 })
    }

    // El trigger update_account_balance() actualizará current_balance automáticamente

    return NextResponse.json({ 
      success: true, 
      withdrawal,
      message: 'Retiro procesado exitosamente'
    })
  } catch (error) {
    console.error('Error creating withdrawal:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
