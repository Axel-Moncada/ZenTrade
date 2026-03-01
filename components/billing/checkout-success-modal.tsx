"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti";
import type { ActiveSubscription } from "@/app/dashboard/billing/page";

const PLAN_NAME_MAP: Record<string, string> = {
  starter: "Starter",
  pro: "Professional",
  zenmode: "ZenMode",
};

const PLAN_NEXT_STEPS: Record<string, { label: string; href: string }[]> = {
  starter: [
    { label: "Crear tu segunda cuenta de trading", href: "/dashboard/accounts/new" },
    { label: "Registrar tu primer trade", href: "/dashboard/trades" },
    { label: "Ver tu dashboard", href: "/dashboard" },
  ],
  pro: [
    { label: "Importar trades desde CSV", href: "/dashboard/trades/import" },
    { label: "Crear tu Trading Plan PDF", href: "/dashboard/trading-plan" },
    { label: "Explorar el dashboard analítico", href: "/dashboard" },
  ],
  zenmode: [
    { label: "Explorar el dashboard analítico", href: "/dashboard" },
    { label: "Configurar tu Trading Plan", href: "/dashboard/trading-plan" },
    { label: "Ver tus cuentas", href: "/dashboard/accounts" },
  ],
};

interface Props {
  subscription: ActiveSubscription;
  onClose: () => void;
}

export function CheckoutSuccessModal({ subscription, onClose }: Props) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    // Primera ráfaga — centro
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { x: 0.5, y: 0.55 },
      colors: ["#00C17C", "#3DBB8F", "#F2F3F4", "#00855B", "#A8F0D2"],
      zIndex: 9999,
    });

    // Segunda ráfaga — izquierda + derecha con delay
    setTimeout(() => {
      confetti({
        particleCount: 60,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: ["#00C17C", "#F2F3F4", "#3DBB8F"],
        zIndex: 9999,
      });
      confetti({
        particleCount: 60,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: ["#00C17C", "#F2F3F4", "#3DBB8F"],
        zIndex: 9999,
      });
    }, 200);
  }, []);

  const planKey = subscription?.plan_key ?? "pro";
  const planName = PLAN_NAME_MAP[planKey] ?? "Premium";
  const steps = PLAN_NEXT_STEPS[planKey] ?? PLAN_NEXT_STEPS.pro;

  return (
    <AnimatePresence>
      {/* Overlay */}
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
        onClick={onClose}
      >
        {/* Modal */}
        <motion.div
          key="modal"
          initial={{ opacity: 0, scale: 0.85, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 16 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="relative w-full max-w-md overflow-hidden rounded-2xl"
          style={{
            background: "linear-gradient(135deg, #002E21 0%, #001B1F 100%)",
            border: "1px solid rgba(0,193,124,0.4)",
            boxShadow: "0 0 60px rgba(0,193,124,0.2), 0 24px 48px rgba(0,0,0,0.5)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Glow superior */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{ background: "linear-gradient(90deg, transparent, #00C17C, transparent)" }}
          />
          <div
            className="pointer-events-none absolute left-1/2 top-0 h-32 w-64 -translate-x-1/2"
            style={{
              background: "radial-gradient(ellipse at top, rgba(0,193,124,0.15), transparent 70%)",
            }}
          />

          {/* Botón cerrar */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg p-1.5 text-white/40 hover:text-white/80 hover:bg-white/10 transition-colors z-10"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="relative p-8 text-center">
            {/* Icono animado */}
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
              className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{
                background: "linear-gradient(135deg, rgba(0,193,124,0.3), rgba(0,193,124,0.1))",
                border: "1px solid rgba(0,193,124,0.5)",
              }}
            >
              <Sparkles className="h-8 w-8 text-zen-caribbean-green" />
            </motion.div>

            {/* Título */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-zen-caribbean-green mb-2">
                ¡Pago exitoso!
              </p>
              <h2 className="text-2xl font-bold text-white mb-1">
                Bienvenido al plan {planName}
              </h2>
              <p className="text-sm text-white/50 mb-7">
                Tu suscripción está activa. ¿Por dónde empezamos?
              </p>
            </motion.div>

            {/* Próximos pasos */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-2 mb-7 text-left"
            >
              {steps.map((step, i) => (
                <Link
                  key={step.href}
                  href={step.href}
                  onClick={onClose}
                  className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all group"
                  style={{
                    background: "rgba(0,193,124,0.07)",
                    border: "1px solid rgba(0,193,124,0.15)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(0,193,124,0.14)";
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,193,124,0.35)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(0,193,124,0.07)";
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,193,124,0.15)";
                  }}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                      style={{ background: "rgba(0,193,124,0.2)", color: "#00C17C" }}
                    >
                      {i + 1}
                    </span>
                    <span className="text-white/80 group-hover:text-white transition-colors">
                      {step.label}
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 text-zen-caribbean-green/60 group-hover:text-zen-caribbean-green transition-colors shrink-0" />
                </Link>
              ))}
            </motion.div>

            {/* CTA principal */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <button
                onClick={onClose}
                className="w-full rounded-xl py-3 text-sm font-semibold transition-colors"
                style={{ background: "#00C17C", color: "#001B1F" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#00A86B")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#00C17C")}
              >
                Ir a Facturación
              </button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
