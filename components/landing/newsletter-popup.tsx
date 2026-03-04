"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, TrendingUp, CheckCircle2 } from "lucide-react";

const STORAGE_KEY = "zentrade-newsletter-seen";

export default function NewsletterPopup() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(STORAGE_KEY)) return;

    const handleScroll = () => {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total > 0 && scrolled / total >= 0.6) {
        setVisible(true);
        window.removeEventListener("scroll", handleScroll);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const dismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  const handleSubmit = async (e: React.FormEvent, source: "landing_popup" | "footer_form" = "landing_popup") => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: name || undefined, source }),
      });

      if (res.status === 409) {
        setError("Este email ya está suscrito.");
        return;
      }
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        setError(data.error ?? "Error al suscribirse");
        return;
      }

      setSuccess(true);
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Overlay */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={dismiss}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-md bg-[#111c11] border border-[#1e3a1e] rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="relative bg-gradient-to-br from-[#0d2010] to-[#112615] px-6 pt-6 pb-5 border-b border-[#1e3a1e]">
                <button
                  onClick={dismiss}
                  className="absolute top-4 right-4 text-[#4a6a4a] hover:text-[#a0b4a0] transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-9 w-9 rounded-full bg-[#00c17c]/15 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-[#00c17c]" />
                  </div>
                  <span className="text-xs font-semibold text-[#00c17c] uppercase tracking-widest">Newsletter</span>
                </div>
                <h2 className="text-xl font-bold text-[#f2f3f4] leading-snug">
                  Trading journal que te hace crecer
                </h2>
                <p className="mt-2 text-sm text-[#a0b4a0] font-light leading-relaxed">
                  Tips de trading, novedades de ZenTrade y acceso anticipado antes que nadie.
                </p>
              </div>

              {/* Body */}
              <div className="px-6 py-5">
                {!success ? (
                  <form onSubmit={(e) => handleSubmit(e, "landing_popup")} className="space-y-3">
                    <input
                      type="text"
                      placeholder="Tu nombre (opcional)"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#0d1a0d] border border-[#1e3a1e] rounded-lg px-4 py-2.5 text-sm text-[#f2f3f4] placeholder:text-[#4a6a4a] focus:outline-none focus:border-[#00c17c] transition-colors"
                    />
                    <input
                      type="email"
                      required
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#0d1a0d] border border-[#1e3a1e] rounded-lg px-4 py-2.5 text-sm text-[#f2f3f4] placeholder:text-[#4a6a4a] focus:outline-none focus:border-[#00c17c] transition-colors"
                    />
                    {error && (
                      <p className="text-xs text-red-400">{error}</p>
                    )}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#00c17c] hover:bg-[#00a869] disabled:opacity-60 text-[#0a0f0a] font-bold py-2.5 rounded-lg text-sm transition-colors"
                    >
                      {loading ? "Suscribiendo..." : "Quiero acceso anticipado →"}
                    </button>
                    <p className="text-center text-xs text-[#4a6a4a]">Sin spam. Cancela cuando quieras.</p>
                  </form>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-4 space-y-3"
                  >
                    <CheckCircle2 className="h-10 w-10 text-[#00c17c] mx-auto" />
                    <p className="font-bold text-[#f2f3f4]">¡Listo! Ya estás dentro.</p>
                    <p className="text-sm text-[#a0b4a0] font-light">Revisa tu email para confirmar la suscripción.</p>
                    <button onClick={dismiss} className="mt-2 text-xs text-[#4a6a4a] hover:text-[#a0b4a0] transition-colors">
                      Cerrar
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
