import { computeDrawdownStatus } from "@/lib/utils/drawdown";
import type {
  AlertLevel,
  DisciplineAlert,
  DisciplineSummary,
  LiveLocale,
  LiveSessionData,
  LiveTrade,
} from "./types";

/** Minutos de pausa recomendados después de una pérdida */
export const COOLDOWN_MINUTES = 15;

const LEVEL_ORDER: Record<AlertLevel, number> = {
  danger: 0,
  warning: 1,
  info: 2,
  success: 3,
};

function formatMoney(value: number, currency: string, locale: LiveLocale): string {
  try {
    return new Intl.NumberFormat(locale === "es" ? "es-CO" : "en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `$${Math.round(value)}`;
  }
}

/** Hora (minutos desde medianoche) y día de la semana en la zona horaria del usuario */
export function getZonedClock(now: Date, timezone: string): { minutes: number; weekday: number } {
  let parts: Intl.DateTimeFormatPart[];
  try {
    parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      weekday: "short",
      hour12: false,
    }).formatToParts(now);
  } catch {
    parts = new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      weekday: "short",
      hour12: false,
    }).formatToParts(now);
  }
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? "";
  const hour = parseInt(get("hour"), 10) % 24;
  const minute = parseInt(get("minute"), 10);
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return { minutes: hour * 60 + minute, weekday: Math.max(0, weekdays.indexOf(get("weekday"))) };
}

/** Fecha YYYY-MM-DD en la zona horaria indicada */
export function getZonedDate(now: Date, timezone: string): string {
  try {
    return new Intl.DateTimeFormat("en-CA", { timeZone: timezone }).format(now);
  } catch {
    return now.toISOString().slice(0, 10);
  }
}

function hhmmToMinutes(value: string | null): number | null {
  if (!value) return null;
  const [h, m] = value.split(":").map((n) => parseInt(n, 10));
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

function sortByCreated(trades: LiveTrade[]): LiveTrade[] {
  return [...trades].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

function countTrailingLosses(sorted: LiveTrade[]): number {
  let count = 0;
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (sorted[i].result < 0) count++;
    else break;
  }
  return count;
}

const TEXT = {
  es: {
    ddBlown: ["Drawdown alcanzado", "El balance registrado llegó al límite de drawdown. No operes más esta cuenta hoy."],
    ddCritical: (left: string) => ["Drawdown crítico", `Te quedan ${left} antes del límite de la cuenta. Un trade malo y la pierdes.`],
    ddWarn: (left: string) => ["Cuidado con el drawdown", `Te quedan ${left} de drawdown. Reduce tamaño o para.`],
    dailyHit: (limit: string) => ["Límite diario alcanzado — PARA", `Llegaste a tu pérdida máxima diaria de ${limit}. Cierra la plataforma. Mañana es otro día.`],
    dailyNear: (left: string) => ["Cerca del límite diario", `Solo te quedan ${left} antes de tu pérdida máxima del día.`],
    targetHit: (target: string) => ["Objetivo diario cumplido", `Ya hiciste ${target}. Lo profesional es cerrar y proteger el día.`],
    consistency: (share: number, rule: number) => ["Regla de consistencia en riesgo", `Hoy representa el ${share}% de tu ganancia neta. Tu regla es ${rule}%. Ganar más hoy puede retrasar tu payout.`],
    maxTradesHit: (max: number) => ["Máximo de trades superado", `Tu plan permite ${max} trades por día. Esto ya es sobreoperar.`],
    maxTradesReached: (max: number) => ["Último trade del día", `Llegaste a ${max} trades, el máximo de tu plan. No abras más.`],
    lossStreakStop: (n: number) => [`${n} pérdidas seguidas`, "Tu ejecución no está bien hoy. Para, revisa tus trades y vuelve mañana."],
    lossStreakWarn: ["2 pérdidas seguidas", "El siguiente trade es el más peligroso. ¿Cumple 100% tu plan?"],
    cooldown: (min: number) => ["Pausa obligatoria", `Acabas de perder. Espera ${min} min antes de volver a entrar — así se evita el revenge trading.`],
    outsideHours: (range: string) => ["Fuera de tu horario", `Tu plan dice operar de ${range}. Fuera de ese horario tus estadísticas empeoran.`],
    offDay: ["Hoy no es día de trading", "Tu plan no incluye este día. ¿Seguro que quieres operar?"],
    instrument: (sym: string) => ["Instrumento fuera del plan", `${sym} no está en tus instrumentos permitidos.`],
    notFollowed: ["Último trade fuera del plan", "Marcaste que no seguiste el plan. Anota qué pasó antes del siguiente trade."],
    noPlan: ["Sin trading plan", "Configura tu límite diario y máximo de trades para que el copiloto pueda protegerte."],
    allGood: ["Todo en orden", "Estás dentro de tu plan. Opera solo tus setups."],
  },
  en: {
    ddBlown: ["Drawdown reached", "Your recorded balance hit the drawdown limit. Stop trading this account today."],
    ddCritical: (left: string) => ["Critical drawdown", `Only ${left} left before your account limit. One bad trade and it's gone.`],
    ddWarn: (left: string) => ["Watch your drawdown", `${left} of drawdown left. Size down or stop.`],
    dailyHit: (limit: string) => ["Daily loss limit hit — STOP", `You reached your max daily loss of ${limit}. Close the platform. Tomorrow is another day.`],
    dailyNear: (left: string) => ["Close to your daily limit", `Only ${left} left before your max daily loss.`],
    targetHit: (target: string) => ["Daily target reached", `You made ${target}. The professional move is to stop and protect the day.`],
    consistency: (share: number, rule: number) => ["Consistency rule at risk", `Today is ${share}% of your net profit. Your rule is ${rule}%. Making more today can delay your payout.`],
    maxTradesHit: (max: number) => ["Max trades exceeded", `Your plan allows ${max} trades per day. This is overtrading.`],
    maxTradesReached: (max: number) => ["Last trade of the day", `You reached ${max} trades, your plan's max. Don't open more.`],
    lossStreakStop: (n: number) => [`${n} losses in a row`, "Your execution is off today. Stop, review your trades and come back tomorrow."],
    lossStreakWarn: ["2 losses in a row", "The next trade is the most dangerous one. Does it 100% match your plan?"],
    cooldown: (min: number) => ["Mandatory pause", `You just took a loss. Wait ${min} min before re-entering — this is how you avoid revenge trading.`],
    outsideHours: (range: string) => ["Outside your hours", `Your plan says trade ${range}. Outside that window your stats get worse.`],
    offDay: ["Not a trading day", "Your plan doesn't include today. Are you sure you want to trade?"],
    instrument: (sym: string) => ["Instrument not in plan", `${sym} isn't in your allowed instruments.`],
    notFollowed: ["Last trade off-plan", "You marked that you didn't follow your plan. Write down what happened before the next trade."],
    noPlan: ["No trading plan", "Set your daily loss limit and max trades so the copilot can protect you."],
    allGood: ["All good", "You're within your plan. Only take your setups."],
  },
} as const;

/**
 * Evalúa las reglas de disciplina en tiempo real.
 * Función pura: mismos datos + misma hora ⇒ mismas alertas.
 */
export function evaluateDiscipline(
  data: LiveSessionData,
  now: Date,
  locale: LiveLocale
): DisciplineSummary {
  const t = TEXT[locale];
  const money = (v: number) => formatMoney(v, data.currency, locale);
  const alerts: DisciplineAlert[] = [];
  const push = (id: string, level: AlertLevel, [title, message]: readonly [string, string] | readonly string[]) => {
    alerts.push({ id, level, title: title ?? "", message: message ?? "" });
  };

  const { account, plan } = data;
  const sorted = sortByCreated(data.todayTrades);
  const todayPnl = sorted.reduce((sum, tr) => sum + tr.result, 0);
  const tradesCount = sorted.length;
  const consecutiveLosses = countTrailingLosses(sorted);
  const last = sorted.length > 0 ? sorted[sorted.length - 1] : null;

  // ── 1. Drawdown de la cuenta ────────────────────────────────────────
  const { remaining: remainingDrawdown } = computeDrawdownStatus({
    startingBalance: account.startingBalance,
    currentBalance: account.currentBalance,
    maxDrawdown: account.maxDrawdown,
    drawdownType: account.drawdownType,
    peakBalance: account.peakBalance,
  });
  if (account.maxDrawdown > 0) {
    if (remainingDrawdown <= 0) {
      push("drawdown", "danger", t.ddBlown);
    } else if (remainingDrawdown < account.maxDrawdown * 0.25) {
      push("drawdown", "danger", t.ddCritical(money(remainingDrawdown)));
    } else if (remainingDrawdown < account.maxDrawdown * 0.5) {
      push("drawdown", "warning", t.ddWarn(money(remainingDrawdown)));
    }
  }

  // ── 2. Límite de pérdida diaria ─────────────────────────────────────
  if (plan?.dailyLossLimit && plan.dailyLossLimit > 0) {
    const lossToday = Math.max(0, -todayPnl);
    if (lossToday >= plan.dailyLossLimit) {
      push("daily-loss", "danger", t.dailyHit(money(plan.dailyLossLimit)));
    } else if (lossToday >= plan.dailyLossLimit * 0.7) {
      push("daily-loss", "warning", t.dailyNear(money(plan.dailyLossLimit - lossToday)));
    }
  }

  // ── 3. Objetivo diario ──────────────────────────────────────────────
  if (plan?.dailyProfitTarget && plan.dailyProfitTarget > 0 && todayPnl >= plan.dailyProfitTarget) {
    push("daily-target", "success", t.targetHit(money(todayPnl)));
  }

  // ── 4. Regla de consistencia (cuentas de evaluación) ────────────────
  if (
    account.accountType === "evaluation" &&
    account.consistencyPercent > 0 &&
    todayPnl > 0 &&
    data.accountNetProfit > 0
  ) {
    const share = Math.round((todayPnl / data.accountNetProfit) * 100);
    if (share > account.consistencyPercent && data.accountNetProfit > todayPnl) {
      push("consistency", "warning", t.consistency(share, account.consistencyPercent));
    }
  }

  // ── 5. Máximo de trades ─────────────────────────────────────────────
  if (plan?.maxDailyTrades && plan.maxDailyTrades > 0) {
    if (tradesCount > plan.maxDailyTrades) {
      push("max-trades", "danger", t.maxTradesHit(plan.maxDailyTrades));
    } else if (tradesCount === plan.maxDailyTrades) {
      push("max-trades", "warning", t.maxTradesReached(plan.maxDailyTrades));
    }
  }

  // ── 6. Racha de pérdidas ────────────────────────────────────────────
  if (consecutiveLosses >= 3) {
    push("loss-streak", "danger", t.lossStreakStop(consecutiveLosses));
  } else if (consecutiveLosses === 2) {
    push("loss-streak", "warning", t.lossStreakWarn);
  }

  // ── 7. Cooldown tras pérdida (anti revenge trading) ─────────────────
  let cooldownMinutesLeft = 0;
  if (last && last.result < 0) {
    const elapsedMin = (now.getTime() - new Date(last.createdAt).getTime()) / 60000;
    if (elapsedMin >= 0 && elapsedMin < COOLDOWN_MINUTES) {
      cooldownMinutesLeft = Math.ceil(COOLDOWN_MINUTES - elapsedMin);
      push("cooldown", "warning", t.cooldown(cooldownMinutesLeft));
    }
  }

  // ── 8. Horario y días del plan ──────────────────────────────────────
  const clock = getZonedClock(now, data.timezone);
  const start = hhmmToMinutes(plan?.tradingStartTime ?? null);
  const end = hhmmToMinutes(plan?.tradingEndTime ?? null);
  if (start !== null && end !== null) {
    const inside =
      start <= end
        ? clock.minutes >= start && clock.minutes <= end
        : clock.minutes >= start || clock.minutes <= end;
    if (!inside) {
      push("hours", "warning", t.outsideHours(`${plan?.tradingStartTime} – ${plan?.tradingEndTime}`));
    }
  }
  if (plan?.tradingDays && plan.tradingDays.length > 0 && !plan.tradingDays.includes(clock.weekday)) {
    push("days", "warning", t.offDay);
  }

  // ── 9. Instrumento permitido ────────────────────────────────────────
  if (last && plan?.allowedInstruments && plan.allowedInstruments.length > 0) {
    const allowed = plan.allowedInstruments.map((s) => s.toUpperCase());
    if (!allowed.includes(last.symbol.toUpperCase())) {
      push("instrument", "warning", t.instrument(last.symbol));
    }
  }

  // ── 10. Último trade fuera del plan ─────────────────────────────────
  if (last && !last.followedPlan) {
    push("not-followed", "info", t.notFollowed);
  }

  if (!plan || (!plan.dailyLossLimit && !plan.maxDailyTrades)) {
    push("no-plan", "info", t.noPlan);
  }

  if (!alerts.some((a) => a.level === "danger" || a.level === "warning")) {
    push("all-good", "success", t.allGood);
  }

  alerts.sort((a, b) => LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level]);

  const status: DisciplineSummary["status"] = alerts.some((a) => a.level === "danger")
    ? "stop"
    : alerts.some((a) => a.level === "warning")
      ? "caution"
      : "ok";

  return {
    status,
    todayPnl,
    tradesCount,
    consecutiveLosses,
    remainingDrawdown,
    cooldownMinutesLeft,
    alerts,
  };
}
