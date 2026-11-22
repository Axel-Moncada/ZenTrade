"use client";

import { useCallback } from "react";
import { useI18n } from "./context";
import type { Locale } from "./translations";

/** Texto bilingüe. El inglés es el idioma principal (English-first). */
export type Bilingual = { es: string; en: string };

/**
 * Devuelve `tr(es, en)`, que elige el texto según el idioma activo.
 * Úsalo para textos de UI cortos dentro de componentes cliente.
 */
export function useTr(): { tr: (es: string, en: string) => string; locale: Locale } {
  const { locale } = useI18n();
  const tr = useCallback((es: string, en: string) => (locale === "es" ? es : en), [locale]);
  return { tr, locale };
}
