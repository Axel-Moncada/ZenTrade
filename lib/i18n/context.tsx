"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import translations, { Locale, Translations } from "./translations";

interface I18nContextValue {
  locale: Locale;
  t: Translations;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);

/**
 * Idioma por zona:
 * - Páginas públicas (landing, pricing, blog, login…): siempre inglés (pauta EE. UU.).
 * - `/es/*`: español.
 * - `/dashboard/*`: la preferencia del usuario (selector del sidebar), inglés por defecto.
 */
function zoneLocale(pathname: string, saved: Locale): Locale {
  if (pathname === "/es" || pathname.startsWith("/es/")) return "es";
  if (pathname.startsWith("/dashboard")) return saved;
  return "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/";
  const [saved, setSaved] = useState<Locale>("en");

  useEffect(() => {
    const stored = localStorage.getItem("zentrade-locale");
    if (stored === "en" || stored === "es") setSaved(stored);
  }, []);

  const locale = zoneLocale(pathname, saved);

  const setLocale = (next: Locale) => {
    setSaved(next);
    localStorage.setItem("zentrade-locale", next);
  };

  return (
    <I18nContext.Provider
      value={{ locale, t: translations[locale] as Translations, setLocale }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}
