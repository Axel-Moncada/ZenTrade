'use client';

import { track } from '@/lib/analytics/track';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n/context';
import { Check, ExternalLink, AlertTriangle, CheckCircle2, Clock, XCircle, Tag, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { enUS, es } from 'date-fns/locale';
import { CheckoutSuccessModal } from '@/components/billing/checkout-success-modal';
import type { PlanConfig, ActiveSubscription } from '@/app/dashboard/billing/page';
import { TrustBadgesCompact } from '@/components/shared/trust-badges';

interface Props {
  plans: PlanConfig[];
  subscription: ActiveSubscription;
  successParam?: string;
  canceledParam?: string;
  /** PayPal agrega ?subscription_id=I-... al return_url después de aprobar */
  paypalSubscriptionId?: string;
}

const PLAN_NAME_MAP: Record<string, string> = {
  starter: 'Starter',
  pro: 'Professional',
  zenmode: 'ZenMode',
};

const STATUS_MAP: Record<string, { label: { es: string; en: string }; className: string }> = {
  active:    { label: { es: 'Activa',         en: 'Active' },          className: 'text-zen-caribbean-green' },
  on_trial:  { label: { es: 'En prueba',      en: 'On trial' },        className: 'text-zen-caribbean-green' },
  past_due:  { label: { es: 'Pago pendiente', en: 'Payment past due' }, className: 'text-zen-danger' },
  cancelled: { label: { es: 'Cancelada',      en: 'Cancelled' },       className: 'text-stone-400' },
};

const COPY = {
  es: {
    title: 'Facturación',
    subtitle: 'Administra tu suscripción y método de pago',
    codeApplied: (pct: number) => `Código aplicado: ${pct}% de descuento`,
    codeInvalid: 'Código inválido',
    codeInvalidDesc: 'El código no existe o está inactivo',
    unknownError: 'Error desconocido',
    paymentError: 'Error al procesar pago',
    tryAgain: 'Intenta de nuevo',
    portalUnavailable: 'Portal no disponible',
    portalUnavailableDesc: 'Contacta a soporte para gestionar tu suscripción.',
    cancelledToast: 'Suscripción cancelada',
    cancelledToastDesc: 'Tu plan seguirá activo hasta el fin del período de facturación.',
    cancelError: 'Error al cancelar',
    cancelErrorDesc: 'Intenta de nuevo o contacta soporte.',
    cancelTitle: '¿Cancelar suscripción?',
    cancelBody: 'Tu plan seguirá activo hasta el fin del período actual de facturación. Después pasarás al plan gratuito y perderás acceso a las funciones premium.',
    keep: 'Mantener suscripción',
    cancelling: 'Cancelando...',
    confirmCancel: 'Sí, cancelar',
    checkoutCanceled: 'Pago cancelado — puedes suscribirte cuando quieras.',
    cycle: 'Ciclo',
    monthly: 'Mensual',
    annual: 'Anual',
    nextCharge: 'Próximo cobro',
    dateFormat: "d 'de' MMMM yyyy",
    pastDue: 'Pago fallido. Actualiza tu método de pago para evitar la suspensión.',
    manageBilling: 'Administrar facturación',
    cancelPlan: 'Cancelar plan',
    availablePlans: 'Planes disponibles',
    choosePlan: 'Elige tu plan',
    codeLabel: 'Código',
    codeAppliedInline: 'aplicado',
    off: 'de descuento',
    codePlaceholder: '¿Tienes un código de descuento?',
    apply: 'Aplicar',
    perMonth: 'USD/mes',
    billedAnnually: (price: number) => `Facturado $${price} USD al año`,
    currentPlan: 'Plan actual',
    comingSoon: 'Próximamente',
    processing: 'Procesando...',
    switchPlan: 'Cambiar a este plan',
    startNow: 'Comenzar ahora',
  },
  en: {
    title: 'Billing',
    subtitle: 'Manage your subscription and payment method',
    codeApplied: (pct: number) => `Code applied: ${pct}% off`,
    codeInvalid: 'Invalid code',
    codeInvalidDesc: 'This code does not exist or is inactive',
    unknownError: 'Unknown error',
    paymentError: 'Could not process the payment',
    tryAgain: 'Please try again',
    portalUnavailable: 'Portal unavailable',
    portalUnavailableDesc: 'Contact support to manage your subscription.',
    cancelledToast: 'Subscription cancelled',
    cancelledToastDesc: 'Your plan stays active until the end of the billing period.',
    cancelError: 'Could not cancel',
    cancelErrorDesc: 'Please try again or contact support.',
    cancelTitle: 'Cancel your subscription?',
    cancelBody: 'Your plan stays active until the end of the current billing period. After that you will move to the Free plan and lose access to premium features.',
    keep: 'Keep subscription',
    cancelling: 'Cancelling...',
    confirmCancel: 'Yes, cancel',
    checkoutCanceled: 'Checkout cancelled. You can subscribe any time.',
    cycle: 'Billing',
    monthly: 'Monthly',
    annual: 'Annual',
    nextCharge: 'Next charge',
    dateFormat: 'MMMM d, yyyy',
    pastDue: 'Payment failed. Update your payment method to avoid suspension.',
    manageBilling: 'Manage billing',
    cancelPlan: 'Cancel plan',
    availablePlans: 'Available plans',
    choosePlan: 'Choose your plan',
    codeLabel: 'Code',
    codeAppliedInline: 'applied',
    off: 'off',
    codePlaceholder: 'Have a discount code?',
    apply: 'Apply',
    perMonth: 'USD/mo',
    billedAnnually: (price: number) => `Billed $${price} USD per year`,
    currentPlan: 'Current plan',
    comingSoon: 'Coming soon',
    processing: 'Processing...',
    switchPlan: 'Switch to this plan',
    startNow: 'Get started',
  },
} as const;

export default function BillingDashboard({ plans, subscription, successParam, canceledParam, paypalSubscriptionId }: Props) {
  const router = useRouter();
  const { locale } = useI18n();
  const isEs = locale === 'es';
  const c = COPY[locale];
  const [interval, setInterval] = useState<'month' | 'year'>('month');
  const [loadingSlug, setLoadingSlug] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(successParam === 'true');
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [affiliateInput, setAffiliateInput] = useState('');
  const [appliedCode, setAppliedCode] = useState<{ code: string; discount_percent: number } | null>(null);
  const [validatingCode, setValidatingCode] = useState(false);

  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const confirmStarted = useRef(false);

  // Al volver de PayPal: confirmar la suscripción en el servidor (no depende solo del webhook)
  useEffect(() => {
    if (successParam !== 'true' || !paypalSubscriptionId || confirmStarted.current) return;
    confirmStarted.current = true;
    setConfirmingPayment(true);
    fetch('/api/paypal/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription_id: paypalSubscriptionId }),
    })
      .then(async res => {
        if (res.ok) {
          const data = await res.json().catch(() => ({})) as { plan?: string; interval?: string; value?: number };
          // transaction_id = ID de PayPal: GA4 descarta duplicados si el usuario recarga
          track('purchase', {
            transaction_id: paypalSubscriptionId,
            value: data.value,
            currency: 'USD',
            plan: data.plan,
            interval: data.interval,
          });
          router.refresh();
          return;
        }
        const data = await res.json().catch(() => ({})) as { reason?: string };
        if (data.reason === 'NOT_ACTIVE') {
          // PayPal aún está procesando: el webhook la activará en unos minutos
          toast.info(isEs ? 'Tu pago se está procesando. Tu plan se activará en unos minutos.' : 'Your payment is processing. Your plan will be active in a few minutes.');
        } else {
          toast.error(isEs ? 'No pudimos confirmar tu pago automáticamente. Escríbenos y lo activamos de inmediato.' : "We couldn't confirm your payment automatically. Contact us and we'll activate it right away.");
        }
      })
      .catch(() => {
        toast.error(isEs ? 'No pudimos confirmar tu pago automáticamente. Escríbenos y lo activamos de inmediato.' : "We couldn't confirm your payment automatically. Contact us and we'll activate it right away.");
      })
      .finally(() => setConfirmingPayment(false));
  }, [successParam, paypalSubscriptionId, router, isEs]);

  // Limpiar los params de la URL sin recargar
  useEffect(() => {
    if (successParam === 'true' || canceledParam === 'true') {
      const url = new URL(window.location.href);
      url.searchParams.delete('success');
      url.searchParams.delete('canceled');
      url.searchParams.delete('subscription_id');
      url.searchParams.delete('ba_token');
      url.searchParams.delete('token');
      window.history.replaceState({}, '', url.toString());
    }
  }, [successParam, canceledParam]);

  const activeSub = cancelled ? null : subscription;
  const activePlanSlug = activeSub?.plan_key ?? null;
  const statusInfo = activeSub
    ? (STATUS_MAP[activeSub.status] ?? { label: { es: activeSub.status, en: activeSub.status }, className: 'text-stone-400' })
    : null;

  // ── Código de afiliado ─────────────────────────────────────────────────────

  async function handleApplyCode() {
    if (!affiliateInput.trim()) return;
    setValidatingCode(true);
    try {
      const res = await fetch(`/api/affiliate/validate?code=${encodeURIComponent(affiliateInput.trim())}`);
      const data = await res.json() as { valid: boolean; code?: string; discount_percent?: number; error?: string };
      if (data.valid && data.code && data.discount_percent !== undefined) {
        setAppliedCode({ code: data.code, discount_percent: data.discount_percent });
        setAffiliateInput('');
        toast.success(c.codeApplied(data.discount_percent));
      } else {
        toast.error(c.codeInvalid, { description: data.error ?? c.codeInvalidDesc });
      }
    } finally {
      setValidatingCode(false);
    }
  }

  // ── Checkout ───────────────────────────────────────────────────────────────

  async function handleCheckout(plan: PlanConfig) {
    const apiInterval = interval === 'month' ? 'monthly' : 'annual';
    setLoadingSlug(plan.slug);
    track('begin_checkout', { plan: plan.slug, interval: apiInterval, currency: 'USD' });
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan:           plan.slug,
          interval:       apiInterval,
          affiliate_code: appliedCode?.code,
        }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? c.unknownError);
      window.location.href = data.url!;
    } catch (err) {
      toast.error(c.paymentError, {
        description: err instanceof Error ? err.message : c.tryAgain,
      });
      setLoadingSlug(null);
    }
  }

  function openPortal() {
    if (subscription?.customer_portal_url) {
      window.open(subscription.customer_portal_url, '_blank');
    } else {
      toast.error(c.portalUnavailable, {
        description: c.portalUnavailableDesc,
      });
    }
  }

  async function handleCancel() {
    setCancelling(true);
    try {
      const res = await fetch('/api/billing/cancel', { method: 'POST' });
      const data = await res.json() as { success?: boolean; error?: string };
      if (!res.ok) throw new Error(data.error ?? c.unknownError);
      setCancelled(true);
      setShowCancelDialog(false);
      toast.success(c.cancelledToast, {
        description: c.cancelledToastDesc,
      });
    } catch (err) {
      toast.error(c.cancelError, {
        description: err instanceof Error ? err.message : c.cancelErrorDesc,
      });
    } finally {
      setCancelling(false);
    }
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  function displayPrice(plan: PlanConfig): string {
    const base = interval === 'month'
      ? plan.price_monthly
      : Math.round((plan.price_annual / 12) * 100) / 100;
    if (appliedCode?.discount_percent) {
      return String(Math.round(base * (1 - appliedCode.discount_percent / 100) * 100) / 100);
    }
    return String(base);
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-zen-anti-flash">{c.title}</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
          {c.subtitle}
        </p>
      </div>

      {/* ── Dialog confirmación cancelación ── */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{c.cancelTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {c.cancelBody}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelling}>{c.keep}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={cancelling}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {cancelling ? c.cancelling : c.confirmCancel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Modal de éxito con confeti ── */}
      {showSuccess && (
        <CheckoutSuccessModal
          subscription={subscription}
          onClose={() => setShowSuccess(false)}
        />
      )}

      {/* ── Confirmando pago de PayPal ── */}
      {confirmingPayment && (
        <div className="rounded-xl border border-zen-caribbean-green/30 bg-zen-surface/40 px-5 py-3 text-sm text-zen-anti-flash/80">
          {isEs ? 'Confirmando tu pago con PayPal…' : 'Confirming your PayPal payment…'}
        </div>
      )}

      {/* ── Canceled notice ── */}
      {canceledParam === 'true' && (
        <div className="rounded-xl border border-zen-anti-flash/10 bg-zen-surface/40 px-5 py-3 text-sm text-zen-anti-flash/60">
          {c.checkoutCanceled}
        </div>
      )}

      {/* ── Active subscription banner ── */}
      {activeSub && (
        <div
          className="rounded-xl border p-5 flex flex-col sm:flex-row sm:items-center gap-4"
          style={{ background: '#002E21', borderColor: '#0F5132' }}
        >
          <div className="flex-1 space-y-1">
            <div className="flex items-center flex-wrap gap-2">
              <span className="text-zen-anti-flash font-semibold text-base">
                {PLAN_NAME_MAP[activeSub.plan_key] ?? activeSub.plan_key}
              </span>
              {statusInfo && (
                <span className={`text-xs font-medium ${statusInfo.className}`}>
                  · {statusInfo.label[locale]}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-4 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
              <span>
                {c.cycle}: {activeSub.billing_interval === 'monthly' ? c.monthly : c.annual}
              </span>
              {activeSub.current_period_end && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {c.nextCharge}:{' '}
                  {format(new Date(activeSub.current_period_end), c.dateFormat, { locale: isEs ? es : enUS })}
                </span>
              )}
            </div>

            {activeSub.status === 'past_due' && (
              <p className="flex items-center gap-1.5 text-xs text-zen-danger mt-1">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                {c.pastDue}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {activeSub.customer_portal_url && (
              <Button
                onClick={openPortal}
                variant="outline"
                className="border-zen-forest text-zen-anti-flash hover:bg-zen-surface-elevated"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                {c.manageBilling}
              </Button>
            )}
            <Button
              onClick={() => setShowCancelDialog(true)}
              variant="ghost"
              className="text-red-400 hover:text-red-300 hover:bg-red-950/30"
            >
              <XCircle className="w-4 h-4 mr-2" />
              {c.cancelPlan}
            </Button>
          </div>
        </div>
      )}

      {/* ── Plans ── */}
      <div>

        {/* ── Interval toggle + heading ── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-zen-anti-flash">
          {activeSub ? c.availablePlans : c.choosePlan}
        </h2>

        <div
          className="flex items-center gap-1 rounded-lg p-1"
          style={{ background: '#002E21', border: '1px solid #0F5132' }}
        >
          {(['month', 'year'] as const).map((iv) => (
            <button
              key={iv}
              onClick={() => setInterval(iv)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-1.5 ${
                interval === iv ? 'font-semibold' : ''
              }`}
              style={
                interval === iv
                  ? { background: '#00C17C', color: '#001B1F' }
                  : { color: 'rgba(255,255,255,0.6)' }
              }
            >
              {iv === 'month' ? c.monthly : c.annual}
              {iv === 'year' && (
                <span
                  className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                  style={{
                    background: interval === 'year' ? 'rgba(0,27,31,0.3)' : 'rgba(0,193,124,0.15)',
                    color: interval === 'year' ? '#001B1F' : '#00C17C',
                  }}
                >
                  -20%
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Código de afiliado (solo si no tiene suscripción activa) ── */}
      {!activeSub && (
        <div className="mt-4  mb-16">
          {appliedCode ? (
            <div
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium"
              style={{ background: 'rgba(0,193,124,0.1)', border: '1px solid rgba(0,193,124,0.3)', color: '#00C17C' }}
            >
              <Tag className="w-4 h-4" />
              {c.codeLabel} <span className="font-mono">{appliedCode.code}</span> {c.codeAppliedInline} · {appliedCode.discount_percent}% {c.off}
              <button
                onClick={() => setAppliedCode(null)}
                className="ml-1 hover:opacity-70 transition-opacity"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 max-w-sm">
              <input
                type="text"
                value={affiliateInput}
                onChange={(e) => setAffiliateInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && void handleApplyCode()}
                placeholder={c.codePlaceholder}
                className="flex-1 px-3 py-2 text-sm rounded-lg text-zen-anti-flash font-mono placeholder:font-sans placeholder:normal-case"
                style={{
                  background:  '#002E21',
                  border:      '1px solid rgba(255,255,255,0.1)',
                  outline:     'none',
                }}
              />
              <button
                onClick={() => void handleApplyCode()}
                disabled={validatingCode || !affiliateInput.trim()}
                className="px-3 py-2 text-sm rounded-lg font-medium transition-colors disabled:opacity-40"
                style={{ background: '#006A4E', color: '#F2F3F4', border: '1px solid #0F5132' }}
              >
                {validatingCode ? '...' : c.apply}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Plan cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => {
          const isCurrentPlan = activePlanSlug === plan.slug;
          const isLoading = loadingSlug === plan.slug;

          return (
            <div
              key={plan.slug}
              className="relative flex flex-col rounded-xl p-5"
              style={{
                background: '#002E21',
                border: plan.highlight
                  ? '1px solid #00C17C'
                  : isCurrentPlan
                  ? '1px solid #3DBB8F'
                  : '1px solid rgba(255,255,255,0.05)',
                boxShadow: plan.highlight ? '0 0 24px rgba(0,193,124,0.12)' : undefined,
              }}
            >
              {/* Badge */}
              {plan.badge && (
                <span
                  className="absolute -top-3 left-4 text-xs font-semibold px-2.5 py-0.5 rounded-full"
                  style={
                    plan.highlight
                      ? { background: '#00C17C', color: '#001B1F' }
                      : plan.disabled
                      ? { background: '#006A4E', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.05)' }
                      : { background: '#002E21', color: '#3DBB8F', border: '1px solid #0F5132' }
                  }
                >
                  {plan.badge[locale]}
                </span>
              )}

              {/* Pricing */}
              <div className="mt-2 mb-4 space-y-0.5">
                <h3 className="font-semibold text-zen-anti-flash">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-semibold text-zen-anti-flash">
                    ${displayPrice(plan)}
                  </span>
                  <span className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    {c.perMonth}
                  </span>
                </div>
                {interval === 'year' && (
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    {c.billedAnnually(plan.price_annual)}
                  </p>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-2 flex-1 mb-5">
                {plan.features[locale].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#00C17C' }} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {isCurrentPlan ? (
                <div className="flex items-center justify-center gap-1.5 py-2 text-sm font-medium" style={{ color: '#00C17C' }}>
                  <CheckCircle2 className="w-4 h-4" />
                  {c.currentPlan}
                </div>
              ) : plan.disabled ? (
                <Button
                  disabled
                  variant="outline"
                  className="w-full"
                  style={{ borderColor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }}
                >
                  {c.comingSoon}
                </Button>
              ) : activeSub ? (
                <Button
                  onClick={() => handleCheckout(plan)}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full border-zen-forest/50 text-zen-anti-flash/70 hover:border-zen-forest hover:text-zen-anti-flash"
                >
                  {isLoading ? c.processing : c.switchPlan}
                </Button>
              ) : (
                <Button
                  onClick={() => handleCheckout(plan)}
                  disabled={isLoading}
                  className="w-full font-semibold"
                  style={
                    plan.highlight
                      ? { background: '#00C17C', color: '#001B1F' }
                      : { background: '#006A4E', color: '#F2F3F4', border: '1px solid #0F5132' }
                  }
                >
                  {isLoading ? c.processing : c.startNow}
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {/* Trust strip */}
      <div
        className="mt-6 rounded-xl px-6 py-4"
        style={{ background: 'rgba(0,46,33,0.3)', border: '1px solid rgba(0,193,124,0.1)' }}
      >
        <TrustBadgesCompact locale={locale} />
      </div>
      </div>{/* /plans */}
    </div>
  );
}
