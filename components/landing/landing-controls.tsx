"use client";

import { useEffect, useState } from "react";
import { Power } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

export function LandingControls() {
  const { locale, setLocale } = useI18n();
  const [isLight, setIsLight] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("zentrade-theme");
    const light = saved === "light";
    setIsLight(light);
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const next = !isLight;
    setIsLight(next);
    if (next) {
      document.documentElement.classList.add("light-mode");
      localStorage.setItem("zentrade-theme", "light");
    } else {
      document.documentElement.classList.remove("light-mode");
      localStorage.setItem("zentrade-theme", "dark");
    }
  };

  const toggleLocale = () => {
    setLocale(locale === "es" ? "en" : "es");
  };

  if (!mounted) return null;

  return (
    <div className="flex items-center gap-1.5">
      {/* Language toggle — flag pill */}
      <button
        onClick={toggleLocale}
        aria-label={locale === "es" ? "Switch to English" : "Cambiar a Español"}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold
          bg-white/10 hover:bg-white/20 text-white border border-white/20
          hover:border-zen-caribbean-green/60 transition-all duration-200
          hover:shadow-[0_0_8px_rgba(0,255,174,0.25)] select-none"
      >
        <span className="text-base leading-none">
          {locale === "es" ? "🇺🇸" : "🇪🇸"}
        </span>
        <span className="hidden sm:inline tracking-wide">
          {locale === "es" ? "EN" : "ES"}
        </span>
      </button>

      {/* Theme toggle — power button */}
      <button
        onClick={toggleTheme}
        aria-label={isLight ? "Activar modo oscuro" : "Activar modo claro"}
        className={`relative flex items-center justify-center w-9 h-9 rounded-full border transition-all duration-200
          ${
            isLight
              ? "bg-zen-caribbean-green/20 border-zen-caribbean-green/60 text-zen-caribbean-green shadow-[0_0_10px_rgba(0,255,174,0.3)]"
              : "bg-white/10 border-white/20 text-white/60 hover:bg-white/20 hover:border-white/40 hover:text-white"
          }`}
      >
        <Power
          className={`h-4 w-4 transition-all duration-200 ${isLight ? "drop-shadow-[0_0_4px_rgba(0,255,174,0.8)]" : ""}`}
          strokeWidth={2.5}
        />
        {/* Glow ring when active */}
        {isLight && (
          <span className="absolute inset-0 rounded-full ring-1 ring-zen-caribbean-green/30 animate-pulse" />
        )}
      </button>
    </div>
  );
}
