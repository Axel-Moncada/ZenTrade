'use client';

import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: 'positive' | 'negative' | 'neutral';
  alert?: boolean;
  alertMessage?: string;
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend = 'neutral',
  alert = false,
  alertMessage
}: StatsCardProps) {
  const trendColors = {
    positive: 'text-zen-caribbean-green',
    negative: 'text-zen-danger',
    neutral: 'text-zen-anti-flash/70'
  };

  const bgColors = {
    positive: 'bg-zen-caribbean-green/20',
    negative: 'bg-zen-danger/20',
    neutral: 'bg-zen-stone/20'
  };

  const borderColors = {
    positive: 'border-zen-caribbean-green/40',
    negative: 'border-zen-danger/40',
    neutral: 'border-zen-black/40'
  };

  return (
    <Card className={cn(
      "bg-zen-surface/60 border-zen-forest/40",
      alert && 'bg-zen-pistachio/10 border-zen-pistachio/40'
    )}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-zen-anti-flash/70">{title}</p>
            <p className={cn(`text-3xl font-bold mt-2`, trendColors[trend])}>
              {value}
            </p>
            {subtitle && (
              <p className="text-sm text-zen-anti-flash/60 mt-1">{subtitle}</p>
            )}
            {alert && alertMessage && (
              <div className="mt-2 px-2.5 py-1.5 rounded-md bg-zen-pistachio/20 text-zen-pistachio text-xs font-medium">
                ⚠️ {alertMessage}
              </div>
            )}
          </div>
          <div className={cn("p-3 rounded-lg", bgColors[trend])}>
            <Icon className={cn("h-6 w-6", trendColors[trend])} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
