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
      "2 trading accounts (evaluation + funded)",
      "Unlimited manual trade logging",
      "Core dashboard: win rate, P&L, drawdown",
      "Trade calendar",
      "CSV export",
      "Email support",
    ],
    nextSteps: [
      { label: "Add your second trading account", href: `${APP_URL}/dashboard/accounts/new` },
      { label: "Log your first trade", href: `${APP_URL}/dashboard/trades` },
      { label: "Explore your dashboard", href: `${APP_URL}/dashboard` },
    ],
  },
  pro: {
    features: [
      "Unlimited trading accounts",
      "CSV import (NinjaTrader, Rithmic, Tradovate)",
      "Full analytics dashboard with every KPI",
      "Profit factor and consistency score",
      "Equity curve and P&L distribution",
      "Advanced filters by instrument, session and setup",
      "Trading plan PDF export",
      "Priority support",
    ],
    nextSteps: [
      { label: "Import your trades from CSV", href: `${APP_URL}/dashboard/trades/import` },
      { label: "Build your trading plan", href: `${APP_URL}/dashboard/trading-plan` },
      { label: "Explore the analytics dashboard", href: `${APP_URL}/dashboard` },
    ],
  },
  zenmode: {
    features: [
      "Everything in Professional",
      "Live Discipline Copilot during your session",
      "Revenge trading detection",
      "ZenCoach, your AI trading coach",
      "Weekly AI performance report every Monday",
      "Weekly Market Radar every Sunday",
    ],
    nextSteps: [
      { label: "Start a live session with the Discipline Copilot", href: `${APP_URL}/dashboard/live-session` },
      { label: "Set up your trading plan", href: `${APP_URL}/dashboard/trading-plan` },
      { label: "Explore your dashboard", href: `${APP_URL}/dashboard` },
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
    console.warn(`[Resend] Unknown plan: ${planKey}, email not sent`);
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
    subject: `Welcome to ${planName}! Your plan is now active 🎉`,
    html,
  });

  if (error) {
    console.error("[Resend] Failed to send welcome email:", error);
    throw error;
  }

  console.log(`[Resend] Welcome email sent, plan ${planName}`);
}
