'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePlan } from '@/lib/hooks/usePlan';
import { useI18n } from '@/lib/i18n/context';
import { createClient } from '@/lib/supabase/client';
import { X, Send, ImagePlus, Loader2, ChevronDown, CheckCircle2, PhoneOff, ArrowRight, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import ZenLogo from '@/data/assets/Favicon-2.png';

const TRIAL_STORAGE_KEY = 'zentrade-zencoach-trial-used';
const TRIAL_DURATION = 5 * 60; // 5 minutes in seconds

interface Account {
  id: string;
  name: string;
  account_type: string;
  broker: string | null;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  image_url?: string | null;
  trade_registered?: { id: string; result: number; date: string } | null;
}

interface GeminiHistoryItem {
  role: 'user' | 'model';
  content: string;
}

type WidgetView = 'select_account' | 'chat' | 'trial_chat' | 'trial_ended' | 'summary';

const COPY = {
  en: {
    title: 'ZenCoach',
    trialBadge: '5-min trial',
    selectAccount: 'Select an account for this session:',
    noAccounts: 'You have no active accounts.',
    loadingSession: 'Loading session…',
    closeSession: 'End session',
    newSession: 'New session',
    sessionClosed: 'Session closed',
    placeholder: 'Write a message… (Ctrl+V to paste screenshots)',
    uploading: 'Uploading…',
    tradeRegistered: 'Trade registered',
    connecting: 'Connection error. Try again.',
    trialWelcome: "Hi! I'm **ZenCoach**, your AI trading coach. I'm here to help you trade better — whether it's psychology, prop firm rules, or reviewing your performance. I can also register trades by screenshot in the full version.\n\nTell me: which prop firm are you working with, and what's your biggest challenge right now?",
    trialEndedTitle: "Your 5-minute trial just ended 🎯",
    trialEndedBody: "Did you find it useful? In the full ZenMode plan you get **unlimited daily coaching sessions**, trade registration by screenshot, AI-powered weekly reports, revenge trading detection in real time, and your complete trading history analyzed by ZenCoach every day.",
    trialCta: "Upgrade to ZenMode — $59/mo",
    trialAlreadyUsed: "You've already used your free trial.",
    tryTrial: 'Try ZenCoach free (5 min)',
    upgradeToUnlock: 'Upgrade to ZenMode to unlock',
    trialTimeLeft: 'Trial',
  },
  es: {
    title: 'ZenCoach',
    trialBadge: 'Prueba 5 min',
    selectAccount: 'Selecciona la cuenta para esta sesión:',
    noAccounts: 'No tienes cuentas activas.',
    loadingSession: 'Cargando sesión…',
    closeSession: 'Cerrar sesión',
    newSession: 'Nueva sesión',
    sessionClosed: 'Sesión cerrada',
    placeholder: 'Escribe un mensaje… (Ctrl+V para pegar screenshots)',
    uploading: 'Subiendo…',
    tradeRegistered: 'Trade registrado',
    connecting: 'Error al conectar. Intenta de nuevo.',
    trialWelcome: "¡Hola! Soy **ZenCoach**, tu coach de trading IA. Estoy aquí para ayudarte a tradear mejor — ya sea con psicología, reglas de prop firms o revisando tu desempeño. En la versión completa también puedo registrar trades con una captura de pantalla.\n\nCuéntame: ¿con qué prop firm estás trabajando y cuál es tu mayor reto ahora mismo?",
    trialEndedTitle: "Tu prueba de 5 minutos ha terminado 🎯",
    trialEndedBody: "¿Te fue útil? Con el plan ZenMode completo tienes **sesiones de coaching ilimitadas**, registro de trades por screenshot, reportes semanales con IA, detección de revenge trading en tiempo real, y tu historial de trading analizado por ZenCoach todos los días.",
    trialCta: "Actualizar a ZenMode — $59/mes",
    trialAlreadyUsed: "Ya usaste tu prueba gratuita.",
    tryTrial: 'Prueba ZenCoach gratis (5 min)',
    upgradeToUnlock: 'Actualiza a ZenMode para acceder',
    trialTimeLeft: 'Prueba',
  },
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function ZenCoachWidget() {
  const plan = usePlan();
  const { locale } = useI18n();
  const c = COPY[locale as 'en' | 'es'] ?? COPY.en;

  const isZenMode = plan.isZenMode;
  const isAuthenticated = !plan.loading;
  const isTrial = isAuthenticated && !isZenMode;

  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<WidgetView>('select_account');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [convId, setConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [trialHistory, setTrialHistory] = useState<GeminiHistoryItem[]>([]);
  const [input, setInput] = useState('');
  const [pendingImage, setPendingImage] = useState<{ url: string; file: File } | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [loadingSession, setLoadingSession] = useState(false);
  const [trialSeconds, setTrialSeconds] = useState(TRIAL_DURATION);
  const [trialStarted, setTrialStarted] = useState(false);
  const [trialAlreadyUsed, setTrialAlreadyUsed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (messages.length > 0) scrollToBottom();
  }, [messages, scrollToBottom]);

  // Check trial state
  useEffect(() => {
    if (isTrial) {
      setTrialAlreadyUsed(localStorage.getItem(TRIAL_STORAGE_KEY) === 'true');
    }
  }, [isTrial]);

  // Countdown timer for trial
  useEffect(() => {
    if (!trialStarted || view !== 'trial_chat') return;
    timerRef.current = setInterval(() => {
      setTrialSeconds(s => {
        if (s <= 1) {
          clearInterval(timerRef.current!);
          setView('trial_ended');
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [trialStarted, view]);

  // Load accounts for ZenMode
  useEffect(() => {
    if (!isOpen || !isZenMode || accounts.length > 0) return;
    setLoadingAccounts(true);
    const supabase = createClient();
    supabase
      .from('accounts')
      .select('id, name, account_type, broker')
      .eq('status', 'active')
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        setAccounts(data ?? []);
        setLoadingAccounts(false);
      });
  }, [isOpen, isZenMode, accounts.length]);

  function openWidget() {
    setIsOpen(true);
    if (isTrial && !trialAlreadyUsed) {
      startTrial();
    } else if (isZenMode) {
      setView('select_account');
    }
  }

  function startTrial() {
    localStorage.setItem(TRIAL_STORAGE_KEY, 'true');
    setTrialAlreadyUsed(true);
    setTrialSeconds(TRIAL_DURATION);
    setTrialStarted(true);
    setView('trial_chat');
    setMessages([{
      id: 'trial-greeting',
      role: 'assistant',
      content: c.trialWelcome,
    }]);
    setTrialHistory([]);
  }

  // ── ZenMode: select account ──
  async function selectAccount(account: Account) {
    setSelectedAccount(account);
    setLoadingSession(true);
    try {
      const res = await fetch('/api/ai/chat/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account_id: account.id }),
      });
      const data = await res.json() as {
        conversation: { id: string; status: string; summary?: string };
        messages: Message[];
      };
      setConvId(data.conversation.id);
      setMessages(data.messages);
      if (data.conversation.status === 'closed') {
        setSummary(data.conversation.summary ?? null);
        setView('summary');
      } else {
        setView('chat');
        if (data.messages.length === 0) {
          setTimeout(() => {
            setMessages([{
              id: 'greeting',
              role: 'assistant',
              content: locale === 'es'
                ? `¡Hola! Soy ZenCoach, tu asistente de trading IA para la cuenta **${account.name}**. Puedo revisar tus trades, analizar tu desempeño, ayudarte con el plan de trading o registrar trades directamente. ¿Cómo puedo ayudarte hoy?`
                : `Hi! I'm ZenCoach, your AI trading assistant for the **${account.name}** account. I can review your trades, analyze your performance, help with your trading plan, or register trades directly. How can I help you today?`,
            }]);
          }, 100);
        }
      }
    } finally {
      setLoadingSession(false);
    }
  }

  // ── ZenMode: send message ──
  async function sendMessage() {
    if ((!input.trim() && !pendingImage) || isSending) return;

    const text = input.trim() || (locale === 'es' ? 'Analiza este trade.' : 'Analyze this trade.');
    const imgUrl = pendingImage?.url ?? undefined;

    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', content: text, image_url: imgUrl };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setPendingImage(null);
    setIsSending(true);

    const thinkingId = `t-${Date.now()}`;
    setMessages(prev => [...prev, { id: thinkingId, role: 'assistant', content: '...' }]);

    try {
      if (view === 'trial_chat') {
        // Trial mode: stateless call
        const res = await fetch('/api/ai/chat/trial', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text, history: trialHistory, locale }),
        });
        const data = await res.json() as { reply: string };
        setTrialHistory(prev => [
          ...prev,
          { role: 'user', content: text },
          { role: 'model', content: data.reply },
        ]);
        setMessages(prev => prev.map(m => m.id === thinkingId ? { ...m, content: data.reply } : m));
      } else if (convId) {
        // Full ZenMode mode
        const res = await fetch(`/api/ai/chat/${convId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text, image_url: imgUrl }),
        });
        const data = await res.json() as {
          reply: string;
          trade_registered?: { id: string; result: number; date: string } | null;
        };
        setMessages(prev =>
          prev.map(m =>
            m.id === thinkingId
              ? { ...m, content: data.reply, trade_registered: data.trade_registered }
              : m
          )
        );
      }
    } catch {
      setMessages(prev => prev.map(m =>
        m.id === thinkingId ? { ...m, content: c.connecting } : m
      ));
    } finally {
      setIsSending(false);
    }
  }

  async function uploadImage(file: File) {
    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/ai/upload-screenshot', { method: 'POST', body: fd });
      if (res.ok) {
        const { url } = await res.json() as { url: string };
        setPendingImage({ url, file });
      }
    } finally {
      setIsUploading(false);
    }
  }

  async function closeSession() {
    if (!convId || isClosing) return;
    setIsClosing(true);
    try {
      const res = await fetch(`/api/ai/chat/${convId}/close`, { method: 'POST' });
      const data = await res.json() as { summary?: string };
      setSummary(data.summary ?? null);
      setView('summary');
    } finally {
      setIsClosing(false);
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    for (const item of e.clipboardData.items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) void uploadImage(file);
        return;
      }
    }
  }

  function resetWidget() {
    if (timerRef.current) clearInterval(timerRef.current);
    setView(isZenMode ? 'select_account' : 'trial_chat');
    setSelectedAccount(null);
    setConvId(null);
    setMessages([]);
    setSummary(null);
    setInput('');
    setPendingImage(null);
    setTrialStarted(false);
    setTrialSeconds(TRIAL_DURATION);
    setTrialHistory([]);
  }

  // Only show for authenticated users
  if (plan.loading) return null;

  const isChat = view === 'chat' || view === 'trial_chat';
  const timerWarning = trialSeconds < 60;

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={openWidget}
          className="fixed bottom-6 right-6 z-50 group flex flex-col items-center"
          title="ZenCoach AI"
        >
          <div className="w-14 h-14 rounded-full bg-zen-caribbean-green shadow-lg shadow-zen-caribbean-green/30 flex items-center justify-center hover:scale-105 transition-transform">
            <Image src={ZenLogo} alt="ZenCoach" width={32} height={32} className="rounded-sm" />
          </div>
          {isTrial && !trialAlreadyUsed && (
            <span className="mt-1.5 text-[10px] font-semibold text-zen-caribbean-green bg-zen-dark-green/80 border border-zen-caribbean-green/30 px-2 py-0.5 rounded-full whitespace-nowrap">
              {c.tryTrial}
            </span>
          )}
        </button>
      )}

      {/* Panel */}
      {isOpen && (
        <div
          className="fixed bottom-6 right-6 z-50 w-[480px] flex flex-col rounded-2xl border border-zen-forest/30 bg-[#0d1810] shadow-2xl shadow-black/50 overflow-hidden"
          style={{ maxHeight: 'min(720px, calc(100vh - 48px))' }}
        >

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-zen-forest/20 bg-[#0a140d] shrink-0">
            <div className="flex items-center gap-2.5">
              <Image src={ZenLogo} alt="ZenCoach" width={22} height={22} className="rounded-sm" />
              <span className="text-sm font-semibold text-zen-anti-flash">{c.title}</span>
              {selectedAccount && (
                <span className="text-xs text-zen-caribbean-green/70 truncate max-w-[130px]">· {selectedAccount.name}</span>
              )}
              {isTrial && view === 'trial_chat' && (
                <span className={cn(
                  'text-[10px] font-bold px-2 py-0.5 rounded-full border',
                  timerWarning
                    ? 'text-red-400 border-red-500/30 bg-red-900/20 animate-pulse'
                    : 'text-amber-400 border-amber-500/30 bg-amber-900/20'
                )}>
                  {c.trialTimeLeft} {formatTime(trialSeconds)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              {view === 'chat' && (
                <button
                  onClick={() => void closeSession()}
                  disabled={isClosing}
                  className="flex items-center gap-1.5 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-900/30 px-2.5 py-1.5 rounded-lg border border-red-500/20 hover:border-red-500/40 transition-colors"
                >
                  {isClosing ? <Loader2 className="w-3 h-3 animate-spin" /> : <PhoneOff className="w-3 h-3" />}
                  {c.closeSession}
                </button>
              )}
              {view === 'chat' && (
                <button
                  onClick={resetWidget}
                  className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-600 hover:text-zinc-400 transition-colors"
                  title={locale === 'es' ? 'Cambiar cuenta' : 'Switch account'}
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ── TRIAL: already used gate ── */}
          {isTrial && trialAlreadyUsed && view !== 'trial_chat' && view !== 'trial_ended' && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 gap-5 text-center">
              <div className="w-16 h-16 rounded-full bg-zen-caribbean-green/10 border border-zen-caribbean-green/20 flex items-center justify-center">
                <Zap className="w-7 h-7 text-zen-caribbean-green" />
              </div>
              <div>
                <p className="text-base font-semibold text-zen-anti-flash mb-2">{c.trialAlreadyUsed}</p>
                <p className="text-sm text-zen-text-muted">{c.upgradeToUnlock}</p>
              </div>
              <UpgradeCTA locale={locale} label={c.trialCta} />
            </div>
          )}

          {/* ── ZenMode: account selector ── */}
          {view === 'select_account' && isZenMode && (
            <div className="flex-1 flex flex-col p-5 gap-3 overflow-y-auto">
              <p className="text-sm text-zen-text-muted">{c.selectAccount}</p>
              {loadingAccounts ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="w-5 h-5 animate-spin text-zen-caribbean-green" />
                </div>
              ) : accounts.length === 0 ? (
                <p className="text-sm text-zinc-500 text-center py-10">{c.noAccounts}</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {accounts.map(acc => (
                    <button
                      key={acc.id}
                      onClick={() => void selectAccount(acc)}
                      disabled={loadingSession}
                      className="text-left rounded-xl border border-zen-border-soft bg-zen-surface hover:border-zen-caribbean-green/40 hover:bg-zen-surface/80 p-4 transition-colors group"
                    >
                      <div className="text-sm font-semibold text-zen-anti-flash group-hover:text-zen-caribbean-green transition-colors">
                        {acc.name}
                      </div>
                      <div className="text-xs text-zen-text-muted mt-0.5 capitalize">
                        {acc.account_type}{acc.broker ? ` · ${acc.broker}` : ''}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {loadingSession && (
                <div className="flex items-center justify-center gap-2 py-2 text-xs text-zen-text-muted">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {c.loadingSession}
                </div>
              )}
            </div>
          )}

          {/* ── Chat (full + trial) ── */}
          {isChat && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                {messages.map(msg => (
                  <ChatMessage key={msg.id} msg={msg} locale={locale} tradeLabel={c.tradeRegistered} />
                ))}
                <div ref={messagesEndRef} />
              </div>

              {pendingImage && (
                <div className="px-4 pb-2 flex items-center gap-2 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={pendingImage.url} alt="Screenshot" className="w-16 h-12 object-cover rounded-lg border border-zen-forest/30" />
                  <span className="text-xs text-zen-text-muted flex-1 truncate">{pendingImage.file.name}</span>
                  <button onClick={() => setPendingImage(null)} className="text-zinc-600 hover:text-zinc-300">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Input */}
              <div className="border-t border-zen-forest/20 bg-[#0a140d] p-4 shrink-0">
                <div className="flex items-end gap-2 rounded-xl bg-[#111c14] border border-zen-forest/20 focus-within:border-zen-caribbean-green/40 transition-colors px-3 py-2.5">
                  {/* Image upload only for ZenMode */}
                  {isZenMode ? (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className={cn(
                        'p-1.5 rounded-lg text-zinc-500 hover:text-zen-caribbean-green hover:bg-zen-forest/20 transition-colors shrink-0 self-end mb-0.5',
                        isUploading && 'opacity-40'
                      )}
                    >
                      {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
                    </button>
                  ) : (
                    <div className="p-1.5 shrink-0 self-end mb-0.5" title={locale === 'es' ? 'Disponible en ZenMode' : 'Available in ZenMode'}>
                      <ImagePlus className="w-4 h-4 text-zinc-700" />
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) void uploadImage(f); e.target.value = ''; }}
                  />
                  <textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKey}
                    onPaste={handlePaste}
                    placeholder={c.placeholder}
                    rows={2}
                    className="flex-1 resize-none bg-transparent text-sm text-zen-anti-flash placeholder:text-zinc-600 outline-none leading-5 max-h-28 overflow-y-auto py-0.5"
                  />
                  <button
                    onClick={() => void sendMessage()}
                    disabled={isSending || (!input.trim() && !pendingImage)}
                    className={cn(
                      'p-1.5 rounded-lg transition-colors shrink-0 self-end mb-0.5',
                      (input.trim() || pendingImage) && !isSending
                        ? 'bg-zen-caribbean-green text-black hover:bg-zen-caribbean-green/90'
                        : 'text-zinc-700 cursor-not-allowed'
                    )}
                  >
                    {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ── Trial ended CTA ── */}
          {view === 'trial_ended' && (
            <div className="flex-1 flex flex-col overflow-y-auto">
              {/* Last messages (dimmed) */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 opacity-40 pointer-events-none" style={{ maxHeight: '220px' }}>
                {messages.slice(-3).map(msg => (
                  <ChatMessage key={msg.id} msg={msg} locale={locale} tradeLabel={c.tradeRegistered} />
                ))}
              </div>

              {/* CTA overlay */}
              <div className="border-t border-zen-forest/20 bg-[#0a140d] p-6 flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-zen-caribbean-green/10 border border-zen-caribbean-green/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Zap className="w-5 h-5 text-zen-caribbean-green" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zen-anti-flash mb-1">{c.trialEndedTitle}</p>
                    <p className="text-xs text-zen-text-muted leading-relaxed">
                      <MessageContent content={c.trialEndedBody} />
                    </p>
                  </div>
                </div>
                <UpgradeCTA locale={locale} label={c.trialCta} />
              </div>
            </div>
          )}

          {/* ── ZenMode: summary ── */}
          {view === 'summary' && (
            <div className="flex-1 flex flex-col p-5 gap-4 overflow-y-auto">
              <div className="flex items-center gap-2 text-zen-caribbean-green">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm font-semibold">{c.sessionClosed}</span>
              </div>
              {summary && (
                <div className="rounded-xl bg-zen-surface border border-zen-forest/20 p-4 text-sm text-zen-anti-flash/90 leading-relaxed">
                  {summary}
                </div>
              )}
              <button
                onClick={resetWidget}
                className="mt-auto w-full rounded-xl border border-zen-caribbean-green/30 py-2.5 text-sm font-medium text-zen-caribbean-green hover:bg-zen-caribbean-green/10 transition-colors"
              >
                {c.newSession}
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

function UpgradeCTA({ locale, label }: { locale: string; label: string }) {
  return (
    <Link
      href="/dashboard/billing"
      className="flex items-center justify-center gap-2 w-full rounded-xl bg-zen-caribbean-green hover:bg-zen-caribbean-green/90 text-black font-bold text-sm py-3.5 transition-colors group"
    >
      <Zap className="w-4 h-4" />
      {label}
      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

function ChatMessage({ msg, locale: _locale, tradeLabel }: { msg: Message; locale: string; tradeLabel: string }) {
  const isUser = msg.role === 'user';
  const isThinking = msg.content === '...';

  return (
    <div className={cn('flex gap-3', isUser && 'flex-row-reverse')}>
      <div className="shrink-0">
        {isUser ? (
          <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-200">T</div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-zen-caribbean-green flex items-center justify-center overflow-hidden">
            <Image src={ZenLogo} alt="ZenCoach" width={22} height={22} className="rounded-sm" />
          </div>
        )}
      </div>

      <div className={cn('flex flex-col gap-1.5 max-w-[78%]', isUser && 'items-end')}>
        {msg.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={msg.image_url} alt="Screenshot" className="rounded-lg max-w-full max-h-44 object-cover border border-zen-forest/30" />
        )}
        <div className={cn(
          'rounded-2xl px-4 py-3 text-sm leading-relaxed',
          isUser
            ? 'bg-zinc-800 text-zen-anti-flash rounded-tr-sm'
            : 'bg-[#152419] text-zen-anti-flash/95 rounded-tl-sm border border-zen-forest/20'
        )}>
          {isThinking ? (
            <span className="flex gap-1 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-zen-caribbean-green/60 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-zen-caribbean-green/60 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-zen-caribbean-green/60 animate-bounce" style={{ animationDelay: '300ms' }} />
            </span>
          ) : (
            <MessageContent content={msg.content} />
          )}
        </div>
        {msg.trade_registered && (
          <div className="flex items-center gap-1.5 text-xs text-zen-caribbean-green bg-zen-caribbean-green/10 rounded-full px-3 py-1 border border-zen-caribbean-green/20">
            <CheckCircle2 className="w-3 h-3" />
            {tradeLabel} · {(msg.trade_registered.result ?? 0) > 0 ? '+' : ''}${msg.trade_registered.result}
          </div>
        )}
      </div>
    </div>
  );
}

function MessageContent({ content }: { content: string }) {
  const parts = content.split(/(\*\*[^*]+\*\*|\n)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part === '\n') return <br key={i} />;
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-semibold text-zen-caribbean-green">{part.slice(2, -2)}</strong>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
