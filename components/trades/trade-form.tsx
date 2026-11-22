"use client";

import { useState, useEffect } from "react";
import { InstrumentSpec } from "@/types/instruments";
import {
  CreateTradeInput,
  ExitReason,
  TradeWithInstrument,
} from "@/types/trades";
import { Account } from "@/types/accounts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Briefcase, TrendingUp, TrendingDown, Clock, Lock } from "lucide-react";
import { TradesList } from "./trades-list";
import { ScreenshotUpload } from "./screenshot-upload";
import { usePlan } from "@/lib/hooks/usePlan";
import { createClient } from "@/lib/supabase/client";
import { EMOTION_LABELS, EMOTION_VALUES, emotionLabel } from "@/lib/constants/trade-labels";
import { ACCOUNT_TYPE_LABELS } from "@/types/accounts";
import { useTr } from "@/lib/i18n/use-tr";

const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2).toString().padStart(2, "0");
  const m = i % 2 === 0 ? "00" : "30";
  return `${h}:${m}`;
});

interface TradeFormProps {
  accountId: string;
  tradeDate: string;
  trades?: TradeWithInstrument[];
  editingTrade?: TradeWithInstrument | null;
  onSubmit: (data: CreateTradeInput) => Promise<void>;
  onCancel: () => void;
}

const EMOTION_COLOR =
  "bg-zen-caribbean-green/20 text-zen-caribbean-green border-zen-caribbean-green/40";

export function TradeForm({
  accountId,
  tradeDate,
  trades = [],
  editingTrade,
  onSubmit,
  onCancel,
}: TradeFormProps) {
  const [instruments, setInstruments] = useState<InstrumentSpec[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [currentAccount, setCurrentAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingInstruments, setLoadingInstruments] = useState(true);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [userId, setUserId] = useState<string>("");
  const { tr, locale } = useTr();

  const [formData, setFormData] = useState<CreateTradeInput>(() => {
    if (editingTrade) {
      return {
        account_id: accountId,
        instrument_id: editingTrade.instrument_id,
        trade_date: tradeDate,
        contracts: editingTrade.contracts,
        side: editingTrade.side,
        result: editingTrade.result,
        exit_reason: editingTrade.exit_reason ?? undefined,
        followed_plan: editingTrade.followed_plan,
        emotions: editingTrade.emotions || [],
        notes: editingTrade.notes || "",
        entry_time: editingTrade.entry_time ?? null,
        exit_time: editingTrade.exit_time ?? null,
        screenshot_urls: editingTrade.screenshot_urls ?? [],
      };
    }
    return {
      account_id: accountId,
      instrument_id: "",
      trade_date: tradeDate,
      contracts: 1,
      side: "long",
      result: 0,
      exit_reason: undefined,
      followed_plan: true,
      emotions: [],
      notes: "",
      entry_time: null,
      exit_time: null,
      screenshot_urls: [],
    };
  });

  const plan = usePlan();
  const canUseTimes = plan.loading || plan.isPro || plan.isZenMode;
  const [selectedEmotion, setSelectedEmotion] = useState<string>("");

  // Obtener userId del usuario autenticado
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
    });
  }, []);

  // Cargar cuentas e instrumentos disponibles
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar instrumentos
        const instrumentsResponse = await fetch("/api/instruments");
        if (instrumentsResponse.ok) {
          const instrumentsData = await instrumentsResponse.json();
          setInstruments(instrumentsData.instruments);
        }

        // Cargar cuentas
        const accountsResponse = await fetch("/api/accounts");
        if (accountsResponse.ok) {
          const accountsData = await accountsResponse.json();
          setAccounts(accountsData.accounts || []);

          // Buscar la cuenta actual
          const account = accountsData.accounts?.find(
            (a: Account) => a.id === accountId,
          );
          setCurrentAccount(account || null);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoadingInstruments(false);
        setLoadingAccounts(false);
      }
    };

    fetchData();
  }, [accountId]);

  const handleAddEmotion = () => {
    if (selectedEmotion && !formData.emotions?.includes(selectedEmotion)) {
      setFormData((prev) => ({
        ...prev,
        emotions: [...(prev.emotions || []), selectedEmotion],
      }));
      setSelectedEmotion("");
    }
  };

  const getEmotionColor = (emotion: string) =>
    EMOTION_LABELS[emotion] ? EMOTION_COLOR : "bg-purple-100 text-purple-700 border-purple-300";

  const getEmotionLabel = (emotion: string) => emotionLabel(emotion, locale);

  const handleRemoveEmotion = (emotion: string) => {
    setFormData((prev) => ({
      ...prev,
      emotions: prev.emotions?.filter((e) => e !== emotion) || [],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData: CreateTradeInput = {
        ...formData,
        exit_reason: formData.exit_reason || undefined,
        notes: formData.notes || undefined,
        emotions:
          formData.emotions && formData.emotions.length > 0
            ? formData.emotions
            : undefined,
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error("Error submitting trade:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccountChange = (newAccountId: string) => {
    setFormData((prev) => ({ ...prev, account_id: newAccountId }));
    const account = accounts.find((a) => a.id === newAccountId);
    setCurrentAccount(account || null);
  };

  return (
    <div className="space-y-4">
      {/* Información de Cuenta */}
      <div className="bg-zen-surface/60 border border-zen-forest/100 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-zen-caribbean-green" />
            <span className="text-sm font-medium text-zen-anti-flash">
              {editingTrade ? tr("Editando trade en:", "Editing trade in:") : tr("Añadiendo trade a:", "Adding trade to:")}
            </span>
          </div>
          {currentAccount && (
            <div className="flex items-center gap-2 text-sm">
              <span
                className={
                  currentAccount.current_balance >=
                  currentAccount.initial_balance
                    ? "text-zen-caribbean-green font-bold"
                    : "text-zen-danger font-medium"
                }
              >
                ${currentAccount.current_balance.toFixed(2)}
              </span>
              {currentAccount.current_balance >=
              currentAccount.initial_balance ? (
                <TrendingUp className="h-4 w-4 text-zen-caribbean-green" />
              ) : (
                <TrendingDown className="h-4 w-4 text-zen-danger" />
              )}
            </div>
          )}
        </div>

        <Select
          value={formData.account_id}
          onValueChange={handleAccountChange}
          disabled={loadingAccounts}
        >
          <SelectTrigger
            className="
    bg-zen-bangladesh-green/30
    border border-zen-bangladesh-green/40
    text-zen-anti-flash
    focus:outline-none
    focus:ring-2 focus:ring-zen-caribbean-green/60
    focus:ring-offset-0
    data-[state=open]:ring-2 data-[state=open]:ring-zen-caribbean-green/60
  "
          >
            <SelectValue placeholder={tr("Seleccionar cuenta", "Select account")} />
          </SelectTrigger>
          <SelectContent className="bg-zen-dark-green border border-zen-forest text-zen-anti-flash">
            {accounts.map((account) => (
              <SelectItem
                key={account.id}
                value={account.id}
                className="focus:bg-zen-bangladesh-green/50 focus:text-zen-anti-flash data-[highlighted]:bg-zen-bangladesh-green/50 data-[highlighted]:text-zen-anti-flash"
              >
                <div className="flex items-center justify-between gap-2">
                  <span>{account.name}</span>
                  <span className="text-xs text-zen-anti-flash/60">
                    ({ACCOUNT_TYPE_LABELS[account.account_type][locale]})
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Formulario de Trade */}
      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-zen-surface/60 border-zen-forest/40 p-4 rounded-lg border"
      >
        {/* Instrumento y Lado */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="instrument" className="text-zen-anti-flash">
              {tr("Instrumento", "Instrument")} *
            </Label>
            <Select
              value={formData.instrument_id}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, instrument_id: value }))
              }
              disabled={loadingInstruments}
            >
              <SelectTrigger className="bg-zen-surface/60 border-zen-forest/40 text-zen-anti-flash">
                <SelectValue placeholder={tr("Seleccionar", "Select")} />
              </SelectTrigger>
              <SelectContent className="bg-zen-dark-green border border-zen-forest text-zen-anti-flash">
                {instruments.map((instrument) => (
                  <SelectItem key={instrument.id} value={instrument.id}
                  className="focus:bg-zen-bangladesh-green/50 focus:text-zen-anti-flash data-[highlighted]:bg-zen-bangladesh-green/50 data-[highlighted]:text-zen-anti-flash">
                    {instrument.symbol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="side" className="text-zen-anti-flash">
              Long/Short *
            </Label>
            <Select
              value={formData.side}
              onValueChange={(value: "long" | "short") =>
                setFormData((prev) => ({ ...prev, side: value }))
              }
            >
              <SelectTrigger className="bg-zen-surface/60 border-zen-forest/40 text-zen-anti-flash">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zen-dark-green border border-zen-forest text-zen-anti-flash">
                <SelectItem value="long" className="focus:bg-zen-bangladesh-green/50 focus:text-zen-anti-flash data-[highlighted]:bg-zen-bangladesh-green/50 data-[highlighted]:text-zen-anti-flash">{tr("LONG (Compra)", "LONG (Buy)")}</SelectItem>
                <SelectItem value="short" className="focus:bg-zen-bangladesh-green/50 focus:text-zen-anti-flash data-[highlighted]:bg-zen-bangladesh-green/50 data-[highlighted]:text-zen-anti-flash">{tr("SHORT (Venta)", "SHORT (Sell)")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Hora Entrada / Salida */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-zen-caribbean-green" />
            <Label className="text-zen-anti-flash">{tr("Horario aproximado", "Approximate time")}</Label>
            {!canUseTimes && (
              <span className="inline-flex items-center gap-1 text-xs bg-zen-caribbean-green/10 border border-zen-caribbean-green/30 text-zen-caribbean-green rounded-full px-2 py-0.5">
                <Lock className="h-3 w-3" /> Professional
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-zen-anti-flash/70 text-xs mb-1 block">{tr("Hora entrada", "Entry time")}</Label>
              <Select
                value={formData.entry_time ?? ""}
                onValueChange={(v) => setFormData((prev) => ({ ...prev, entry_time: v || null }))}
                disabled={!canUseTimes}
              >
                <SelectTrigger className="bg-zen-surface/60 border-zen-forest/40 text-zen-anti-flash disabled:opacity-50 disabled:cursor-not-allowed">
                  <SelectValue placeholder="-- : --" />
                </SelectTrigger>
                <SelectContent className="bg-zen-dark-green border border-zen-forest text-zen-anti-flash max-h-60">
                  {TIME_SLOTS.map((t) => (
                    <SelectItem key={t} value={t} className="focus:bg-zen-bangladesh-green/50 focus:text-zen-anti-flash data-[highlighted]:bg-zen-bangladesh-green/50 data-[highlighted]:text-zen-anti-flash">
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-zen-anti-flash/70 text-xs mb-1 block">{tr("Hora salida", "Exit time")}</Label>
              <Select
                value={formData.exit_time ?? ""}
                onValueChange={(v) => setFormData((prev) => ({ ...prev, exit_time: v || null }))}
                disabled={!canUseTimes}
              >
                <SelectTrigger className="bg-zen-surface/60 border-zen-forest/40 text-zen-anti-flash disabled:opacity-50 disabled:cursor-not-allowed">
                  <SelectValue placeholder="-- : --" />
                </SelectTrigger>
                <SelectContent className="bg-zen-dark-green border border-zen-forest text-zen-anti-flash max-h-60">
                  {TIME_SLOTS.map((t) => (
                    <SelectItem key={t} value={t} className="focus:bg-zen-bangladesh-green/50 focus:text-zen-anti-flash data-[highlighted]:bg-zen-bangladesh-green/50 data-[highlighted]:text-zen-anti-flash">
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Contratos y Resultado */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="contracts" className="text-zen-anti-flash">
              {tr("Contratos", "Contracts")} *
            </Label>
            <Input
              id="contracts"
              type="number"
              min="1"
              value={formData.contracts}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  contracts: parseInt(e.target.value) || 1,
                }))
              }
              required
              className="bg-zen-surface/60 border-zen-forest/40 text-zen-anti-flash placeholder:text-zen-anti-flash/40 font-semibold"
            />
          </div>

          <div>
            <Label htmlFor="result" className="text-zen-anti-flash">
              {tr("Resultado (+ / -)", "Result (+ / -)")} *
            </Label>
            <Input
              id="result"
              type="number"
              step="0.01"
              value={formData.result || ""}
              onChange={(e) => {
                const value =
                  e.target.value === "" ? 0 : parseFloat(e.target.value);
                setFormData((prev) => ({
                  ...prev,
                  result: isNaN(value) ? 0 : value,
                }));
              }}
              required
              placeholder={tr("Ej: 500 o -500", "e.g. 500 or -500")}
              className={`bg-zen-surface/60 border-zen-forest/40 placeholder:text-zen-anti-flash/40 font-semibold ${formData.result >= 0 ? "text-zen-caribbean-green" : "text-zen-danger"}`}
            />
          </div>
        </div>

        {/* Razón de Salida */}
        <div>
          <Label htmlFor="exit_reason" className="text-zen-anti-flash">
            {tr("Razón de Salida", "Exit Reason")}
          </Label>
          <Select
            value={formData.exit_reason || ""}
            onValueChange={(value: ExitReason) =>
              setFormData((prev) => ({
                ...prev,
                exit_reason: value || undefined,
              }))
            }
          >
            <SelectTrigger className="bg-zen-surface/60 border-zen-forest/40 text-zen-anti-flash">
              <SelectValue placeholder={tr("Seleccionar (opcional)", "Select (optional)")} />
            </SelectTrigger>
            <SelectContent className="bg-zen-dark-green border border-zen-forest text-zen-anti-flash">
              <SelectItem value="take_profit" className="focus:bg-zen-bangladesh-green/50 focus:text-zen-anti-flash data-[highlighted]:bg-zen-bangladesh-green/50 data-[highlighted]:text-zen-anti-flash">🎯 Take Profit</SelectItem>
              <SelectItem value="stop_loss" className="focus:bg-zen-bangladesh-green/50 focus:text-zen-anti-flash data-[highlighted]:bg-zen-bangladesh-green/50 data-[highlighted]:text-zen-anti-flash">🛑 Stop Loss</SelectItem>
              <SelectItem value="trailing" className="focus:bg-zen-bangladesh-green/50 focus:text-zen-anti-flash data-[highlighted]:bg-zen-bangladesh-green/50 data-[highlighted]:text-zen-anti-flash">📈 Trailing Stop</SelectItem>
              <SelectItem value="break_even" className="focus:bg-zen-bangladesh-green/50 focus:text-zen-anti-flash data-[highlighted]:bg-zen-bangladesh-green/50 data-[highlighted]:text-zen-anti-flash">⚖️ Break Even</SelectItem>
              <SelectItem value="manual" className="focus:bg-zen-bangladesh-green/50 focus:text-zen-anti-flash data-[highlighted]:bg-zen-bangladesh-green/50 data-[highlighted]:text-zen-anti-flash">✋ {tr("Salida Manual", "Manual Exit")}</SelectItem>
              <SelectItem value="timeout" className="focus:bg-zen-bangladesh-green/50 focus:text-zen-anti-flash data-[highlighted]:bg-zen-bangladesh-green/50 data-[highlighted]:text-zen-anti-flash">⏰ Timeout</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Cumplí el Plan */}
        <div>
          <Label htmlFor="followed_plan" className="text-zen-anti-flash">
            {tr("¿Cumplí el Plan de Trading?", "Did I follow my trading plan?")} *
          </Label>
          <Select
            value={formData.followed_plan ? "yes" : "no"}
            onValueChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                followed_plan: value === "yes",
              }))
            }
          >
            <SelectTrigger className="bg-zen-surface/60 border-zen-forest/40 text-zen-anti-flash">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zen-dark-green border border-zen-forest text-zen-anti-flash">
              <SelectItem value="yes" className="focus:bg-zen-bangladesh-green/50 focus:text-zen-anti-flash data-[highlighted]:bg-zen-bangladesh-green/50 data-[highlighted]:text-zen-anti-flash">✅ {tr("Sí, cumplí el plan", "Yes, I followed my plan")}</SelectItem>
              <SelectItem value="no" className="focus:bg-zen-bangladesh-green/50 focus:text-zen-anti-flash data-[highlighted]:bg-zen-bangladesh-green/50 data-[highlighted]:text-zen-anti-flash">❌ {tr("No, no seguí el plan", "No, I broke my plan")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Emociones */}
        <div>
          <Label className="text-zen-anti-flash">{tr("Emociones", "Emotions")}</Label>
          <div className="flex gap-2 mb-2">
            <Select value={selectedEmotion} onValueChange={setSelectedEmotion}>
              <SelectTrigger className="flex-1 bg-zen-surface/60 border-zen-forest/40 text-zen-anti-flash">
                <SelectValue placeholder={tr("Agregar emoción...", "Add emotion...")} />
              </SelectTrigger>
              <SelectContent className="bg-zen-dark-green border border-zen-forest text-zen-anti-flash">
                {EMOTION_VALUES.filter(
                  (value) => !formData.emotions?.includes(value),
                ).map((value) => (
                  <SelectItem key={value} value={value} className="focus:bg-zen-bangladesh-green/50 focus:text-zen-anti-flash data-[highlighted]:bg-zen-bangladesh-green/50 data-[highlighted]:text-zen-anti-flash">
                    {emotionLabel(value, locale)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              onClick={handleAddEmotion}
              disabled={!selectedEmotion}
              className="bg-zen-caribbean-green hover:bg-zen-mountain-meadow text-zen-rich-black font-semibold"
            >
              {tr("Agregar", "Add")}
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.emotions?.map((emotion) => (
              <Badge
                key={emotion}
                variant="outline"
                className={getEmotionColor(emotion)}
              >
                {getEmotionLabel(emotion)}
                <button
                  type="button"
                  onClick={() => handleRemoveEmotion(emotion)}
                  className="ml-1 hover:opacity-70"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>

        {/* Capturas de pantalla */}
        {userId && (
          <ScreenshotUpload
            value={formData.screenshot_urls ?? []}
            onChange={(paths) => setFormData((prev) => ({ ...prev, screenshot_urls: paths }))}
            disabled={!canUseTimes}
            userId={userId}
          />
        )}

        {/* Notas */}
        <div>
          <Label htmlFor="notes" className="text-zen-anti-flash">
            {tr("Notas", "Notes")}
          </Label>
          <Textarea
            id="notes"
            value={formData.notes || ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, notes: e.target.value }))
            }
            placeholder={tr("Comentarios sobre el trade...", "What happened in this trade?")}
            rows={3}
            className="bg-zen-caribbean-green/20 border-zen-forest/40 text-zen-anti-flash placeholder:text-zen-anti-flash/40 resize-none hover:border-zen-caribbean-green/60 focus:border-zen-caribbean-green/60 focus:ring-0 focus-visible:ring-0 transition-colors"
          />
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-2 pt-2 border-t border-zen-forest/30">
          <Button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="h-9 px-4 bg-zen-surface hover:bg-zen-forest/30 text-zen-anti-flash border border-zen-forest/40 rounded-lg font-semibold transition-colors"
          >
            {tr("Cancelar", "Cancel")}
          </Button>
          <Button
            type="submit"
            disabled={loading || !formData.instrument_id}
            className="h-9 px-4 bg-zen-caribbean-green hover:bg-zen-mountain-meadow text-zen-rich-black rounded-lg font-semibold transition-colors"
          >
            {loading ? tr("Guardando...", "Saving...") : editingTrade ? tr("Actualizar Trade", "Update Trade") : tr("Guardar Trade", "Save Trade")}
          </Button>
        </div>
      </form>

      {/* Lista de Trades del Día */}
      {trades.length > 0 && (
        <div className="bg-zen-surface/60 border border-zen-forest/40 rounded-lg p-4">
          <h4 className="text-sm font-semibold mb-3 text-zen-anti-flash">
            {tr("Trades de hoy", "Today's trades")} ({trades.length})
          </h4>
          <TradesList trades={trades} />
        </div>
      )}
    </div>
  );
}
