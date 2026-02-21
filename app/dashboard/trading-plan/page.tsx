'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TradingPlanForm } from '@/components/trading-plan/trading-plan-form'
import { ExportPlanPDF } from '@/components/trading-plan/export-plan-pdf'
import { AccountSelector } from '@/components/shared/account-selector'
import { Target, FileText, Calendar, Shield } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { TradingPlan } from '@/types/trading-plan'

export default function TradingPlanPage() {
  const [accounts, setAccounts] = useState<Array<{ id: string; name: string; broker: string }>>([])
  const [selectedAccount, setSelectedAccount] = useState<string>('')
  const [activePlan, setActivePlan] = useState<TradingPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const supabase = createClient()

  const fetchAccounts = useCallback(async () => {
    const { data, error } = await supabase
      .from('accounts')
      .select('id, name, broker')
      .order('name')

    if (data && !error) {
      setAccounts(data)
      if (data.length > 0 && !selectedAccount) {
        setSelectedAccount(data[0].id)
      }
    }
  }, [supabase, selectedAccount])

  const fetchActivePlan = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('trading_plans')
      .select('*')
      .eq('account_id', selectedAccount)
      .eq('is_active', true)
      .single()

    if (data && !error) {
      setActivePlan(data)
    } else {
      setActivePlan(null)
    }
    setLoading(false)
  }, [supabase, selectedAccount])

  useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts])

  useEffect(() => {
    if (selectedAccount) {
      fetchActivePlan()
    }
  }, [selectedAccount, fetchActivePlan])

  const handleSaveSuccess = () => {
    fetchActivePlan()
    setShowForm(false)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-zen-anti-flash">Plan de Trading</h1>
          <p className="text-zen-anti-flash/60">Define tus reglas y objetivos de trading</p>
        </div>
        {!showForm && (
          <div className="flex gap-2">
            {activePlan && (
              <ExportPlanPDF 
                plan={activePlan} 
                accountName={accounts.find(a => a.id === selectedAccount)?.name || 'cuenta'}
              />
            )}
            <Button onClick={() => setShowForm(true)} variant={'zenGreen'} >
              {activePlan ? 'Editar plan' : 'Crear plan'}
            </Button>
          </div>
        )}
      </div>

      {/* Account Selector */}
      <Card className="p-4 border-slate-700/50 bg-gradient-to-br from-zen-dark-green/20 to-zen-dark-green/50">
        <AccountSelector
          accounts={accounts}
          selectedAccount={selectedAccount}
          onAccountChange={setSelectedAccount}
        />
      </Card>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-400">Cargando...</p>
        </div>
      ) : showForm ? (
        <TradingPlanForm
          accountId={selectedAccount}
          existingPlan={activePlan || undefined}
          onSaveSuccess={handleSaveSuccess}
        />
      ) : activePlan ? (
        <div className="space-y-6">
          {/* Plan Summary */}
          <Card className="p-6 border-zen-caribbean-green shadow-md bg-gradient-to-br from-zen-dark-green/20 to-zen-dark-green/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-emerald-400" />
                <h3 className="text-lg font-semibold text-slate-200">Objetivos</h3>
              </div>
              <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50">
                Plan Activo
              </Badge>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {activePlan.daily_profit_target && (
                <div>
                  <p className="text-sm text-slate-400">Objetivo diario</p>
                  <p className="text-lg font-semibold text-emerald-400">
                    ${activePlan.daily_profit_target.toFixed(2)}
                  </p>
                </div>
              )}
              {activePlan.daily_loss_limit && (
                <div>
                  <p className="text-sm text-slate-400">Límite diario</p>
                  <p className="text-lg font-semibold text-rose-400">
                    ${activePlan.daily_loss_limit.toFixed(2)}
                  </p>
                </div>
              )}
              {activePlan.weekly_profit_target && (
                <div>
                  <p className="text-sm text-slate-400">Objetivo semanal</p>
                  <p className="text-lg font-semibold text-emerald-400">
                    ${activePlan.weekly_profit_target.toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Risk Management */}
          {(activePlan.max_risk_per_trade || activePlan.max_daily_trades) && (
            <Card className="p-6 border-slate-700/50 bg-gradient-to-br from-zen-dark-green/20 to-zen-dark-green/50">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-5 w-5 text-rose-400" />
                <h3 className="text-lg font-semibold text-slate-200">Gestión de Riesgo</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 place-items-center">
                {activePlan.max_risk_per_trade && (
                  <div className="text-center">
                    <p className="text-sm text-slate-400">Riesgo máximo/trade</p>
                    <p className="text-lg font-semibold text-slate-200">
                      {activePlan.max_risk_per_trade}%
                    </p>
                  </div>
                )}
                {activePlan.max_daily_trades && (
                  <div className="text-center">
                    <p className="text-sm text-slate-400">Trades diarios</p>
                    <p className="text-lg font-semibold text-slate-200">
                      {activePlan.max_daily_trades}
                    </p>
                  </div>
                )}
                {activePlan.max_concurrent_positions && (
                  <div className="text-center">
                    <p className="text-sm text-slate-400">Posiciones concurrentes</p>
                    <p className="text-lg font-semibold text-slate-200">
                      {activePlan.max_concurrent_positions}
                    </p>
                  </div>
                )}
                {activePlan.min_risk_reward_ratio && (
                  <div className="text-center">
                    <p className="text-sm text-slate-400">Ratio R:R mínimo</p>
                    <p className="text-lg font-semibold text-slate-200">
                      1:{activePlan.min_risk_reward_ratio}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Checklist */}
          {activePlan.pre_trade_checklist && activePlan.pre_trade_checklist.length > 0 && (
            <Card className="p-6 border-zen-caribbean-green bg-gradient-to-br from-zen-dark-green/20 to-zen-dark-green/50">
              <h3 className="font-semibold text-slate-200 mb-3">Checklist Pre-Trade</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {activePlan.pre_trade_checklist.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="text-emerald-400 mt-0.5">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          )}
</div>




          <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> 
          {/* Rules */}
          {(activePlan.entry_rules || activePlan.exit_rules) && (
            <Card className="p-6 border-zen-caribbean-green bg-gradient-to-br from-zen-dark-green/20 to-zen-dark-green/50">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-slate-200">Reglas</h3>
              </div>
              <div className="space-y-4">
                {activePlan.entry_rules && (
                  <div>
                    <p className="text-sm font-semibold text-slate-300 mb-2">Entrada:</p>
                    <p className="text-sm text-slate-400 whitespace-pre-wrap">
                      {activePlan.entry_rules}
                    </p>
                  </div>
                )}
                {activePlan.exit_rules && (
                  <div>
                    <p className="text-sm font-semibold text-slate-300 mb-2">Salida:</p>
                    <p className="text-sm text-slate-400 whitespace-pre-wrap">
                      {activePlan.exit_rules}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Instruments */}
          {activePlan.allowed_instruments && activePlan.allowed_instruments.length > 0 && (
            <Card className="p-6 border-zen-caribbean-green bg-gradient-to-br from-zen-dark-green/20 to-zen-dark-green/50">
              <h3 className="font-semibold text-slate-200 mb-3">Instrumentos permitidos</h3>
              <div className="flex flex-wrap gap-2">
                {activePlan.allowed_instruments.map((inst) => (
                  <Badge key={inst} variant="secondary">{inst}</Badge>
                ))}
              </div>
            </Card>
          )}

          {/* Schedule */}
          {(activePlan.trading_start_time || activePlan.trading_days) && (
            <Card className="p-6 border-zen-caribbean-green bg-gradient-to-br from-zen-dark-green/20 to-zen-dark-green/50">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5 text-purple-400" />
                <h3 className="text-lg font-semibold text-slate-200">Horarios</h3>
              </div>
              <div className="space-y-2">
                {activePlan.trading_start_time && activePlan.trading_end_time && (
                  <p className="text-sm text-slate-300">
                    <span className="text-slate-400">Horario:</span> {activePlan.trading_start_time} - {activePlan.trading_end_time}
                  </p>
                )}
                {activePlan.trading_days && activePlan.trading_days.length > 0 && (
                  <p className="text-sm text-slate-300">
                    <span className="text-slate-400">Días:</span>{' '}
                    {activePlan.trading_days.map(d => 
                      ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][d]
                    ).join(', ')}
                  </p>
                )}
              </div>
            </Card>
          )}
          </div>
</div>
          
        </div>
      ) : (
        <Card className="p-12 border-slate-700/50 bg-gradient-to-br from-zen-dark-green/20 to-zen-dark-green/50 text-center">
          <Target className="h-16 w-16 mx-auto mb-4 text-slate-600" />
          <h3 className="text-xl font-semibold text-slate-300 mb-2">No tienes un plan de trading</h3>
          <p className="text-slate-400 mb-6">
            Crea tu plan para definir objetivos, reglas y gestión de riesgo
          </p>
          <Button onClick={() => setShowForm(true)} variant={'zenGreen'}>
            Crear plan de trading
          </Button>
        </Card>
      )}
    </div>
  )
}
