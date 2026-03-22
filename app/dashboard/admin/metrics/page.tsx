import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { ExternalLink } from 'lucide-react'

function isAdmin(email: string): boolean {
  const adminEmails = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
  return adminEmails.includes(email.toLowerCase())
}

function fmt(n: number) {
  return n.toLocaleString('es-CO')
}

function daysAgo(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

export default async function MetricsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')
  if (!user.email || !isAdmin(user.email)) redirect('/dashboard')

  // ── Queries en paralelo ───────────────────────────────────────────────────
  const [
    { data: { users: allUsers } },
    { count: totalTrades },
    { count: totalAccounts },
    { count: newsletterSubs },
    { data: subscriptions },
    { count: recentSignups },
    { count: tradesThisWeek },
  ] = await Promise.all([
    supabaseAdmin.auth.admin.listUsers({ perPage: 1000 }),
    supabaseAdmin.from('trades').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('accounts').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('newsletter_subscribers').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('subscriptions').select('plan_key, status').in('status', ['active', 'on_trial']),
    supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', daysAgo(7)),
    supabaseAdmin.from('trades').select('*', { count: 'exact', head: true }).gte('created_at', daysAgo(7)),
  ])

  const totalUsers = allUsers?.length ?? 0
  const activeLastMonth = allUsers?.filter(u =>
    u.last_sign_in_at && new Date(u.last_sign_in_at) > new Date(daysAgo(30))
  ).length ?? 0

  // Distribución de planes
  const planDist: Record<string, number> = { free: 0, starter: 0, pro: 0, zenmode: 0 }
  const activeSubs = new Set<string>()
  for (const sub of subscriptions ?? []) {
    activeSubs.add(sub.plan_key)
  }
  // Count unique users per plan (take highest)
  const subsByPlan = { free: 0, starter: 0, pro: 0, zenmode: 0 }
  for (const sub of subscriptions ?? []) {
    subsByPlan[sub.plan_key as keyof typeof subsByPlan] = (subsByPlan[sub.plan_key as keyof typeof subsByPlan] ?? 0) + 1
  }
  planDist.starter = subsByPlan.starter
  planDist.pro = subsByPlan.pro
  planDist.zenmode = subsByPlan.zenmode
  planDist.free = totalUsers - planDist.starter - planDist.pro - planDist.zenmode

  const PLAN_COLORS: Record<string, string> = {
    free: 'text-zen-text-muted bg-zen-surface/60',
    starter: 'text-blue-400 bg-blue-400/10',
    pro: 'text-purple-400 bg-purple-400/10',
    zenmode: 'text-zen-caribbean-green bg-zen-caribbean-green/10',
  }

  const EXTERNAL_SERVICES = [
    { name: 'Supabase', desc: 'DB, Auth, Storage — uso y límites', href: 'https://supabase.com/dashboard', color: 'text-emerald-400' },
    { name: 'Vercel', desc: 'Deployments, Analytics, Cron logs', href: 'https://vercel.com/dashboard', color: 'text-white' },
    { name: 'Resend', desc: 'Emails enviados, bounces, spam rate', href: 'https://resend.com/emails', color: 'text-blue-400' },
    { name: 'Google AI Studio', desc: 'Uso de Gemini 2.5 Flash — reportes y radar', href: 'https://aistudio.google.com', color: 'text-yellow-400' },
    { name: 'Wompi', desc: 'Transacciones, pagos, webhooks', href: 'https://comercios.wompi.co', color: 'text-orange-400' },
  ]

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-zen-anti-flash">Métricas del Servicio</h1>
        <p className="text-sm text-zen-text-muted mt-1">
          Datos en tiempo real desde la base de datos. Actualiza la página para refrescar.
        </p>
      </div>

      {/* ── KPIs principales ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Usuarios totales', value: fmt(totalUsers), sub: `${activeLastMonth} activos último mes` },
          { label: 'Nuevos esta semana', value: fmt(recentSignups ?? 0), sub: 'Registros últimos 7 días' },
          { label: 'Trades totales', value: fmt(totalTrades ?? 0), sub: `${fmt(tradesThisWeek ?? 0)} esta semana` },
          { label: 'Cuentas', value: fmt(totalAccounts ?? 0), sub: `${fmt(newsletterSubs ?? 0)} suscriptores newsletter` },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-zen-surface/60 border border-zen-forest/30 rounded-xl p-5">
            <p className="text-xs text-zen-text-muted uppercase tracking-wider">{kpi.label}</p>
            <p className="text-3xl font-bold text-zen-anti-flash mt-2">{kpi.value}</p>
            <p className="text-xs text-zen-text-muted mt-1">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Distribución de planes ────────────────────────────────────────── */}
      <div>
        <h2 className="text-lg font-semibold text-zen-anti-flash mb-4">Distribución de Planes</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(planDist).map(([plan, count]) => (
            <div key={plan} className="bg-zen-surface/60 border border-zen-forest/30 rounded-xl p-5">
              <span className={`text-xs font-semibold uppercase px-2 py-0.5 rounded ${PLAN_COLORS[plan]}`}>
                {plan}
              </span>
              <p className="text-4xl font-bold text-zen-anti-flash mt-3">{count}</p>
              <p className="text-xs text-zen-text-muted mt-1">
                {totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0}% del total
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Servicios externos ────────────────────────────────────────────── */}
      <div>
        <h2 className="text-lg font-semibold text-zen-anti-flash mb-1">Servicios Externos</h2>
        <p className="text-xs text-zen-text-muted mb-4">
          El consumo detallado de estos servicios se monitorea desde sus dashboards.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {EXTERNAL_SERVICES.map((svc) => (
            <a
              key={svc.name}
              href={svc.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-zen-surface/40 border border-zen-forest/20 hover:border-zen-forest/50 rounded-xl p-5 transition-colors flex items-start justify-between gap-3"
            >
              <div>
                <p className={`font-semibold ${svc.color}`}>{svc.name}</p>
                <p className="text-xs text-zen-text-muted mt-1">{svc.desc}</p>
              </div>
              <ExternalLink className="h-4 w-4 text-zen-text-muted group-hover:text-zen-anti-flash transition-colors flex-shrink-0 mt-0.5" />
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
