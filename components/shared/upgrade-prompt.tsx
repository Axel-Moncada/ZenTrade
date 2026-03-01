"use client";

import { useState } from "react";
import { Zap, X, ArrowRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { PlanKey, BillingInterval } from "@/lib/lemonsqueezy/client";

// ─── Configuración visual por plan destino ────────────────────────────────────

const PLAN_META: Record<
  Exclude<PlanKey, "free">,
  { name: string; monthlyPrice: number; highlight: string[] }
> = {
  starter: {
    name: "Starter",
    monthlyPrice: 9,
    highlight: ["2 cuentas de trading", "Historial ilimitado de trades", "Export CSV"],
  },
  pro: {
    name: "Professional",
    monthlyPrice: 29,
    highlight: [
      "Cuentas ilimitadas",
      "Dashboard avanzado",
      "Import/Export completo",
      "Soporte prioritario",
    ],
  },
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface UpgradePromptProps {
  /** Plan mínimo requerido para desbloquear la feature */
  requiredPlan?: Exclude<PlanKey, "free">;
  /** Mensaje contextual que explica por qué aparece el prompt */
  message?: string;
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
  message,
  variant = "card",
  defaultInterval = "monthly",
  onDismiss,
}: UpgradePromptProps) {
  const [loading, setLoading] = useState(false);
  const [interval, setInterval] = useState<BillingInterval>(defaultInterval);

  const plan = PLAN_META[requiredPlan];

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
        throw new Error(data.error ?? "Error al procesar");
      }

      window.location.href = data.url!;
    } catch (err) {
      toast.error("Error al iniciar el pago", {
        description: err instanceof Error ? err.message : "Intenta de nuevo",
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
            {message ?? `Actualiza a ${plan.name} para desbloquear esta función`}
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
            {loading ? "Cargando..." : `Ver ${plan.name}`}
            {!loading && <ArrowRight className="w-3.5 h-3.5 ml-1" />}
          </Button>

          {onDismiss && (
            <button
              onClick={onDismiss}
              className="p-1 rounded hover:bg-white/5 transition-colors"
              aria-label="Cerrar"
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
                Plan {plan.name} requerido
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
              aria-label="Cerrar"
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
          {loading ? "Cargando..." : `Actualizar a ${plan.name} · $${plan.monthlyPrice}/mes`}
          {!loading && <ArrowRight className="w-4 h-4 ml-1.5" />}
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
              Actualizar plan
            </span>
          </div>

          <h3 className="text-lg font-semibold text-zen-anti-flash mt-2">
            {message ?? `Desbloquea ${plan.name}`}
          </h3>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
            Obtén acceso completo con el plan {plan.name}.
          </p>
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1.5 rounded-lg hover:bg-white/5 transition-colors shrink-0"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" style={{ color: "rgba(255,255,255,0.4)" }} />
          </button>
        )}
      </div>

      {/* Features */}
      <ul className="space-y-2">
        {plan.highlight.map((feature) => (
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
            {iv === "monthly" ? "Mensual" : "Anual"}
            {iv === "annual" && (
              <span
                className="px-1 py-0.5 rounded text-xs font-semibold"
                style={
                  interval === "annual"
                    ? { background: "rgba(0,27,31,0.3)", color: "#001B1F" }
                    : { background: "rgba(0,193,124,0.2)", color: "#00C17C" }
                }
              >
                -20%
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Price + CTA */}
      <div className="space-y-3">
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-bold text-zen-anti-flash">
            ${interval === "monthly" ? plan.monthlyPrice : Math.round(plan.monthlyPrice * 0.8)}
          </span>
          <span className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
            USD/mes{interval === "annual" && " · facturado anualmente"}
          </span>
        </div>

        <Button
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full font-semibold h-11"
          style={{ background: "#00C17C", color: "#001B1F" }}
        >
          {loading ? "Procesando..." : `Comenzar con ${plan.name}`}
          {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
        </Button>

        <p className="text-center text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
          Cancela cuando quieras · Sin permanencia
        </p>
      </div>
    </div>
  );
}
