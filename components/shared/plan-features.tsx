"use client";

import { CheckCircle2, X, Clock } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

type CellValue = boolean | { es: string; en: string };

interface FeatureRow {
  label: { es: string; en: string };
  starter: CellValue;
  pro: CellValue;
  zenmode: CellValue;
  comingSoon?: boolean;
}

const UNLIMITED = { es: "Ilimitadas", en: "Unlimited" };

const FEATURES: FeatureRow[] = [
  // ── Cuentas ──────────────────────────────────────────────────────────────
  { label: { es: "Cuentas de trading", en: "Trading accounts" }, starter: { es: "2", en: "2" }, pro: UNLIMITED, zenmode: UNLIMITED },

  // ── Core ─────────────────────────────────────────────────────────────────
  { label: { es: "Registro manual de trades", en: "Manual trade logging" }, starter: true, pro: true, zenmode: true },
  { label: { es: "Dashboard básico (Win Rate, PnL, DD)", en: "Core dashboard (win rate, P&L, DD)" }, starter: true, pro: true, zenmode: true },
  { label: { es: "Calendario de trades", en: "Trade calendar" }, starter: true, pro: true, zenmode: true },
  { label: { es: "Export CSV", en: "CSV export" }, starter: true, pro: true, zenmode: true },

  // ── Import & export avanzado ──────────────────────────────────────────────
  { label: { es: "Import CSV automático", en: "CSV import" }, starter: false, pro: true, zenmode: true },
  { label: { es: "Export PDF / Excel ilimitado", en: "Unlimited PDF / Excel export" }, starter: false, pro: true, zenmode: true },

  // ── Analytics ────────────────────────────────────────────────────────────
  { label: { es: "Dashboard analítico completo", en: "Full analytics dashboard" }, starter: false, pro: true, zenmode: true },
  { label: { es: "Profit factor y consistency score", en: "Profit factor and consistency score" }, starter: false, pro: true, zenmode: true },
  { label: { es: "Equity curve y distribución", en: "Equity curve and distribution" }, starter: false, pro: true, zenmode: true },
  { label: { es: "Filtros avanzados (sesión, setup)", en: "Advanced filters (session, setup)" }, starter: false, pro: true, zenmode: true },

  // ── Prop Firm tools ───────────────────────────────────────────────────────
  { label: { es: "Trading Plan exportable en PDF", en: "Trading plan PDF export" }, starter: false, pro: true, zenmode: true },
  { label: { es: "Calendario con notas emocionales", en: "Calendar with emotion notes" }, starter: false, pro: true, zenmode: true },

  // ── ZenMode exclusivo ─────────────────────────────────────────────────────
  { label: { es: "Copiloto de Disciplina en vivo", en: "Live Discipline Copilot" }, starter: false, pro: false, zenmode: true },
  { label: { es: "Detección de revenge trading (IA)", en: "Revenge trading detection (AI)" }, starter: false, pro: false, zenmode: true },
  { label: { es: "ZenCoach, coach de trading con IA", en: "ZenCoach AI trading coach" }, starter: false, pro: false, zenmode: true },
  { label: { es: "Reporte semanal automático por email", en: "Automated weekly email report" }, starter: false, pro: false, zenmode: true },
  { label: { es: "Radar de mercado semanal", en: "Weekly Market Radar" }, starter: false, pro: false, zenmode: true },
  { label: { es: "Análisis de horario óptimo (IA)", en: "Best trading hours analysis (AI)" }, starter: false, pro: false, zenmode: true, comingSoon: true },
  { label: { es: "Benchmark vs. reglas de la prop firm", en: "Benchmark vs. prop firm rules" }, starter: false, pro: false, zenmode: true, comingSoon: true },
  { label: { es: "Coaching 1-a-1 mensual (30 min)", en: "Monthly 1-on-1 coaching (30 min)" }, starter: false, pro: false, zenmode: true, comingSoon: true },

  // ── Soporte ───────────────────────────────────────────────────────────────
  { label: { es: "Soporte por email", en: "Email support" }, starter: true, pro: false, zenmode: false },
  { label: { es: "Soporte prioritario", en: "Priority support" }, starter: false, pro: true, zenmode: false },
  { label: { es: "Soporte dedicado", en: "Dedicated support" }, starter: false, pro: false, zenmode: true },
];

interface PlanFeaturesProps {
  /** Plan del usuario actual — resalta la columna correspondiente */
  highlightPlan?: "starter" | "pro" | "zenmode";
}

function FeatureCell({ value, comingSoon, locale }: { value: CellValue; comingSoon?: boolean; locale: "es" | "en" }) {
  if (typeof value === "object") {
    return <span className="text-sm font-medium text-zen-anti-flash">{value[locale]}</span>;
  }
  if (value && comingSoon) {
    return <Clock className="w-4 h-4 mx-auto" style={{ color: "#00C17C", opacity: 0.7 }} />;
  }
  return value ? (
    <CheckCircle2 className="w-4 h-4 mx-auto" style={{ color: "#00C17C" }} />
  ) : (
    <X className="w-4 h-4 mx-auto text-zen-anti-flash/20" />
  );
}

export function PlanFeatures({ highlightPlan }: PlanFeaturesProps) {
  const starterActive = highlightPlan === "starter";
  const proActive     = highlightPlan === "pro";
  const zenActive     = highlightPlan === "zenmode";
  const { locale } = useI18n();
  const perMonth = locale === "es" ? "USD/mes" : "USD/mo";

  const colStyle = (active: boolean) =>
    active ? { background: "rgba(0,193,124,0.08)" } : undefined;

  const cellStyle = (active: boolean) =>
    active ? { background: "rgba(0,193,124,0.04)" } : undefined;

  const headingColor = (active: boolean) =>
    active ? "text-zen-caribbean-green" : "text-zen-anti-flash/70";

  const subColor = (active: boolean) =>
    active ? "text-zen-anti-flash/60" : "text-zen-anti-flash/35";

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
      {/* Cabecera de columnas */}
      <div className="grid grid-cols-4 text-sm" style={{ background: "#001810" }}>
        <div className="px-4 py-3 text-zen-anti-flash/50 font-medium">{locale === "es" ? "Funcionalidad" : "Feature"}</div>

        {/* Starter */}
        <div className="px-4 py-3 text-center" style={colStyle(starterActive)}>
          <p className={`font-semibold text-sm ${headingColor(starterActive)}`}>Starter</p>
          <p className={`text-xs mt-0.5 ${subColor(starterActive)}`}>$9 {perMonth}</p>
        </div>

        {/* Professional */}
        <div className="px-4 py-3 text-center" style={colStyle(proActive)}>
          <p className={`font-semibold text-sm ${headingColor(proActive)}`}>Professional</p>
          <p className={`text-xs mt-0.5 ${subColor(proActive)}`}>$29 {perMonth}</p>
        </div>

        {/* ZenMode */}
        <div className="px-4 py-3 text-center" style={colStyle(zenActive)}>
          <p className={`font-semibold text-sm ${headingColor(zenActive)}`}>ZenMode</p>
          <p className={`text-xs mt-0.5 ${subColor(zenActive)}`}>$59 {perMonth}</p>
        </div>
      </div>

      {/* Filas */}
      {FEATURES.map((row, i) => (
        <div
          key={row.label.en}
          className="grid grid-cols-4 items-center"
          style={{
            borderTop: "1px solid rgba(255,255,255,0.04)",
            background: i % 2 === 0 ? "rgba(0,0,0,0.12)" : "transparent",
          }}
        >
          <div className="px-4 py-2.5 text-sm text-zen-anti-flash/60">
            {row.label[locale]}
            {row.comingSoon && (
              <span className="ml-1.5 text-[10px] uppercase tracking-wide text-zen-caribbean-green/70">
                {locale === "es" ? "Próximamente" : "Coming soon"}
              </span>
            )}
          </div>

          <div className="px-4 py-2.5 text-center" style={cellStyle(starterActive)}>
            <FeatureCell value={row.starter} locale={locale} />
          </div>

          <div className="px-4 py-2.5 text-center" style={cellStyle(proActive)}>
            <FeatureCell value={row.pro} locale={locale} />
          </div>

          <div className="px-4 py-2.5 text-center" style={cellStyle(zenActive)}>
            <FeatureCell value={row.zenmode} comingSoon={row.comingSoon} locale={locale} />
          </div>
        </div>
      ))}
    </div>
  );
}
