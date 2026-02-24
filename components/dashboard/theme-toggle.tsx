"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

interface ThemeToggleProps {
  collapsed?: boolean;
}

export function ThemeToggle({ collapsed = false }: ThemeToggleProps) {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("zentrade-theme");
    if (saved === "light") {
      setIsLight(true);
      document.documentElement.classList.add("light-mode");
    }
    // Activar transiciones después del primer pintado para evitar FOUC
    const timer = setTimeout(() => {
      document.documentElement.classList.add("zen-theme-ready");
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const toggle = () => {
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

  return (
    <button
      onClick={toggle}
      className={`flex items-center gap-3 w-full rounded-lg text-zen-anti-flash/70 hover:text-zen-anti-flash hover:bg-zen-caribbean-green/10 transition-colors py-2 px-3 my-1 ${
        collapsed ? "justify-center px-0" : "justify-start"
      }`}
      aria-label={isLight ? "Cambiar a modo oscuro" : "Cambiar a modo claro"}
      title={isLight ? "Modo Oscuro" : "Modo Claro"}
    >
      <div className="p-1.5 bg-zen-caribbean-green/20 rounded-lg transition-colors flex-shrink-0">
        {isLight ? (
          <Moon className="h-4 w-4 text-zen-caribbean-green" />
        ) : (
          <Sun className="h-4 w-4 text-zen-caribbean-green" />
        )}
      </div>
      {!collapsed && (
        <span className="font-medium text-lg">
          {isLight ? "Modo Oscuro" : "Modo Claro"}
        </span>
      )}
    </button>
  );
}
