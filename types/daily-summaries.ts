import { Database } from "./database.types";

// Type aliases para daily_summaries
export type DailySummary = Database["public"]["Tables"]["daily_summaries"]["Row"];
export type DailySummaryInsert = Database["public"]["Tables"]["daily_summaries"]["Insert"];
export type DailySummaryUpdate = Database["public"]["Tables"]["daily_summaries"]["Update"];

// Summary con información calculada para UI
export interface DailySummaryWithMetrics extends DailySummary {
  win_rate: number;
  avg_win: number | null;
  avg_loss: number | null;
}

// Helper para calendario
export interface CalendarDay {
  date: Date;
  dateString: string; // YYYY-MM-DD
  isCurrentMonth: boolean;
  isToday: boolean;
  isPast: boolean;
  summary: DailySummary | null;
}

// Respuesta API para calendario mensual
export interface MonthlyCalendarData {
  month: number;
  year: number;
  days: CalendarDay[];
  summaries: DailySummary[];
}
