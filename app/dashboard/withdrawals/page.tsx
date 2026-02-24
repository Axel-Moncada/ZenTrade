'use client'

import { useCallback, useEffect, useState } from 'react'
import { Account } from '@/types/accounts'
import { Withdrawal } from '@/types/withdrawal'
import { WithdrawalAccountCard } from '@/components/withdrawals/withdrawal-account-card'
import { AddWithdrawalDialog } from '@/components/withdrawals/add-withdrawal-dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  ArrowDownToLine, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  TrendingDown 
} from 'lucide-react'
import { useI18n } from '@/lib/i18n/context'

export default function WithdrawalsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const { t } = useI18n()

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Obtener cuentas
      const accountsResponse = await fetch('/api/accounts')
      const accountsData = await accountsResponse.json()

      if (!accountsResponse.ok) {
          throw new Error(accountsData.error || t.common.error)
      }

      // Filtrar solo cuentas live
      const liveAccounts = (accountsData.accounts || []).filter(
        (acc: Account) => acc.account_type === 'live'
      )
      setAccounts(liveAccounts)

      // Obtener retiros recientes
      const withdrawalsResponse = await fetch('/api/withdrawals')
      const withdrawalsData = await withdrawalsResponse.json()

      if (withdrawalsResponse.ok) {
        setWithdrawals(withdrawalsData.withdrawals || [])
      }

      setLoading(false)
    } catch (err: any) {
      setError(err.message)
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
    // Recargar datos después de un retiro exitoso
    fetchData()
  }

  // Calcular estadísticas
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

        <div className="grid gap-16 md:grid-cols-3 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[400px]" />
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
          <ArrowDownToLine className="h-8 w-8 text-zen-mint" />
          {t.withdrawals.title}
        </h1>
        <p className="text-zen-anti-flash/60">
          {t.withdrawals.subtitle}
        </p>
      </div>

      {/* Estadísticas */}
      {withdrawals.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-4 border-zen-caribbean-green/40 bg-zen-caribbean-green/5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-zen-caribbean-green/20">
                <TrendingDown className="h-5 w-5 text-zen-caribbean-green" />
              </div>
              <div>
                <p className="text-xs text-zen-anti-flash/60">{t.withdrawals.totalWithdrawn}</p>
                <p className="text-xl font-bold text-zen-anti-flash">
                  ${totalWithdrawn.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-zen-mint/40 bg-zen-mint/5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-zen-mint/20">
                <CheckCircle2 className="h-5 w-5 text-zen-mint" />
              </div>
              <div>
                <p className="text-xs text-zen-anti-flash/60">{t.withdrawals.completed}</p>
                <p className="text-xl font-bold text-zen-anti-flash">
                  {withdrawals.filter(w => w.status === 'completed').length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-zen-pistachio/40 bg-zen-pistachio/5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-zen-pistachio/20">
                <Clock className="h-5 w-5 text-zen-pistachio" />
              </div>
              <div>
                <p className="text-xs text-zen-anti-flash/60">{t.withdrawals.lastWithdrawal}</p>
                <p className="text-xl font-bold text-zen-anti-flash">
                  {withdrawals.length > 0
                    ? new Date(withdrawals[0].withdrawal_date).toLocaleDateString('es-ES')
                    : 'N/A'
                  }
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Cuentas Live */}
      {accounts.length === 0 ? (
        <Card className="p-12 text-center border-zen-forest/40 bg-zen-surface/60 rounded-xl">
          <ArrowDownToLine className="h-16 w-16 mx-auto mb-4 text-zen-caribbean-green/40" />
          <h3 className="text-xl font-semibold text-zen-anti-flash mb-2">
            {t.withdrawals.noLiveAccounts}
          </h3>
          <p className="text-zen-anti-flash/60">
            {t.withdrawals.noLiveAccountsDesc}
          </p>
        </Card>
      ) : (
        <>
          <div>
            <h2 className="text-xl font-semibold mb-4 text-zen-anti-flash">
              {t.withdrawals.liveAccounts(accounts.length)}
            </h2>
            <div className="grid gap-16 md:grid-cols-3 lg:grid-cols-3">
              {accounts.map((account) => (
                <WithdrawalAccountCard
                  key={account.id}
                  account={account}
                  onWithdraw={handleWithdraw}
                />
              ))}
            </div>
          </div>

          {/* Retiros recientes */}
          {recentWithdrawals.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-zen-anti-flash">
                {t.withdrawals.recentWithdrawals}
              </h2>
              <Card className="border-zen-forest/40 bg-zen-surface/60">
                <div className="divide-y divide-zen-forest/30">
                  {recentWithdrawals.map((withdrawal: any) => (
                    <div key={withdrawal.id} className="p-4 flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-zen-anti-flash">
                          {withdrawal.account?.name || 'Cuenta'}
                        </p>
                        <p className="text-sm text-zen-anti-flash/60">
                          {new Date(withdrawal.withdrawal_date).toLocaleDateString('es-ES')}
                        </p>
                        {withdrawal.notes && (
                          <p className="text-xs text-zen-anti-flash/50 mt-1">{withdrawal.notes}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
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
                        <p className="text-lg font-bold text-zen-caribbean-green">
                          -${withdrawal.amount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </>
      )}

      {/* Dialog para agregar retiro */}
      <AddWithdrawalDialog
        account={selectedAccount}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
