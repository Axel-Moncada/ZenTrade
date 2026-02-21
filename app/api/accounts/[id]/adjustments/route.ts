import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const accountId = params.id
    const { adjustment } = await request.json()

    if (typeof adjustment !== 'number') {
      return NextResponse.json({ error: 'Ajuste inválido' }, { status: 400 })
    }

    // Verificar que la cuenta pertenece al usuario
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('id, manual_adjustments')
      .eq('id', accountId)
      .eq('user_id', user.id)
      .single()

    if (accountError || !account) {
      return NextResponse.json({ error: 'Cuenta no encontrada' }, { status: 404 })
    }

    // Actualizar ajuste manual (el trigger recalculará current_balance automáticamente)
    const newAdjustment = (account.manual_adjustments || 0) + adjustment

    const { data: updatedAccount, error: updateError } = await supabase
      .from('accounts')
      .update({ manual_adjustments: newAdjustment })
      .eq('id', accountId)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json(updatedAccount)
  } catch (error) {
    console.error('Error updating manual adjustment:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
