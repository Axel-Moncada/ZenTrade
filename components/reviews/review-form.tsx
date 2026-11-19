"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import type { Review } from "@/lib/reviews/reviews";

interface ReviewFormProps {
  initialReview?: Review | null;
  suggestedName?: string | null;
  source: "in_app" | "email";
  onDone?: (review: Review) => void;
}

const TEXT = {
  es: {
    question: "¿Zentrade te está ayudando con tu trading?",
    goodTitle: "¡Gracias! ¿Nos cuentas en una frase cómo te ayuda?",
    goodPlaceholder: "Ej: Desde que uso el journal dejé de romper mi límite diario en Apex…",
    badTitle: "Gracias por tu sinceridad. ¿Qué deberíamos mejorar?",
    badPlaceholder: "Cuéntanos qué te falta o qué no funciona. Solo lo leerá el fundador.",
    name: "Nombre a mostrar (ej: Carlos M.)",
    role: "Tu perfil (ej: Trader de NQ · Apex 50K)",
    allowPublic: "Acepto que publiquen mi testimonio en zen-trader.com",
    submit: "Enviar",
    sending: "Enviando…",
    thanksGood: "¡Gracias! Lo revisaremos antes de publicarlo.",
    thanksBad: "Gracias. Lo vamos a leer con atención.",
    trustpilot: "¿Nos ayudas también con una reseña en Trustpilot?",
    trustpilotCta: "Escribir en Trustpilot",
    error: "No se pudo enviar. Intenta de nuevo.",
  },
  en: {
    question: "Is Zentrade helping your trading?",
    goodTitle: "Thank you! Can you tell us in one sentence how it helps?",
    goodPlaceholder: "E.g. Since I started journaling I stopped breaking my daily limit on Apex…",
    badTitle: "Thanks for being honest. What should we improve?",
    badPlaceholder: "Tell us what's missing or not working. Only the founder will read it.",
    name: "Display name (e.g. Carlos M.)",
    role: "Your profile (e.g. NQ trader · Apex 50K)",
    allowPublic: "I agree to have my testimonial published on zen-trader.com",
    submit: "Send",
    sending: "Sending…",
    thanksGood: "Thank you! We'll review it before publishing.",
    thanksBad: "Thank you. We'll read it carefully.",
    trustpilot: "Would you also leave us a review on Trustpilot?",
    trustpilotCta: "Write on Trustpilot",
    error: "Could not send. Please try again.",
  },
} as const;

const TRUSTPILOT_URL = process.env.NEXT_PUBLIC_TRUSTPILOT_REVIEW_URL ?? "";

const inputClass =
  "w-full rounded-lg border border-zen-forest/60 bg-zen-rich-black/40 px-3 py-2 text-sm text-zen-anti-flash placeholder:text-zen-anti-flash/40 focus:outline-none focus:ring-1 focus:ring-zen-caribbean-green";

export function ReviewForm({ initialReview, suggestedName, source, onDone }: ReviewFormProps) {
  const { locale } = useI18n();
  const t = TEXT[locale === "es" ? "es" : "en"];

  const [rating, setRating] = useState<number>(initialReview?.rating ?? 0);
  const [hover, setHover] = useState(0);
  const [testimonial, setTestimonial] = useState(initialReview?.testimonial ?? "");
  const [displayName, setDisplayName] = useState(initialReview?.display_name ?? suggestedName ?? "");
  const [roleLabel, setRoleLabel] = useState(initialReview?.role_label ?? "");
  const [allowPublic, setAllowPublic] = useState(initialReview?.allow_public ?? true);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  const positive = rating >= 4;

  async function submit() {
    setStatus("sending");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          testimonial: testimonial.trim() || null,
          display_name: positive ? displayName.trim() || null : null,
          role_label: positive ? roleLabel.trim() || null : null,
          allow_public: positive && allowPublic,
          source,
        }),
      });
      if (!res.ok) throw new Error("request failed");
      const body = (await res.json()) as { review: Review };
      setStatus("done");
      onDone?.(body.review);
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="space-y-3 text-center">
        <p className="text-sm font-medium text-zen-caribbean-green">{positive ? t.thanksGood : t.thanksBad}</p>
        {positive && TRUSTPILOT_URL && (
          <div className="space-y-2">
            <p className="text-xs text-zen-anti-flash/70">{t.trustpilot}</p>
            <a
              href={TRUSTPILOT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-lg bg-[#00b67a] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              ★ {t.trustpilotCta}
            </a>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2 text-center">
        <p className="text-sm font-semibold text-zen-anti-flash">{t.question}</p>
        <div className="flex justify-center gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              aria-label={`${n}/5`}
              onMouseEnter={() => setHover(n)}
              onClick={() => setRating(n)}
              className="p-1"
            >
              <Star
                className={`h-8 w-8 transition-colors ${
                  n <= (hover || rating) ? "fill-amber-400 text-amber-400" : "text-zen-anti-flash/30"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {rating > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-zen-anti-flash/80">{positive ? t.goodTitle : t.badTitle}</p>
          <textarea
            className={`${inputClass} min-h-[90px]`}
            maxLength={600}
            placeholder={positive ? t.goodPlaceholder : t.badPlaceholder}
            value={testimonial}
            onChange={(e) => setTestimonial(e.target.value)}
          />
          {positive && (
            <>
              <div className="grid gap-2 sm:grid-cols-2">
                <input
                  className={inputClass}
                  maxLength={60}
                  placeholder={t.name}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
                <input
                  className={inputClass}
                  maxLength={80}
                  placeholder={t.role}
                  value={roleLabel}
                  onChange={(e) => setRoleLabel(e.target.value)}
                />
              </div>
              <label className="flex items-start gap-2 text-xs text-zen-anti-flash/70">
                <input
                  type="checkbox"
                  className="mt-0.5"
                  checked={allowPublic}
                  onChange={(e) => setAllowPublic(e.target.checked)}
                />
                {t.allowPublic}
              </label>
            </>
          )}
          <button
            type="button"
            disabled={status === "sending"}
            onClick={submit}
            className="w-full rounded-lg bg-zen-caribbean-green py-2.5 text-sm font-semibold text-zen-rich-black hover:opacity-90 disabled:opacity-50"
          >
            {status === "sending" ? t.sending : t.submit}
          </button>
          {status === "error" && <p className="text-center text-xs text-red-400">{t.error}</p>}
        </div>
      )}
    </div>
  );
}
