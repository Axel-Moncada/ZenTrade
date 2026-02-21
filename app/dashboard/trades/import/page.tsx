'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ImportCSV } from '@/components/trades/import-csv'
import { AccountSelector } from '@/components/shared/account-selector'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function ImportPage() {
  const [accounts, setAccounts] = useState<Array<{ id: string; name: string; broker: string; initial_balance: number }>>([])
  const [selectedAccount, setSelectedAccount] = useState<string>('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
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
  }

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
          initialBalance={accounts.find(a => a.id === selectedAccount)?.initial_balance || 50000}
          onImportSuccess={handleImportSuccess}
        />
      )}
    </div>
  )
}
