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

// Precios en USD — el cobro se hace en COP vía Wompi (~4,200 COP/USD)
const PLAN_CONFIGS: PlanConfig[] = [
  {
    slug: 'starter',
    name: 'Starter',
    price_monthly: 9,
    price_annual:  84,
    badge: 'Ideal para Empezar',
    features: [
      '2 Cuentas de Trading',
      'Registro manual de trades (ilimitado)',
      'Dashboard básico: Win Rate, PnL, Drawdown',
      'Calendario de trades',
      'Export CSV',
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
      'Dashboard analítico completo (todos los KPIs)',
      'Trading Plan exportable en PDF',
      'Calendario con notas emocionales y tags',
      'Filtros avanzados por instrumento, sesión y setup',
      'Equity curve + análisis de distribución',
      'Export CSV/PDF/Excel ilimitado',
      'Soporte prioritario',
    ],
  },
  {
    slug: 'zenmode',
    name: 'ZenMode',
    price_monthly: 59,
    price_annual:  499,
    disabled: true,
    badge: 'Próximamente',
    features: [
      'Todo en Professional +',
      'Detección de revenge trading en tiempo real (IA)',
      'Alertas de reglas de riesgo (daily loss, position size)',
      'Reporte semanal automático por email',
      'Análisis de horario óptimo de trading (IA)',
      'Benchmark vs. requisitos de prop firms',
      'Coaching 1-a-1 mensual (30 min)',
      'Soporte dedicado 24/7',
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
