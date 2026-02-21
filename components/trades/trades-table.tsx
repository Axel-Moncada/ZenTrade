'use client'

import { Trade } from '@/types/trade'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowUpDown, TrendingUp, TrendingDown } from 'lucide-react'
import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'

interface TradesTableProps {
  trades: Trade[]
  onTradeClick?: (trade: Trade) => void
  selectedTrades?: string[]
  onSelectionChange?: (selectedIds: string[]) => void
}

type SortField = 'trade_date' | 'result' | 'instrument'
type SortDirection = 'asc' | 'desc'

export function TradesTable({ trades, onTradeClick, selectedTrades = [], onSelectionChange }: TradesTableProps) {
  const [sortField, setSortField] = useState<SortField>('trade_date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const handleSelectAll = (checked: boolean) => {
    if (onSelectionChange) {
      onSelectionChange(checked ? trades.map(t => t.id) : [])
    }
  }

  const handleSelectTrade = (tradeId: string, checked: boolean) => {
    if (onSelectionChange) {
      if (checked) {
        onSelectionChange([...selectedTrades, tradeId])
      } else {
        onSelectionChange(selectedTrades.filter(id => id !== tradeId))
      }
    }
  }

  const allSelected = trades.length > 0 && selectedTrades.length === trades.length
  const someSelected = selectedTrades.length > 0 && selectedTrades.length < trades.length

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const sortedTrades = [...trades].sort((a, b) => {
    let aValue: any
    let bValue: any

    switch (sortField) {
      case 'trade_date':
        aValue = new Date(a.trade_date).getTime()
        bValue = new Date(b.trade_date).getTime()
        break
      case 'result':
        aValue = a.result || 0
        bValue = b.result || 0
        break
      case 'instrument':
        aValue = a.instrument?.symbol || ''
        bValue = b.instrument?.symbol || ''
        break
      default:
        return 0
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  const getExitReasonLabel = (reason: string | null) => {
    const labels: Record<string, string> = {
      take_profit: 'TP',
      stop_loss: 'SL',
      break_even: 'BE',
      manual: 'Manual',
      timeout: 'Timeout',
    }
    return reason ? labels[reason] || reason : '-'
  }

  const getExitReasonColor = (reason: string | null) => {
    const colors: Record<string, string> = {
      take_profit: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
      stop_loss: 'bg-rose-500/20 text-rose-400 border-rose-500/50',
      break_even: 'bg-slate-500/20 text-slate-400 border-slate-500/50',
      manual: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
      timeout: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
    }
    return reason ? colors[reason] || 'bg-slate-500/20 text-slate-400' : 'bg-slate-500/20 text-slate-400'
  }

  if (trades.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 border border-slate-700/50 rounded-lg bg-gradient-to-br from-slate-800/50 to-slate-900/50">
        <p className="text-slate-400">No hay trades para mostrar</p>
      </div>
    )
  }

  return (
    <div className="border border-zen-bangladesh-green/80 rounded-lg overflow-hidden bg-gradient-to-br from-zen-bangladesh-green/50 to-zen-dark-green/50">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-zen-rich-black/80 hover:bg-zen-rich-black-800/90">
              {onSelectionChange && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={allSelected || someSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Seleccionar todos"
                    className={someSelected ? "data-[state=checked]:bg-zen-caribbean-green/50" : ""}
                  />
                </TableHead>
              )}
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1"
                  onClick={() => handleSort('trade_date')}
                >
                  Fecha
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1"
                  onClick={() => handleSort('instrument')}
                >
                  Instrumento
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>Lado</TableHead>
              <TableHead className="text-right">Contratos</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1"
                  onClick={() => handleSort('result')}
                >
                  Resultado
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>Razón Salida</TableHead>
              <TableHead className="text-center">Plan</TableHead>
              <TableHead>Emociones</TableHead>
              <TableHead className="max-w-[200px]">Notas</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTrades.map((trade) => (
              <TableRow
                key={trade.id}
                className="border-zen-mountain-meadow/80 hover:bg-red-800/10 cursor-pointer"
              >
                {onSelectionChange && (
                  <TableCell className="w-12" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedTrades.includes(trade.id)}
                      onCheckedChange={(checked) => handleSelectTrade(trade.id, checked as boolean)}
                      aria-label={`Seleccionar trade ${trade.id}`}
                    />
                  </TableCell>
                )}
                <TableCell className="font-medium" onClick={() => onTradeClick?.(trade)}>
                  {format(new Date(trade.trade_date), 'dd/MM/yyyy', { locale: es })}
                </TableCell>
                <TableCell onClick={() => onTradeClick?.(trade)}>
                  <div className="flex flex-col">
                    <span className="font-medium">{trade.instrument?.symbol}</span>
                    <span className="text-xs text-slate-400">{trade.instrument?.name}</span>
                  </div>
                </TableCell>
                <TableCell onClick={() => onTradeClick?.(trade)}>
                  <Badge
                    variant="outline"
                    className={cn(
                      trade.side === 'long'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                        : 'bg-rose-500/20 text-rose-400 border-rose-500/50'
                    )}
                  >
                    {trade.side === 'long' ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    {trade.side === 'long' ? 'Largo' : 'Corto'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right" onClick={() => onTradeClick?.(trade)}>{trade.contracts}</TableCell>
                <TableCell onClick={() => onTradeClick?.(trade)}>
                  <span
                    className={cn(
                      'font-semibold',
                      (trade.result || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    )}
                  >
                    ${(trade.result || 0).toFixed(2)}
                  </span>
                </TableCell>
                <TableCell onClick={() => onTradeClick?.(trade)}>
                  <Badge variant="outline" className={getExitReasonColor(trade.exit_reason)}>
                    {getExitReasonLabel(trade.exit_reason)}
                  </Badge>
                </TableCell>
                <TableCell className="text-center" onClick={() => onTradeClick?.(trade)}>
                  {trade.followed_plan ? (
                    <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50">
                      ✓
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-rose-500/20 text-rose-400 border-rose-500/50">
                      ✗
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-sm text-slate-300" onClick={() => onTradeClick?.(trade)}>
                  {trade.emotions && trade.emotions.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {trade.emotions.slice(0, 2).map((emotion: string, idx: number) => (
                        <Badge key={idx} variant="secondary" className="text-xs capitalize">
                          {emotion}
                        </Badge>
                      ))}
                      {trade.emotions.length > 2 && (
                        <span className="text-xs text-slate-500">+{trade.emotions.length - 2}</span>
                      )}
                    </div>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell className="text-sm text-slate-400 max-w-[200px] truncate" title={trade.notes || undefined} onClick={() => onTradeClick?.(trade)}>
                  {trade.notes || '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
