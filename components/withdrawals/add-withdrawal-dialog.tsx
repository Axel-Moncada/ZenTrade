'use client'

import { useState } from 'react'
import { Account } from '@/types/accounts'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertTriangle, ArrowDownToLine } from 'lucide-react'

interface AddWithdrawalDialogProps {
  account: Account | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AddWithdrawalDialog({ 
  account, 
  open, 
  onOpenChange, 
  onSuccess 
}: AddWithdrawalDialogProps) {
  const [amount, setAmount] = useState('')
  const [withdrawalDate, setWithdrawalDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!account) return null

  // Calcular máximo disponible para retiro
  const threshold = account.initial_balance * 1.30
  const maxWithdrawal = Math.max(0, account.current_balance - threshold)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const withdrawalAmount = parseFloat(amount)

    // Validaciones
    if (isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
      setError('El monto debe ser mayor a 0')
      return
    }

    if (withdrawalAmount > maxWithdrawal) {
      setError(`El monto no puede exceder $${maxWithdrawal.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`)
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account_id: account.id,
          amount: withdrawalAmount,
          withdrawal_date: withdrawalDate,
          notes: notes.trim() || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear el retiro')
      }

      // Limpiar formulario
      setAmount('')
      setNotes('')
      setWithdrawalDate(new Date().toISOString().split('T')[0])
      
      // Cerrar modal y notificar éxito
      onOpenChange(false)
      onSuccess()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!loading) {
      onOpenChange(newOpen)
      if (!newOpen) {
        // Reset form cuando se cierra
        setAmount('')
        setNotes('')
        setError(null)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowDownToLine className="h-5 w-5 text-blue-400" />
              Solicitar Retiro
            </DialogTitle>
            <DialogDescription>
              Retiro de la cuenta {account.name} ({account.broker})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Info de cuenta */}
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Saldo actual:</span>
                <span className="font-semibold text-slate-200">
                  ${account.current_balance.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Umbral del 30%:</span>
                <span className="font-semibold text-slate-200">
                  ${threshold.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-slate-700">
                <span className="text-slate-300 font-medium">Máximo disponible:</span>
                <span className="font-bold text-emerald-400">
                  ${maxWithdrawal.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </span>
              </div>
            </div>

            {/* Monto */}
            <div className="space-y-2">
              <Label htmlFor="amount">
                Monto a Retirar <span className="text-red-400">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  $
                </span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  max={maxWithdrawal}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="pl-12"
                  required
                  disabled={loading}
                />
              </div>
              <p className="text-xs text-slate-500">
                Máximo: ${maxWithdrawal.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </p>
            </div>

            {/* Fecha */}
            <div className="space-y-2">
              <Label htmlFor="withdrawal_date">
                Fecha del Retiro <span className="text-red-400">*</span>
              </Label>
              <Input
                id="withdrawal_date"
                type="date"
                value={withdrawalDate}
                onChange={(e) => setWithdrawalDate(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {/* Notas */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej: Retiro de ganancias del mes..."
                rows={3}
                disabled={loading}
              />
            </div>

            {/* Error */}
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Advertencia */}
            <Alert className="border-blue-500/50 bg-blue-500/10">
              <AlertTriangle className="h-4 w-4 text-blue-400" />
              <AlertDescription className="text-blue-400 text-xs">
                El retiro reducirá tu balance y ajustará el campo manual_adjustments de la cuenta
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                'Confirmar Retiro'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
