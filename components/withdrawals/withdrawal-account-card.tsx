'use client'

import { Account } from '@/types/accounts'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowDownToLine, TrendingUp, Shield, AlertTriangle, CheckCircle2 } from 'lucide-react'

export interface ConsistencyData {
  totalGains: number      // suma de todos los trades con PNL positivo
  biggestWin: number      // el trade individual con mayor PNL positivo
  passesConsistency: boolean  // biggestWin <= totalGains * 0.30
}

interface WithdrawalAccountCardProps {
  account: Account
  onWithdraw: (account: Account) => void
  consistencyData?: ConsistencyData
}

export function WithdrawalAccountCard({ account, onWithdraw, consistencyData }: WithdrawalAccountCardProps) {
  // Ganancia total = balance actual - balance inicial
  const totalProfit = account.current_balance - account.initial_balance
  const profitPercentage = account.initial_balance > 0
    ? (totalProfit / account.initial_balance) * 100
    : 0

  // Regla de consistencia del 30%:
  // El trade más grande NO puede ser mayor al 30% de la ganancia total
  const CONSISTENCY_THRESHOLD = 0.30
  const maxAllowedBiggestWin = (consistencyData?.totalGains ?? 0) * CONSISTENCY_THRESHOLD
  const meetsRule = consistencyData ? consistencyData.passesConsistency : false
  const hasTrades = consistencyData && consistencyData.totalGains > 0

  // Solo puede retirar si cumple la regla de consistencia y tiene ganancias
  const availableToWithdraw = meetsRule && totalProfit > 0 ? totalProfit : 0

  // Solo mostrar cuentas live
  if (account.account_type !== 'live') return null

  return (
    <Card className="hover:shadow-lg transition-shadow border-zen-forest/50 rounded-xl backdrop-blur-sm p-6 bg-zen-bangladesh-green/60">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-zen-anti-flash">{account.name}</h3>
            <p className="text-sm text-zen-anti-flash/60">{account.broker}</p>
          </div>
          <Badge
            className={meetsRule ? 'bg-zen-caribbean-green/20 text-zen-caribbean-green border-zen-caribbean-green/40' : 'bg-zen-pistachio/20 text-zen-pistachio border-zen-pistachio/40'}
          >
            {account.account_type.toUpperCase()}
          </Badge>
        </div>

        {/* Ganancia total */}
        <div className="grid grid-cols-2 gap-4">
          {/* Saldo Total */}
          <div className="space-y-1">
            <p className="text-xs text-zen-anti-flash/60">Saldo Total</p>
            <p className="text-2xl font-bold text-zen-anti-flash">
              ${account.current_balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          {/* Ganancia Neta */}
          <div className="space-y-1">
            <p className="text-xs text-zen-anti-flash/60">Ganancia Neta</p>
            <p className={`text-lg font-semibold ${totalProfit >= 0 ? 'text-zen-caribbean-green' : 'text-zen-danger'}`}>
              {totalProfit >= 0 ? '+' : ''}${totalProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span className="text-xs text-zen-anti-flash/50 ml-1">({profitPercentage.toFixed(1)}%)</span>
            </p>
          </div>
        </div>

        {/* Regla de Consistencia del 30% */}
        <div className={`p-4 rounded-lg border ${
          !hasTrades
            ? 'bg-zen-surface/40 border-zen-forest/20'
            : meetsRule
              ? 'bg-zen-caribbean-green/5 border-zen-caribbean-green/30'
              : 'bg-zen-danger/5 border-zen-danger/30'
        }`}>
          <div className="flex items-start gap-3">
            {!hasTrades ? (
              <Shield className="h-5 w-5 text-zen-anti-flash/30 mt-0.5 shrink-0" />
            ) : meetsRule ? (
              <CheckCircle2 className="h-5 w-5 text-zen-caribbean-green mt-0.5 shrink-0" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-zen-danger mt-0.5 shrink-0" />
            )}
            <div className="space-y-1.5 flex-1">
              <p className={`text-sm font-medium ${
                !hasTrades ? 'text-zen-anti-flash/50' : meetsRule ? 'text-zen-caribbean-green' : 'text-zen-danger'
              }`}>
                Regla de Consistencia (30%)
              </p>
              {!hasTrades ? (
                <p className="text-xs text-zen-anti-flash/50">Sin trades registrados</p>
              ) : (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-zen-anti-flash/60">
                    <span>Trade más grande:</span>
                    <span className={meetsRule ? 'text-zen-caribbean-green' : 'text-zen-danger font-semibold'}>
                      ${consistencyData!.biggestWin.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-zen-anti-flash/60">
                    <span>Máximo permitido (30% de ${consistencyData!.totalGains.toFixed(0)}):</span>
                    <span className="text-zen-anti-flash/80">
                      ${maxAllowedBiggestWin.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <p className={`text-xs font-medium mt-1 ${meetsRule ? 'text-zen-caribbean-green' : 'text-zen-danger'}`}>
                    {meetsRule
                      ? '✓ Tu trade más grande está dentro del límite'
                      : `✗ Tu trade más grande supera el 30% de la ganancia total`
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Disponible para retirar */}
        <div className="p-4 rounded-lg bg-zen-mint/5 border border-zen-mint/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-zen-mint" />
              <p className="text-sm font-medium text-zen-anti-flash">Disponible para Retiro</p>
            </div>
          </div>
          <p className="text-2xl font-bold text-zen-mint">
            ${availableToWithdraw.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        {/* Botón de retiro */}
        <Button
          onClick={() => onWithdraw(account)}
          disabled={!meetsRule || availableToWithdraw <= 0}
          className={`w-full gap-2 ${meetsRule && availableToWithdraw > 0 ? 'bg-zen-caribbean-green hover:bg-zen-mountain-meadow text-zen-rich-black' : 'bg-zen-surface hover:bg-zen-forest/30 text-zen-anti-flash border border-zen-forest/40'}`}
        >
          <ArrowDownToLine className="h-4 w-4" />
          {meetsRule && availableToWithdraw > 0
            ? 'Solicitar Retiro'
            : 'No disponible para retiro'
          }
        </Button>

        {!meetsRule && hasTrades && (
          <p className="text-xs text-center text-zen-danger/70">
            Tu trade más grande (${consistencyData!.biggestWin.toFixed(2)}) supera el 30% de ganancias totales (${maxAllowedBiggestWin.toFixed(2)})
          </p>
        )}

        {!meetsRule && !hasTrades && (
          <p className="text-xs text-center text-zen-anti-flash/50">
            Registra trades para verificar la regla de consistencia
          </p>
        )}
      </div>
    </Card>
  )
}
