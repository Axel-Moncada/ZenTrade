'use client'

import { Account } from '@/types/accounts'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowDownToLine, TrendingUp, Shield, AlertTriangle, CheckCircle2 } from 'lucide-react'

interface WithdrawalAccountCardProps {
  account: Account
  onWithdraw: (account: Account) => void
}

export function WithdrawalAccountCard({ account, onWithdraw }: WithdrawalAccountCardProps) {
  // Calcular métricas
  const cushion = account.current_balance - account.initial_balance
  const cushionPercentage = account.initial_balance > 0 
    ? (cushion / account.initial_balance) * 100 
    : 0

  // Regla del 30%: el saldo debe estar al menos 30% por encima del inicial
  const threshold = account.initial_balance * 1.30
  const meetsRule = account.current_balance >= threshold
  const availableToWithdraw = meetsRule ? Math.max(0, account.current_balance - threshold) : 0

  // Solo mostrar cuentas live
  if (account.account_type !== 'live') return null

  return (
    <Card className="hover:shadow-lg transition-shadow border-zen-forest/50 rounded-xl bg-zen-surface/60 backdrop-blur-sm p-6 bg-zen-bangladesh-green/60">
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

        {/* Métricas principales */}
        <div className="grid grid-cols-2 gap-4">
          {/* Saldo Total */}
          <div className="space-y-1">
            <p className="text-xs text-zen-anti-flash/60">Saldo Total</p>
            <p className="text-2xl font-bold text-zen-anti-flash">
              ${account.current_balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          {/* Saldo Inicial */}
          <div className="space-y-1">
            <p className="text-xs text-zen-anti-flash/60">Saldo Inicial</p>
            <p className="text-lg font-semibold text-zen-anti-flash">
              ${account.initial_balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Colchón */}
        <div className={`p-4 rounded-lg border ${cushion >= 0 ? 'bg-zen-caribbean-green/5 border-zen-caribbean-green/30' : 'bg-zen-danger/5 border-zen-danger/30'}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Shield className={`h-4 w-4 ${cushion >= 0 ? 'text-zen-caribbean-green' : 'text-zen-danger'}`} />
              <p className="text-sm font-medium text-zen-anti-flash">Colchón</p>
            </div>
            <Badge
              className={cushion >= 0 ? 'bg-zen-caribbean-green/20 text-zen-caribbean-green border-zen-caribbean-green/40' : 'bg-zen-danger/20 text-zen-danger border-zen-danger/40'}
            >
              {cushion >= 0 ? '+' : ''}{cushionPercentage.toFixed(1)}%
            </Badge>
          </div>
          <p className={`text-xl font-bold ${cushion >= 0 ? 'text-zen-caribbean-green' : 'text-zen-danger'}`}>
            {cushion >= 0 ? '+' : ''}${cushion.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        {/* Regla del 30% */}
        <div className={`p-4 rounded-lg border ${meetsRule ? 'bg-zen-caribbean-green/5 border-zen-caribbean-green/30' : 'bg-zen-pistachio/5 border-zen-pistachio/30'}`}>
          <div className="flex items-start gap-3">
            {meetsRule ? (
              <CheckCircle2 className="h-5 w-5 text-zen-caribbean-green mt-0.5 shrink-0" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-zen-pistachio mt-0.5 shrink-0" />
            )}
            <div className="space-y-1 flex-1">
              <p className={`text-sm font-medium ${meetsRule ? 'text-zen-caribbean-green' : 'text-zen-pistachio'}`}>
                Regla del 30%
              </p>
              <p className="text-xs text-zen-anti-flash/60">
                {meetsRule
                  ? `✓ Cumple: Saldo supera $${threshold.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : `✗ No cumple: Necesitas $${threshold.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} para retirar`
                }
              </p>
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

        {!meetsRule && (
          <p className="text-xs text-center text-zen-anti-flash/50">
            Necesitas +${((threshold - account.current_balance)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} más para poder retirar
          </p>
        )}
      </div>
    </Card>
  )
}
