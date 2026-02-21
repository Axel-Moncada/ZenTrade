'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { EmotionDistribution } from '@/types/dashboard';
import { Smile } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface EmotionsChartProps {
  data: EmotionDistribution[];
}

const EMOTION_COLORS: Record<string, string> = {
  disciplinado: '#3b82f6',
  confiado: '#10b981',
  paciente: '#14b8a6',
  ansioso: '#eab308',
  miedo: '#f97316',
  codicia: '#ef4444',
  frustrado: '#dc2626',
  'eufórico': '#ec4899',
  revenge_trading: '#b91c1c',
  fomo: '#a855f7'
};

const EMOTION_LABELS: Record<string, string> = {
  disciplinado: 'Disciplinado',
  confiado: 'Confiado',
  paciente: 'Paciente',
  ansioso: 'Ansioso',
  miedo: 'Miedo',
  codicia: 'Codicia',
  frustrado: 'Frustrado',
  'eufórico': 'Eufórico',
  revenge_trading: 'Revenge',
  fomo: 'FOMO'
};

export function EmotionsChart({ data }: EmotionsChartProps) {
  if (data.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border-none shadow-none p-4">
        <div className="flex items-center gap-2 mb-2">
          <Smile className="h-4 w-4 text-purple-400" />
          <h3 className="text-sm font-bold text-white">Emociones</h3>
        </div>
        <div className="h-[200px] flex items-center justify-center text-slate-500 text-xs">
          No hay datos
        </div>
      </div>
    );
  }

  const chartData = data.map(item => ({
    name: EMOTION_LABELS[item.emotion] || item.emotion,
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
                <Smile className="h-3.5 w-3.5 text-zen-caribbean-green" />
              </div>
              <h3 className="text-xs font-bold text-white">Emociones</h3>
            </div>

            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={ (({ percentage }: {name: string; percentage: number}) => `${percentage}%`) as any}
                  outerRadius={60}
                  dataKey="value"
                  fontSize={10}
                  fill="#ffffff"
                >
                  {chartData.map((entry, index) => {
                    const originalEmotion = data[index].emotion;
                    const color = EMOTION_COLORS[originalEmotion] || '#6b7280';
                    return <Cell key={`cell-${index}`} fill={color} stroke="#1e293b" strokeOpacity={0} strokeWidth={4} />;
                  })}
                </Pie>


                <Legend
                  verticalAlign="bottom"
                  height={25}
                  wrapperStyle={{ fontSize: '8px' }}
                  formatter={(value: string) => <span style={{ color: '#cbd5e1' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="font-semibold mb-1">Estado Emocional</p>
          <p className="text-slate-300">Distribución de tus estados emocionales al operar. Identifica patrones emocionales que afectan tu trading.</p>
        </TooltipContent>
      </UITooltip>
    </TooltipProvider>
  );
}
