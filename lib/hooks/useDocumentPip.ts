"use client";

import { useCallback, useEffect, useState } from "react";

interface DocumentPictureInPictureApi {
  requestWindow(options?: { width?: number; height?: number }): Promise<Window>;
  window: Window | null;
}

type WindowWithPip = Window & { documentPictureInPicture?: DocumentPictureInPictureApi };

/** Copia hojas de estilo y clases de tema al documento de la ventana flotante */
function copyStyles(target: Window) {
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      const css = Array.from(sheet.cssRules)
        .map((rule) => rule.cssText)
        .join("\n");
      const style = target.document.createElement("style");
      style.textContent = css;
      target.document.head.appendChild(style);
    } catch {
      // Hoja externa (CORS): enlazarla directamente
      if (sheet.href) {
        const link = target.document.createElement("link");
        link.rel = "stylesheet";
        link.href = sheet.href;
        target.document.head.appendChild(link);
      }
    }
  }
  target.document.documentElement.className = document.documentElement.className;
  target.document.body.className = document.body.className;
}

/**
 * Ventana flotante "siempre encima" usando Document Picture-in-Picture (Chrome/Edge 116+).
 * Permite dejar el copiloto sobre la plataforma de trading.
 */
export function useDocumentPip() {
  const [pipWindow, setPipWindow] = useState<Window | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported(typeof window !== "undefined" && "documentPictureInPicture" in window);
  }, []);

  const open = useCallback(async (width = 360, height = 520) => {
    const api = (window as WindowWithPip).documentPictureInPicture;
    if (!api) return null;
    if (api.window) return api.window;
    const win = await api.requestWindow({ width, height });
    copyStyles(win);
    win.document.title = "Zentrade Copilot";
    win.addEventListener("pagehide", () => setPipWindow(null));
    setPipWindow(win);
    return win;
  }, []);

  const close = useCallback(() => {
    pipWindow?.close();
    setPipWindow(null);
  }, [pipWindow]);

  return { pipWindow, isSupported, open, close };
}
