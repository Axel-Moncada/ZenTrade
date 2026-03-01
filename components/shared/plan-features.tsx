import { CheckCircle2, X, Clock } from "lucide-react";

type CellValue = boolean | string;

interface FeatureRow {
  label: string;
  category?: string;
  starter: CellValue;
  pro: CellValue;
  zenmode: CellValue;
}

const FEATURES: FeatureRow[] = [
  // ── Cuentas ──────────────────────────────────────────────────────────────
  { label: "Cuentas de trading",                  starter: "2",             pro: "Ilimitadas",    zenmode: "Ilimitadas"    },

  // ── Core ─────────────────────────────────────────────────────────────────
  { label: "Registro manual de trades",           starter: true,            pro: true,            zenmode: true            },
  { label: "Dashboard básico (Win Rate, PnL, DD)", starter: true,           pro: true,            zenmode: true            },
  { label: "Calendario de trades",                starter: true,            pro: true,            zenmode: true            },
  { label: "Export CSV",                          starter: true,            pro: true,            zenmode: true            },

  // ── Import & export avanzado ──────────────────────────────────────────────
  { label: "Import CSV automático",               starter: false,           pro: true,            zenmode: true            },
  { label: "Export PDF / Excel ilimitado",        starter: false,           pro: true,            zenmode: true            },

  // ── Analytics ────────────────────────────────────────────────────────────
  { label: "Dashboard analítico completo",        starter: false,           pro: true,            zenmode: true            },
  { label: "Profit factor y consistency score",   starter: false,           pro: true,            zenmode: true            },
  { label: "Equity curve y distribución",         starter: false,           pro: true,            zenmode: true            },
  { label: "Filtros avanzados (sesión, setup)",   starter: false,           pro: true,            zenmode: true            },

  // ── Prop Firm tools ───────────────────────────────────────────────────────
  { label: "Trading Plan exportable en PDF",      starter: false,           pro: true,            zenmode: true            },
  { label: "Calendario con notas emocionales",    starter: false,           pro: true,            zenmode: true            },

  // ── ZenMode exclusivo ─────────────────────────────────────────────────────
  { label: "Detección de revenge trading (IA)",   starter: false,           pro: false,           zenmode: true            },
  { label: "Alertas de reglas de riesgo",         starter: false,           pro: false,           zenmode: true            },
  { label: "Reporte semanal automático por email",starter: false,           pro: false,           zenmode: true            },
  { label: "Análisis de horario óptimo (IA)",     starter: false,           pro: false,           zenmode: true            },
  { label: "Benchmark vs. prop firm reqs.",       starter: false,           pro: false,           zenmode: true            },
  { label: "Coaching 1-a-1 mensual (30 min)",     starter: false,           pro: false,           zenmode: true            },

  // ── Soporte ───────────────────────────────────────────────────────────────
  { label: "Soporte por email",                   starter: true,            pro: false,           zenmode: false           },
  { label: "Soporte prioritario",                 starter: false,           pro: true,            zenmode: false           },
  { label: "Soporte dedicado 24/7",               starter: false,           pro: false,           zenmode: true            },
];

interface PlanFeaturesProps {
  /** Plan del usuario actual — resalta la columna correspondiente */
  highlightPlan?: "starter" | "pro" | "zenmode";
}

function FeatureCell({ value, comingSoon }: { value: CellValue; comingSoon?: boolean }) {
  if (typeof value === "string") {
    return <span className="text-sm font-medium text-zen-anti-flash">{value}</span>;
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
        <div className="px-4 py-3 text-zen-anti-flash/50 font-medium">Funcionalidad</div>

        {/* Starter */}
        <div className="px-4 py-3 text-center" style={colStyle(starterActive)}>
          <p className={`font-semibold text-sm ${headingColor(starterActive)}`}>Starter</p>
          <p className={`text-xs mt-0.5 ${subColor(starterActive)}`}>$9 USD/mes</p>
        </div>

        {/* Professional */}
        <div className="px-4 py-3 text-center" style={colStyle(proActive)}>
          <p className={`font-semibold text-sm ${headingColor(proActive)}`}>Professional</p>
          <p className={`text-xs mt-0.5 ${subColor(proActive)}`}>$29 USD/mes</p>
        </div>

        {/* ZenMode */}
        <div className="px-4 py-3 text-center" style={colStyle(zenActive)}>
          <p className={`font-semibold text-sm ${headingColor(zenActive)}`}>ZenMode</p>
          <p className={`text-xs mt-0.5 ${subColor(zenActive)}`}>
            $59 USD/mes
            <span className="ml-1 px-1 rounded text-zen-caribbean-green/60" style={{ fontSize: "10px", background: "rgba(0,193,124,0.08)" }}>
              pronto
            </span>
          </p>
        </div>
      </div>

      {/* Filas */}
      {FEATURES.map((row, i) => (
        <div
          key={row.label}
          className="grid grid-cols-4 items-center"
          style={{
            borderTop: "1px solid rgba(255,255,255,0.04)",
            background: i % 2 === 0 ? "rgba(0,0,0,0.12)" : "transparent",
          }}
        >
          <div className="px-4 py-2.5 text-sm text-zen-anti-flash/60">{row.label}</div>

          <div className="px-4 py-2.5 text-center" style={cellStyle(starterActive)}>
            <FeatureCell value={row.starter} />
          </div>

          <div className="px-4 py-2.5 text-center" style={cellStyle(proActive)}>
            <FeatureCell value={row.pro} />
          </div>

          <div className="px-4 py-2.5 text-center" style={cellStyle(zenActive)}>
            <FeatureCell value={row.zenmode} comingSoon={row.zenmode === true && !row.pro} />
          </div>
        </div>
      ))}
    </div>
  );
}
