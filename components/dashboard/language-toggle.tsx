"use client";

import { useI18n } from "@/lib/i18n/context";
import { Languages } from "lucide-react";

interface LanguageToggleProps {
  collapsed?: boolean;
}

export function LanguageToggle({ collapsed = false }: LanguageToggleProps) {
  const { locale, setLocale } = useI18n();

  const toggle = () => setLocale(locale === "es" ? "en" : "es");

  return (
    <button
      onClick={toggle}
      className={`flex items-center gap-3 w-full rounded-lg text-zen-anti-flash/70 hover:text-zen-anti-flash hover:bg-zen-caribbean-green/10 transition-colors py-2 px-3 my-1 ${
        collapsed ? "justify-center px-0" : "justify-start"
      }`}
      aria-label={locale === "es" ? "Switch to English" : "Cambiar a Español"}
      title={locale === "es" ? "Switch to English" : "Cambiar a Español"}
    >
      <div className="p-1.5 bg-zen-caribbean-green/20 rounded-lg transition-colors flex-shrink-0">
        <Languages className="h-4 w-4 text-zen-caribbean-green" />
      </div>
      {!collapsed && (
        <span className="font-medium text-lg">
          {locale === "es" ? "English" : "Español"}
        </span>
      )}
    </button>
  );
}
