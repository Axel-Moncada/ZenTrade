'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ExitReasonDistribution } from '@/types/dashboard';
import { Target } from 'lucide-react';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ExitReasonsChartProps {
  data: ExitReasonDistribution[];
}

const EXIT_REASON_COLORS: Record<string, string> = {
  take_profit: '#10b981',
  stop_loss: '#ef4444',
  break_even: '#6b7280',
  manual: '#3b82f6',
  timeout: '#f97316'
};

const EXIT_REASON_LABELS: Record<string, string> = {
  take_profit: 'Take Profit',
  stop_loss: 'Stop Loss',
  break_even: 'Break Even',
  manual: 'Manual',
  timeout: 'Timeout'
};

export function ExitReasonsChart({ data }: ExitReasonsChartProps) {
  if (data.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border-none shadow-none p-4">
        <div className="flex items-center gap-2 mb-2">
          <Target className="h-4 w-4 text-orange-400" />
          <h3 className="text-sm font-bold text-white">Razones de Salida</h3>
        </div>
        <div className="h-[200px] flex items-center justify-center text-slate-500 text-xs">
          No hay datos
        </div>
      </div>
    );
  }

  const chartData = data.map(item => ({
    name: EXIT_REASON_LABELS[item.reason] || item.reason,
    value: item.count,
    percentage: item.percentage
  }));

  return (
    <TooltipProvider>
      <UITooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-zen-bangladesh-green/50 to-zen-dark-green/50 backdrop-blur-sm border-none shadow-none p-4 cursor-help">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1 bg-zen-caribbean-green/20 rounded">
                <Target className="h-3.5 w-3.5 text-zen-caribbean-green" />
              </div>
              <h3 className="text-xs font-bold text-white">Razones de Salida</h3>
            </div>

            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(({ percentage }: {name: string; percentage: number}) => `${percentage}%`) as any}
                  outerRadius={60}
                  dataKey="value"
                  fontSize={10}

                >
                  {chartData.map((entry, index) => {
                    const originalReason = data[index].reason;
                    const color = EXIT_REASON_COLORS[originalReason] || '#6b7280';
                    return <Cell key={`cell-${index}`} fill={color} stroke='none' />;
                  })}
                </Pie>
                <Tooltip
                  formatter={((value: number, name: string, props: {payload: {percentage: number}}) => [
                    `${value} trades (${props.payload.percentage}%)`,
                    name
                  ]) as any}
                  contentStyle={{
                    backgroundColor: '#fff',

                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#262626'
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={10}
                  wrapperStyle={{ fontSize: '8px' }}
                  formatter={(value: string) => <span style={{ color: '#cbd5e1' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="font-semibold mb-1">Razones de Salida del Trade</p>
          <p className="text-slate-300">Muestra cómo cerraste tus trades: TP (ganancia objetivo), SL (stop loss), BE (break even), manual, o timeout. Analiza si estás dejando correr las ganancias o cortando pérdidas adecuadamente.</p>
        </TooltipContent>
      </UITooltip>
    </TooltipProvider>
  );
}
