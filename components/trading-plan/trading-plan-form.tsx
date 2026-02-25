'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Target,
  Shield,
  Clock,
  CheckSquare,
  Plus,
  X,
  Save,
  Loader2,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react'
import { TradingPlanFormData, WEEK_DAYS } from '@/types/trading-plan'
import { cn } from '@/lib/utils'

interface TradingPlanFormProps {
  accountId: string
  existingPlan?: TradingPlanFormData & { id: string }
  onSaveSuccess: () => void
}

export function TradingPlanForm({ accountId, existingPlan, onSaveSuccess }: TradingPlanFormProps) {
  const [formData, setFormData] = useState<TradingPlanFormData>({
    account_id: accountId,
    allowed_instruments: [],
    trading_days: [],
    pre_trade_checklist: [],
  })

  const [newInstrument, setNewInstrument] = useState('')
  const [newChecklistItem, setNewChecklistItem] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Shared input/textarea class — account-input triggers light-mode CSS overrides
  const inputCls =
    'account-input border-zen-bangladesh-green bg-zen-bangladesh-green/40 text-zen-anti-flash placeholder:text-zen-anti-flash/50 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
  const textareaCls =
    'account-input border-zen-bangladesh-green bg-zen-bangladesh-green/40 text-zen-anti-flash placeholder:text-zen-anti-flash/50'

  useEffect(() => {
    if (existingPlan) {
      setFormData(existingPlan)
    }
  }, [existingPlan])

  const updateField = (field: keyof TradingPlanFormData, value: unknown) => {
    setFormData({ ...formData, [field]: value })
  }

  const addInstrument = () => {
    if (!newInstrument.trim()) return
    const instruments = formData.allowed_instruments || []
    if (!instruments.includes(newInstrument.trim().toUpperCase())) {
      updateField('allowed_instruments', [...instruments, newInstrument.trim().toUpperCase()])
      setNewInstrument('')
    }
  }

  const removeInstrument = (instrument: string) => {
    updateField(
      'allowed_instruments',
      (formData.allowed_instruments || []).filter((i) => i !== instrument)
    )
  }

  const addChecklistItem = () => {
    if (!newChecklistItem.trim()) return
    const checklist = formData.pre_trade_checklist || []
    if (!checklist.includes(newChecklistItem.trim())) {
      updateField('pre_trade_checklist', [...checklist, newChecklistItem.trim()])
      setNewChecklistItem('')
    }
  }

  const removeChecklistItem = (item: string) => {
    updateField(
      'pre_trade_checklist',
      (formData.pre_trade_checklist || []).filter((i) => i !== item)
    )
  }

  const toggleTradingDay = (day: number) => {
    const days = formData.trading_days || []
    if (days.includes(day)) {
      updateField('trading_days', days.filter((d) => d !== day))
    } else {
      updateField('trading_days', [...days, day].sort())
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const url = '/api/trading-plans'
      const method = existingPlan ? 'PATCH' : 'POST'
      const body = existingPlan ? { id: existingPlan.id, ...formData } : formData

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al guardar el plan')
      }

      setSuccess('Plan de trading guardado exitosamente')
      onSaveSuccess()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar el plan')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Error banner */}
      {error && (
        <div className="flex items-start gap-3 bg-zen-danger/10 border border-zen-danger/40 text-zen-danger px-4 py-3 rounded-lg">
          <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Success banner */}
      {success && (
        <div className="flex items-start gap-3 bg-zen-caribbean-green/10 border border-zen-caribbean-green/40 text-zen-caribbean-green px-4 py-3 rounded-lg">
          <CheckSquare className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span className="text-sm">{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Objetivos */}
        <Card className="p-6 border-zen-forest/40 bg-zen-dark-green">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-zen-caribbean-green" />
            <h3 className="text-lg font-semibold text-zen-anti-flash">Objetivos y Límites</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-zen-anti-flash">Objetivo de ganancia diario ($)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.daily_profit_target || ''}
                onChange={(e) => updateField('daily_profit_target', parseFloat(e.target.value) || undefined)}
                placeholder="500"
                className={inputCls}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-zen-anti-flash">Límite de pérdida diario ($)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.daily_loss_limit || ''}
                onChange={(e) => updateField('daily_loss_limit', parseFloat(e.target.value) || undefined)}
                placeholder="200"
                className={inputCls}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-zen-anti-flash">Objetivo de ganancia semanal ($)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.weekly_profit_target || ''}
                onChange={(e) => updateField('weekly_profit_target', parseFloat(e.target.value) || undefined)}
                placeholder="2500"
                className={inputCls}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-zen-anti-flash">Límite de pérdida semanal ($)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.weekly_loss_limit || ''}
                onChange={(e) => updateField('weekly_loss_limit', parseFloat(e.target.value) || undefined)}
                placeholder="1000"
                className={inputCls}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-zen-anti-flash">Objetivo de ganancia mensual ($)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.monthly_profit_target || ''}
                onChange={(e) => updateField('monthly_profit_target', parseFloat(e.target.value) || undefined)}
                placeholder="10000"
                className={inputCls}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-zen-anti-flash">Límite de pérdida mensual ($)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.monthly_loss_limit || ''}
                onChange={(e) => updateField('monthly_loss_limit', parseFloat(e.target.value) || undefined)}
                placeholder="4000"
                className={inputCls}
              />
            </div>
          </div>
        </Card>

        {/* Gestión de riesgo */}
        <Card className="p-6 border-zen-forest/40 bg-zen-dark-green">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-zen-danger" />
            <h3 className="text-lg font-semibold text-zen-anti-flash">Gestión de Riesgo</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-zen-anti-flash">Riesgo máximo por trade (%)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.max_risk_per_trade || ''}
                onChange={(e) => updateField('max_risk_per_trade', parseFloat(e.target.value) || undefined)}
                placeholder="1"
                className={inputCls}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-zen-anti-flash">Máximo de trades diarios</Label>
              <Input
                type="number"
                value={formData.max_daily_trades || ''}
                onChange={(e) => updateField('max_daily_trades', parseInt(e.target.value) || undefined)}
                placeholder="5"
                className={inputCls}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-zen-anti-flash">Máximo de posiciones concurrentes</Label>
              <Input
                type="number"
                value={formData.max_concurrent_positions || ''}
                onChange={(e) => updateField('max_concurrent_positions', parseInt(e.target.value) || undefined)}
                placeholder="3"
                className={inputCls}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-zen-anti-flash">Ratio mínimo riesgo/recompensa</Label>
              <Input
                type="number"
                step="0.1"
                value={formData.min_risk_reward_ratio || ''}
                onChange={(e) => updateField('min_risk_reward_ratio', parseFloat(e.target.value) || undefined)}
                placeholder="2"
                className={inputCls}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Reglas de entrada/salida */}
      <Card className="p-6 border-zen-forest/40 bg-zen-dark-green">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-zen-caribbean-green" />
          <h3 className="text-lg font-semibold text-zen-anti-flash">Reglas de Entrada y Salida</h3>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-zen-anti-flash">Reglas de entrada</Label>
            <Textarea
              value={formData.entry_rules || ''}
              onChange={(e) => updateField('entry_rules', e.target.value)}
              placeholder="Ej: Entrar solo en pullback a EMA 21, con confirmación de volumen..."
              rows={4}
              className={textareaCls}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-zen-anti-flash">Reglas de salida</Label>
            <Textarea
              value={formData.exit_rules || ''}
              onChange={(e) => updateField('exit_rules', e.target.value)}
              placeholder="Ej: Salir al alcanzar 2R, o cuando se rompe soporte..."
              rows={4}
              className={textareaCls}
            />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Instrumentos permitidos */}
        <Card className="p-6 border-zen-forest/40 bg-zen-dark-green">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-zen-caribbean-green" />
            <h3 className="text-lg font-semibold text-zen-anti-flash">Instrumentos Permitidos</h3>
          </div>

          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newInstrument}
                onChange={(e) => setNewInstrument(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addInstrument()}
                placeholder="ES, NQ, CL..."
                className={inputCls}
              />
              <Button
                onClick={addInstrument}
                variant="outline"
                size="icon"
                className="border-zen-forest/40 text-zen-anti-flash hover:bg-zen-caribbean-green/10 flex-shrink-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {(formData.allowed_instruments || []).map((instrument) => (
                <Badge
                  key={instrument}
                  variant="secondary"
                  className="gap-1 text-base mt-2 bg-zen-bangladesh-green/60 text-zen-anti-flash border-zen-forest/40"
                >
                  {instrument}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeInstrument(instrument)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        </Card>

        {/* Horarios */}
        <Card className="p-6 border-zen-forest/40 bg-zen-dark-green">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-zen-caribbean-green" />
            <h3 className="text-lg font-semibold text-zen-anti-flash">Horarios de Trading</h3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-zen-anti-flash">Hora de inicio</Label>
                <Input
                  type="time"
                  value={formData.trading_start_time || ''}
                  onChange={(e) => updateField('trading_start_time', e.target.value)}
                  className={inputCls}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-zen-anti-flash">Hora de fin</Label>
                <Input
                  type="time"
                  value={formData.trading_end_time || ''}
                  onChange={(e) => updateField('trading_end_time', e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-zen-anti-flash">Días permitidos</Label>
              <div className="flex flex-wrap gap-2">
                {WEEK_DAYS.map((day) => {
                  const isActive = (formData.trading_days || []).includes(day.value)
                  return (
                    <Button
                      key={day.value}
                      variant={isActive ? 'zenGreen' : 'outline'}
                      size="sm"
                      onClick={() => toggleTradingDay(day.value)}
                      className={cn(!isActive && 'border-zen-forest/40 text-zen-anti-flash hover:bg-zen-caribbean-green/10')}
                    >
                      {day.label}
                    </Button>
                  )
                })}
              </div>
            </div>
          </div>
        </Card>

        {/* Checklist pre-trade */}
        <Card className="p-6 border-zen-forest/40 bg-zen-dark-green">
          <div className="flex items-center gap-2 mb-4">
            <CheckSquare className="h-5 w-5 text-zen-caribbean-green" />
            <h3 className="text-lg font-semibold text-zen-anti-flash">Checklist Pre-Trade</h3>
          </div>

          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newChecklistItem}
                onChange={(e) => setNewChecklistItem(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addChecklistItem()}
                placeholder="Ej: ¿Revisé el calendario económico?"
                className={inputCls}
              />
              <Button
                onClick={addChecklistItem}
                variant="zenGreen"
                size="icon"
                className="flex-shrink-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {(formData.pre_trade_checklist || []).map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between p-3 border border-zen-forest/40 rounded-lg bg-zen-bangladesh-green/40"
                >
                  <span className="text-sm text-zen-anti-flash/80">{item}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-zen-anti-flash/50 hover:text-zen-danger hover:bg-transparent"
                    onClick={() => removeChecklistItem(item)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Notas de estrategia */}
      <Card className="p-6 border-zen-forest/40 bg-zen-dark-green">
        <div className="space-y-2">
          <Label className="text-zen-anti-flash">Notas y estrategia general</Label>
          <Textarea
            value={formData.strategy_notes || ''}
            onChange={(e) => updateField('strategy_notes', e.target.value)}
            placeholder="Describe tu estrategia general, setups favoritos, condiciones de mercado..."
            rows={6}
            className={textareaCls}
          />
        </div>
      </Card>

      {/* Botón guardar */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} size="lg" className="gap-2" variant="zenGreen">
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Guardar plan
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
