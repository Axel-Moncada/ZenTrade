"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { usePlan } from "@/lib/hooks/usePlan";

const STORAGE_KEY = "zentrade-welcome-dismissed";

export function FreePlanWelcome() {
  const plan = usePlan();
  const [dismissed, setDismissed] = useState(true); // true para evitar flash inicial

  useEffect(() => {
    const wasDismissed = localStorage.getItem(STORAGE_KEY) === "true";
    setDismissed(wasDismissed);
  }, []);

  function handleDismiss() {
    localStorage.setItem(STORAGE_KEY, "true");
    setDismissed(true);
  }

  if (plan.loading || !plan.isFree || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden rounded-2xl border border-zen-caribbean-green/30 bg-zen-caribbean-green/5 p-5"
      >
        {/* Glow de fondo */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-zen-caribbean-green/5 via-transparent to-transparent" />

        <div className="relative flex items-start gap-4">
          {/* Icono */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zen-caribbean-green/15 border border-zen-caribbean-green/30">
            <Sparkles className="h-5 w-5 text-zen-caribbean-green" />
          </div>

          {/* Contenido */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-zen-anti-flash mb-1">
              Bienvenido a ZenTrade — Plan Free activo
            </p>

            {/* Lo que incluye */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3">
              {["1 cuenta de trading", "Registro manual de trades", "Dashboard básico", "Export CSV"].map((f) => (
                <span key={f} className="flex items-center gap-1 text-xs text-zen-anti-flash/70">
                  <CheckCircle2 className="h-3 w-3 text-zen-caribbean-green shrink-0" />
                  {f}
                </span>
              ))}
            </div>

            {/* CTA */}
            <p className="text-xs text-zen-anti-flash/50 mb-3">
              Activa <span className="text-zen-caribbean-green font-medium">Starter desde $7/mes</span> y desbloquea import CSV automático, export PDF, dashboard analítico completo, 2 cuentas y más.
            </p>

            <Link
              href="/dashboard/billing"
              className="inline-flex items-center gap-1.5 rounded-lg bg-zen-caribbean-green px-4 py-1.5 text-xs font-semibold text-zen-rich-black hover:bg-zen-mountain-meadow transition-colors"
            >
              Ver planes
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Botón cerrar */}
          <button
            onClick={handleDismiss}
            className="shrink-0 rounded-lg p-1.5 text-zen-anti-flash/40 hover:text-zen-anti-flash/80 hover:bg-zen-surface/50 transition-colors"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
