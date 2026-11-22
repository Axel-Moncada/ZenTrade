import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import BillingDashboard from '@/components/billing/billing-dashboard';

// ── Types exported for Client Component ──────────────────────────────────────

export type PlanConfig = {
  slug: string;
  name: string;
  price_monthly: number;
  price_annual: number;
  features: { es: string[]; en: string[] };
  highlight?: boolean;
  disabled?: boolean;
  badge?: { es: string; en: string };
};

export type ActiveSubscription = {
  plan_key: 'starter' | 'pro' | 'zenmode';
  status: string;
  billing_interval: 'monthly' | 'annual';
  current_period_end: string | null;
  customer_portal_url: string | null;
} | null;

// ── Plan config ───────────────────────────────────────────────────────────────

const PLAN_CONFIGS: PlanConfig[] = [
  {
    slug: 'starter',
    name: 'Starter',
    price_monthly: 9,
    price_annual:  84,
    badge: { es: 'Ideal para Empezar', en: 'Best to Start' },
    features: {
      es: [
        '2 cuentas de trading',
        'Registro manual de trades ilimitado',
        'Dashboard: Win Rate, PnL, Drawdown en tiempo real',
        'Calendario mensual de trades',
        'Export CSV de todos tus trades',
        'Seguimiento de reglas por cuenta (drawdown, límite diario)',
        'Soporte por email',
      ],
      en: [
        '2 trading accounts',
        'Unlimited manual trade logging',
        'Dashboard: win rate, P&L and drawdown in real time',
        'Monthly trade calendar',
        'CSV export of all your trades',
        'Per-account rule tracking (drawdown, daily limit)',
        'Email support',
      ],
    },
  },
  {
    slug: 'pro',
    name: 'Professional',
    price_monthly: 29,
    price_annual:  249,
    highlight: true,
    badge: { es: 'Lo Más Popular', en: 'Most Popular' },
    features: {
      es: [
        'Cuentas ilimitadas',
        'Import CSV automático (Rithmic, NinjaTrader, Tradovate)',
        'Dashboard analítico completo — profit factor, R:R, consistency score',
        'Equity curve con overlay de drawdown límite',
        'Calendario emocional con tags y notas por día',
        'Filtros avanzados por instrumento, sesión, setup y emoción',
        'Trading Plan estructurado por cuenta',
        'Export CSV, PDF y Excel ilimitado',
        'Soporte prioritario',
      ],
      en: [
        'Unlimited accounts',
        'CSV import (Rithmic, NinjaTrader, Tradovate)',
        'Full analytics dashboard: profit factor, R:R, consistency score',
        'Equity curve with drawdown limit overlay',
        'Emotion calendar with daily tags and notes',
        'Advanced filters by instrument, session, setup and emotion',
        'Structured trading plan per account',
        'Unlimited CSV, PDF and Excel export',
        'Priority support',
      ],
    },
  },
  {
    slug: 'zenmode',
    name: 'ZenMode',
    price_monthly: 59,
    price_annual:  499,
    badge: { es: 'Para Traders Serios', en: 'For Serious Traders' },
    features: {
      es: [
        'Todo lo de Professional incluido',
        'Copiloto de Disciplina en vivo durante tu sesión',
        'ZenCoach — tu coach de trading IA (chat diario con contexto completo)',
        'Registro de trades por screenshot vía ZenCoach',
        'Detección de revenge trading en tiempo real',
        'Reporte semanal de trading generado con IA',
        'Radar de mercado semanal con eventos de alto impacto (IA)',
        'Soporte dedicado',
      ],
      en: [
        'Everything in Professional',
        'Live Discipline Copilot during your session',
        'ZenCoach, your AI trading coach (daily chat with full context)',
        'Log trades from a screenshot with ZenCoach',
        'Real-time revenge trading detection',
        'Weekly AI trading report',
        'Weekly Market Radar of high-impact events (AI)',
        'Dedicated support',
      ],
    },
  },
];

// ── Page ─────────────────────────────────────────────────────────────────────

interface PageProps {
  searchParams: Promise<{ success?: string; canceled?: string; subscription_id?: string }>;
}

export default async function BillingPage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const params = await searchParams;

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan_key, status, billing_interval, current_period_end, customer_portal_url')
    .eq('user_id', user.id)
    .in('status', ['active', 'on_trial', 'past_due'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <BillingDashboard
        plans={PLAN_CONFIGS}
        subscription={subscription as ActiveSubscription}
        successParam={params.success}
        canceledParam={params.canceled}
        paypalSubscriptionId={params.subscription_id}
      />
    </div>
  );
}
