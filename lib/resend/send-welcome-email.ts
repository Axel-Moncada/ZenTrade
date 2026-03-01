import { render } from "@react-email/render";
import { resend, FROM_EMAIL } from "@/lib/resend/client";
import { WelcomeUpgradeEmail } from "@/lib/resend/emails/welcome-upgrade";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.zen-trader.com";

const PLAN_CONFIG: Record<
  string,
  {
    features: string[];
    nextSteps: { label: string; href: string }[];
  }
> = {
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
      { label: "Crear tu segunda cuenta de trading", href: `${APP_URL}/dashboard/accounts/new` },
      { label: "Registrar tu primer trade", href: `${APP_URL}/dashboard/trades` },
      { label: "Explorar tu dashboard", href: `${APP_URL}/dashboard` },
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
      { label: "Importar trades desde CSV", href: `${APP_URL}/dashboard/trades/import` },
      { label: "Crear tu Trading Plan en PDF", href: `${APP_URL}/dashboard/trading-plan` },
      { label: "Explorar el dashboard analítico", href: `${APP_URL}/dashboard` },
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
      { label: "Explorar el dashboard analítico", href: `${APP_URL}/dashboard` },
      { label: "Configurar tu Trading Plan", href: `${APP_URL}/dashboard/trading-plan` },
      { label: "Ver tus cuentas", href: `${APP_URL}/dashboard/accounts` },
    ],
  },
};

const PLAN_NAME_MAP: Record<string, string> = {
  starter: "Starter",
  pro: "Professional",
  zenmode: "ZenMode",
};

interface SendWelcomeEmailParams {
  userEmail: string;
  userName: string;
  planKey: string;
  billingInterval: "monthly" | "annual";
}

export async function sendWelcomeEmail({
  userEmail,
  userName,
  planKey,
  billingInterval,
}: SendWelcomeEmailParams): Promise<void> {
  const config = PLAN_CONFIG[planKey];

  if (!config) {
    console.warn(`[Resend] Plan desconocido: ${planKey} — email no enviado`);
    return;
  }

  const planName = PLAN_NAME_MAP[planKey] ?? planKey;

  const html = await render(
    WelcomeUpgradeEmail({
      userName,
      userEmail,
      planName,
      billingInterval,
      features: config.features,
      nextSteps: config.nextSteps,
      dashboardUrl: `${APP_URL}/dashboard`,
    })
  );

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: userEmail,
    subject: `¡Bienvenido al plan ${planName}! Tu cuenta está activa 🎉`,
    html,
  });

  if (error) {
    console.error("[Resend] Error enviando email de bienvenida:", error);
    throw error;
  }

  console.log(`[Resend] Email de bienvenida enviado a ${userEmail} — plan ${planName}`);
}
