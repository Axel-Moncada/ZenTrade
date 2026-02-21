'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { EquityCurvePoint } from '@/types/dashboard';
import { TrendingUp } from 'lucide-react';

interface EquityCurveChartProps {
  data: EquityCurvePoint[];
}

export function EquityCurveChart({ data }: EquityCurveChartProps) {
  if (data.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-zen-bangladesh-green/50 to-zen-dark-green/50 backdrop-blur-sm border-none shadow-none bg-transparent p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-emerald-400" />
          <h3 className="text-lg font-bold text-white">Curva de Capital</h3>
        </div>
        <div className="h-[400px] flex items-center justify-center text-slate-500">
          No hay datos para mostrar
        </div>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  const formatCurrency = (value: number) => {
    return `$${value.toFixed(2)}`;
  };

  // Determinar el color de la línea basado en el resultado final
  const finalPnl = data[data.length - 1]?.cumulativePnl || 0;
  const lineColor = finalPnl >= 0 ? '#10b981' : '#ef4444';
  const gradientColor = finalPnl >= 0 ? '#10b98150' : '#ef444450';

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-zen-bangladesh-green/50 to-zen-dark-green/50 backdrop-blur-sm border border-slate-700/50 p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-emerald-500/20 rounded-lg">
          <TrendingUp className="h-5 w-5 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Curva de Capital</h3>
          <p className="text-xs text-slate-400">Evolución del P&L acumulado</p>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <defs>
            <linearGradient id="colorPnl" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={lineColor} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={lineColor} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            stroke="#64748b"
            style={{ fontSize: '11px' }}
            tick={{ fill: '#64748b' }}
          />
          <YAxis
            tickFormatter={formatCurrency}
            stroke="#64748b"
            style={{ fontSize: '11px' }}
            tick={{ fill: '#64748b' }}
          />
          <Tooltip
            formatter={((value: number) => [`${formatCurrency(value)}`, 'PNL Acumulado']) as any}
            labelFormatter={((label: string) => `Fecha: ${label}`) as any}
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '12px',
              color: '#e2e8f0'
            }}
            itemStyle={{ color: lineColor }}
          />
          <Line
            type="monotone"
            dataKey="cumulativePnl"
            stroke={lineColor}
            strokeWidth={3}
            dot={false}
            fill="url(#colorPnl)"
            activeDot={{ r: 6, fill: lineColor }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
