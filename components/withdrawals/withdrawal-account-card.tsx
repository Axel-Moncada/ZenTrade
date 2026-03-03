'use client'

import { Account } from '@/types/accounts'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowDownToLine, Shield, AlertTriangle, CheckCircle2 } from 'lucide-react'

export interface ConsistencyData {
  netProfit: number           // ganancia neta = suma de todos los trades (wins - losses)
  biggestWin: number          // el trade individual con mayor PNL positivo
  passesConsistency: boolean  // biggestWin <= netProfit * threshold
}

interface WithdrawalAccountCardProps {
  account: Account
  onWithdraw: (account: Account) => void
  consistencyData?: ConsistencyData
}

export function WithdrawalAccountCard({ account, onWithdraw, consistencyData }: WithdrawalAccountCardProps) {
  const totalProfit = account.current_balance - account.initial_balance
  const profitPercentage = account.initial_balance > 0
    ? (totalProfit / account.initial_balance) * 100
    : 0

  const CONSISTENCY_THRESHOLD = (account.consistency_percent ?? 30) / 100
  const maxAllowedBiggestWin = (consistencyData?.netProfit ?? 0) * CONSISTENCY_THRESHOLD
  const meetsRule = consistencyData ? consistencyData.passesConsistency : false
  const hasTrades = consistencyData && consistencyData.netProfit > 0
  const availableToWithdraw = meetsRule && totalProfit > 0 ? totalProfit : 0

  if (account.account_type !== 'live') return null

  return (
    <Card className="border-zen-forest/50 rounded-xl backdrop-blur-sm p-6 bg-zen-bangladesh-green/60 hover:shadow-lg transition-shadow">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-zen-anti-flash">{account.name}</h3>
            <p className="text-sm text-zen-anti-flash/50">{account.broker || 'Sin broker'}</p>
          </div>
          <Badge className="bg-zen-caribbean-green/20 text-zen-caribbean-green border-zen-caribbean-green/40 text-xs">
            LIVE
          </Badge>
        </div>

        {/* Balances */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-zen-rich-black/40 rounded-lg p-3 border border-zen-forest/30">
            <p className="text-xs text-zen-anti-flash/50 mb-1">Balance Actual</p>
            <p className="text-lg font-bold text-zen-anti-flash">
              ${account.current_balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className={`rounded-lg p-3 border ${totalProfit >= 0 ? 'bg-zen-caribbean-green/10 border-zen-caribbean-green/30' : 'bg-zen-danger/10 border-zen-danger/30'}`}>
            <p className="text-xs text-zen-anti-flash/50 mb-1">Ganancia Neta</p>
            <p className={`text-lg font-bold ${totalProfit >= 0 ? 'text-zen-caribbean-green' : 'text-zen-danger'}`}>
              {totalProfit >= 0 ? '+' : ''}${totalProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-zen-anti-flash/40">{profitPercentage >= 0 ? '+' : ''}{profitPercentage.toFixed(1)}%</p>
          </div>
        </div>

        {/* Regla de Consistencia */}
        <div className={`p-4 rounded-lg border ${
          !hasTrades
            ? 'bg-zen-rich-black/40 border-zen-forest/30'
            : meetsRule
              ? 'bg-zen-caribbean-green/10 border-zen-caribbean-green/30'
              : 'bg-zen-danger/10 border-zen-danger/30'
        }`}>
          <div className="flex items-start gap-3">
            {!hasTrades ? (
              <Shield className="h-4 w-4 text-zen-anti-flash/30 mt-0.5 shrink-0" />
            ) : meetsRule ? (
              <CheckCircle2 className="h-4 w-4 text-zen-caribbean-green mt-0.5 shrink-0" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-zen-danger mt-0.5 shrink-0" />
            )}
            <div className="space-y-1.5 flex-1 min-w-0">
              <p className={`text-sm font-semibold ${
                !hasTrades ? 'text-zen-anti-flash/50' : meetsRule ? 'text-zen-caribbean-green' : 'text-zen-danger'
              }`}>
                Consistencia {account.consistency_percent ?? 30}% — {!hasTrades ? 'Sin datos' : meetsRule ? 'Cumplida ✓' : 'Pendiente'}
              </p>
              {!hasTrades ? (
                <p className="text-xs text-zen-anti-flash/40">Registra trades para verificar</p>
              ) : (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-zen-anti-flash/60">
                    <span>Trade más grande:</span>
                    <span className={`font-medium ${meetsRule ? 'text-zen-caribbean-green' : 'text-zen-danger'}`}>
                      ${consistencyData!.biggestWin.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-zen-anti-flash/60">
                    <span>Máx. permitido ({account.consistency_percent ?? 30}% de ${consistencyData!.netProfit.toFixed(0)}):</span>
                    <span className="font-medium text-zen-anti-flash/80">
                      ${maxAllowedBiggestWin.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Disponible para retirar */}
        <div className={`p-4 rounded-lg border ${meetsRule && availableToWithdraw > 0 ? 'bg-zen-caribbean-green/10 border-zen-caribbean-green/30' : 'bg-zen-rich-black/40 border-zen-forest/30'}`}>
          <p className="text-xs text-zen-anti-flash/50 mb-1">Disponible para Retiro</p>
          <p className={`text-2xl font-bold ${meetsRule && availableToWithdraw > 0 ? 'text-zen-caribbean-green' : 'text-zen-anti-flash/40'}`}>
            ${availableToWithdraw.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          {!meetsRule && hasTrades && (
            <p className="text-xs text-zen-danger/70 mt-1">
              Trade más grande supera el {account.consistency_percent ?? 30}% de ganancia neta
            </p>
          )}
        </div>

        {/* Botón */}
        <Button
          onClick={() => onWithdraw(account)}
          disabled={!meetsRule || availableToWithdraw <= 0}
          className={`w-full gap-2 font-semibold ${
            meetsRule && availableToWithdraw > 0
              ? 'bg-zen-caribbean-green hover:bg-zen-mountain-meadow text-zen-rich-black'
              : 'bg-zen-forest/30 hover:bg-zen-forest/40 text-zen-anti-flash/50 border border-zen-forest/40 cursor-not-allowed'
          }`}
        >
          <ArrowDownToLine className="h-4 w-4" />
          {meetsRule && availableToWithdraw > 0 ? 'Solicitar Retiro' : 'No disponible'}
        </Button>
      </div>
    </Card>
  )
}
