"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import tradingQuotes from "@/data/trading-quotes.json";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { DailySummary } from "@/types/daily-summaries";
import type { TradeWithInstrument, CreateTradeInput } from "@/types/trades";
import type { Account } from "@/types/accounts";
import { formatDateToReadable, formatDateToISO } from "@/lib/utils/date-helpers";
import { TrendingUp, TrendingDown, BarChart3, DollarSign, Users, Plus, Percent, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { TradesList } from "@/components/trades/trades-list";
import { TradeForm } from "@/components/trades/trade-form";

interface DayModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date;
  accountId: string;
  summary: DailySummary | null;
  onSaveNotes: (notes: string) => Promise<void>;
  onSummaryUpdate: () => Promise<void>;
}

export function DayModal({
  open,
  onOpenChange,
  date,
  accountId,
  summary,
  onSaveNotes,
  onSummaryUpdate,
}: DayModalProps) {
  const [notes, setNotes] = useState(summary?.notes || "");
  const [saving, setSaving] = useState(false);
  const [trades, setTrades] = useState<TradeWithInstrument[]>([]);
  const [loadingTrades, setLoadingTrades] = useState(false);
  const [showTradeForm, setShowTradeForm] = useState(false);
  const [tradeToEdit, setTradeToEdit] = useState<TradeWithInstrument | null>(null);
  const [tradeToDelete, setTradeToDelete] = useState<string | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [dailyQuote, setDailyQuote] = useState("");

  // Cargar quote aleatoria solo en el cliente para evitar hydration error
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * tradingQuotes.quotes.length);
    setDailyQuote(tradingQuotes.quotes[randomIndex]);
  }, []);

  const hasTrades = summary && summary.total_trades > 0;
  const winRate = hasTrades
    ? Math.round((summary.winning_trades / summary.total_trades) * 100)
    : 0;

  // Calcular porcentaje de cuenta
  const accountPercentage = account && summary && account.current_balance > 0
    ? (summary.net_pnl / account.current_balance) * 100
    : 0;

  const fetchAccount = useCallback(async () => {
    try {
      const response = await fetch(`/api/accounts/${accountId}`);
      if (response.ok) {
        const data = await response.json();
        setAccount(data.account);
      }
    } catch (error) {
      console.error("Error fetching account:", error);
    }
  }, [accountId]);

  const fetchTrades = useCallback(async () => {
    setLoadingTrades(true);
    try {
      const tradeDate = formatDateToISO(date);
      const response = await fetch(
        `/api/trades?account_id=${accountId}&trade_date=${tradeDate}`
      );
      if (response.ok) {
        const data = await response.json();
        setTrades(data.trades || []);
      }
    } catch (error) {
      console.error("Error fetching trades:", error);
    } finally {
      setLoadingTrades(false);
    }
  }, [accountId, date]);

  // Cargar trades y cuenta cuando se abre el modal
  useEffect(() => {
    if (open && accountId) {
      fetchTrades();
      fetchAccount();
    }
  }, [open, accountId, date, fetchTrades, fetchAccount]);

  // Reset notes cuando cambia el summary
  useEffect(() => {
    setNotes(summary?.notes || "");
  }, [summary]);

  const handleSaveNotes = async () => {
    setSaving(true);
    try {
      await onSaveNotes(notes);
    } catch (error) {
      console.error("Error saving notes:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateTrade = async (tradeData: CreateTradeInput) => {
    try {
      const response = await fetch("/api/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tradeData),
      });

      if (response.ok) {
        await fetchTrades();
        await onSummaryUpdate();
        setShowTradeForm(false);
      } else {
        const error = await response.json();
        console.error("Error creating trade:", error);
        alert(error.error || "Error al crear trade");
      }
    } catch (error) {
      console.error("Error creating trade:", error);
      alert("Error al crear trade");
    }
  };

  const handleUpdateTrade = async (tradeData: CreateTradeInput) => {
    if (!tradeToEdit) return;

    try {
      const response = await fetch(`/api/trades/${tradeToEdit.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tradeData),
      });

      if (response.ok) {
        await fetchTrades();
        await onSummaryUpdate();
        setTradeToEdit(null);
        setShowTradeForm(false);
      } else {
        const error = await response.json();
        console.error("Error updating trade:", error);
        alert(error.error || "Error al actualizar trade");
      }
    } catch (error) {
      console.error("Error updating trade:", error);
      alert("Error al actualizar trade");
    }
  };

  const handleEditTrade = (trade: TradeWithInstrument) => {
    setTradeToEdit(trade);
    setShowTradeForm(true);
  };

  const handleDeleteTrade = async (tradeId: string) => {
    setTradeToDelete(tradeId);
  };

  const confirmDeleteTrade = async () => {
    if (!tradeToDelete) return;

    try {
      const response = await fetch(`/api/trades/${tradeToDelete}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchTrades();
        await onSummaryUpdate();
        setTradeToDelete(null);
      } else {
        const error = await response.json();
        console.error("Error deleting trade:", error);
        alert(error.error || "Error al eliminar trade");
      }
    } catch (error) {
      console.error("Error deleting trade:", error);
      alert("Error al eliminar trade");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} >
      <DialogContent className="max-w-6xl max-h-[85vh] overflow-y-auto bg-zen-rich-black/80 backdrop-blur-sm border-zen-forest/40 p-5">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 bg-zen-dark-green/90 backdrop-blur-md border-b border-zen-forest/40 px-6 py-4 flex items-center justify-between z-10"
        >
          <div>
            <h2 className="text-2xl font-bold text-zen-anti-flash capitalize">
              {formatDateToReadable(date)}
            </h2>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="h-8 w-8 rounded-lg hover:bg-zen-caribbean-green/20 text-zen-caribbean-green flex items-center justify-center transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </motion.div>

        <div className="space-y-5 p-6 grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="h-full">
          {/* Resumen del Día */}
          {hasTrades && summary ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-none border-none rounded-xl p-4"
            >
               {/* Frase Motivacional */}
          {dailyQuote && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mb-4 p-4 rounded-lg bg-gradient-to-r from-zen-caribbean-green/10 to-zen-mountain-meadow/10 border border-zen-caribbean-green/5 h-24 flex items-center justify-center"
            >
              <p className="text-lg italic  text-zen-anti-flash text-center font-bold">
                💡 {`"${dailyQuote}"`}
              </p>
            </motion.div>
          )}

              <div className="flex items-center gap-2 mb-4 mt-12">
                <div className="p-2 bg-zen-caribbean-green/20 rounded-lg">
                  <BarChart3 className="h-4 w-4 text-zen-caribbean-green" />
                </div>
                <h3 className="font-bold text-zen-anti-flash">Resumen del Día</h3>
              </div>

              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {/* Total Trades */}
                <div className="bg-zen-surface/60 rounded-lg p-3 border border-zen-forest/30">
                  <p className="text-xs text-zen-anti-flash/60 mb-1">Operaciones</p>
                  <p className="text-xl font-bold text-zen-anti-flash">{summary.total_trades}</p>
                </div>

                {/* W/L */}
                <div className="bg-zen-surface/60 rounded-lg p-3 border border-zen-forest/30">
                  <p className="text-xs text-zen-anti-flash/60 mb-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-zen-caribbean-green" /> Ganadores/Perdedores
                  </p>
                  <p className="text-xl font-bold">
                    <span className="text-zen-caribbean-green">{summary.winning_trades}</span>
                    <span className="text-zen-anti-flash/50 mx-1">/</span>
                    <span className="text-zen-danger">{summary.losing_trades}</span>
                  </p>
                </div>

                {/* Win Rate */}
                <div className="bg-zen-surface/60 rounded-lg p-3 border border-zen-forest/30">
                  <p className="text-xs text-zen-anti-flash/60 mb-1">Win Rate</p>
                  <p className={cn("text-xl font-bold", winRate >= 50 ? "text-zen-caribbean-green" : "text-zen-danger")}>
                    {winRate}%
                  </p>
                </div>

                {/* PNL Neto */}
                <div className={cn(
                  "bg-zen-surface/60 rounded-lg p-3 border col-span-1 md:col-span-2",
                  summary.net_pnl >= 0 ? "border-zen-caribbean-green/40 bg-zen-caribbean-green/30" : "border-zen-danger/40 border-2 bg-zen-danger/20"
                )}>
                  <p className="text-xs text-zen-anti-flash/60 mb-1">PNL Neto</p>
                  <p className={cn(
                    "text-2xl font-bold",
                    summary.net_pnl >= 0 ? "text-zen-caribbean-green" : "text-zen-danger"
                  )}>
                    {summary.net_pnl >= 0 ? "+" : ""}${summary.net_pnl.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>

                {/* % de Cuenta */}
                <div className={cn(
                  "bg-zen-surface/60 rounded-lg p-3 border",
                  accountPercentage >= 0 ? "border-zen-caribbean-green/40 bg-zen-caribbean-green/30" : "border-zen-danger/40 border-2 bg-zen-danger/20"
                )}>
                  <p className="text-xs text-zen-anti-flash/60 mb-1">% Cuenta</p>
                  <p className={cn(
                    "text-lg font-bold",
                    accountPercentage >= 0 ? "text-zen-caribbean-green" : "text-zen-danger"
                  )}>
                    {accountPercentage >= 0 ? "+" : ""}{accountPercentage.toFixed(2)}%
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-zen-forest/10 border border-zen-forest/40 rounded-xl p-8 text-center"
            >
              <p className="text-zen-anti-flash/60">No hay operaciones registradas para este día</p>
            </motion.div>
          )}

          {/* Notas del Día */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            <label className="text-sm font-bold bg text-zen-anti-flash flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-zen-caribbean-green" />
              Notas del Día
            </label>
            <Textarea
              placeholder="Agrega notas sobre este día de trading..."
              rows={8}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={saving}
              className="bg-zen-caribbean-green/20 border-zen-forest/40 text-zen-anti-flash placeholder:text-zen-anti-flash/40 rounded-lg resize-none hover:border-zen-caribbean-green/60 focus:border-zen-caribbean-green/60 focus:ring-0 focus-visible:ring-0 transition-colors"
            />
            <div className="flex items-center justify-between text-xs text-zen-anti-flash/60">
              <span>{notes.length} / 2000</span>
              {notes !== (summary?.notes || "") && (
                <span className="text-zen-pistachio">✦ Sin guardar</span>
              )}
            </div>
          </motion.div>
        </div>
        <div>
         

          {/* Trades del Día */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-3 border-t border-zen-forest/30 pt-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-zen-anti-flash flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-zen-caribbean-green" />
                Trades del Día
              </h3>
              {!showTradeForm && (
                <Button
                  onClick={() => {
                    setTradeToEdit(null);
                    setShowTradeForm(true);
                  }}
                  className="h-8 px-3 bg-zen-caribbean-green hover:bg-zen-mountain-meadow text-zen-rich-black gap-2 text-xs font-semibold rounded-lg"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Nuevo
                </Button>
              )}
            </div>

            {showTradeForm ? (
              <TradeForm
                accountId={accountId}
                tradeDate={formatDateToISO(date)}
                trades={trades}
                editingTrade={tradeToEdit}
                onSubmit={tradeToEdit ? handleUpdateTrade : handleCreateTrade}
                onCancel={() => {
                  setShowTradeForm(false);
                  setTradeToEdit(null);
                }}
              />
            ) : loadingTrades ? (
              <div className="text-center py-6 text-zen-anti-flash/60 text-sm">
                Cargando trades...
              </div>
            ) : (
              <TradesList
                trades={trades}
                onEdit={handleEditTrade}
                onDelete={handleDeleteTrade}
              />
            )}
          </motion.div>

          {/* Botones */}
          {!showTradeForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex gap-3 justify-end pt-4 border-t border-zen-forest/30"
            >
              <Button
                onClick={() => onOpenChange(false)}
                disabled={saving}
                className="h-9 px-4 bg-zen-surface hover:bg-zen-forest/30 text-zen-anti-flash border border-zen-forest/40 rounded-lg font-semibold transition-colors"
              >
                Cerrar
              </Button>
              <Button
                onClick={handleSaveNotes}
                disabled={saving || notes === (summary?.notes || "")}
                className="h-9 px-4 bg-zen-caribbean-green hover:bg-zen-mountain-meadow text-zen-rich-black rounded-lg font-semibold transition-colors"
              >
                {saving ? "Guardando..." : "Guardar"}
              </Button>
            </motion.div>
          )}
        </div>
        </div>
      </DialogContent>

      {/* Diálogo de confirmación de eliminación */}
      <AlertDialog open={!!tradeToDelete} onOpenChange={() => setTradeToDelete(null)}>
        <AlertDialogContent className="bg-zen-surface/80 backdrop-blur-sm border-zen-forest/40">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-zen-anti-flash">¿Eliminar esta operación?</AlertDialogTitle>
            <AlertDialogDescription className="text-zen-anti-flash/70">
              Esta acción no se puede deshacer. La operación será eliminada permanentemente y las métricas se actualizarán automáticamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zen-surface hover:bg-zen-forest/30 text-zen-anti-flash border-zen-forest/40">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteTrade}
              className="bg-zen-danger hover:bg-zen-danger/90 text-white"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
