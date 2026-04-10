import { Database } from "./database.types";

// Type aliases para facilitar el uso
export type Account = Database["public"]["Tables"]["accounts"]["Row"];
export type AccountInsert = Database["public"]["Tables"]["accounts"]["Insert"];
export type AccountUpdate = Database["public"]["Tables"]["accounts"]["Update"];

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

// Tipos helper para UI
export type AccountType = "evaluation" | "live";
export type DrawdownType = "trailing" | "static";
export type AccountStatus = "active" | "passed" | "failed" | "inactive";

// Account con información calculada para UI
export interface AccountWithMetrics extends Account {
  remaining_drawdown: number;
  drawdown_percentage: number;
  profit_percentage: number | null;
  days_active: number;
}

// Opciones para formateo
export interface CurrencyFormatOptions {
  currency: string;
  locale?: string;
}

// Labels en español para UI
export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  evaluation: "Evaluación",
  live: "Live",
};

export const DRAWDOWN_TYPE_LABELS: Record<DrawdownType, string> = {
  trailing: "Trailing",
  static: "Estático",
};

export const ACCOUNT_STATUS_LABELS: Record<AccountStatus, string> = {
  active: "Activa",
  passed: "Aprobada",
  failed: "Fallida",
  inactive: "Inactiva",
};

// Colores para badges de estado (usando paleta Zentrade)
export const ACCOUNT_STATUS_COLORS: Record<AccountStatus, string> = {
  active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/50",
  passed: "bg-green-500/20 text-green-400 border-green-500/50",
  failed: "bg-red-500/20 text-red-400 border-red-500/50",
  inactive: "bg-slate-600/20 text-slate-400 border-slate-600/50",
};

// Colores para badges de tipo (usando paleta Zentrade)
export const ACCOUNT_TYPE_COLORS: Record<AccountType, string> = {
  evaluation: "bg-amber-600/80 text-amber-400 border-amber-500/50",
  live: "bg-zen-caribbean-green/20 text-zen-caribbean-green border-zen-caribbean-green/90",
};
