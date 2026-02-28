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
import { X, Briefcase, TrendingUp, TrendingDown } from "lucide-react";
import { TradesList } from "./trades-list";

interface TradeFormProps {
  accountId: string;
  tradeDate: string;
  trades?: TradeWithInstrument[];
  editingTrade?: TradeWithInstrument | null;
  onSubmit: (data: CreateTradeInput) => Promise<void>;
  onCancel: () => void;
}

const EMOTIONS_OPTIONS = [
  {
    value: "disciplinado",
    label: "Disciplinado",
    color:
      "bg-zen-caribbean-green/20 text-zen-caribbean-green border-zen-caribbean-green/40",
  },
  {
    value: "confiado",
    label: "Confiado",
    color: "bg-zen-caribbean-green/20 text-zen-caribbean-green border-zen-caribbean-green/40",
  },
  {
    value: "paciente",
    label: "Paciente",
    color: "bg-zen-caribbean-green/20 text-zen-caribbean-green border-zen-caribbean-green/40",
  },
  {
    value: "ansioso",
    label: "Ansioso",
    color: "bg-zen-caribbean-green/20 text-zen-caribbean-green border-zen-caribbean-green/40",
  },
  {
    value: "miedo",
    label: "Miedo",
    color: "bg-zen-caribbean-green/20 text-zen-caribbean-green border-zen-caribbean-green/40",
  },
  {
    value: "codicia",
    label: "Codicia",
    color: "bg-zen-caribbean-green/20 text-zen-caribbean-green border-zen-caribbean-green/40",
  },
  {
    value: "frustrado",
    label: "Frustrado",
    color: "bg-zen-caribbean-green/20 text-zen-caribbean-green border-zen-caribbean-green/40",
  },
  {
    value: "eufórico",
    label: "Eufórico",
    color:
      "bg-zen-caribbean-green/20 text-zen-caribbean-green border-zen-caribbean-green/40",
  },
  {
    value: "revenge_trading",
    label: "Venganza Trading",
    color: "bg-zen-caribbean-green/20 text-zen-caribbean-green border-zen-caribbean-green/40",
  },
  {
    value: "fomo",
    label: "FOMO",
    color: "bg-zen-caribbean-green/20 text-zen-caribbean-green border-zen-caribbean-green/40",
  },
];

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
    };
  });

  const [selectedEmotion, setSelectedEmotion] = useState<string>("");

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

  const getEmotionColor = (emotion: string) => {
    const emotionObj = EMOTIONS_OPTIONS.find((e) => e.value === emotion);
    return (
      emotionObj?.color || "bg-purple-100 text-purple-700 border-purple-300"
    );
  };

  const getEmotionLabel = (emotion: string) => {
    const emotionObj = EMOTIONS_OPTIONS.find((e) => e.value === emotion);
    return emotionObj?.label || emotion;
  };

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
              {editingTrade ? 'Editando trade en:' : 'Añadiendo trade a:'}
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
            <SelectValue placeholder="Seleccionar cuenta" />
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
                    ({account.account_type})
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
              Instrumento *
            </Label>
            <Select
              value={formData.instrument_id}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, instrument_id: value }))
              }
              disabled={loadingInstruments}
            >
              <SelectTrigger className="bg-zen-surface/60 border-zen-forest/40 text-zen-anti-flash">
                <SelectValue placeholder="Seleccionar" />
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
                <SelectItem value="long" className="focus:bg-zen-bangladesh-green/50 focus:text-zen-anti-flash data-[highlighted]:bg-zen-bangladesh-green/50 data-[highlighted]:text-zen-anti-flash">LONG (Compra)</SelectItem>
                <SelectItem value="short" className="focus:bg-zen-bangladesh-green/50 focus:text-zen-anti-flash data-[highlighted]:bg-zen-bangladesh-green/50 data-[highlighted]:text-zen-anti-flash">SHORT (Venta)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Contratos y Resultado */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="contracts" className="text-zen-anti-flash">
              Contratos *
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
              Resultado (+ / -) *
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
              placeholder="Ej: 500 o -500"
              className={`bg-zen-surface/60 border-zen-forest/40 placeholder:text-zen-anti-flash/40 font-semibold ${formData.result >= 0 ? "text-zen-caribbean-green" : "text-zen-danger"}`}
            />
          </div>
        </div>

        {/* Razón de Salida */}
        <div>
          <Label htmlFor="exit_reason" className="text-zen-anti-flash">
            Razón de Salida
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
              <SelectValue placeholder="Seleccionar (opcional)" />
            </SelectTrigger>
            <SelectContent className="bg-zen-dark-green border border-zen-forest text-zen-anti-flash">
              <SelectItem value="take_profit" className="focus:bg-zen-bangladesh-green/50 focus:text-zen-anti-flash data-[highlighted]:bg-zen-bangladesh-green/50 data-[highlighted]:text-zen-anti-flash">🎯 Take Profit</SelectItem>
              <SelectItem value="stop_loss" className="focus:bg-zen-bangladesh-green/50 focus:text-zen-anti-flash data-[highlighted]:bg-zen-bangladesh-green/50 data-[highlighted]:text-zen-anti-flash">🛑 Stop Loss</SelectItem>
              <SelectItem value="break_even" className="focus:bg-zen-bangladesh-green/50 focus:text-zen-anti-flash data-[highlighted]:bg-zen-bangladesh-green/50 data-[highlighted]:text-zen-anti-flash">⚖️ Break Even</SelectItem>
              <SelectItem value="manual" className="focus:bg-zen-bangladesh-green/50 focus:text-zen-anti-flash data-[highlighted]:bg-zen-bangladesh-green/50 data-[highlighted]:text-zen-anti-flash">✋ Salida Manual</SelectItem>
              <SelectItem value="timeout" className="focus:bg-zen-bangladesh-green/50 focus:text-zen-anti-flash data-[highlighted]:bg-zen-bangladesh-green/50 data-[highlighted]:text-zen-anti-flash">⏰ Timeout</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Cumplí el Plan */}
        <div>
          <Label htmlFor="followed_plan" className="text-zen-anti-flash">
            ¿Cumplí el Plan de Trading? *
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
              <SelectItem value="yes" className="focus:bg-zen-bangladesh-green/50 focus:text-zen-anti-flash data-[highlighted]:bg-zen-bangladesh-green/50 data-[highlighted]:text-zen-anti-flash">✅ Sí, cumplí el plan</SelectItem>
              <SelectItem value="no" className="focus:bg-zen-bangladesh-green/50 focus:text-zen-anti-flash data-[highlighted]:bg-zen-bangladesh-green/50 data-[highlighted]:text-zen-anti-flash">❌ No, no seguí el plan</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Emociones */}
        <div>
          <Label className="text-zen-anti-flash">Emociones</Label>
          <div className="flex gap-2 mb-2">
            <Select value={selectedEmotion} onValueChange={setSelectedEmotion}>
              <SelectTrigger className="flex-1 bg-zen-surface/60 border-zen-forest/40 text-zen-anti-flash">
                <SelectValue placeholder="Agregar emoción..." />
              </SelectTrigger>
              <SelectContent className="bg-zen-dark-green border border-zen-forest text-zen-anti-flash">
                {EMOTIONS_OPTIONS.filter(
                  (e) => !formData.emotions?.includes(e.value),
                ).map((emotion) => (
                  <SelectItem key={emotion.value} value={emotion.value} className="focus:bg-zen-bangladesh-green/50 focus:text-zen-anti-flash data-[highlighted]:bg-zen-bangladesh-green/50 data-[highlighted]:text-zen-anti-flash">
                    {emotion.label}
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
              Agregar
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

        {/* Notas */}
        <div>
          <Label htmlFor="notes" className="text-zen-anti-flash">
            Notas
          </Label>
          <Textarea
            id="notes"
            value={formData.notes || ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, notes: e.target.value }))
            }
            placeholder="Comentarios sobre el trade..."
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
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading || !formData.instrument_id}
            className="h-9 px-4 bg-zen-caribbean-green hover:bg-zen-mountain-meadow text-zen-rich-black rounded-lg font-semibold transition-colors"
          >
            {loading ? "Guardando..." : editingTrade ? "Actualizar Trade" : "Guardar Trade"}
          </Button>
        </div>
      </form>

      {/* Lista de Trades del Día */}
      {trades.length > 0 && (
        <div className="bg-zen-surface/60 border border-zen-forest/40 rounded-lg p-4">
          <h4 className="text-sm font-semibold mb-3 text-zen-anti-flash">
            Trades de hoy ({trades.length})
          </h4>
          <TradesList trades={trades} />
        </div>
      )}
    </div>
  );
}
