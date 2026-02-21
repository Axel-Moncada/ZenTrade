import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import BillingDashboard from '@/components/billing/billing-dashboard';

// ── Types exported for Client Component ──────────────────────────────────────

export type PlanConfig = {
  slug: string;
  name: string;
  price_monthly: number;
  price_annual: number;
  monthlyPriceId: string;
  annualPriceId: string;
  features: string[];
  highlight?: boolean;
  disabled?: boolean;
  badge?: string;
};

export type ActiveSubscription = {
  id: string;
  status: string;
  billing_interval: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  plan: {
    slug: string;
    name: string;
    price_monthly: number;
    price_annual: number;
  } | null;
} | null;

export type PaymentRow = {
  id: string;
  amount_cents: number;
  currency: string;
  status: string;
  paid_at: string | null;
  created_at: string;
};

// ── Plan config (server-side env vars — never exposed to client directly) ────

const PLAN_CONFIGS: PlanConfig[] = [
  {
    slug: 'starter',
    name: 'Starter',
    price_monthly: 9,
    price_annual: 86,
    monthlyPriceId: '',
    annualPriceId: '',
    badge: 'Ideal para Empezar',
    features: [
      '1 Cuenta de Trading',
      'Dashboard básico',
      'Métricas esenciales (Win Rate, PnL, Drawdown)',
      'Calendario de trades',
      'Soporte por email',
    ],
  },
  {
    slug: 'professional',
    name: 'Professional',
    price_monthly: 29,
    price_annual: 278,
    monthlyPriceId: '',
    annualPriceId: '',
    highlight: true,
    badge: 'Lo Más Popular',
    features: [
      '3 Cuentas de trading',
      'Import CSV automático',
      'Dashboard analítico completo',
      'Trading Plan PDF exportable',
      'Export CSV/PDF/Excel ilimitado',
      'Soporte prioritario',
    ],
  },
  {
    slug: 'zenmode',
    name: 'ZenMode',
    price_monthly: 59,
    price_annual: 566,
    monthlyPriceId: '',
    annualPriceId:  '',
    disabled: true,
    badge: 'Próximamente',
    features: [
      'Todo en Professional',
      'IA Coach personalizado',
      'Reportes automáticos semanales',
      'Análisis predictivo de patrones',
      'Soporte 24/7',
      'Coaching 1-a-1 mensual',
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
    .select(`
      id,
      status,
      billing_interval,
      current_period_end,
      cancel_at_period_end,
      plan:plans(slug, name, price_monthly, price_annual)
    `)
    .eq('user_id', user.id)
    .in('status', ['active', 'trialing', 'past_due'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: payments } = await supabase
    .from('payments')
    .select('id, amount_cents, currency, status, paid_at, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10);

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
        payments={(payments ?? []) as PaymentRow[]}
        successParam={params.success}
        canceledParam={params.canceled}
      />
    </div>
  );
}
