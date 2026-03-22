import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { z } from 'zod'

function isAdmin(email: string): boolean {
  const adminEmails = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
  return adminEmails.includes(email.toLowerCase())
}

const PlanOverrideSchema = z.object({
  plan_key: z.enum(['free', 'starter', 'pro', 'zenmode']),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user?.email || !isAdmin(user.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id: targetUserId } = await params

  const body = await request.json()
  const parsed = PlanOverrideSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Plan inválido' }, { status: 400 })
  }

  const { plan_key } = parsed.data

  // Si se restablece a free, cancelar el override manual
  if (plan_key === 'free') {
    await supabaseAdmin
      .from('subscriptions')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('user_id', targetUserId)
      .eq('variant_id', 'manual_override')
    return NextResponse.json({ success: true, plan_key: 'free' })
  }

  // Calcular fin: 30 días desde hoy
  const periodEnd = new Date()
  periodEnd.setDate(periodEnd.getDate() + 30)

  // Buscar override manual existente para este usuario
  const { data: existing } = await supabaseAdmin
    .from('subscriptions')
    .select('id')
    .eq('user_id', targetUserId)
    .eq('variant_id', 'manual_override')
    .maybeSingle()

  if (existing) {
    const { error } = await supabaseAdmin
      .from('subscriptions')
      .update({
        plan_key,
        status: 'active',
        current_period_end: periodEnd.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  } else {
    const { error } = await supabaseAdmin
      .from('subscriptions')
      .insert({
        user_id: targetUserId,
        plan_key,
        billing_interval: 'monthly',
        status: 'active',
        variant_id: 'manual_override',
        processor_subscription_id: `manual_${Date.now()}`,
        processor_customer_id: `admin_override_by_${user.id}`,
        current_period_end: periodEnd.toISOString(),
      })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    plan_key,
    expires_at: periodEnd.toISOString(),
  })
}
