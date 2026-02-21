'use client';

import { TradeWithInstrument } from '@/types/trades';
import { TradeCard } from './trade-card';
import { cn } from '@/lib/utils';

interface TradesListProps {
  trades: TradeWithInstrument[];
  onEdit?: (trade: TradeWithInstrument) => void;
  onDelete?: (tradeId: string) => void;
}

export function TradesList({ trades, onEdit, onDelete }: TradesListProps) {
  if (trades.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-zen-anti-flash/60">No hay operaciones para este día</p>
      </div>
    );
  }

  // Calcular métricas rápidas
  const totalTrades = trades.length;
  const winningTrades = trades.filter(t => t.result > 0).length;
  const losingTrades = trades.filter(t => t.result < 0).length;
  const totalPnl = trades.reduce((sum, t) => sum + t.result, 0);

  return (
    <div className="space-y-4">
      {/* Resumen rápido */}
      <div className="grid grid-cols-4 gap-3 p-3 bg-zen-surface/60 border border-zen-forest/40 rounded-lg text-sm">
        <div>
          <p className="text-zen-anti-flash/60 text-xs mb-1">Total</p>
          <p className="font-bold text-zen-anti-flash">{totalTrades}</p>
        </div>
        <div>
          <p className="text-zen-anti-flash/60 text-xs mb-1">Ganadas</p>
          <p className="font-bold text-zen-caribbean-green">{winningTrades}</p>
        </div>
        <div>
          <p className="text-zen-anti-flash/60 text-xs mb-1">Perdidas</p>
          <p className="font-bold text-zen-danger">{losingTrades}</p>
        </div>
        <div>
          <p className="text-zen-anti-flash/60 text-xs mb-1">PNL</p>
          <p className={cn("font-bold", totalPnl >= 0 ? 'text-zen-caribbean-green' : 'text-zen-danger')}>
            ${totalPnl.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Lista de trades */}
      <div className="space-y-3">
        {trades.map(trade => (
          <TradeCard
            key={trade.id}
            trade={trade}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}
