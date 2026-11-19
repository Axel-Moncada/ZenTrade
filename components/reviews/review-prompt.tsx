"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import type { Review } from "@/lib/reviews/reviews";
import { ReviewForm } from "./review-form";

interface ReviewStatusResponse {
  review: Review | null;
  shouldPrompt: boolean;
  suggestedName: string | null;
}

const SHOW_DELAY_MS = 4000;

/**
 * Tarjeta flotante (no modal) que pide reseña a usuarios elegibles.
 * La elegibilidad la decide GET /api/reviews (≥10 trades, ≥7 días, sin reseña, cooldown 30 días).
 */
export function ReviewPrompt() {
  const pathname = usePathname();
  const [state, setState] = useState<ReviewStatusResponse | null>(null);
  const [visible, setVisible] = useState(false);

  const excluded =
    pathname.startsWith("/dashboard/review") ||
    pathname.startsWith("/dashboard/admin") ||
    pathname.startsWith("/dashboard/live-session");

  useEffect(() => {
    if (excluded || state) return;
    let cancelled = false;
    fetch("/api/reviews", { cache: "no-store" })
      .then((r) => (r.ok ? (r.json() as Promise<ReviewStatusResponse>) : null))
      .then((data) => {
        if (!cancelled && data) setState(data);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [excluded, state]);

  useEffect(() => {
    if (!state?.shouldPrompt || excluded) return;
    const timer = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, [state, excluded]);

  function dismiss() {
    setVisible(false);
    setState((s) => (s ? { ...s, shouldPrompt: false } : s));
    void fetch("/api/reviews/dismiss", { method: "POST" });
  }

  if (!visible || excluded) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-50 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-[380px]">
      <div className="relative rounded-2xl border border-zen-caribbean-green/40 bg-zen-surface p-5 shadow-2xl shadow-black/40">
        <button
          type="button"
          onClick={dismiss}
          aria-label="Cerrar"
          className="absolute right-3 top-3 text-zen-anti-flash/50 hover:text-zen-anti-flash"
        >
          <X className="h-4 w-4" />
        </button>
        <ReviewForm
          source="in_app"
          suggestedName={state?.suggestedName}
          onDone={() => setTimeout(() => setVisible(false), 8000)}
        />
      </div>
    </div>
  );
}
