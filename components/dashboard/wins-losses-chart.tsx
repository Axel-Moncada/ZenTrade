'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { WinsLossesPoint } from '@/types/dashboard';
import { BarChart3 } from 'lucide-react';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface WinsLossesChartProps {
  data: WinsLossesPoint[];
}

export function WinsLossesChart({ data }: WinsLossesChartProps) {
  if (data.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-zen-bangladesh-green/50 to-zen-dark-green/50 backdrop-blur-sm border-none shadow-none p-4">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="h-4 w-4 text-zen-caribbean-green" />
          <h3 className="text-sm font-bold text-white">W/L por Día</h3>
        </div>
        <div className="h-[200px] flex items-center justify-center text-slate-500 text-xs">
          No hay datos
        </div>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  return (
    <TooltipProvider>
      <UITooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-zen-bangladesh-green/50 to-zen-dark-green/50 backdrop-blur-sm border-none shadow-none p-4 cursor-help">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1 bg-zen-caribbean-green/20 rounded">
                <BarChart3 className="h-3.5 w-3.5 text-zen-caribbean-green" />
              </div>
              <h3 className="text-xs font-bold text-white">Ganadores vs Perdedores</h3>
            </div>

            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={data} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  stroke="#94a3b8"
                  style={{ fontSize: '9px' }}
                  tick={{ fill: '#94a3b8' }}
                />
                <YAxis
                  stroke="#94a3b8"
                  style={{ fontSize: '9px' }}
                  tick={{ fill: '#94a3b8' }}
                />

                <Legend
                  wrapperStyle={{ paddingTop: '8px', fontSize: '9px' }}
                  formatter={(value: string) => {
                    const label = value === 'wins' ? 'Ganadores' : value === 'losses' ? 'Perdedores' : value;
                    return <span style={{ color: '#cbd5e1' }}>{label}</span>;
                  }}
                  iconType="circle"
                />
                <Bar dataKey="wins" fill="#10b981" name="wins" radius={[4, 4, 0, 0]} />
                <Bar dataKey="losses" fill="#ef4444" name="losses" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="font-semibold mb-1">Ganadores vs Perdedores</p>
          <p className="text-slate-300">Distribución diaria de trades ganadores (verde) y perdedores (rojo). Te ayuda a identificar patrones de rendimiento por día.</p>
        </TooltipContent>
      </UITooltip>
    </TooltipProvider>
  );
}
