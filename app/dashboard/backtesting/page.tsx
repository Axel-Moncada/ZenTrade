'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { usePlan } from '@/lib/hooks/usePlan'
import { UpgradePrompt } from '@/components/shared/upgrade-prompt'
import { BacktestingGallery } from '@/components/backtesting/backtesting-gallery'
import { Trade } from '@/types/trade'
import { Account } from '@/types/accounts'
import { FlipHorizontal2, Loader2 } from 'lucide-react'

export default function BacktestingPage() {
  const plan = usePlan()
  const supabase = createClient()

  const [trades, setTrades] = useState<Trade[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [{ data: accountsData }, tradesRes] = await Promise.all([
        supabase.from('accounts').select('*').order('name'),
        fetch('/api/trades'),
      ])

      if (accountsData) setAccounts(accountsData)

      if (tradesRes.ok) {
        const { trades: allTrades } = (await tradesRes.json()) as { trades: Trade[] }
        setTrades(allTrades ?? [])
      }
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    if (!plan.loading && (plan.isPro || plan.isZenMode)) {
      fetchData()
    }
  }, [plan.loading, plan.isPro, plan.isZenMode, fetchData])

  // Loading del plan
  if (plan.loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-6 w-6 animate-spin text-zen-caribbean-green" />
      </div>
    )
  }

  // Upgrade wall para Free y Starter
  if (!plan.isPro && !plan.isZenMode) {
    return (
      <div className="max-w-lg mx-auto mt-20">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-zen-caribbean-green/10 border border-zen-caribbean-green/20 flex items-center justify-center mx-auto mb-4">
            <FlipHorizontal2 className="h-8 w-8 text-zen-caribbean-green" />
          </div>
          <h1 className="text-2xl font-bold text-zen-anti-flash mb-2">Zona de Backtesting</h1>
          <p className="text-zen-anti-flash/50 text-sm leading-relaxed">
            Revisa cada trade con su captura de pantalla, navega tu historial completo
            y encuentra patrones que mejoren tu operativa.
          </p>
        </div>
        <UpgradePrompt
          requiredPlan="pro"
          variant="card"
          message="Desbloquea la Zona de Backtesting"
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-zen-caribbean-green/15 rounded-xl">
              <FlipHorizontal2 className="h-5 w-5 text-zen-caribbean-green" />
            </div>
            <h1 className="text-2xl font-bold text-zen-anti-flash">Zona de Backtesting</h1>
          </div>
          <p className="text-zen-anti-flash/50 text-sm ml-12">
            Revisa tu historial de trades como una galería y encuentra tus patrones
          </p>
        </div>
      </div>

      {/* Gallery */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-6 w-6 animate-spin text-zen-caribbean-green" />
        </div>
      ) : (
        <BacktestingGallery trades={trades} accounts={accounts} />
      )}
    </div>
  )
}
