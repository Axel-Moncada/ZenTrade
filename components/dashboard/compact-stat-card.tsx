'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CompactStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend: 'positive' | 'negative' | 'neutral';
  progress?: number; // 0-100 para barra de progreso
  delay?: number;
}

export function CompactStatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  progress,
  delay = 0
}: CompactStatCardProps) {
  const colors = {
    positive: {
      border: 'border-zen-caribbean-green/30',
      bg: 'bg-zen-caribbean-green/5',
      icon: 'text-zen-caribbean-green',
      text: 'text-zen-caribbean-green',
      progress: 'bg-zen-caribbean-green'
    },
    negative: {
      border: 'border-zen-danger/30',
      bg: 'bg-zen-danger/5',
      icon: 'text-zen-danger',
      text: 'text-zen-danger',
      progress: 'bg-zen-danger'
    },
    neutral: {
      border: 'border-zen-',
      bg: 'bg-zen-stone/5',
      icon: 'text-zen-stone',
      text: 'text-zen-anti-flash/70',
      progress: 'bg-zen-stone'
    }
  };

  const style = colors[trend];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        "relative overflow-hidden rounded-lg",
        "backdrop-blur-sm border",
        "transition-all duration-200 p-4",
        style.bg,
        style.border
      )}
    >
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium text-zen-anti-flash/60 uppercase tracking-wide">
            {title}
          </p>
          <Icon className={cn("h-5 w-5", style.icon)} strokeWidth={2} />
        </div>

        <p className={cn("text-2xl font-bold mb-2", style.text)}
           style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          {value}
        </p>

        {subtitle && (
          <p className="text-xs text-zen-anti-flash/70 font-medium">
            {subtitle}
          </p>
        )}

        {/* Progress bar */}
        {progress !== undefined && (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-zen-anti-flash/60 font-medium">% del total</span>
              <span className={cn("text-[10px] font-bold", style.text)}>{progress.toFixed(1)}%</span>
            </div>
            <div className="h-1 bg-zen-surface/60 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ delay: delay + 0.2, duration: 0.8, ease: "easeOut" }}
                className={cn("h-full rounded-full", style.progress)}
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
