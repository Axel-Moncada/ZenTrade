// Tipos del Copiloto de Disciplina ("Sesión en Vivo")

export type LiveLocale = "es" | "en";

export type AlertLevel = "danger" | "warning" | "info" | "success";

export interface DisciplineAlert {
  /** Identificador estable de la regla (para deduplicar notificaciones) */
  id: string;
  level: AlertLevel;
  title: string;
  message: string;
}

export interface LiveTrade {
  id: string;
  result: number;
  contracts: number;
  side: "long" | "short";
  symbol: string;
  followedPlan: boolean;
  /** Timestamp ISO de creación — se usa como momento real del registro */
  createdAt: string;
  entryTime: string | null;
  exitTime: string | null;
}

export interface LiveAccount {
  id: string;
  name: string;
  accountType: "evaluation" | "live";
  startingBalance: number;
  currentBalance: number;
  maxDrawdown: number;
  drawdownType: "trailing" | "static";
  /** Mayor balance alcanzado tras cerrar trades (para drawdown trailing) */
  peakBalance: number;
  profitTarget: number | null;
  consistencyPercent: number;
}

export interface LivePlanRules {
  dailyLossLimit: number | null;
  dailyProfitTarget: number | null;
  maxDailyTrades: number | null;
  tradingStartTime: string | null;
  tradingEndTime: string | null;
  tradingDays: number[] | null;
  allowedInstruments: string[] | null;
}

export interface LiveInstrument {
  id: string;
  symbol: string;
  name: string;
}

export interface LiveSessionData {
  account: LiveAccount;
  plan: LivePlanRules | null;
  todayTrades: LiveTrade[];
  /** Fecha de hoy (YYYY-MM-DD) en la zona horaria del usuario */
  today: string;
  timezone: string;
  currency: string;
  /** Suma del resultado de TODOS los trades de la cuenta (para la regla de consistencia) */
  accountNetProfit: number;
  /** Mejor día de la cuenta (excluyendo hoy) */
  bestPreviousDay: number;
}

export interface DisciplineSummary {
  status: "ok" | "caution" | "stop";
  todayPnl: number;
  tradesCount: number;
  consecutiveLosses: number;
  remainingDrawdown: number;
  /** Minutos restantes de cooldown tras una pérdida (0 = sin cooldown) */
  cooldownMinutesLeft: number;
  alerts: DisciplineAlert[];
}
