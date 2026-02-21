"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Account } from "@/types/accounts";

interface AccountFormProps {
  account?: Account;
  mode: "create" | "edit";
}

export function AccountForm({ account, mode }: AccountFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    name: account?.name || "",
    account_type: account?.account_type || "evaluation",
    broker: account?.broker || "",
    platform: account?.platform || "",
    initial_balance: account?.initial_balance?.toString() || "",
    starting_balance: account?.starting_balance?.toString() || account?.initial_balance?.toString() || "",
    drawdown_type: account?.drawdown_type || "trailing",
    max_drawdown: account?.max_drawdown?.toString() || "",
    profit_target: account?.profit_target?.toString() || "",
    buffer_amount: account?.buffer_amount?.toString() || "",
    start_date: account?.start_date || new Date().toISOString().split("T")[0],
    status: account?.status || "active",
    notes: account?.notes || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Preparar datos para enviar
      const payload = {
        name: formData.name,
        account_type: formData.account_type,
        broker: formData.broker || null,
        platform: formData.platform || null,
        initial_balance: parseFloat(formData.initial_balance),
        starting_balance: parseFloat(formData.starting_balance),
        drawdown_type: formData.drawdown_type,
        max_drawdown: parseFloat(formData.max_drawdown),
        profit_target: formData.profit_target
          ? parseFloat(formData.profit_target)
          : null,
        buffer_amount: formData.buffer_amount
          ? parseFloat(formData.buffer_amount)
          : null,
        start_date: formData.start_date,
        status: formData.status,
        notes: formData.notes || null,
      };

      const url =
        mode === "create"
          ? "/api/accounts"
          : `/api/accounts/${account?.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Error al guardar la cuenta");
        setLoading(false);
        return;
      }

      // Redirigir a la lista de cuentas
      router.push("/dashboard/accounts");
      router.refresh();
    } catch (err) {
      setError("Error de conexión");
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Nueva Cuenta" : "Editar Cuenta"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Nombre <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Ej: Prop FTMO 50k"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                disabled={loading}
              />
            </div>

            {/* Tipo de Cuenta */}
            <div className="space-y-2">
              <Label htmlFor="account_type">
                Tipo de Cuenta <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.account_type}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    account_type: value as "evaluation" | "live",
                  })
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="evaluation">Evaluación</SelectItem>
                  <SelectItem value="live">Live</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Broker */}
            <div className="space-y-2">
              <Label htmlFor="broker">Broker</Label>
              <Input
                id="broker"
                placeholder="Ej: FTMO, Apex, TopStep"
                value={formData.broker}
                onChange={(e) =>
                  setFormData({ ...formData, broker: e.target.value })
                }
                disabled={loading}
              />
            </div>

            {/* Plataforma */}
            <div className="space-y-2">
              <Label htmlFor="platform">Plataforma</Label>
              <Input
                id="platform"
                placeholder="Ej: NinjaTrader, TradingView"
                value={formData.platform}
                onChange={(e) =>
                  setFormData({ ...formData, platform: e.target.value })
                }
                disabled={loading}
              />
            </div>

            {/* Balance Inicial */}
            <div className="space-y-2">
              <Label htmlFor="initial_balance">
                Balance Inicial del Broker <span className="text-red-500">*</span>
              </Label>
              <Input
                id="initial_balance"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="50000.00"
                value={formData.initial_balance}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ 
                    ...formData, 
                    initial_balance: value,
                    // Si starting_balance está vacío, sincronizar con initial_balance
                    starting_balance: formData.starting_balance || value
                  });
                }}
                required
                disabled={loading}
              />
              <p className="text-xs text-zen-text-muted">
                Balance con el que el broker te dio la cuenta
              </p>
            </div>

            {/* Balance al Iniciar Tracking */}
            <div className="space-y-2">
              <Label htmlFor="starting_balance">
                Balance al Iniciar Tracking <span className="text-red-500">*</span>
              </Label>
              <Input
                id="starting_balance"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="50000.00"
                value={formData.starting_balance}
                onChange={(e) =>
                  setFormData({ ...formData, starting_balance: e.target.value })
                }
                required
                disabled={loading}
              />
              <p className="text-xs text-zen-text-muted">
                Balance real de tu cuenta cuando empezaste a usar ZenTrade (si difiere del inicial)
              </p>
            </div>

            {/* Tipo de Drawdown */}
            <div className="space-y-2">
              <Label htmlFor="drawdown_type">
                Tipo de Drawdown <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.drawdown_type}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    drawdown_type: value as "trailing" | "static",
                  })
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trailing">Trailing</SelectItem>
                  <SelectItem value="static">Estático</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Máximo Drawdown */}
            <div className="space-y-2">
              <Label htmlFor="max_drawdown">
                Drawdown Máximo (USD) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="max_drawdown"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="2500.00"
                value={formData.max_drawdown}
                onChange={(e) =>
                  setFormData({ ...formData, max_drawdown: e.target.value })
                }
                required
                disabled={loading}
              />
            </div>

            {/* Objetivo de Ganancia */}
            <div className="space-y-2">
              <Label htmlFor="profit_target">Objetivo de Ganancia (USD)</Label>
              <Input
                id="profit_target"
                type="number"
                step="0.01"
                min="0"
                placeholder="3000.00"
                value={formData.profit_target}
                onChange={(e) =>
                  setFormData({ ...formData, profit_target: e.target.value })
                }
                disabled={loading}
              />
            </div>

            {/* Colchón */}
            <div className="space-y-2">
              <Label htmlFor="buffer_amount">Colchón de Seguridad (USD)</Label>
              <Input
                id="buffer_amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="500.00"
                value={formData.buffer_amount}
                onChange={(e) =>
                  setFormData({ ...formData, buffer_amount: e.target.value })
                }
                disabled={loading}
              />
            </div>

            {/* Fecha Inicio */}
            <div className="space-y-2">
              <Label htmlFor="start_date">
                Fecha de Inicio <span className="text-red-500">*</span>
              </Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) =>
                  setFormData({ ...formData, start_date: e.target.value })
                }
                max={new Date().toISOString().split("T")[0]}
                required
                disabled={loading}
              />
            </div>

            {/* Estado */}
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    status: value as
                      | "active"
                      | "passed"
                      | "failed"
                      | "inactive",
                  })
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activa</SelectItem>
                  <SelectItem value="passed">Aprobada</SelectItem>
                  <SelectItem value="failed">Fallida</SelectItem>
                  <SelectItem value="inactive">Inactiva</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notas - Full Width */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              placeholder="Notas adicionales sobre esta cuenta..."
              rows={4}
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              disabled={loading}
            />
          </div>

          {/* Botones */}
          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} variant="zenGreen">
              {loading
                ? "Guardando..."
                : mode === "create"
                ? "Crear Cuenta"
                : "Guardar Cambios"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
