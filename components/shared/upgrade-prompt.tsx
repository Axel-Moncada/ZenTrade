"use client";

import { useState } from "react";
import { Zap, X, ArrowRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { PlanKey, BillingInterval } from "@/lib/lemonsqueezy/client";
import { useI18n } from "@/lib/i18n/context";

// ─── Configuración visual por plan destino ────────────────────────────────────

const PLAN_META: Record<
  Exclude<PlanKey, "free">,
  { name: string; monthlyPrice: number; annualPrice: number; highlight: { es: string[]; en: string[] } }
> = {
  starter: {
    name: "Starter",
    monthlyPrice: 9,
    annualPrice: 84,
    highlight: {
      es: ["2 cuentas de trading", "Historial ilimitado de trades", "Export CSV"],
      en: ["2 trading accounts", "Unlimited trade history", "CSV export"],
    },
  },
  pro: {
    name: "Professional",
    monthlyPrice: 29,
    annualPrice: 249,
    highlight: {
      es: ["Cuentas ilimitadas", "Dashboard analítico completo", "Import CSV + export PDF/Excel", "Soporte prioritario"],
      en: ["Unlimited accounts", "Full analytics dashboard", "CSV import + PDF/Excel export", "Priority support"],
    },
  },
  zenmode: {
    name: "ZenMode",
    monthlyPrice: 59,
    annualPrice: 499,
    highlight: {
      es: ["Todo lo de Professional", "Copiloto de Disciplina en vivo", "ZenCoach y detección de revenge trading", "Reporte semanal con IA"],
      en: ["Everything in Professional", "Live Discipline Copilot", "ZenCoach and revenge trading detection", "Weekly AI report"],
    },
  },
};

const COPY = {
  es: {
    processingError: "Error al procesar",
    checkoutError: "Error al iniciar el pago",
    tryAgain: "Intenta de nuevo",
    unlockFeature: (plan: string) => `Actualiza a ${plan} para desbloquear esta función`,
    processing: "Procesando...",
    upgrade: "Actualizar plan",
    close: "Cerrar",
    planRequired: (plan: string) => `Plan ${plan} requerido`,
    upgradeTo: (plan: string) => `Actualizar a ${plan}`,
    unlock: (plan: string) => `Desbloquea ${plan}`,
    fullAccess: (plan: string) => `Obtén acceso completo con el plan ${plan}.`,
    monthly: "Mensual",
    annual: "Anual",
    perMonth: "USD/mes",
    billedAnnually: " · facturado anualmente",
    redirecting: "Redirigiendo...",
    startWith: (plan: string) => `Comenzar con ${plan}`,
    securePayment: "Pago seguro con PayPal · Cancela cuando quieras",
  },
  en: {
    processingError: "Could not process the request",
    checkoutError: "Could not start checkout",
    tryAgain: "Please try again",
    unlockFeature: (plan: string) => `Upgrade to ${plan} to unlock this feature`,
    processing: "Processing...",
    upgrade: "Upgrade",
    close: "Close",
    planRequired: (plan: string) => `${plan} plan required`,
    upgradeTo: (plan: string) => `Upgrade to ${plan}`,
    unlock: (plan: string) => `Unlock ${plan}`,
    fullAccess: (plan: string) => `Get full access with the ${plan} plan.`,
    monthly: "Monthly",
    annual: "Annual",
    perMonth: "USD/mo",
    billedAnnually: " · billed annually",
    redirecting: "Redirecting...",
    startWith: (plan: string) => `Get started with ${plan}`,
    securePayment: "Secure payment with PayPal · Cancel anytime",
  },
} as const;

function formatPrice(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface UpgradePromptProps {
  /** Plan mínimo requerido para desbloquear la feature */
  requiredPlan?: Exclude<PlanKey, "free">;
  /** Mensaje contextual que explica por qué aparece el prompt (texto o { es, en }) */
  message?: string | { es: string; en: string };
  /** Estilo de presentación */
  variant?: "inline" | "card" | "banner";
  /** Ciclo de facturación preseleccionado en el checkout */
  defaultInterval?: BillingInterval;
  /** Callback cuando el usuario cierra el prompt (solo variant inline/banner) */
  onDismiss?: () => void;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function UpgradePrompt({
  requiredPlan = "starter",
  message: rawMessage,
  variant = "card",
  defaultInterval = "monthly",
  onDismiss,
}: UpgradePromptProps) {
  const [loading, setLoading] = useState(false);
  const [interval, setInterval] = useState<BillingInterval>(defaultInterval);

  const plan = PLAN_META[requiredPlan];
  const { locale } = useI18n();
  const c = COPY[locale];
  const message = typeof rawMessage === "string" ? rawMessage : rawMessage?.[locale];
  const annualMonthly = Math.round((plan.annualPrice / 12) * 100) / 100;
  const annualSavingsPct = Math.round((1 - plan.annualPrice / (plan.monthlyPrice * 12)) * 100);

  async function handleUpgrade() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: requiredPlan, interval }),
      });

      const data = (await res.json()) as { url?: string; error?: string };

      if (!res.ok) {
        throw new Error(data.error ?? c.processingError);
      }

      window.location.href = data.url!;
    } catch (err) {
      toast.error(c.checkoutError, {
        description: err instanceof Error ? err.message : c.tryAgain,
      });
      setLoading(false);
    }
  }

  // ── Banner (franja horizontal compacta) ──────────────────────────────────

  if (variant === "banner") {
    return (
      <div
        className="flex items-center justify-between gap-4 rounded-xl px-4 py-3"
        style={{
          background: "linear-gradient(90deg, #002E21 0%, #003828 100%)",
          border: "1px solid #0F5132",
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <Lock className="w-4 h-4 shrink-0" style={{ color: "#00C17C" }} />
          <p className="text-sm text-zen-anti-flash truncate">
            {message ?? c.unlockFeature(plan.name)}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            onClick={handleUpgrade}
            disabled={loading}
            className="font-semibold text-xs h-8"
            style={{ background: "#00C17C", color: "#001B1F" }}
          >
            {loading ? c.processing : c.upgrade}
          </Button>

          {onDismiss && (
            <button
              onClick={onDismiss}
              className="p-1 rounded hover:bg-white/5 transition-colors"
              aria-label={c.close}
            >
              <X className="w-4 h-4" style={{ color: "rgba(255,255,255,0.4)" }} />
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Inline (bloque compacto con features) ────────────────────────────────

  if (variant === "inline") {
    return (
      <div
        className="rounded-xl p-4 space-y-3"
        style={{
          background: "#002E21",
          border: "1px solid #0F5132",
        }}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "rgba(0,193,124,0.12)" }}
            >
              <Zap className="w-4 h-4" style={{ color: "#00C17C" }} />
            </div>
            <div>
              <p className="text-sm font-semibold text-zen-anti-flash">
                {c.planRequired(plan.name)}
              </p>
              {message && (
                <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>
                  {message}
                </p>
              )}
            </div>
          </div>

          {onDismiss && (
            <button
              onClick={onDismiss}
              className="p-1 rounded hover:bg-white/5 transition-colors shrink-0"
              aria-label={c.close}
            >
              <X className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.4)" }} />
            </button>
          )}
        </div>

        <Button
          size="sm"
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full font-semibold text-sm"
          style={{ background: "#00C17C", color: "#001B1F" }}
        >
          {loading ? c.processing : c.upgradeTo(plan.name)}
          {!loading && <ArrowRight className="w-3.5 h-3.5 ml-1.5" />}
        </Button>
      </div>
    );
  }

  // ── Card (presentación completa con pricing toggle) ──────────────────────

  return (
    <div
      className="rounded-2xl p-6 space-y-5"
      style={{
        background: "linear-gradient(135deg, #002E21 0%, #003020 100%)",
        border: "1px solid #00C17C",
        boxShadow: "0 0 32px rgba(0,193,124,0.08)",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(0,193,124,0.15)" }}
            >
              <Zap className="w-5 h-5" style={{ color: "#00C17C" }} />
            </div>
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: "rgba(0,193,124,0.15)", color: "#00C17C" }}
            >
              {c.upgrade}
            </span>
          </div>

          <h3 className="text-lg font-semibold text-zen-anti-flash mt-2">
            {message ?? c.unlock(plan.name)}
          </h3>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
            {c.fullAccess(plan.name)}
          </p>
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1.5 rounded-lg hover:bg-white/5 transition-colors shrink-0"
            aria-label={c.close}
          >
            <X className="w-4 h-4" style={{ color: "rgba(255,255,255,0.4)" }} />
          </button>
        )}
      </div>

      {/* Features */}
      <ul className="space-y-2">
        {plan.highlight[locale].map((feature) => (
          <li key={feature} className="flex items-center gap-2 text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>
            <div
              className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "rgba(0,193,124,0.2)" }}
            >
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#00C17C" }} />
            </div>
            {feature}
          </li>
        ))}
      </ul>

      {/* Billing interval toggle */}
      <div
        className="flex items-center gap-1 rounded-lg p-1 w-fit"
        style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.05)" }}
      >
        {(["monthly", "annual"] as BillingInterval[]).map((iv) => (
          <button
            key={iv}
            onClick={() => setInterval(iv)}
            className="px-3 py-1.5 text-xs rounded-md transition-colors flex items-center gap-1.5"
            style={
              interval === iv
                ? { background: "#00C17C", color: "#001B1F", fontWeight: 600 }
                : { color: "rgba(255,255,255,0.5)" }
            }
          >
            {iv === "monthly" ? c.monthly : c.annual}
            {iv === "annual" && (
              <span
                className="px-1 py-0.5 rounded text-xs font-semibold"
                style={
                  interval === "annual"
                    ? { background: "rgba(0,27,31,0.3)", color: "#001B1F" }
                    : { background: "rgba(0,193,124,0.2)", color: "#00C17C" }
                }
              >
                -{annualSavingsPct}%
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Price + CTA */}
      <div className="space-y-3">
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-bold text-zen-anti-flash">
            ${interval === "monthly" ? plan.monthlyPrice : formatPrice(annualMonthly)}
          </span>
          <span className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
            {c.perMonth}{interval === "annual" && c.billedAnnually}
          </span>
        </div>

        <Button
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full font-semibold h-11"
          style={{ background: "#00C17C", color: "#001B1F" }}
        >
          {loading ? c.redirecting : c.startWith(plan.name)}
          {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
        </Button>

        <p className="text-center text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
          {c.securePayment}
        </p>
      </div>
    </div>
  );
}
