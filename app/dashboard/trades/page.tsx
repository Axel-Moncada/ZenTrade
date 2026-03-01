'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Download, Upload, Plus, Trash2, Lock } from 'lucide-react'
import { TradesFilters, TradeFilters } from '@/components/trades/trades-filters'
import { TradesTable } from '@/components/trades/trades-table'
import { AccountSelector } from '@/components/accounts/account-selector'
import { UpgradePrompt } from '@/components/shared/upgrade-prompt'
import { Account } from '@/types/accounts'
import { createClient } from '@/lib/supabase/client'
import { Trade } from '@/types/trade'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n/context'
import { usePlan } from '@/lib/hooks/usePlan'

export default function TradesPage() {
  const plan = usePlan()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [selectedAccount, setSelectedAccount] = useState<string>('')
  const [instruments, setInstruments] = useState<Array<{ id: string; symbol: string; name: string }>>([])
  const [trades, setTrades] = useState<any[]>([])
  const [filteredTrades, setFilteredTrades] = useState<any[]>([])
  const [filters, setFilters] = useState<TradeFilters>({})
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedTrades, setSelectedTrades] = useState<string[]>([])
  const [deleting, setDeleting] = useState(false)
  const [showImportUpgrade, setShowImportUpgrade] = useState(false)
  const tradesPerPage = 20
  const { t } = useI18n()

  const supabase = createClient()

  const fetchAccounts = useCallback(async () => {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .order('name')

    if (data && !error) {
      setAccounts(data)
      if (data.length > 0 && !selectedAccount) {
        setSelectedAccount(data[0].id)
      }
    }
  }, [supabase, selectedAccount])

  const fetchInstruments = useCallback(async () => {
    const { data, error } = await supabase
      .from('instrument_specs')
      .select('id, symbol, name')
      .order('symbol')

    if (data && !error) {
      setInstruments(data)
    }
  }, [supabase])

  const fetchTrades = useCallback(async () => {
    if (!selectedAccount) return
    
    setLoading(true)
    
    console.log('Fetching trades for account:', selectedAccount)
    
    const { data, error } = await supabase
      .from('trades')
      .select(`
        *,
        instrument:instrument_specs(symbol, name, tick_size, tick_value)
      `)
      .eq('account_id', selectedAccount)
      .order('trade_date', { ascending: false })
      .order('created_at', { ascending: false })

    console.log('Trades data:', data)
    console.log('Trades error:', error)

    if (data && !error) {
      setTrades(data)
    } else if (error) {
      console.error('Error fetching trades:', error)
    }
    setLoading(false)
  }, [selectedAccount, supabase])

  const applyFilters = useCallback(() => {
    let filtered = [...trades]

    if (filters.instrument) {
      filtered = filtered.filter(t => t.instrument_id === filters.instrument)
    }

    if (filters.side) {
      filtered = filtered.filter(t => t.side === filters.side)
    }

    if (filters.exitReason) {
      filtered = filtered.filter(t => t.exit_reason === filters.exitReason)
    }

    if (filters.followedPlan !== undefined) {
      filtered = filtered.filter(t => t.followed_plan === filters.followedPlan)
    }

    if (filters.emotion) {
      filtered = filtered.filter(t => t.emotion === filters.emotion)
    }

    if (filters.winnersOnly) {
      filtered = filtered.filter(t => (t.result || 0) > 0)
    }

    if (filters.losersOnly) {
      filtered = filtered.filter(t => (t.result || 0) < 0)
    }

    if (filters.startDate) {
      filtered = filtered.filter(t => new Date(t.entry_date) >= filters.startDate!)
    }

    if (filters.endDate) {
      filtered = filtered.filter(t => new Date(t.entry_date) <= filters.endDate!)
    }

    setFilteredTrades(filtered)
    setCurrentPage(1)
    setSelectedTrades([]) // Clear selection when filters change
  }, [trades, filters])

  useEffect(() => {
    fetchAccounts()
    fetchInstruments()
  }, [fetchAccounts, fetchInstruments])

  useEffect(() => {
    fetchTrades()
  }, [fetchTrades])

  useEffect(() => {
    applyFilters()
  }, [applyFilters])

  const handleDeleteSelected = async () => {
    if (selectedTrades.length === 0) return
    
    const confirmDelete = confirm(t.trades.confirmDelete(selectedTrades.length))
    
    if (!confirmDelete) return
    
    setDeleting(true)
    try {
      // Delete trades one by one
      const deletePromises = selectedTrades.map(tradeId =>
        fetch(`/api/trades/${tradeId}`, { method: 'DELETE' })
      )
      
      await Promise.all(deletePromises)
      
      // Refresh trades list
      await fetchTrades()
      setSelectedTrades([])
      
      alert(t.trades.deleteSuccess(selectedTrades.length))
    } catch (error) {
      console.error('Error deleting trades:', error)
      alert(t.trades.deleteError)
    } finally {
      setDeleting(false)
    }
  }

  const handleExport = async () => {
    const params = new URLSearchParams()
    if (selectedAccount) params.append('account_id', selectedAccount)
    if (filters.startDate) params.append('start_date', filters.startDate.toISOString().split('T')[0])
    if (filters.endDate) params.append('end_date', filters.endDate.toISOString().split('T')[0])
    if (filters.instrument) params.append('instrument', filters.instrument)
    if (filters.side) params.append('side', filters.side)
    if (filters.exitReason) params.append('exit_reason', filters.exitReason)
    if (filters.followedPlan !== undefined) params.append('followed_plan', filters.followedPlan.toString())
    if (filters.emotion) params.append('emotion', filters.emotion)
    if (filters.winnersOnly) params.append('winners_only', 'true')
    if (filters.losersOnly) params.append('losers_only', 'true')

    const response = await fetch(`/api/trades/export?${params}`)
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = response.headers.get('Content-Disposition')?.split('filename=')[1]?.replace(/"/g, '') || 'trades.csv'
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  const activeFiltersCount = Object.keys(filters).filter((key) => {
    const value = filters[key as keyof TradeFilters];
    return value !== undefined && value !== null && value !== '';
  }).length;

  // Pagination
  const indexOfLastTrade = currentPage * tradesPerPage;
  const indexOfFirstTrade = indexOfLastTrade - tradesPerPage;
  const currentTrades = filteredTrades.slice(indexOfFirstTrade, indexOfLastTrade);
  const totalPages: number = Math.ceil(filteredTrades.length / tradesPerPage);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zen-anti-flash">{t.trades.title}</h1>
          <p className="text-zen-anti-flash/60 mt-2">
            {t.trades.subtitle}
          </p>
        </div>
        <div className="flex gap-3">
          {/* Importar — bloqueado para Starter/Free */}
          {!plan.loading && plan.isPro ? (
            <Link href="/dashboard/trades/import">
              <Button className="gap-2 bg-zen-caribbean-green hover:bg-zen-mountain-meadow text-zen-rich-black">
                <Upload className="h-4 w-4" />
                {t.trades.importBtn}
              </Button>
            </Link>
          ) : (
            <Button
              onClick={() => setShowImportUpgrade(prev => !prev)}
              className="gap-2 bg-zen-caribbean-green/15 hover:bg-zen-caribbean-green/25 text-zen-caribbean-green/60 border border-zen-caribbean-green/20"
            >
              <Lock className="h-4 w-4" />
              {t.trades.importBtn}
            </Button>
          )}

          <Button onClick={handleExport} className="gap-2 bg-zen-caribbean-green hover:bg-zen-mountain-meadow text-zen-rich-black">
            <Download className="h-4 w-4" />
            {t.trades.exportBtn}
          </Button>
          <Link href="/dashboard/calendar">
            <Button className="gap-2 bg-zen-caribbean-green hover:bg-zen-mountain-meadow text-zen-rich-black">
              <Plus className="h-4 w-4" />
              {t.trades.newTrade}
            </Button>
          </Link>
        </div>
      </div>

      {/* Upgrade prompt inline — aparece al hacer click en el botón bloqueado */}
      {showImportUpgrade && !plan.isPro && (
        <UpgradePrompt
          requiredPlan="pro"
          variant="banner"
          message="Import CSV automático desde Rithmic, NinjaTrader y Tradoverse requiere Professional"
          onDismiss={() => setShowImportUpgrade(false)}
        />
      )}

      {/* Account Selector */}
      <div className="flex items-center bg-card rounded-lg border border-border px-4 py-3 gap-4">
        <AccountSelector
          accounts={accounts}
          value={selectedAccount}
          onValueChange={setSelectedAccount}
          showLabel={false}
        />
        <TradesFilters 
        instruments={instruments}
        onFiltersChange={setFilters}
        activeFiltersCount={activeFiltersCount}
      />
      </div>

      {/* Filters */}
      

      {/* Bulk Actions */}
      {selectedTrades.length > 0 && (
        <Card className="p-4 border-zen-caribbean-green/40 bg-zen-caribbean-green/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <p className="text-sm text-zen-anti-flash">
                {t.trades.selectedInfo(selectedTrades.length)}
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedTrades([])}
                className="text-zen-anti-flash border-zen-border-soft hover:bg-zen-surface"
              >
                {t.trades.deselectAll}
              </Button>
            </div>
            <Button
              size="sm"
              onClick={handleDeleteSelected}
              disabled={deleting}
              className="gap-2 bg-zen-danger hover:bg-zen-danger/80 text-white"
            >
              <Trash2 className="h-4 w-4" />
              {deleting ? t.trades.deleting : t.trades.deleteSelected}
            </Button>
          </div>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 border-zen-forest/40 bg-zen-surface/60">
          <p className="text-sm text-zen-anti-flash/60">{t.trades.totalTrades}</p>
          <p className="text-2xl font-bold text-zen-anti-flash mt-1">{filteredTrades.length}</p>
        </Card>
        <Card className="p-4 border-zen-caribbean-green/40 bg-zen-caribbean-green/5">
          <p className="text-sm text-zen-anti-flash/60">{t.trades.winners}</p>
          <p className="text-2xl font-bold text-zen-caribbean-green mt-1">
            {filteredTrades.filter(t => (t.result || 0) > 0).length}
          </p>
        </Card>
        <Card className="p-4 border-zen-danger/40 bg-zen-danger/5">
          <p className="text-sm text-zen-anti-flash/60">{t.trades.losers}</p>
          <p className="text-2xl font-bold text-zen-danger mt-1">
            {filteredTrades.filter(t => (t.result || 0) < 0).length}
          </p>
        </Card>
        <Card className={`p-4 border-zen-forest/40 ${
          filteredTrades.reduce((sum, t) => sum + (t.result || 0), 0) >= 0
            ? 'bg-zen-caribbean-green/5'
            : 'bg-zen-danger/5'
        }`}>
          <p className="text-sm text-zen-anti-flash/60">{t.trades.totalPnl}</p>
          <p className={`text-2xl font-bold mt-1 ${
            filteredTrades.reduce((sum, t) => sum + (t.result || 0), 0) >= 0
              ? 'text-zen-caribbean-green'
              : 'text-zen-danger'
          }`}>
            {filteredTrades.reduce((sum, t) => sum + (t.result || 0), 0).toFixed(2)}
          </p>
        </Card>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-zen-anti-flash/60">{t.trades.loading}</p>
        </div>
      ) : (
        <>
          <TradesTable
            trades={currentTrades}
            selectedTrades={selectedTrades}
            onSelectionChange={setSelectedTrades}
            isPro={plan.isPro || plan.isZenMode}
          />

          {/* Pagination */}
          {(totalPages > 1) && (
            <div className="flex items-center justify-center gap-2">
              <Button
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="bg-zen-caribbean-green hover:bg-zen-mountain-meadow text-zen-rich-black"
              >
                {t.trades.prevPage}
              </Button>
              <span className="text-sm text-zen-anti-flash/60">
                {t.trades.page(currentPage, totalPages)}
              </span>
              <Button
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="bg-zen-caribbean-green hover:bg-zen-mountain-meadow text-zen-rich-black"
              >
                {t.trades.nextPage}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
