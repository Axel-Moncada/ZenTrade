import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import BillingDashboard from '@/components/billing/billing-dashboard';

// ── Types exported for Client Component ──────────────────────────────────────

export type PlanConfig = {
  slug: string;
  name: string;
  price_monthly: number;
  price_annual: number;
  features: string[];
  highlight?: boolean;
  disabled?: boolean;
  badge?: string;
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
    badge: 'Ideal para Empezar',
    features: [
      '2 cuentas de trading',
      'Registro manual de trades ilimitado',
      'Dashboard: Win Rate, PnL, Drawdown en tiempo real',
      'Calendario mensual de trades',
      'Export CSV de todos tus trades',
      'Seguimiento de reglas por cuenta (drawdown, límite diario)',
      'Soporte por email',
    ],
  },
  {
    slug: 'pro',
    name: 'Professional',
    price_monthly: 29,
    price_annual:  249,
    highlight: true,
    badge: 'Lo Más Popular',
    features: [
      'Cuentas ilimitadas',
      'Import CSV automático (Rithmic, NinjaTrader, Tradoverse)',
      'Dashboard analítico completo — profit factor, R:R, consistency score',
      'Equity curve con overlay de drawdown límite',
      'Calendario emocional con tags y notas por día',
      'Filtros avanzados por instrumento, sesión, setup y emoción',
      'Trading Plan estructurado por cuenta',
      'Export CSV, PDF y Excel ilimitado',
      'Soporte prioritario',
    ],
  },
  {
    slug: 'zenmode',
    name: 'ZenMode',
    price_monthly: 59,
    price_annual:  499,
    badge: 'Para Traders Serios',
    features: [
      'Todo lo de Professional incluido',
      'ZenCoach — tu coach de trading IA (chat diario con contexto completo)',
      'Registro de trades por screenshot vía ZenCoach',
      'Detección de revenge trading en tiempo real',
      'Reporte semanal de trading generado con IA',
      'Radar de mercado semanal con eventos de alto impacto (IA)',
      'Alertas de reglas de riesgo: daily loss y drawdown',
      'Soporte dedicado',
    ],
  },
];

// ── Page ─────────────────────────────────────────────────────────────────────

interface PageProps {
  searchParams: Promise<{ success?: string; canceled?: string }>;
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
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-zen-anti-flash">Facturación</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
          Administra tu suscripción y método de pago
        </p>
      </div>

      <BillingDashboard
        plans={PLAN_CONFIGS}
        subscription={subscription as ActiveSubscription}
        successParam={params.success}
        canceledParam={params.canceled}
      />
    </div>
  );
}
