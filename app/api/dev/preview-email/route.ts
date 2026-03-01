import { NextRequest, NextResponse } from "next/server";
import { render } from "@react-email/render";
import { WelcomeUpgradeEmail } from "@/lib/resend/emails/welcome-upgrade";

// ⚠️ Solo disponible en desarrollo — bloqueado en producción
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const plan = (searchParams.get("plan") ?? "pro") as "starter" | "pro" | "zenmode";
  const interval = (searchParams.get("interval") ?? "monthly") as "monthly" | "annual";

  const PLAN_NAME_MAP: Record<string, string> = {
    starter: "Starter",
    pro: "Professional",
    zenmode: "ZenMode",
  };

  const PLAN_CONFIG: Record<string, { features: string[]; nextSteps: { label: string; href: string }[] }> = {
    starter: {
      features: [
        "2 cuentas de trading (Evaluation + Live)",
        "Registro manual de trades ilimitado",
        "Dashboard básico: Win Rate, PnL, Drawdown",
        "Calendario de trades",
        "Export CSV",
        "Soporte por email",
      ],
      nextSteps: [
        { label: "Crear tu segunda cuenta de trading", href: "http://localhost:3000/dashboard/accounts/new" },
        { label: "Registrar tu primer trade", href: "http://localhost:3000/dashboard/trades" },
        { label: "Explorar tu dashboard", href: "http://localhost:3000/dashboard" },
      ],
    },
    pro: {
      features: [
        "Cuentas ilimitadas",
        "Import CSV automático (Rithmic, NinjaTrader, Tradoverse)",
        "Dashboard analítico completo con todos los KPIs",
        "Trading Plan exportable en PDF",
        "Equity curve + análisis de distribución",
        "Filtros avanzados por instrumento, sesión y setup",
        "Export CSV / PDF / Excel ilimitado",
        "Soporte prioritario",
      ],
      nextSteps: [
        { label: "Importar trades desde CSV", href: "http://localhost:3000/dashboard/trades/import" },
        { label: "Crear tu Trading Plan en PDF", href: "http://localhost:3000/dashboard/trading-plan" },
        { label: "Explorar el dashboard analítico", href: "http://localhost:3000/dashboard" },
      ],
    },
    zenmode: {
      features: [
        "Todo en Professional incluido",
        "Detección de revenge trading en tiempo real (IA)",
        "Alertas de reglas de riesgo automáticas",
        "Reporte semanal por email cada lunes",
        "Análisis de horario óptimo de trading (IA)",
        "Benchmark vs. requisitos de prop firms",
        "Coaching 1-a-1 mensual",
      ],
      nextSteps: [
        { label: "Explorar el dashboard analítico", href: "http://localhost:3000/dashboard" },
        { label: "Configurar tu Trading Plan", href: "http://localhost:3000/dashboard/trading-plan" },
        { label: "Ver tus cuentas", href: "http://localhost:3000/dashboard/accounts" },
      ],
    },
  };

  const config = PLAN_CONFIG[plan] ?? PLAN_CONFIG.pro;

  const html = await render(
    WelcomeUpgradeEmail({
      userName: "Axel Moncada",
      userEmail: "axel@zen-trader.com",
      planName: PLAN_NAME_MAP[plan] ?? "Professional",
      billingInterval: interval,
      features: config.features,
      nextSteps: config.nextSteps,
      dashboardUrl: "http://localhost:3000/dashboard",
    })
  );

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
