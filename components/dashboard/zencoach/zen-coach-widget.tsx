"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Loader2, ChevronDown, Sparkles } from "lucide-react";
import type { ZenCoachMessage } from "@/lib/agents/zencoach";

interface Props {
  accountId: string;
  accountName: string;
}

const WELCOME_MESSAGE: ZenCoachMessage = {
  role: "assistant",
  content:
    "Hola. Soy ZenCoach, tu coach de trading para esta cuenta. Tengo acceso a tus datos de los últimos 30 días.\n\nPuede preguntarme sobre tus patrones, tu adherencia al plan, tus emociones o cualquier duda sobre tu desempeño. Sin rodeos.",
};

const SUGGESTED_QUESTIONS = [
  "¿Cuál es mi mayor problema como trader este mes?",
  "¿En qué horario rindo mejor?",
  "¿Estoy siguiendo mi trading plan?",
  "Analiza mis emociones y su impacto",
];

export function ZenCoachWidget({ accountId, accountName }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ZenCoachMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent, scrollToBottom]);

  useEffect(() => {
    if (isOpen && !isLoading) {
      inputRef.current?.focus();
    }
  }, [isOpen, isLoading]);

  async function sendMessage(text: string) {
    if (!text.trim() || isLoading) return;

    const userMessage: ZenCoachMessage = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMessage];

    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    setStreamingContent("");
    setShowSuggestions(false);

    try {
      const response = await fetch("/api/agents/zencoach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId, messages: newMessages }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error ?? "Error desconocido");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No stream");

      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        setStreamingContent(accumulated);
      }

      setMessages(prev => [
        ...prev,
        { role: "assistant", content: accumulated },
      ]);
      setStreamingContent("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error de conexión";
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: `No pude procesar tu consulta: ${message}. Intenta de nuevo.`,
        },
      ]);
      setStreamingContent("");
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className={`
          fixed bottom-6 right-6 z-50
          flex items-center gap-2 px-4 py-3
          bg-violet-600 hover:bg-violet-500
          text-white text-sm font-semibold
          rounded-full shadow-lg shadow-violet-900/40
          transition-colors duration-200
          ${isOpen ? "hidden" : "flex"}
        `}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        title="Abrir ZenCoach"
      >
        <Sparkles className="h-4 w-4" />
        ZenCoach
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="zencoach-panel"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="
              fixed bottom-6 right-6 z-50
              w-[380px] max-h-[600px]
              flex flex-col
              rounded-2xl border border-white/10
              bg-zinc-900/95 backdrop-blur-xl
              shadow-2xl shadow-black/50
              overflow-hidden
            "
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/8 bg-violet-600/20">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-violet-500/30 flex items-center justify-center">
                  <Sparkles className="h-3.5 w-3.5 text-violet-300" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">ZenCoach</p>
                  <p className="text-[10px] text-zinc-400 leading-tight">
                    {accountName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
              {messages.map((msg, i) => (
                <MessageBubble key={i} message={msg} />
              ))}

              {/* Streaming bubble */}
              {streamingContent && (
                <MessageBubble
                  message={{ role: "assistant", content: streamingContent }}
                  isStreaming
                />
              )}

              {/* Loading indicator */}
              {isLoading && !streamingContent && (
                <div className="flex items-center gap-2 text-zinc-500">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span className="text-xs">Analizando tus datos...</span>
                </div>
              )}

              {/* Suggested questions */}
              {showSuggestions && messages.length === 1 && (
                <div className="space-y-1.5 pt-1">
                  {SUGGESTED_QUESTIONS.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(q)}
                      className="
                        w-full text-left text-xs
                        px-3 py-2 rounded-lg
                        border border-white/8 text-zinc-400
                        hover:border-violet-500/40 hover:text-violet-300
                        hover:bg-violet-500/5
                        transition-all duration-150
                      "
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-white/8">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Pregunta sobre tus trades..."
                  disabled={isLoading}
                  rows={1}
                  className="
                    flex-1 resize-none
                    bg-zinc-800/60 border border-white/8
                    rounded-xl px-3 py-2
                    text-sm text-white placeholder:text-zinc-600
                    focus:outline-none focus:border-violet-500/50
                    disabled:opacity-50
                    max-h-28 overflow-y-auto
                    transition-colors duration-150
                  "
                  style={{ height: "auto" }}
                  onInput={e => {
                    const el = e.currentTarget;
                    el.style.height = "auto";
                    el.style.height = Math.min(el.scrollHeight, 112) + "px";
                  }}
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isLoading}
                  className="
                    shrink-0 h-9 w-9
                    bg-violet-600 hover:bg-violet-500
                    disabled:opacity-40 disabled:cursor-not-allowed
                    rounded-xl flex items-center justify-center
                    transition-colors duration-150
                  "
                >
                  {isLoading ? (
                    <Loader2 className="h-3.5 w-3.5 text-white animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5 text-white" />
                  )}
                </button>
              </div>
              <p className="mt-1.5 text-[10px] text-zinc-600 text-center">
                ZenMode · Datos privados · No es asesoría financiera
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────

function MessageBubble({
  message,
  isStreaming = false,
}: {
  message: ZenCoachMessage;
  isStreaming?: boolean;
}) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="shrink-0 h-6 w-6 rounded-full bg-violet-500/20 flex items-center justify-center mr-2 mt-0.5">
          <MessageCircle className="h-3 w-3 text-violet-400" />
        </div>
      )}
      <div
        className={`
          max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed
          ${
            isUser
              ? "bg-violet-600/90 text-white rounded-br-sm"
              : "bg-zinc-800/70 text-zinc-200 rounded-bl-sm border border-white/5"
          }
        `}
      >
        {message.content.split("\n").map((line, i) => (
          <span key={i}>
            {line}
            {i < message.content.split("\n").length - 1 && <br />}
          </span>
        ))}
        {isStreaming && (
          <span className="inline-block ml-0.5 h-3.5 w-0.5 bg-violet-400 animate-pulse rounded-full" />
        )}
      </div>
    </div>
  );
}
