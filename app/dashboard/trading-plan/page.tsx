'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TradingPlanForm } from '@/components/trading-plan/trading-plan-form'
import { ExportPlanPDF } from '@/components/trading-plan/export-plan-pdf'
import { AccountSelector } from '@/components/shared/account-selector'
import { UpgradePrompt } from '@/components/shared/upgrade-prompt'
import { Target, FileText, Calendar, Shield, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { TradingPlan } from '@/types/trading-plan'
import { useI18n } from '@/lib/i18n/context'
import { usePlan } from '@/lib/hooks/usePlan'

export default function TradingPlanPage() {
  const [accounts, setAccounts] = useState<Array<{ id: string; name: string; broker: string }>>([])
  const [selectedAccount, setSelectedAccount] = useState<string>('')
  const [activePlan, setActivePlan] = useState<TradingPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showPdfUpgrade, setShowPdfUpgrade] = useState(false)
  const { t } = useI18n()
  const plan = usePlan()

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
          <h1 className="text-3xl font-bold text-zen-anti-flash">{t.tradingPlan.title}</h1>
          <p className="text-zen-anti-flash/60">{t.tradingPlan.subtitle}</p>
        </div>
        {!showForm && (
          <div className="flex gap-2">
            {activePlan && (
              (plan.isPro || plan.isZenMode) ? (
                <ExportPlanPDF
                  plan={activePlan}
                  accountName={accounts.find(a => a.id === selectedAccount)?.name ?? 'cuenta'}
                />
              ) : (
                <Button
                  variant="outline"
                  className="gap-2 border-zen-caribbean-green/20 text-zen-caribbean-green/50 cursor-not-allowed"
                  onClick={() => setShowPdfUpgrade(true)}
                >
                  <Lock className="h-4 w-4" />
                  {t.tradingPlan.exportPdf}
                </Button>
              )
            )}
            <Button onClick={() => setShowForm(true)} variant={'zenGreen'}>
              {activePlan ? t.tradingPlan.editPlan : t.tradingPlan.createPlan}
            </Button>
          </div>
        )}
      </div>

      {/* Account Selector */}
      <Card className="p-4 border-zen-forest/40 bg-zen-dark-green">
        <AccountSelector
          accounts={accounts}
          selectedAccount={selectedAccount}
          onAccountChange={setSelectedAccount}
        />
      </Card>

      {/* Upgrade prompt — PDF export bloqueado */}
      {showPdfUpgrade && !plan.isPro && !plan.isZenMode && (
        <UpgradePrompt
          requiredPlan="pro"
          variant="inline"
          message="Exporta tu Trading Plan en PDF profesional para presentarlo en evaluaciones de prop firms"
          onDismiss={() => setShowPdfUpgrade(false)}
        />
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-zen-anti-flash/60">{t.common.loading}</p>
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
          <Card className="p-6 border-zen-caribbean-green bg-zen-dark-green">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-zen-caribbean-green" />
                <h3 className="text-lg font-semibold text-zen-anti-flash">Objetivos</h3>
              </div>
              <Badge variant="outline" className="bg-zen-caribbean-green/20 text-zen-caribbean-green border-zen-caribbean-green/40">
                Plan Activo
              </Badge>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {activePlan.daily_profit_target && (
                <div>
                  <p className="text-sm text-zen-anti-flash/60">Objetivo diario</p>
                  <p className="text-lg font-semibold text-zen-caribbean-green">
                    ${activePlan.daily_profit_target.toFixed(2)}
                  </p>
                </div>
              )}
              {activePlan.daily_loss_limit && (
                <div>
                  <p className="text-sm text-zen-anti-flash/60">Límite diario</p>
                  <p className="text-lg font-semibold text-zen-danger">
                    ${activePlan.daily_loss_limit.toFixed(2)}
                  </p>
                </div>
              )}
              {activePlan.weekly_profit_target && (
                <div>
                  <p className="text-sm text-zen-anti-flash/60">Objetivo semanal</p>
                  <p className="text-lg font-semibold text-zen-caribbean-green">
                    ${activePlan.weekly_profit_target.toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Risk Management */}
          {(activePlan.max_risk_per_trade || activePlan.max_daily_trades) && (
            <Card className="p-6 border-zen-forest/40 bg-zen-dark-green">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-5 w-5 text-zen-danger" />
                <h3 className="text-lg font-semibold text-zen-anti-flash">Gestión de Riesgo</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 place-items-center">
                {activePlan.max_risk_per_trade && (
                  <div className="text-center">
                    <p className="text-sm text-zen-anti-flash/60">Riesgo máximo/trade</p>
                    <p className="text-lg font-semibold text-zen-anti-flash">
                      {activePlan.max_risk_per_trade}%
                    </p>
                  </div>
                )}
                {activePlan.max_daily_trades && (
                  <div className="text-center">
                    <p className="text-sm text-zen-anti-flash/60">Trades diarios</p>
                    <p className="text-lg font-semibold text-zen-anti-flash">
                      {activePlan.max_daily_trades}
                    </p>
                  </div>
                )}
                {activePlan.max_concurrent_positions && (
                  <div className="text-center">
                    <p className="text-sm text-zen-anti-flash/60">Posiciones concurrentes</p>
                    <p className="text-lg font-semibold text-zen-anti-flash">
                      {activePlan.max_concurrent_positions}
                    </p>
                  </div>
                )}
                {activePlan.min_risk_reward_ratio && (
                  <div className="text-center">
                    <p className="text-sm text-zen-anti-flash/60">Ratio R:R mínimo</p>
                    <p className="text-lg font-semibold text-zen-anti-flash">
                      1:{activePlan.min_risk_reward_ratio}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Checklist */}
          {activePlan.pre_trade_checklist && activePlan.pre_trade_checklist.length > 0 && (
            <Card className="p-6 border-zen-caribbean-green bg-zen-dark-green">
              <h3 className="font-semibold text-zen-anti-flash mb-3">Checklist Pre-Trade</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {activePlan.pre_trade_checklist.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-zen-anti-flash/80">
                    <span className="text-zen-caribbean-green mt-0.5">✓</span>
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
            <Card className="p-6 border-zen-forest/40 bg-zen-dark-green">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-zen-caribbean-green" />
                <h3 className="text-lg font-semibold text-zen-anti-flash">Reglas</h3>
              </div>
              <div className="space-y-4">
                {activePlan.entry_rules && (
                  <div>
                    <p className="text-sm font-semibold text-zen-anti-flash/80 mb-2">Entrada:</p>
                    <p className="text-sm text-zen-anti-flash/60 whitespace-pre-wrap">
                      {activePlan.entry_rules}
                    </p>
                  </div>
                )}
                {activePlan.exit_rules && (
                  <div>
                    <p className="text-sm font-semibold text-zen-anti-flash/80 mb-2">Salida:</p>
                    <p className="text-sm text-zen-anti-flash/60 whitespace-pre-wrap">
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
            <Card className="p-6 border-zen-forest/40 bg-zen-dark-green">
              <h3 className="font-semibold text-zen-anti-flash mb-3">Instrumentos permitidos</h3>
              <div className="flex flex-wrap gap-2">
                {activePlan.allowed_instruments.map((inst) => (
                  <Badge key={inst} variant="secondary" className="bg-zen-bangladesh-green/60 text-zen-anti-flash border-zen-forest/40">{inst}</Badge>
                ))}
              </div>
            </Card>
          )}

          {/* Schedule */}
          {(activePlan.trading_start_time || activePlan.trading_days) && (
            <Card className="p-6 border-zen-forest/40 bg-zen-dark-green">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5 text-zen-caribbean-green" />
                <h3 className="text-lg font-semibold text-zen-anti-flash">Horarios</h3>
              </div>
              <div className="space-y-2">
                {activePlan.trading_start_time && activePlan.trading_end_time && (
                  <p className="text-sm text-zen-anti-flash/80">
                    <span className="text-zen-anti-flash/50">Horario:</span> {activePlan.trading_start_time} - {activePlan.trading_end_time}
                  </p>
                )}
                {activePlan.trading_days && activePlan.trading_days.length > 0 && (
                  <p className="text-sm text-zen-anti-flash/80">
                    <span className="text-zen-anti-flash/50">Días:</span>{' '}
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
        <Card className="p-12 border-zen-forest/40 bg-zen-dark-green text-center">
          <Target className="h-16 w-16 mx-auto mb-4 text-zen-forest" />
          <h3 className="text-xl font-semibold text-zen-anti-flash mb-2">{t.tradingPlan.noPlan}</h3>
          <p className="text-zen-anti-flash/60 mb-6">
            {t.tradingPlan.noPlanDesc}
          </p>
          <Button onClick={() => setShowForm(true)} variant={'zenGreen'}>
            {t.tradingPlan.createPlan}
          </Button>
        </Card>
      )}
    </div>
  )
}
