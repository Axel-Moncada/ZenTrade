"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, CheckCircle, Loader2, ChevronDown } from "lucide-react";

type FormState = "idle" | "sending" | "success" | "error";

export function SupportChat() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [formState, setFormState] = useState<FormState>("idle");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot

  // Hide on dashboard and auth routes
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register")
  ) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message || formState === "sending") return;

    setFormState("sending");
    try {
      const res = await fetch("/api/support/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, website }),
      });

      if (!res.ok) throw new Error("failed");
      setFormState("success");
      // Reset after delay
      setTimeout(() => {
        setFormState("idle");
        setName("");
        setEmail("");
        setMessage("");
        setOpen(false);
      }, 3500);
    } catch {
      setFormState("error");
      setTimeout(() => setFormState("idle"), 3000);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-[340px] rounded-2xl overflow-hidden shadow-2xl shadow-black/60"
            style={{ border: "1px solid rgba(0,193,124,0.15)" }}
          >
            {/* Header */}
            <div
              className="px-5 py-4 flex items-center justify-between"
              style={{
                background: "linear-gradient(135deg, #070d07 0%, #0d2318 100%)",
                borderBottom: "1px solid rgba(0,193,124,0.12)",
              }}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-9 w-9 rounded-xl bg-zen-caribbean-green/20 border border-zen-caribbean-green/30 flex items-center justify-center">
                    <span className="text-base font-black text-zen-caribbean-green leading-none">Z</span>
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-zen-caribbean-green border-2 border-[#070d07]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-zen-anti-flash leading-tight">Soporte Zentrade</p>
                  <p className="text-[11px] text-zen-caribbean-green/80 leading-tight">En línea · Respuesta rápida</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="h-7 w-7 rounded-lg flex items-center justify-center text-zen-anti-flash/40 hover:text-zen-anti-flash hover:bg-white/5 transition-all"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div style={{ background: "#0a120a" }}>
              <AnimatePresence mode="wait">
                {formState === "success" ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-10 px-6 gap-3"
                  >
                    <div className="h-14 w-14 rounded-full bg-zen-caribbean-green/15 border border-zen-caribbean-green/30 flex items-center justify-center">
                      <CheckCircle className="h-7 w-7 text-zen-caribbean-green" />
                    </div>
                    <p className="text-zen-anti-flash font-semibold text-center">¡Mensaje enviado!</p>
                    <p className="text-zen-anti-flash/50 text-xs text-center">
                      Te responderemos en support@zen-trader.com pronto.
                    </p>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onSubmit={handleSubmit}
                    className="p-5 space-y-3"
                  >
                    {/* Intro message */}
                    <div
                      className="px-3.5 py-3 rounded-xl text-xs text-zen-anti-flash/70 leading-relaxed"
                      style={{ background: "rgba(0,193,124,0.06)", border: "1px solid rgba(0,193,124,0.1)" }}
                    >
                      ¿Tienes alguna duda sobre Zentrade? Escríbenos y te respondemos lo antes posible.
                    </div>

                    {/* Honeypot */}
                    <input
                      type="text"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      tabIndex={-1}
                      aria-hidden="true"
                      className="hidden"
                      autoComplete="off"
                    />

                    {/* Name */}
                    <div>
                      <input
                        type="text"
                        placeholder="Tu nombre"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        maxLength={100}
                        className="w-full px-3.5 py-2.5 rounded-xl text-sm text-zen-anti-flash placeholder:text-zen-anti-flash/30 outline-none transition-all"
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.08)",
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.border = "1px solid rgba(0,193,124,0.4)";
                          e.currentTarget.style.background = "rgba(0,193,124,0.04)";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.border = "1px solid rgba(255,255,255,0.08)";
                          e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                        }}
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <input
                        type="email"
                        placeholder="Tu email (para responderte)"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        maxLength={200}
                        className="w-full px-3.5 py-2.5 rounded-xl text-sm text-zen-anti-flash placeholder:text-zen-anti-flash/30 outline-none transition-all"
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.08)",
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.border = "1px solid rgba(0,193,124,0.4)";
                          e.currentTarget.style.background = "rgba(0,193,124,0.04)";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.border = "1px solid rgba(255,255,255,0.08)";
                          e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                        }}
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <textarea
                        placeholder="¿En qué te podemos ayudar?"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                        minLength={10}
                        maxLength={2000}
                        rows={4}
                        className="w-full px-3.5 py-2.5 rounded-xl text-sm text-zen-anti-flash placeholder:text-zen-anti-flash/30 outline-none transition-all resize-none"
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.08)",
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.border = "1px solid rgba(0,193,124,0.4)";
                          e.currentTarget.style.background = "rgba(0,193,124,0.04)";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.border = "1px solid rgba(255,255,255,0.08)";
                          e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                        }}
                      />
                    </div>

                    {formState === "error" && (
                      <p className="text-xs text-red-400">
                        Error al enviar. Intenta de nuevo o escríbenos directamente a support@zen-trader.com
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={formState === "sending" || !name || !email || !message}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{
                        background: "linear-gradient(135deg, #00c17c 0%, #00a068 100%)",
                        color: "#070d07",
                      }}
                    >
                      {formState === "sending" ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</>
                      ) : (
                        <><Send className="h-4 w-4" /> Enviar mensaje</>
                      )}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB Button */}
      <motion.button
        onClick={() => setOpen((o) => !o)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        className="relative h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg shadow-zen-caribbean-green/20 transition-shadow hover:shadow-zen-caribbean-green/40"
        style={{
          background: open
            ? "linear-gradient(135deg, #0d2318 0%, #0a120a 100%)"
            : "linear-gradient(135deg, #00c17c 0%, #00a068 100%)",
          border: open ? "1px solid rgba(0,193,124,0.3)" : "none",
        }}
        aria-label={open ? "Cerrar soporte" : "Abrir chat de soporte"}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="h-5 w-5 text-zen-caribbean-green" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <MessageCircle className="h-5 w-5 text-zen-rich-black" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulse ring — solo cuando cerrado */}
        {!open && (
          <span className="absolute inset-0 rounded-2xl animate-ping opacity-20 bg-zen-caribbean-green" />
        )}
      </motion.button>
    </div>
  );
}
