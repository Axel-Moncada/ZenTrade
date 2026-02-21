'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { CheckCircle } from 'lucide-react';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface PlanAdherenceChartProps {
  followedPlan: number;
  notFollowedPlan: number;
  adherenceRate: number;
}

const COLORS = {
  followed: '#10b981',
  notFollowed: '#ef4444'
};

export function PlanAdherenceChart({ followedPlan, notFollowedPlan, adherenceRate }: PlanAdherenceChartProps) {
  const totalTrades = followedPlan + notFollowedPlan;

  if (totalTrades === 0) {
    return (
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border-none shadow-none p-4">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="h-4 w-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white">Adherencia al Plan</h3>
        </div>
        <div className="h-[200px] flex items-center justify-center text-slate-500 text-xs">
          No hay datos
        </div>
      </div>
    );
  }

  const data = [
    { name: 'Siguió el plan', value: followedPlan },
    { name: 'No siguió el plan', value: notFollowedPlan }
  ];

  return (
    <TooltipProvider>
      <UITooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-zen-bangladesh-green/50 to-zen-dark-green/50 backdrop-blur-sm border-none shadow-none p-4 cursor-help">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1 bg-emerald-500/20 rounded">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
              </div>
              <h3 className="text-xs font-bold text-white">Adherencia al Plan</h3>
            </div>

            <div className="text-center mb-2">
              <p className="text-2xl font-black text-emerald-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {adherenceRate.toFixed(1)}%
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {followedPlan} de {totalTrades} trades
              </p>
            </div>

            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  paddingAngle={5}
                  dataKey="value"

                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === 0 ? COLORS.followed : COLORS.notFollowed}
                      stroke='none'
                    />
                  ))}
                </Pie>

                <Legend
                  verticalAlign="bottom"
                  height={25}
                  wrapperStyle={{ fontSize: '9px' }}
                  formatter={(value: string) => <span style={{ color: '#cbd5e1' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="font-semibold mb-1">Adherencia al Plan de Trading</p>
          <p className="text-slate-300">Porcentaje de trades donde seguiste tu plan de trading. La disciplina es clave para el éxito consistente.</p>
        </TooltipContent>
      </UITooltip>
    </TooltipProvider>
  );
}
