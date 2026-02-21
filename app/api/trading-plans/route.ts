import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - Obtener planes de trading
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const accountId = searchParams.get('account_id')

    let query = supabase
      .from('trading_plans')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (accountId) {
      query = query.eq('account_id', accountId)
    }

    const { data: plans, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(plans || [])
  } catch (error) {
    console.error('Error fetching trading plans:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// POST - Crear o actualizar plan de trading
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const planData = await request.json()

    // Verificar que la cuenta pertenece al usuario
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('id')
      .eq('id', planData.account_id)
      .eq('user_id', user.id)
      .single()

    if (accountError || !account) {
      return NextResponse.json({ error: 'Cuenta no encontrada' }, { status: 404 })
    }

    // Desactivar plan actual si existe
    await supabase
      .from('trading_plans')
      .update({ is_active: false })
      .eq('account_id', planData.account_id)
      .eq('user_id', user.id)

    // Crear nuevo plan
    const { data: newPlan, error: insertError } = await supabase
      .from('trading_plans')
      .insert({
        user_id: user.id,
        ...planData,
        is_active: true
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json(newPlan)
  } catch (error) {
    console.error('Error creating trading plan:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// PATCH - Actualizar plan existente
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id, ...planData } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'ID del plan requerido' }, { status: 400 })
    }

    // Actualizar plan
    const { data: updatedPlan, error: updateError } = await supabase
      .from('trading_plans')
      .update(planData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json(updatedPlan)
  } catch (error) {
    console.error('Error updating trading plan:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
