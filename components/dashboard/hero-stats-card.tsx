'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeroStatsCardProps {
  value: number;
  label: string;
  change?: number;
  changeLabel?: string;
}

export function HeroStatsCard({ value, label, change, changeLabel }: HeroStatsCardProps) {
  const isPositive = value >= 0;
  const hasChange = change !== undefined;
  const changeIsPositive = change ? change >= 0 : false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "relative overflow-hidden rounded-2xl backdrop-blur-sm border p-10",
        isPositive
          ? "bg-zen-caribbean-green/10 border-zen-caribbean-green/30"
          : "bg-zen-danger/10 border-zen-danger/30"
      )}
    >
      <div className="relative">
        {/* Label */}
        <div className="flex items-center gap-3 mb-6">
          <div className={cn(
            "w-2 h-2 rounded-full animate-pulse",
            isPositive ? "bg-zen-caribbean-green" : "bg-zen-danger"
          )} />
          <span className="text-sm font-semibold text-zen-anti-flash/60 uppercase tracking-wider">
            {label}
          </span>
        </div>

        {/* Valor principal */}
        <div className="flex items-baseline gap-4 mb-4">
          {isPositive ? (
            <TrendingUp className="h-12 w-12 text-zen-caribbean-green" strokeWidth={2.5} />
          ) : (
            <TrendingDown className="h-12 w-12 text-zen-danger" strokeWidth={2.5} />
          )}

          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className={cn(
              "text-7xl font-black tracking-tight",
              isPositive
                ? "text-zen-caribbean-green"
                : "text-zen-danger"
            )}
            style={{ fontFamily: 'JetBrains Mono, monospace' }}
          >
            {isPositive ? '+' : ''}${Math.abs(value).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </motion.div>
        </div>

        {/* Cambio/Subtítulo */}
        {hasChange && (
          <div className="flex items-center gap-2 pt-4 border-t border-zen-forest/30">
            <div className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold",
              changeIsPositive
                ? "bg-zen-caribbean-green/20 text-zen-caribbean-green"
                : "bg-zen-danger/20 text-zen-danger"
            )}>
              {changeIsPositive ? '+' : ''}{change?.toFixed(2)}%
              <span className="text-xs font-normal opacity-75">{changeLabel}</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
