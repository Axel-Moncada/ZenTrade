'use client';

import { InstrumentStats } from '@/types/dashboard';
import { BarChart2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InstrumentStatsTableProps {
  data: InstrumentStats[];
}

export function InstrumentStatsTable({ data }: InstrumentStatsTableProps) {
  if (data.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart2 className="h-5 w-5 text-blue-400" />
          <h3 className="text-lg font-bold text-white">Estadísticas por Instrumento</h3>
        </div>
        <div className="text-center py-8 text-slate-500">
          No hay datos para mostrar
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-zen-bangladesh-green/50 to-zen-dark-green/50 backdrop-blur-sm border border-zen-rich-black/50 p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-zen-caribbean-green/20 rounded-lg">
          <BarChart2 className="h-5 w-5 text-zen-caribbean-green" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Estadísticas por Instrumento</h3>
          <p className="text-xs text-slate-400">Rendimiento detallado por símbolo</p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zen-rich-black/50">
              <th className="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                Instrumento
              </th>
              <th className="text-center py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                Trades
              </th>
              <th className="text-center py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                Win Rate
              </th>
              <th className="text-right py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                PNL Total
              </th>
              <th className="text-right py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                Promedio
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((instrument, index) => (
              <tr
                key={instrument.symbol}
                className={cn(
                  "border-b border-zen-rich-black/30 hover:bg-zen-rich-black-800/50 transition-colors",
                  index % 2 === 0 ? 'bg-zen-rich-black/20' : 'bg-transparent'
                )}
              >
                <td className="py-3 px-4">
                  <div>
                    <p className="font-bold text-white" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {instrument.symbol}
                    </p>
                    <p className="text-xs text-slate-500">{instrument.name}</p>
                  </div>
                </td>
                <td className="text-center py-3 px-4">
                  <span className="text-sm font-semibold text-slate-300">
                    {instrument.totalTrades}
                  </span>
                  <div className="text-xs mt-1">
                    <span className="text-emerald-400">{instrument.winningTrades}W</span>
                    <span className="text-slate-600 mx-1">/</span>
                    <span className="text-rose-400">{instrument.losingTrades}L</span>
                  </div>
                </td>
                <td className="text-center py-3 px-4">
                  <div className="inline-flex items-center gap-2">
                    <span
                      className={cn(
                        "text-sm font-bold",
                        instrument.winRate >= 50 ? 'text-emerald-400' : 'text-rose-400'
                      )}
                      style={{ fontFamily: 'JetBrains Mono, monospace' }}
                    >
                      {instrument.winRate.toFixed(1)}%
                    </span>
                    <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full transition-all",
                          instrument.winRate >= 50 ? 'bg-emerald-500' : 'bg-rose-500'
                        )}
                        style={{ width: `${instrument.winRate}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="text-right py-3 px-4">
                  <span
                    className={cn(
                      "text-sm font-bold",
                      instrument.totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    )}
                    style={{ fontFamily: 'JetBrains Mono, monospace' }}
                  >
                    {instrument.totalPnl >= 0 ? '+' : ''}${instrument.totalPnl.toFixed(2)}
                  </span>
                </td>
                <td className="text-right py-3 px-4">
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      instrument.averagePnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    )}
                    style={{ fontFamily: 'JetBrains Mono, monospace' }}
                  >
                    {instrument.averagePnl >= 0 ? '+' : ''}${instrument.averagePnl.toFixed(2)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
