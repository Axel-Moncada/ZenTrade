'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Account } from '@/types/accounts';
import { DashboardStats, DateRange } from '@/types/dashboard';
import { AccountSelector } from '@/components/accounts/account-selector';
import { DateRangeSelector } from '@/components/dashboard/date-range-selector';
import { HeroStatsCard } from '@/components/dashboard/hero-stats-card';
import { PrimaryStatCard } from '@/components/dashboard/primary-stat-card';
import { CompactStatCard } from '@/components/dashboard/compact-stat-card';
import { EquityCurveChart } from '@/components/dashboard/equity-curve-chart';
import { WinsLossesChart } from '@/components/dashboard/wins-losses-chart';
import { EmotionsChart } from '@/components/dashboard/emotions-chart';
import { ExitReasonsChart } from '@/components/dashboard/exit-reasons-chart';
import { PlanAdherenceChart } from '@/components/dashboard/plan-adherence-chart';
import { InstrumentStatsTable } from '@/components/dashboard/instrument-stats-table';
import { AccountsProgress } from '@/components/dashboard/accounts-progress';
import {
  Target,
  BarChart3,
  TrendingUp,
  Award,
  TrendingDown,
  Flame,
  Sun,
  CloudRain,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n/context';
import { FreePlanWelcome } from '@/components/shared/free-plan-welcome';

export default function DashboardPage() {
  const { t } = useI18n();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: getDefaultStartDate(),
    endDate: getDefaultEndDate(),
    label: t.dashboard.lastDays(30)
  });
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAccounts = useCallback(async () => {
    try {
      const response = await fetch('/api/accounts');
      if (response.ok) {
        const data = await response.json();
        setAccounts(data.accounts || []);

        // Seleccionar la primera cuenta por defecto
        if (data.accounts && data.accounts.length > 0) {
          setSelectedAccount(data.accounts[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    if (!selectedAccount) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        account_id: selectedAccount,
        start_date: dateRange.startDate,
        end_date: dateRange.endDate
      });

      const response = await fetch(`/api/dashboard/stats?${params}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedAccount, dateRange]);

  // Cargar cuentas
  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // Cargar stats cuando cambia cuenta o rango de fechas
  useEffect(() => {
    if (selectedAccount) {
      fetchStats();
    }
  }, [selectedAccount, fetchStats]);

  // Renderizar estado vacío
  if (!selectedAccount || accounts.length === 0) {
    return (
      <div className="min-h-screen bg-{#031200} flex flex-col p-6 gap-6">
        <FreePlanWelcome />
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zen-surface/60 backdrop-blur-sm rounded-2xl border border-zen-forest/40 p-12 text-center max-w-md"
          >
            <Activity className="h-16 w-16 text-zen-caribbean-green/60 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-zen-anti-flash mb-3">
              {t.dashboard.noAccounts}
            </h2>
            <p className="text-zen-anti-flash/70 mb-8">
              {t.dashboard.noAccountsDesc}
            </p>
            <Link
              href="/dashboard/accounts/new"
              className="inline-flex items-center px-6 py-3 bg-zen-caribbean-green hover:bg-zen-mountain-meadow text-zen-rich-black font-semibold rounded-lg transition-colors"
            >
              {t.dashboard.createFirst}
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  // Renderizar loading
  if (loading || !stats) {
    return (
      <div className="min-h-screen bg-zen-rich-black">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header skeleton */}
          <div className="flex items-center justify-between">
            <div className="h-10 w-48 bg-zen-surface rounded-lg animate-pulse" />
            <div className="h-10 w-64 bg-zen-surface rounded-lg animate-pulse" />
          </div>

          {/* Hero card skeleton */}
          <div className="h-64 bg-zen-surface rounded-2xl animate-pulse" />

          {/* Primary stats skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 bg-zen-surface rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Determinar si hay alerta de 30%
  const has30PercentAlert = stats.bestDay ? (stats.bestDay.percentOfTotal ?? 0) > 30 : false;

  return (
    <div className="min-h-screen bg-zen-rich-black">
      <div className="max-w-8xl mx-auto space-y-8">
        {/* Banner de bienvenida — solo plan free, dismissible */}
        <FreePlanWelcome />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-zen-anti-flash">
              {t.dashboard.title}
            </h1>
            <p className="text-sm text-zen-anti-flash/60">
              {t.dashboard.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-card rounded-lg border border-border px-4 py-3 text-zen-caribbean-green">
            <AccountSelector
              accounts={accounts}
              value={selectedAccount || ''}
              onValueChange={setSelectedAccount}
              showLabel={false}
              
            />
            <DateRangeSelector value={dateRange} onChange={setDateRange} />
          </div>
        </motion.div>

        {/* Layout 2 columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6">
          {/* COLUMNA IZQUIERDA: Métricas */}
          <div className="space-y-4">
            {/* Hero: PNL Total */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "relative overflow-hidden rounded-2xl backdrop-blur-sm border p-6",
                stats.totalPnl >= 0
                  ? "bg-zen-caribbean-green/10 border-zen-caribbean-green/30"
                  : "bg-zen-danger/10 border-zen-danger/30"
              )}
            >
              <div className="relative">
                <div className="flex items-center gap-2 mb-4">
                  <div className={cn(
                    "w-2 h-2 rounded-full animate-pulse",
                    stats.totalPnl >= 0 ? "bg-zen-caribbean-green" : "bg-zen-danger"
                  )} />
                  <span className="text-xs font-semibold text-zen-anti-flash/60 uppercase tracking-wider">
                    {t.dashboard.pnlTotal}
                  </span>
                </div>

                <div className="flex items-baseline gap-3 mb-4">
                  {(stats.totalPnl ?? 0) >= 0 ? (
                    <TrendingUp className="h-8 w-8 text-zen-caribbean-green" strokeWidth={2.5} />
                  ) : (
                    <TrendingDown className="h-8 w-8 text-zen-danger" strokeWidth={2.5} />
                  )}

                  <div
                    className={cn(
                      "text-5xl font-black tracking-tight",
                      (stats.totalPnl ?? 0) >= 0
                        ? "text-zen-caribbean-green"
                        : "text-zen-danger"
                    )}
                    style={{ fontFamily: 'JetBrains Mono, monospace' }}
                  >
                    {(stats.totalPnl ?? 0) >= 0 ? '+' : ''}${Math.abs(stats.totalPnl ?? 0).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-zen-forest/30">
                  <div className={cn(
                    "px-2 py-1 rounded-md text-xs font-bold",
                    (stats.winRate ?? 0) >= 50
                      ? "bg-zen-caribbean-green/20 text-zen-caribbean-green"
                      : "bg-zen-danger/20 text-zen-danger"
                  )}>
                    {(stats.winRate ?? 0).toFixed(1)}% {t.dashboard.winRate}
                  </div>
                  <div className="text-xs text-zen-anti-flash/60">
                    {stats.totalTrades ?? 0} trades
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Métricas Primarias: Grid 2x2 */}
            <div className="grid grid-cols-2 gap-4">
              <PrimaryStatCard
                title={t.dashboard.winRate}
                value={`${(stats.winRate ?? 0).toFixed(1)}%`}
                subtitle={`${stats.winningTrades ?? 0} Win / ${stats.losingTrades ?? 0} Lost`}
                icon={Target}
                trend={(stats.winRate ?? 0) >= 50 ? 'positive' : 'negative'}
                progress={stats.winRate ?? 0}
                delay={0.1}
              />

              <PrimaryStatCard
                title="Profit Factor"
                value={stats.profitFactor === Infinity ? '∞' : (stats.profitFactor ?? 0).toFixed(2)}
                subtitle={`$${(stats.totalGrossWins ?? 0).toFixed(0)} / $${Math.abs(stats.totalGrossLosses ?? 0).toFixed(0)}`}
                icon={Award}
                trend={stats.profitFactor >= 1.5 ? 'positive' : stats.profitFactor >= 1 ? 'neutral' : 'negative'}
                delay={0.2}
              />

              <PrimaryStatCard
                title="Avg/Trade"
                value={`${(stats.averagePerTrade ?? 0) >= 0 ? '+' : ''}$${(stats.averagePerTrade ?? 0).toFixed(0)}`}
                subtitle={`${stats.totalTrades ?? 0} ${t.dashboard.ops}`}
                icon={TrendingUp}
                trend={(stats.averagePerTrade ?? 0) >= 0 ? 'positive' : 'negative'}
                delay={0.3}
              />

              <PrimaryStatCard
                title="Total Trades"
                value={stats.totalTrades}
                  subtitle={`${stats.winningTrades} ${t.dashboard.winners}`}
                icon={BarChart3}
                trend="neutral"
                delay={0.4}
              />
            </div>

            {/* Métricas Secundarias: Grid 3 columnas */}
            <div className="grid grid-cols-3 gap-4">
              <CompactStatCard
                title="Max Gain"
                value={`$${(stats.maxGain ?? 0).toFixed(0)}`}
                icon={Sun}
                trend="positive"
                delay={0.5}
              />

              <CompactStatCard
                title="Max Loss"
                value={`$${Math.abs(stats.maxLoss ?? 0).toFixed(0)}`}
                icon={CloudRain}
                trend="negative"
                delay={0.55}
              />

              <CompactStatCard
                title={t.dashboard.streak}
                value={stats.currentStreak?.count ?? 0}
                subtitle={
                  stats.currentStreak?.type === 'winning'
                    ? '🔥'
                    : stats.currentStreak?.type === 'losing'
                    ? '❄️'
                    : '—'
                }
                icon={Flame}
                trend={
                  stats.currentStreak?.type === 'winning'
                    ? 'positive'
                    : stats.currentStreak?.type === 'losing'
                    ? 'negative'
                    : 'neutral'
                }
                delay={0.6}
              />
            </div>

            {/* Mejor/Peor día */}
            {stats.bestDay && (
              <div className={cn(
                "grid gap-4",
                stats.worstDay ? "grid-cols-2" : "grid-cols-1"
              )}>
                <CompactStatCard
                  title={t.dashboard.bestDay}
                  value={`$${stats.bestDay.pnl.toFixed(0)}`}
                  subtitle={stats.bestDay.date}
                  icon={TrendingUp}
                  trend="positive"
                  progress={stats.bestDay.percentOfTotal}
                  delay={0.65}
                />

                {stats.worstDay && (
                  <CompactStatCard
                    title={t.dashboard.worstDay}
                    value={`$${Math.abs(stats.worstDay.pnl).toFixed(0)}`}
                    subtitle={stats.worstDay.date}
                    icon={TrendingDown}
                    trend="negative"
                    delay={0.7}
                  />
                )}
              </div>
            )}

            {/* Alerta 30% */}
            {has30PercentAlert && stats.bestDay && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.75 }}
                className="relative overflow-hidden rounded-lg bg-zen-pistachio/10 backdrop-blur-sm border border-zen-pistachio/40 p-3"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-zen-pistachio" />
                  <p className="text-xs text-zen-pistachio font-medium">
                    {t.dashboard.bestDayAlert((stats.bestDay.percentOfTotal ?? 0).toFixed(1))}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Gráficos secundarios */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <WinsLossesChart data={stats.winsLossesByDay} />
              <PlanAdherenceChart
                followedPlan={stats.tradesFollowingPlan ?? 0}
                notFollowedPlan={(stats.totalTrades ?? 0) - (stats.tradesFollowingPlan ?? 0)}
                adherenceRate={stats.planAdherenceRate ?? 0}
              />
              <EmotionsChart data={stats.emotionsDistribution} />
              <ExitReasonsChart data={stats.exitReasonsDistribution} />
            </motion.div>
          </div>

          {/* COLUMNA DERECHA: Equity Curve + Tabla */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <EquityCurveChart data={stats.equityCurve} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <InstrumentStatsTable data={stats.instrumentStats} />

              <div className="mt-6">
                <AccountsProgress
                  accounts={accounts}
                  selectedAccountId={selectedAccount}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getDefaultStartDate(): string {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return formatDateToISO(date);
}

function getDefaultEndDate(): string {
  return formatDateToISO(new Date());
}

function formatDateToISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
