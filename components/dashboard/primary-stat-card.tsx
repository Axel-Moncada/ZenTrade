'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PrimaryStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend: 'positive' | 'negative' | 'neutral';
  progress?: number; // 0-100 para barra de progreso
  delay?: number;
}

export function PrimaryStatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  progress,
  delay = 0
}: PrimaryStatCardProps) {
  const colors = {
    positive: {
      border: 'border-zen-caribbean-green/40',
      bg: 'bg-zen-caribbean-green/10',
      icon: 'bg-zen-caribbean-green/20 text-zen-caribbean-green',
      text: 'text-zen-caribbean-green',
      glow: 'shadow-zen-caribbean-green/20',
      progress: 'bg-zen-caribbean-green'
    },
    negative: {
      border: 'border-zen-danger/40',
      bg: 'bg-zen-danger/10',
      icon: 'bg-zen-danger/20 text-zen-danger',
      text: 'text-zen-danger',
      glow: 'shadow-zen-danger/20',
      progress: 'bg-zen-danger'
    },
    neutral: {
      border: 'border-zen-forest',
      bg: 'bg-zen-stone/10',
      icon: 'bg-zen-stone/20 text-zen-stone',
      text: 'text-zen-anti-flash/70',
      glow: 'shadow-zen-stone/20',
      progress: 'bg-zen-stone'
    }
  };

  const style = colors[trend];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={cn(
        "group relative overflow-hidden rounded-xl",
        "backdrop-blur-sm border",
        "transition-all duration-300 p-5",
        style.bg,
        style.border
      )}
    >
      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-xs font-semibold text-zen-anti-flash/60 uppercase tracking-wider mb-2">
              {title}
            </p>
            <motion.p
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: delay + 0.1, type: "spring" }}
              className={cn("text-3xl font-bold tracking-tight", style.text)}
              style={{ fontFamily: 'JetBrains Mono, monospace' }}
            >
              {value}
            </motion.p>
          </div>

          <div className={cn("p-2.5 rounded-lg flex-shrink-0", style.icon)}>
            <Icon className="h-5 w-5" strokeWidth={2} />
          </div>
        </div>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-sm text-zen-anti-flash/70 font-medium mb-4">
            {subtitle}
          </p>
        )}

        {/* Progress bar */}
        {progress !== undefined && (
          <div className="pt-4 border-t border-zen-forest/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-zen-anti-flash/60 font-medium">Tasa de éxito</span>
              <span className={cn("text-xs font-bold", style.text)}>{progress}%</span>
            </div>
            <div className="h-1.5 bg-zen-surface rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ delay: delay + 0.3, duration: 1, ease: "easeOut" }}
                className={cn("h-full rounded-full", style.progress)}
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
