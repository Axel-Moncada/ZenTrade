"use client";

import { useEffect, useRef, useState } from "react";
import { Moon, Sun, ChevronDown, Check } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

function FlagCO({ className = "w-5 h-4" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 14" className={className} aria-hidden>
      <rect width="20" height="14" rx="2" fill="#FCD116"/>
      <rect y="7" width="20" height="3.5" fill="#003893"/>
      <rect y="10.5" width="20" height="3.5" rx="0" fill="#CE1126"/>
      <rect y="10.5" width="20" height="3.5" fill="#CE1126"/>
      {/* bottom corners radius clip */}
      <path d="M0 12.5v-2h20v2a2 2 0 0 1-2 1.5H2A2 2 0 0 1 0 12.5z" fill="#CE1126"/>
    </svg>
  );
}

function FlagUS({ className = "w-5 h-4" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 14" className={className} aria-hidden>
      <rect width="20" height="14" rx="2" fill="#fff"/>
      {/* 13 stripes */}
      {Array.from({ length: 7 }).map((_, i) => (
        <rect key={i} x="0" y={i * 14 / 6.5} width="20" height={14 / 13} fill="#B22234"/>
      ))}
      {/* blue canton */}
      <rect width="8" height="7" rx="1" fill="#3C3B6E"/>
      {/* 9 stars (3×3 simplified) */}
      {[1.3,2.7,4,1.3,2.7,4,1.3,2.7,4].map((cx, i) => (
        <circle key={i} cx={cx} cy={1.2 + Math.floor(i/3)*2.4} r="0.4" fill="#fff"/>
      ))}
    </svg>
  );
}

const LOCALES = [
  { code: "es" as const, Flag: FlagCO, label: "Español" },
  { code: "en" as const, Flag: FlagUS, label: "English" },
];

export function LandingControls() {
  const { locale, setLocale } = useI18n();
  const [isLight, setIsLight] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Read persisted theme
  useEffect(() => {
    const saved = localStorage.getItem("zentrade-theme");
    setIsLight(saved === "light");
    setMounted(true);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
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

  const currentLocale = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  if (!mounted) return null;

  return (
    <div className="flex items-center gap-2">

      {/* ── Language dropdown ───────────────────────────── */}
      <div ref={dropdownRef} className="relative">
        <button
          onClick={() => setLangOpen((v) => !v)}
          aria-label="Change language"
          className="landing-control-btn flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium"
        >
          <currentLocale.Flag className="w-5 h-3.5 rounded-[2px] shadow-sm" />
          <span className="hidden sm:inline">{currentLocale.code.toUpperCase()}</span>
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform duration-200 ${langOpen ? "rotate-180" : ""}`}
            strokeWidth={2.5}
          />
        </button>

        {/* Dropdown menu */}
        {langOpen && (
          <div className="landing-lang-dropdown absolute top-full right-0 mt-1.5 min-w-[130px] rounded-xl border py-1 shadow-xl z-[60]">
            {LOCALES.map((l) => (
              <button
                key={l.code}
                onClick={() => { setLocale(l.code); setLangOpen(false); }}
                className="landing-lang-item flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors"
              >
                <l.Flag className="w-5 h-3.5 rounded-[2px] shadow-sm flex-shrink-0" />
                <span className="flex-1 text-left font-medium">{l.label}</span>
                {locale === l.code && (
                  <Check className="h-3.5 w-3.5 landing-lang-check" strokeWidth={2.5} />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Theme pill toggle ───────────────────────────── */}
      <button
        onClick={toggleTheme}
        role="switch"
        aria-checked={isLight}
        aria-label={isLight ? "Activar modo oscuro" : "Activar modo claro"}
        className={`relative inline-flex h-7 w-[52px] shrink-0 items-center rounded-full border transition-all duration-300 ease-in-out
          ${isLight
            ? "bg-slate-100 border-slate-300"
            : "bg-[#0d1117] border-white/20 hover:border-white/35"
          }`}
      >
        {/* Moon icon (left track — dark mode label) */}
        <Moon
          className={`absolute left-1.5 h-3 w-3 transition-opacity duration-200 ${
            isLight ? "opacity-25 text-slate-400" : "opacity-0"
          }`}
          strokeWidth={2.5}
        />
        {/* Sun icon (right track — light mode label) */}
        <Sun
          className={`absolute right-1.5 h-3 w-3 transition-opacity duration-200 ${
            isLight ? "opacity-0" : "opacity-25 text-white"
          }`}
          strokeWidth={2.5}
        />
        {/* Sliding circle with icon inside */}
        <span
          className={`absolute flex h-[22px] w-[22px] items-center justify-center rounded-full shadow-md transition-all duration-300 ease-in-out
            ${isLight
              ? "translate-x-[27px] bg-slate-700"
              : "translate-x-[2px] bg-white"
            }`}
        >
          {isLight
            ? <Sun className="h-3 w-3 text-amber-300" strokeWidth={2.5} />
            : <Moon className="h-3 w-3 text-slate-700" strokeWidth={2.5} />
          }
        </span>
      </button>
    </div>
  );
}

