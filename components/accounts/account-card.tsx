"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2, CheckCircle2, AlertTriangle, TrendingUp } from "lucide-react";
import type { Account } from "@/types/accounts";
import { parseISODate } from "@/lib/utils/date-helpers";
import { computeDrawdownStatus } from "@/lib/utils/drawdown";
import { formatSignedMoney } from "@/lib/utils/format-money";
import { useTr } from "@/lib/i18n/use-tr";
import {
  ACCOUNT_TYPE_LABELS,
  ACCOUNT_TYPE_COLORS,
  ACCOUNT_STATUS_LABELS,
  ACCOUNT_STATUS_COLORS,
  DRAWDOWN_TYPE_LABELS,
} from "@/types/accounts";

interface ConsistencyInfo {
  netProfit: number;   // ganancia neta = suma de todos los trades (wins - losses)
  biggestWin: number;
  passes: boolean;
  neededProfit: number; // cuánto más de ganancia neta se necesita para cumplir
}

interface AccountCardProps {
  /** peak_balance lo calcula GET /api/accounts para el drawdown trailing */
  account: Account & { peak_balance?: number };
  onDelete?: () => void;
}

export function AccountCard({ account, onDelete }: AccountCardProps) {
  const [consistency, setConsistency] = useState<ConsistencyInfo | null>(null);
  const { tr, locale } = useTr();

  useEffect(() => {
    if (account.account_type !== "live") return;
    const fetchConsistency = async () => {
      try {
        const res = await fetch(`/api/trades?account_id=${account.id}&limit=1000`);
        const data = await res.json();
        const trades: { result: number | null }[] = data.trades ?? [];
        const winningTrades = trades.filter((t) => (t.result ?? 0) > 0);
        // Ganancia NETA = suma de todos los trades (wins - losses)
        const netProfit = trades.reduce((s, t) => s + (t.result ?? 0), 0);
        const biggestWin = winningTrades.length > 0 ? Math.max(...winningTrades.map((t) => t.result ?? 0)) : 0;
        const threshold = (account.consistency_percent ?? 30) / 100;
        const passes = netProfit > 0 && biggestWin <= netProfit * threshold;
        const requiredProfit = biggestWin > 0 ? biggestWin / threshold : 0;
        const neededProfit = Math.max(0, requiredProfit - netProfit);
        setConsistency({ netProfit, biggestWin, passes, neededProfit });
      } catch {
        // silencioso
      }
    };
    fetchConsistency();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account.id, account.account_type]);
  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/accounts/${account.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || tr("Error al eliminar la cuenta", "Could not delete the account"));
        return;
      }

      if (onDelete) {
        onDelete();
      }
    } catch (err) {
      alert(tr("Error de conexión", "Connection error"));
    }
  };

  // Cálculos para métricas
  const tradePnL = account.current_balance - account.starting_balance - (account.manual_adjustments || 0);
  const balanceChange = account.current_balance - account.starting_balance;
  const balanceChangePercent =
    (balanceChange / account.starting_balance) * 100;

  const { remaining: remainingDrawdown, usedPercent: drawdownUsedPercent } = computeDrawdownStatus({
    startingBalance: Number(account.starting_balance) || 0,
    currentBalance: Number(account.current_balance) || 0,
    maxDrawdown: Number(account.max_drawdown) || 0,
    drawdownType: account.drawdown_type,
    peakBalance: account.peak_balance ?? Number(account.starting_balance) ?? 0,
  });

  // Progreso hacia el objetivo (basado en initial_balance para evaluaciones)
  const profitProgress = account.profit_target
    ? ((account.current_balance - account.initial_balance) / account.profit_target) * 100
    : 0;

  const isFailed = account.status === "failed";

  return (
    <Card className={`hover:shadow-lg transition-shadow rounded-xl backdrop-blur-sm p-6 ${
      isFailed
        ? "border-red-900/50 bg-zen-bangladesh-green/30 opacity-75"
        : "border-zen-forest/50 bg-zen-bangladesh-green/60"
    }`}>
      {/* Banner de evaluación fallida */}
      {isFailed && (
        <div className="mb-4 -mx-6 -mt-6 px-4 py-2 bg-red-900/40 border-b border-red-900/50 flex items-center gap-2 rounded-t-xl">
          <span className="text-xs font-bold text-red-400 tracking-wide uppercase">{tr("Evaluación Fallida · Solo lectura", "Failed evaluation · Read only")}</span>
        </div>
      )}
      <CardHeader>
        <div className="flex items-start justify-between text-zen-anti-flash">
          <div className="flex-1">
            <CardTitle className={`text-2xl ${isFailed ? "text-zen-anti-flash/70" : ""}`}>{account.name}</CardTitle>
            <CardDescription className="mt-1">
              {account.broker && `${account.broker} · `}
              {account.platform || tr("Sin plataforma", "No platform")}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge className={ACCOUNT_TYPE_COLORS[account.account_type]}>
              {ACCOUNT_TYPE_LABELS[account.account_type][locale]}
            </Badge>
            <Badge className={ACCOUNT_STATUS_COLORS[account.status]}>
              {ACCOUNT_STATUS_LABELS[account.status][locale]}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Balance Actual */}
        <div>
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-sm text-zen-anti-flash">{tr("Balance Actual", "Current Balance")}</span>
            <span className="text-2xl text-zen-caribbean-green font-bold bg-zen-bangladesh-green/80 px-4 py-1 rounded-full">
              ${account.current_balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          
          {/* Desglose del balance */}
          <div className="mt-2 p-3 bg-zen-rich-black/40 rounded-lg space-y-1.5 text-xs">
            <div className="flex justify-between text-zen-anti-flash/70">
              <span>{tr("Balance al Iniciar:", "Starting Balance:")}</span>
              <span className="font-medium">${account.starting_balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-zen-anti-flash/70">
              <span>{tr("P&L Trades:", "Trade P&L:")}</span>
              <span className={`font-medium ${tradePnL >= 0 ? "text-zen-caribbean-green" : "text-zen-danger"}`}>
                {formatSignedMoney(tradePnL)}
              </span>
            </div>
            
            <div className="pt-1.5 border-t border-zen-border-soft/30 flex justify-between text-zen-anti-flash font-semibold">
              <span>{tr("Balance Actual:", "Current Balance:")}</span>
              <span className={balanceChange >= 0 ? "text-zen-caribbean-green" : "text-zen-danger"}>
                {formatSignedMoney(balanceChange)} ({balanceChangePercent >= 0 ? "+" : ""}{balanceChangePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar - Objetivo */}
        {account.profit_target && (
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-zen-anti-flash mt-5">{tr("Progreso Objetivo", "Profit Target Progress")}</span>
              <span className="font-medium text-zen-anti-flash">{profitProgress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-zen-rich-black/70 rounded-full h-3">
              <div
                className="bg-zen-caribbean-green h-3 rounded-full transition-all"
                style={{ width: `${Math.min(profitProgress, 100)}%` }}
              />
            </div>
            <div className="text-xs text-zen-anti-flash mt-1">
              {tr("Meta", "Target")}: ${account.profit_target.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
          </div>
        )}

        {/* Drawdown */}
        <div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-zen-anti-flash">
              Drawdown ({DRAWDOWN_TYPE_LABELS[account.drawdown_type][locale]})
            </span>
            <span
              className={`font-medium ${
                drawdownUsedPercent > 80 ? "text-red-600" : "text-zen-anti-flash"
              }`}
            >
              {drawdownUsedPercent.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-zen-rich-black/70 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${
                drawdownUsedPercent > 80
                  ? "bg-red-600"
                  : drawdownUsedPercent > 50
                  ? "bg-yellow-500"
                  : "bg-green-600"
              }`}
              style={{ width: `${Math.min(drawdownUsedPercent, 100)}%` }}
            />
          </div>
          <div className="text-xs text-zen-anti-flash mt-1">
            {tr("Máximo", "Max")}: ${account.max_drawdown.toLocaleString("en-US", { minimumFractionDigits: 2 })} · 
            {tr("Disponible", "Remaining")}: ${remainingDrawdown.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* Información adicional */}
        <div className="pt-10 text-xs text-zen-anti-flash">
          <div>{tr("Fecha de inicio", "Start date")}: {parseISODate(account.start_date).toLocaleDateString(locale === "es" ? "es-ES" : "en-US")}</div>
        </div>

        {/* Regla de Consistencia (solo cuentas live) */}
        {account.account_type === "live" && consistency && consistency.netProfit > 0 && (
          <div className={`p-4 rounded-xl border text-sm space-y-2 ${
            consistency.passes
              ? "bg-zen-caribbean-green/5 border-zen-caribbean-green/30"
              : "bg-amber-500/5 border-amber-500/30"
          }`}>
            <div className="flex items-center gap-2 font-semibold">
              {consistency.passes ? (
                <CheckCircle2 className="h-4 w-4 text-zen-caribbean-green shrink-0" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
              )}
              <span className={consistency.passes ? "text-zen-caribbean-green" : "text-amber-400"}>
                {tr("Consistencia", "Consistency")} {account.consistency_percent ?? 30}% — {consistency.passes ? tr("Cumplida ✓", "Met ✓") : tr("Pendiente", "Pending")}
              </span>
            </div>
            <p className="text-xs text-zen-anti-flash/70 leading-relaxed">
              {consistency.passes ? (
                <>
                  {tr("Tu trade más grande fue", "Your biggest trade was")}{" "}
                  <span className="font-semibold text-zen-anti-flash">
                    ${consistency.biggestWin.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>{" "}
                  {tr(
                    `y representa menos del ${account.consistency_percent ?? 30}% de tu ganancia neta de`,
                    `and it is less than ${account.consistency_percent ?? 30}% of your net profit of`
                  )}{" "}
                  <span className="font-semibold text-zen-caribbean-green">
                    ${consistency.netProfit.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                  {tr(". Puedes solicitar un retiro.", ". You can request a payout.")}
                </>
              ) : (
                <>
                  {tr("Tu ganancia neta es", "Your net profit is")}{" "}
                  <span className="font-semibold text-zen-anti-flash">
                    ${consistency.netProfit.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                  {tr(", pero tu trade más grande fue", ", but your biggest trade was")}{" "}
                  <span className="font-semibold text-amber-400">
                    ${consistency.biggestWin.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>{" "}
                  ({((consistency.biggestWin / consistency.netProfit) * 100).toFixed(1)}% {tr("de tu ganancia neta", "of your net profit")}).{" "}
                  {tr(
                    `Para cumplir el ${account.consistency_percent ?? 30}%, necesitas acumular`,
                    `To meet the ${account.consistency_percent ?? 30}% rule, you need`
                  )}{" "}
                  <span className="font-semibold text-zen-caribbean-green">
                    ${consistency.neededProfit.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>{" "}
                  {tr("más en ganancia neta (llevar el total a", "more in net profit (bringing the total to")}{" "}
                  <span className="font-semibold text-zen-anti-flash">
                    ${(consistency.netProfit + consistency.neededProfit).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                  ).
                </>
              )}
            </p>
            {!consistency.passes && (
              <div className="flex items-center gap-2 pt-1">
                <TrendingUp className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span className="text-xs text-amber-400 font-medium">
                  {tr("Ganancia neta mínima necesaria", "Minimum net profit needed")}: $
                  {(consistency.biggestWin / ((account.consistency_percent ?? 30) / 100)).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-2 pt-3">
          <Link href={`/dashboard/accounts/${account.id}`} className="flex-1">
            {isFailed ? (
              <Button
                size="sm"
                className="w-full font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700"
              >
                <Pencil className="h-4 w-4 mr-2" />
                {tr("Ver Historial", "View History")}
              </Button>
            ) : (
              <Button
                variant="outline"
                className="w-full font-bold border-0 bg-zen-caribbean-green hover:bg-zen-caribbean-green/70 hover:text-zen-rich-black"
                size="sm"
              >
                <Pencil className="h-4 w-4 mr-2" />
                {tr("Ver / Editar", "View / Edit")}
              </Button>
            )}
          </Link>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button  size="sm" className="bg-red-800/90 text-red-200 hover:text-red-700 hover:bg-red-100/90 w-20">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-zen-dark-green border border-zen-forest/40 rounded-xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-zen-anti-flash">{tr("¿Eliminar cuenta?", "Delete account?")}</AlertDialogTitle>
                <AlertDialogDescription className="text-zen-anti-flash/60">
                  {tr(
                    `Esta acción eliminará permanentemente la cuenta "${account.name}" y todos sus trades asociados. Esta acción no se puede deshacer.`,
                    `This will permanently delete the account "${account.name}" and all of its trades. This cannot be undone.`
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-zen-bangladesh-green/30 border-zen-forest/40 text-zen-anti-flash hover:bg-zen-bangladesh-green/50 hover:text-zen-anti-flash">{tr("Cancelar", "Cancel")}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700 text-white border-0"
                >
                  {tr("Eliminar", "Delete")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
