'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, ChevronDown, ChevronUp, Check, X } from 'lucide-react'

type PlanKey = 'free' | 'starter' | 'pro' | 'zenmode'

interface AdminUser {
  id: string
  email: string
  full_name: string
  plan_key: PlanKey
  plan_status: string | null
  current_period_end: string | null
  is_manual_override: boolean
  trade_count: number
  created_at: string
  last_sign_in_at: string | null
}

const PLAN_BADGE: Record<PlanKey, string> = {
  free:    'bg-zinc-700/60 text-zinc-300',
  starter: 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
  pro:     'bg-purple-500/15 text-purple-400 border border-purple-500/20',
  zenmode: 'bg-zen-caribbean-green/15 text-zen-caribbean-green border border-zen-caribbean-green/20',
}

const PLAN_OPTIONS: { value: PlanKey; label: string }[] = [
  { value: 'free',    label: 'Free' },
  { value: 'starter', label: 'Starter' },
  { value: 'pro',     label: 'Professional' },
  { value: 'zenmode', label: 'ZenMode' },
]

function relativeDate(iso: string | null): string {
  if (!iso) return '—'
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Hoy'
  if (days === 1) return 'Ayer'
  if (days < 30) return `Hace ${days}d`
  if (days < 365) return `Hace ${Math.floor(days / 30)}m`
  return `Hace ${Math.floor(days / 365)}a`
}

export function UsersAdminPanel() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [planFilter, setPlanFilter] = useState<PlanKey | 'all'>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>('pro')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/users')
    if (res.ok) {
      const data = await res.json() as { users: AdminUser[] }
      setUsers(data.users)
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  const handlePlanChange = async (userId: string) => {
    setSaving(true)
    const res = await fetch(`/api/admin/users/${userId}/plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan_key: selectedPlan }),
    })
    setSaving(false)

    if (res.ok) {
      showToast(`Plan actualizado a ${selectedPlan} por 30 días`, true)
      setExpandedId(null)
      await fetchUsers()
    } else {
      const err = await res.json() as { error: string }
      showToast(err.error ?? 'Error al cambiar plan', false)
    }
  }

  const filtered = users.filter((u) => {
    const matchSearch = search === '' ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.full_name.toLowerCase().includes(search.toLowerCase())
    const matchPlan = planFilter === 'all' || u.plan_key === planFilter
    return matchSearch && matchPlan
  })

  return (
    <div className="space-y-5">
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-lg flex items-center gap-2 ${
          toast.ok ? 'bg-zen-caribbean-green text-zen-rich-black' : 'bg-red-500/90 text-white'
        }`}>
          {toast.ok ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
          {toast.msg}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zen-text-muted" />
          <Input
            placeholder="Buscar por email o nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-zen-rich-black border-zen-border-soft text-zen-anti-flash placeholder:text-zen-text-muted"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'free', 'starter', 'pro', 'zenmode'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPlanFilter(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                planFilter === p
                  ? 'bg-zen-caribbean-green text-zen-rich-black'
                  : 'bg-zen-surface/60 text-zen-text-muted hover:text-zen-anti-flash border border-zen-border-soft'
              }`}
            >
              {p === 'all' ? 'Todos' : p}
            </button>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <p className="text-xs text-zen-text-muted">
        Mostrando <span className="text-zen-anti-flash font-medium">{filtered.length}</span> de {users.length} usuarios
      </p>

      {/* Table */}
      <div className="border border-zen-forest/30 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[1fr_160px_80px_130px_130px] gap-4 px-5 py-3 bg-zen-surface/80 border-b border-zen-forest/30 text-xs font-semibold uppercase tracking-wider text-zen-text-muted">
          <span>Usuario</span>
          <span>Plan</span>
          <span className="text-right">Trades</span>
          <span className="text-right">Último acceso</span>
          <span className="text-right">Acción</span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-zen-text-muted text-sm">Cargando usuarios...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-zen-text-muted text-sm">Sin resultados</div>
        ) : (
          filtered.map((u) => {
            const isExpanded = expandedId === u.id
            return (
              <div key={u.id} className="border-b border-zen-forest/20 last:border-0">
                {/* Row */}
                <div className="grid grid-cols-[1fr_160px_80px_130px_130px] gap-4 px-5 py-4 items-center hover:bg-zen-surface/30 transition-colors">
                  {/* Email + name */}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zen-anti-flash truncate">{u.email}</p>
                    {u.full_name && (
                      <p className="text-xs text-zen-text-muted truncate">{u.full_name}</p>
                    )}
                  </div>

                  {/* Plan badge */}
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${PLAN_BADGE[u.plan_key]}`}>
                      {u.plan_key}
                    </span>
                    {u.is_manual_override && (
                      <span className="text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 px-1.5 py-0.5 rounded">
                        manual
                      </span>
                    )}
                  </div>

                  {/* Trades */}
                  <span className="text-sm text-zen-anti-flash text-right font-mono">{u.trade_count}</span>

                  {/* Last sign in */}
                  <span className="text-xs text-zen-text-muted text-right">{relativeDate(u.last_sign_in_at)}</span>

                  {/* Acción */}
                  <button
                    onClick={() => {
                      setExpandedId(isExpanded ? null : u.id)
                      setSelectedPlan(u.plan_key === 'free' ? 'pro' : u.plan_key)
                    }}
                    className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 justify-end transition-colors"
                  >
                    Cambiar plan
                    {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </button>
                </div>

                {/* Expanded plan change */}
                {isExpanded && (
                  <div className="px-5 pb-4 bg-amber-400/5 border-t border-amber-400/10">
                    <p className="text-xs text-amber-400/70 mb-3 pt-3">
                      Asignar plan manualmente por <strong>30 días</strong>. Al vencer, recupera su plan original.
                    </p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex gap-2">
                        {PLAN_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => setSelectedPlan(opt.value)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                              selectedPlan === opt.value
                                ? 'bg-amber-400 text-zen-rich-black'
                                : 'bg-zen-surface text-zen-text-muted hover:text-zen-anti-flash border border-zen-border-soft'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                      <Button
                        onClick={() => handlePlanChange(u.id)}
                        disabled={saving || selectedPlan === u.plan_key}
                        size="sm"
                        className="bg-amber-400 hover:bg-amber-300 text-zen-rich-black text-xs h-8 disabled:opacity-40"
                      >
                        {saving ? 'Guardando...' : `Aplicar ${selectedPlan}`}
                      </Button>
                      <button
                        onClick={() => setExpandedId(null)}
                        className="text-xs text-zen-text-muted hover:text-zen-anti-flash"
                      >
                        Cancelar
                      </button>
                    </div>
                    {u.current_period_end && (
                      <p className="text-xs text-zen-text-muted mt-2">
                        Plan actual vence: {new Date(u.current_period_end).toLocaleDateString('es-CO')}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
