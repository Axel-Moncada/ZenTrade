'use client';

import { useState, useEffect } from 'react';
import { Check, ExternalLink, AlertTriangle, CheckCircle2, Clock, XCircle } from 'lucide-react';
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
import { es } from 'date-fns/locale';
import { CheckoutSuccessModal } from '@/components/billing/checkout-success-modal';
import type { PlanConfig, ActiveSubscription } from '@/app/dashboard/billing/page';

interface Props {
  plans: PlanConfig[];
  subscription: ActiveSubscription;
  successParam?: string;
  canceledParam?: string;
}

const PLAN_NAME_MAP: Record<string, string> = {
  starter: 'Starter',
  pro: 'Professional',
  zenmode: 'ZenMode',
};

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  active:   { label: 'Activa',        className: 'text-zen-caribbean-green' },
  on_trial: { label: 'En prueba',     className: 'text-zen-caribbean-green' },
  past_due: { label: 'Pago pendiente', className: 'text-zen-danger' },
  cancelled:{ label: 'Cancelada',     className: 'text-stone-400' },
};

export default function BillingDashboard({ plans, subscription, successParam, canceledParam }: Props) {
  const [interval, setInterval] = useState<'month' | 'year'>('month');
  const [loadingSlug, setLoadingSlug] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(successParam === 'true');
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  // Limpiar el param de la URL sin recargar
  useEffect(() => {
    if (successParam === 'true' || canceledParam === 'true') {
      const url = new URL(window.location.href);
      url.searchParams.delete('success');
      url.searchParams.delete('canceled');
      window.history.replaceState({}, '', url.toString());
    }
  }, [successParam, canceledParam]);

  const activeSub = cancelled ? null : subscription;
  const activePlanSlug = activeSub?.plan_key ?? null;
  const statusInfo = activeSub
    ? (STATUS_MAP[activeSub.status] ?? { label: activeSub.status, className: 'text-stone-400' })
    : null;

  // ── Checkout ───────────────────────────────────────────────────────────────

  async function handleCheckout(plan: PlanConfig) {
    const apiInterval = interval === 'month' ? 'monthly' : 'annual';
    setLoadingSlug(plan.slug);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: plan.slug, interval: apiInterval }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Error desconocido');
      window.location.href = data.url!;
    } catch (err) {
      toast.error('Error al procesar pago', {
        description: err instanceof Error ? err.message : 'Intenta de nuevo',
      });
      setLoadingSlug(null);
    }
  }

  function openPortal() {
    if (subscription?.customer_portal_url) {
      window.open(subscription.customer_portal_url, '_blank');
    } else {
      toast.error('Portal no disponible', {
        description: 'Contacta a soporte para gestionar tu suscripción.',
      });
    }
  }

  async function handleCancel() {
    setCancelling(true);
    try {
      const res = await fetch('/api/billing/cancel', { method: 'POST' });
      const data = await res.json() as { success?: boolean; error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Error desconocido');
      setCancelled(true);
      setShowCancelDialog(false);
      toast.success('Suscripción cancelada', {
        description: 'Tu plan seguirá activo hasta el fin del período de facturación.',
      });
    } catch (err) {
      toast.error('Error al cancelar', {
        description: err instanceof Error ? err.message : 'Intenta de nuevo o contacta soporte.',
      });
    } finally {
      setCancelling(false);
    }
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  function displayPrice(plan: PlanConfig) {
    if (interval === 'month') return plan.price_monthly;
    return Math.round((plan.price_annual / 12) * 100) / 100;
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8">

      {/* ── Dialog confirmación cancelación ── */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar suscripción?</AlertDialogTitle>
            <AlertDialogDescription>
              Tu plan seguirá activo hasta el fin del período actual de facturación.
              Después pasarás al plan gratuito y perderás acceso a las funciones premium.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelling}>Mantener suscripción</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={cancelling}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {cancelling ? 'Cancelando...' : 'Sí, cancelar'}
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

      {/* ── Canceled notice ── */}
      {canceledParam === 'true' && (
        <div className="rounded-xl border border-zen-anti-flash/10 bg-zen-surface/40 px-5 py-3 text-sm text-zen-anti-flash/60">
          Pago cancelado — puedes suscribirte cuando quieras.
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
                  · {statusInfo.label}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-4 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
              <span>
                Ciclo: {activeSub.billing_interval === 'monthly' ? 'Mensual' : 'Anual'}
              </span>
              {activeSub.current_period_end && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Próximo cobro:{' '}
                  {format(new Date(activeSub.current_period_end), "d 'de' MMMM yyyy", { locale: es })}
                </span>
              )}
            </div>

            {activeSub.status === 'past_due' && (
              <p className="flex items-center gap-1.5 text-xs text-zen-danger mt-1">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                Pago fallido. Actualiza tu método de pago para evitar la suspensión.
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
                Administrar facturación
              </Button>
            )}
            <Button
              onClick={() => setShowCancelDialog(true)}
              variant="ghost"
              className="text-red-400 hover:text-red-300 hover:bg-red-950/30"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Cancelar plan
            </Button>
          </div>
        </div>
      )}

      {/* ── Interval toggle + heading ── */}
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-zen-anti-flash">
          {activeSub ? 'Planes disponibles' : 'Elige tu plan'}
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
              {iv === 'month' ? 'Mensual' : 'Anual'}
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
                  {plan.badge}
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
                    USD/mes
                  </span>
                </div>
                {interval === 'year' && (
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    Facturado ${plan.price_annual} al año
                  </p>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-2 flex-1 mb-5">
                {plan.features.map((f) => (
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
                  Plan actual
                </div>
              ) : plan.disabled ? (
                <Button
                  disabled
                  variant="outline"
                  className="w-full"
                  style={{ borderColor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }}
                >
                  Próximamente
                </Button>
              ) : activeSub ? (
                <Button
                  disabled
                  variant="outline"
                  className="w-full border-zen-forest/30 text-zen-anti-flash/40"
                >
                  Gestionar desde PayPal
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
                  {isLoading ? 'Procesando...' : 'Comenzar ahora'}
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
