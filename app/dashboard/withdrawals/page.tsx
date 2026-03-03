'use client'

import { useCallback, useEffect, useState } from 'react'
import { Account } from '@/types/accounts'
import { Withdrawal } from '@/types/withdrawal'
import { WithdrawalAccountCard, type ConsistencyData } from '@/components/withdrawals/withdrawal-account-card'
import { AddWithdrawalDialog } from '@/components/withdrawals/add-withdrawal-dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  ArrowDownToLine,
  AlertCircle,
  CheckCircle2,
  Clock,
  DollarSign,
  TrendingDown
} from 'lucide-react'
import { useI18n } from '@/lib/i18n/context'

export default function WithdrawalsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [consistencyMap, setConsistencyMap] = useState<Record<string, ConsistencyData>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const { t } = useI18n()

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const accountsResponse = await fetch('/api/accounts')
      const accountsData = await accountsResponse.json()

      if (!accountsResponse.ok) {
        throw new Error(accountsData.error || t.common.error)
      }

      const liveAccounts = (accountsData.accounts || []).filter(
        (acc: Account) => acc.account_type === 'live'
      )
      setAccounts(liveAccounts)

      // Calcular consistencia por cuenta
      const map: Record<string, ConsistencyData> = {}
      await Promise.all(
        liveAccounts.map(async (acc: Account) => {
          try {
            const tradesRes = await fetch(`/api/trades?account_id=${acc.id}&limit=1000`)
            const tradesData = await tradesRes.json()
            const trades: { result: number | null }[] = tradesData.trades || []
            const winningTrades = trades.filter(t => (t.result ?? 0) > 0)
            // Ganancia NETA = suma de todos los trades (wins - losses)
            const netProfit = trades.reduce((s, t) => s + (t.result ?? 0), 0)
            const biggestWin = winningTrades.length > 0 ? Math.max(...winningTrades.map(t => t.result ?? 0)) : 0
            const threshold = (acc.consistency_percent ?? 30) / 100
            map[acc.id] = {
              netProfit,
              biggestWin,
              passesConsistency: netProfit > 0 ? biggestWin <= netProfit * threshold : false,
            }
          } catch {
            map[acc.id] = { netProfit: 0, biggestWin: 0, passesConsistency: false }
          }
        })
      )
      setConsistencyMap(map)

      const withdrawalsResponse = await fetch('/api/withdrawals')
      const withdrawalsData = await withdrawalsResponse.json()
      if (withdrawalsResponse.ok) {
        setWithdrawals(withdrawalsData.withdrawals || [])
      }

      setLoading(false)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t.common.error)
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleWithdraw = (account: Account) => {
    setSelectedAccount(account)
    setDialogOpen(true)
  }

  const handleSuccess = () => {
    fetchData()
  }

  const totalWithdrawn = withdrawals
    .filter(w => w.status === 'completed')
    .reduce((sum, w) => sum + w.amount, 0)

  const recentWithdrawals = withdrawals.slice(0, 5)

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-zen-anti-flash">{t.withdrawals.title}</h1>
          <p className="text-zen-anti-flash/60">{t.withdrawals.loading}</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[380px] rounded-xl bg-zen-bangladesh-green/40 border border-zen-forest/30 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-zen-anti-flash">{t.withdrawals.title}</h1>
        <Alert className="bg-zen-danger/10 border-zen-danger/40">
          <AlertCircle className="h-4 w-4 text-zen-danger" />
          <AlertDescription className="text-zen-danger/80">{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3 text-zen-anti-flash">
          <ArrowDownToLine className="h-8 w-8 text-zen-caribbean-green" />
          {t.withdrawals.title}
        </h1>
        <p className="text-zen-anti-flash/60">
          {t.withdrawals.subtitle}
        </p>
      </div>

      {/* Estadísticas de retiros */}
      {withdrawals.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-zen-forest/40 bg-zen-bangladesh-green/60 p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-zen-caribbean-green/20 shrink-0">
              <DollarSign className="h-5 w-5 text-zen-caribbean-green" />
            </div>
            <div>
              <p className="text-xs text-zen-anti-flash/50 mb-0.5">{t.withdrawals.totalWithdrawn}</p>
              <p className="text-xl font-bold text-zen-caribbean-green">
                ${totalWithdrawn.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-zen-forest/40 bg-zen-bangladesh-green/60 p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-zen-caribbean-green/10 shrink-0">
              <CheckCircle2 className="h-5 w-5 text-zen-caribbean-green" />
            </div>
            <div>
              <p className="text-xs text-zen-anti-flash/50 mb-0.5">{t.withdrawals.completed}</p>
              <p className="text-xl font-bold text-zen-anti-flash">
                {withdrawals.filter(w => w.status === 'completed').length}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-zen-forest/40 bg-zen-bangladesh-green/60 p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-zen-forest/20 shrink-0">
              <Clock className="h-5 w-5 text-zen-anti-flash/70" />
            </div>
            <div>
              <p className="text-xs text-zen-anti-flash/50 mb-0.5">{t.withdrawals.lastWithdrawal}</p>
              <p className="text-xl font-bold text-zen-anti-flash">
                {withdrawals.length > 0
                  ? new Date(withdrawals[0].withdrawal_date).toLocaleDateString('es-ES')
                  : 'N/A'
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Cuentas Live */}
      {accounts.length === 0 ? (
        <div className="rounded-xl border border-zen-forest/40 bg-zen-surface/60 p-12 text-center">
          <div className="p-4 rounded-full bg-zen-caribbean-green/10 w-fit mx-auto mb-4">
            <ArrowDownToLine className="h-12 w-12 text-zen-caribbean-green/40" />
          </div>
          <h3 className="text-xl font-semibold text-zen-anti-flash mb-2">
            {t.withdrawals.noLiveAccounts}
          </h3>
          <p className="text-zen-anti-flash/50 text-sm">
            {t.withdrawals.noLiveAccountsDesc}
          </p>
        </div>
      ) : (
        <>
          <div>
            <h2 className="text-lg font-semibold mb-4 text-zen-anti-flash flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-zen-caribbean-green" />
              {t.withdrawals.liveAccounts(accounts.length)}
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {accounts.map((account) => (
                <WithdrawalAccountCard
                  key={account.id}
                  account={account}
                  onWithdraw={handleWithdraw}
                  consistencyData={consistencyMap[account.id]}
                />
              ))}
            </div>
          </div>

          {/* Retiros recientes */}
          {recentWithdrawals.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4 text-zen-anti-flash flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-zen-caribbean-green" />
                {t.withdrawals.recentWithdrawals}
              </h2>
              <div className="rounded-xl border border-zen-forest/40 bg-zen-bangladesh-green/60 overflow-hidden">
                {recentWithdrawals.map((withdrawal, idx) => (
                  <div
                    key={withdrawal.id}
                    className={`p-4 flex items-center justify-between gap-4 ${
                      idx < recentWithdrawals.length - 1 ? 'border-b border-zen-forest/30' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-zen-rich-black/40 shrink-0">
                        <TrendingDown className="h-4 w-4 text-zen-caribbean-green" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-zen-anti-flash truncate">
                          {(withdrawal as { account?: { name?: string } }).account?.name || 'Cuenta'}
                        </p>
                        <p className="text-xs text-zen-anti-flash/50">
                          {new Date(withdrawal.withdrawal_date).toLocaleDateString('es-ES')}
                        </p>
                        {withdrawal.notes && (
                          <p className="text-xs text-zen-anti-flash/40 mt-0.5 truncate">{withdrawal.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge
                        className={
                          withdrawal.status === 'completed'
                            ? 'bg-zen-caribbean-green/20 text-zen-caribbean-green border-zen-caribbean-green/40'
                            : withdrawal.status === 'pending'
                            ? 'bg-zen-pistachio/20 text-zen-pistachio border-zen-pistachio/40'
                            : 'bg-zen-danger/20 text-zen-danger border-zen-danger/40'
                        }
                      >
                        {withdrawal.status === 'completed' ? t.withdrawals.statusCompleted :
                         withdrawal.status === 'pending' ? t.withdrawals.statusPending : t.withdrawals.statusCancelled}
                      </Badge>
                      <p className="text-base font-bold text-zen-caribbean-green whitespace-nowrap">
                        -${withdrawal.amount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <AddWithdrawalDialog
        account={selectedAccount}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
