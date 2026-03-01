'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ImportCSV } from '@/components/trades/import-csv'
import { AccountSelector } from '@/components/shared/account-selector'
import { UpgradePrompt } from '@/components/shared/upgrade-prompt'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { usePlan } from '@/lib/hooks/usePlan'

type AccountSummary = { id: string; name: string; broker: string; initial_balance: number }

export default function ImportPage() {
  const plan = usePlan()
  const [accounts, setAccounts] = useState<AccountSummary[]>([])
  const [selectedAccount, setSelectedAccount] = useState<string>('')
  const router = useRouter()
  const supabase = createClient()

  const fetchAccounts = useCallback(async () => {
    const { data, error } = await supabase
      .from('accounts')
      .select('id, name, broker, initial_balance')
      .order('name')

    if (data && !error) {
      setAccounts(data)
      if (data.length > 0) {
        setSelectedAccount(data[0].id)
      }
    }
  }, [supabase])

  useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts])

  const handleImportSuccess = () => {
    setTimeout(() => {
      router.push('/dashboard/trades')
    }, 2000)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-zen-anti-flash">Importar Trades</h1>
          <p className="text-zen-text-muted">Sube un archivo CSV con tus trades desde tu plataforma de trading</p>
        </div>
        <Link href="/dashboard/trades">
          <Button variant="outline" className="gap-2 border-zen-border-soft text-zen-anti-flash hover:bg-zen-surface">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
        </Link>
      </div>

      {/* Plan check — mostrar upgrade wall para Starter/Free */}
      {!plan.loading && !plan.isPro ? (
        <div className="max-w-md mx-auto pt-8">
          <UpgradePrompt
            requiredPlan="pro"
            variant="card"
            message="Import CSV automático requiere Professional"
          />
          <p className="text-center text-sm text-zen-text-muted mt-4">
            Con Starter estás registrando cada trade manualmente.<br />
            Professional importa todo en 1 clic desde Rithmic, NinjaTrader y Tradoverse.
          </p>
        </div>
      ) : !plan.loading && plan.isPro ? (
        <>
          {/* Account Selector */}
          <Card className="p-4 border-zen-forest/40 bg-zen-surface/60">
            <AccountSelector
              accounts={accounts}
              selectedAccount={selectedAccount}
              onAccountChange={setSelectedAccount}
            />
          </Card>

          {/* Import Component */}
          {selectedAccount && (
            <ImportCSV
              accountId={selectedAccount}
              initialBalance={accounts.find(a => a.id === selectedAccount)?.initial_balance ?? 50000}
              onImportSuccess={handleImportSuccess}
            />
          )}
        </>
      ) : (
        /* Loading plan state */
        <div className="flex items-center justify-center py-24">
          <div className="text-zen-anti-flash/40 text-sm">Cargando...</div>
        </div>
      )}
    </div>
  )
}
