import type { Locale } from "@/lib/i18n/translations";

/** Texto bilingüe { es, en }. */
type Bilingual = { es: string; en: string };

/**
 * Emociones de un trade. La clave es el valor que se guarda en la BD
 * (histórico, en español); el label se muestra según el idioma activo.
 */
export const EMOTION_LABELS: Record<string, Bilingual> = {
  disciplinado: { es: "Disciplinado", en: "Disciplined" },
  confiado: { es: "Confiado", en: "Confident" },
  paciente: { es: "Paciente", en: "Patient" },
  ansioso: { es: "Ansioso", en: "Anxious" },
  miedo: { es: "Miedo", en: "Fearful" },
  codicia: { es: "Codicia", en: "Greedy" },
  frustrado: { es: "Frustrado", en: "Frustrated" },
  "eufórico": { es: "Eufórico", en: "Euphoric" },
  revenge_trading: { es: "Revenge Trading", en: "Revenge Trading" },
  fomo: { es: "FOMO", en: "FOMO" },
};

/** Valores de emoción en el orden en que se ofrecen en los formularios. */
export const EMOTION_VALUES: string[] = Object.keys(EMOTION_LABELS);

export function emotionLabel(value: string, locale: Locale): string {
  return EMOTION_LABELS[value]?.[locale] ?? value;
}

export const EXIT_REASON_LABELS: Record<string, Bilingual> = {
  take_profit: { es: "Take Profit", en: "Take Profit" },
  stop_loss: { es: "Stop Loss", en: "Stop Loss" },
  trailing: { es: "Trailing Stop", en: "Trailing Stop" },
  break_even: { es: "Break Even", en: "Break Even" },
  manual: { es: "Salida Manual", en: "Manual Exit" },
  timeout: { es: "Timeout", en: "Timeout" },
};

export function exitReasonLabel(value: string | null | undefined, locale: Locale): string {
  if (!value) return locale === "es" ? "Sin razón" : "No reason";
  return EXIT_REASON_LABELS[value]?.[locale] ?? value;
}
