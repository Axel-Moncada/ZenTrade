import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

function isAdmin(email: string): boolean {
  const adminEmails = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
  return adminEmails.includes(email.toLowerCase())
}

type PlanKey = 'free' | 'starter' | 'pro' | 'zenmode'
const PLAN_PRIORITY: Record<PlanKey, number> = { zenmode: 3, pro: 2, starter: 1, free: 0 }

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user?.email || !isAdmin(user.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Todos los usuarios de auth
  const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })
  if (usersError) return NextResponse.json({ error: usersError.message }, { status: 500 })

  // Suscripciones activas
  const { data: subscriptions } = await supabaseAdmin
    .from('subscriptions')
    .select('user_id, plan_key, status, current_period_end, variant_id')
    .in('status', ['active', 'on_trial'])

  // Conteo de trades por usuario
  const { data: trades } = await supabaseAdmin
    .from('trades')
    .select('user_id')

  // Perfiles
  const { data: profiles } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name')

  // Mapa suscripción de mayor jerarquía por usuario
  const subsByUser = new Map<string, { plan_key: string; status: string; current_period_end: string | null; variant_id: string | null }>()
  for (const sub of subscriptions ?? []) {
    const existing = subsByUser.get(sub.user_id)
    const subPriority = PLAN_PRIORITY[sub.plan_key as PlanKey] ?? 0
    const existingPriority = existing ? (PLAN_PRIORITY[existing.plan_key as PlanKey] ?? 0) : -1
    if (!existing || subPriority > existingPriority) {
      subsByUser.set(sub.user_id, sub)
    }
  }

  // Mapa trades por usuario
  const tradeCountByUser = new Map<string, number>()
  for (const t of trades ?? []) {
    tradeCountByUser.set(t.user_id, (tradeCountByUser.get(t.user_id) ?? 0) + 1)
  }

  // Mapa perfiles
  const profileByUser = new Map<string, string>()
  for (const p of profiles ?? []) {
    profileByUser.set(p.id, p.full_name ?? '')
  }

  const result = users
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .map((u) => ({
      id: u.id,
      email: u.email ?? '',
      full_name: profileByUser.get(u.id) ?? '',
      plan_key: subsByUser.get(u.id)?.plan_key ?? 'free',
      plan_status: subsByUser.get(u.id)?.status ?? null,
      current_period_end: subsByUser.get(u.id)?.current_period_end ?? null,
      is_manual_override: subsByUser.get(u.id)?.variant_id === 'manual_override',
      trade_count: tradeCountByUser.get(u.id) ?? 0,
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at ?? null,
    }))

  return NextResponse.json({ users: result })
}
