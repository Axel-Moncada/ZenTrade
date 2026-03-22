'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Plus, ToggleLeft, ToggleRight, Copy, TrendingUp } from 'lucide-react';

interface AffiliateConversion {
  id: string;
  commission_cents: number;
  discounted_amount_cents: number;
  created_at: string;
}

interface AffiliateCode {
  id: string;
  code: string;
  name: string;
  discount_percent: number;
  commission_percent: number;
  is_active: boolean;
  max_uses: number | null;
  uses_count: number;
  notes: string | null;
  created_at: string;
  affiliate_conversions: AffiliateConversion[];
}

interface Props {
  codes: AffiliateCode[];
}

const EMPTY_FORM = {
  code:               '',
  name:               '',
  discount_percent:   15,
  commission_percent: 10,
  max_uses:           '',
  notes:              '',
};

export default function AffiliatesAdminPanel({ codes: initialCodes }: Props) {
  const [codes, setCodes]           = useState<AffiliateCode[]>(initialCodes);
  const [showForm, setShowForm]     = useState(false);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/affiliates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code:               form.code.toUpperCase().trim(),
          name:               form.name.trim(),
          discount_percent:   form.discount_percent,
          commission_percent: form.commission_percent,
          max_uses:           form.max_uses ? parseInt(form.max_uses) : null,
          notes:              form.notes.trim() || undefined,
        }),
      });
      const data = await res.json() as { code?: AffiliateCode; error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Error desconocido');

      setCodes((prev) => [{ ...data.code!, affiliate_conversions: [] }, ...prev]);
      setForm(EMPTY_FORM);
      setShowForm(false);
      toast.success(`Código ${data.code!.code} creado`);
    } catch (err) {
      toast.error('Error al crear código', {
        description: err instanceof Error ? err.message : 'Intenta de nuevo',
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggle(code: AffiliateCode) {
    setTogglingId(code.id);
    try {
      const res = await fetch(`/api/admin/affiliates/${code.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !code.is_active }),
      });
      const data = await res.json() as { code?: AffiliateCode; error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Error desconocido');

      setCodes((prev) =>
        prev.map((c) => (c.id === code.id ? { ...c, is_active: !c.is_active } : c)),
      );
      toast.success(`Código ${code.code} ${!code.is_active ? 'activado' : 'desactivado'}`);
    } catch (err) {
      toast.error('Error al actualizar', {
        description: err instanceof Error ? err.message : 'Intenta de nuevo',
      });
    } finally {
      setTogglingId(null);
    }
  }

  function copyCode(code: string) {
    void navigator.clipboard.writeText(code);
    toast.success(`Código ${code} copiado`);
  }

  function formatCOP(cents: number): string {
    return `$${(cents / 100).toLocaleString('es-CO')} COP`;
  }

  const totalCommissions = codes.reduce(
    (sum, c) => sum + c.affiliate_conversions.reduce((s, cv) => s + cv.commission_cents, 0),
    0,
  );
  const totalConversions = codes.reduce((sum, c) => sum + c.affiliate_conversions.length, 0);

  return (
    <div className="space-y-6">

      {/* ── Stats summary ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Códigos activos', value: codes.filter((c) => c.is_active).length },
          { label: 'Total conversiones', value: totalConversions },
          { label: 'Comisiones generadas', value: formatCOP(totalCommissions) },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl p-4"
            style={{ background: '#002E21', border: '1px solid #0F5132' }}
          >
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{stat.label}</p>
            <p className="text-2xl font-semibold text-zen-anti-flash mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* ── Header + crear ── */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zen-anti-flash">Códigos de afiliado</h2>
        <Button
          onClick={() => setShowForm((v) => !v)}
          className="font-semibold"
          style={{ background: '#00C17C', color: '#001B1F' }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo código
        </Button>
      </div>

      {/* ── Formulario de creación ── */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="rounded-xl p-5 space-y-4"
          style={{ background: '#002E21', border: '1px solid #00C17C' }}
        >
          <h3 className="font-semibold text-zen-anti-flash">Nuevo código de afiliado</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                Código <span className="text-xs">(letras mayúsculas, números, _)</span>
              </label>
              <Input
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="TRADER20"
                required
                pattern="[A-Z0-9_]+"
                minLength={3}
                maxLength={20}
                className="bg-zen-surface border-zen-forest/30 text-zen-anti-flash font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                Nombre del influencer
              </label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Juan Pérez"
                required
                className="bg-zen-surface border-zen-forest/30 text-zen-anti-flash"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                Descuento al usuario (%)
              </label>
              <Input
                type="number"
                min={0}
                max={100}
                value={form.discount_percent}
                onChange={(e) => setForm((f) => ({ ...f, discount_percent: parseInt(e.target.value) || 0 }))}
                className="bg-zen-surface border-zen-forest/30 text-zen-anti-flash"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                Comisión para el afiliado (%)
              </label>
              <Input
                type="number"
                min={0}
                max={100}
                value={form.commission_percent}
                onChange={(e) => setForm((f) => ({ ...f, commission_percent: parseInt(e.target.value) || 0 }))}
                className="bg-zen-surface border-zen-forest/30 text-zen-anti-flash"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                Límite de usos <span className="text-xs">(vacío = ilimitado)</span>
              </label>
              <Input
                type="number"
                min={1}
                value={form.max_uses}
                onChange={(e) => setForm((f) => ({ ...f, max_uses: e.target.value }))}
                placeholder="Ilimitado"
                className="bg-zen-surface border-zen-forest/30 text-zen-anti-flash"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                Notas internas
              </label>
              <Input
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Canal de YouTube, Instagram..."
                className="bg-zen-surface border-zen-forest/30 text-zen-anti-flash"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowForm(false)}
              className="text-zen-anti-flash/60"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="font-semibold"
              style={{ background: '#00C17C', color: '#001B1F' }}
            >
              {submitting ? 'Creando...' : 'Crear código'}
            </Button>
          </div>
        </form>
      )}

      {/* ── Lista de códigos ── */}
      {codes.length === 0 ? (
        <div
          className="rounded-xl p-10 text-center"
          style={{ background: '#002E21', border: '1px solid rgba(255,255,255,0.05)' }}
        >
          <p className="text-zen-anti-flash/50">No hay códigos de afiliado aún.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {codes.map((code) => {
            const totalCommission = code.affiliate_conversions.reduce(
              (s, cv) => s + cv.commission_cents, 0,
            );
            return (
              <div
                key={code.id}
                className="rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4"
                style={{
                  background:  '#002E21',
                  border:      `1px solid ${code.is_active ? '#0F5132' : 'rgba(255,255,255,0.05)'}`,
                  opacity:     code.is_active ? 1 : 0.6,
                }}
              >
                {/* Code + name */}
                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-zen-anti-flash text-base">
                      {code.code}
                    </span>
                    <button
                      onClick={() => copyCode(code.code)}
                      className="text-zen-anti-flash/40 hover:text-zen-anti-flash/80 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    {!code.is_active && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-stone-800 text-stone-400">
                        Inactivo
                      </span>
                    )}
                  </div>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    {code.name}
                    {code.notes && (
                      <span className="ml-2 text-xs opacity-60">· {code.notes}</span>
                    )}
                  </p>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap gap-4 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  <span>
                    <span style={{ color: '#00C17C' }}>-{code.discount_percent}%</span> descuento
                  </span>
                  <span>
                    <span style={{ color: '#00C17C' }}>{code.commission_percent}%</span> comisión
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    {code.uses_count}
                    {code.max_uses ? `/${code.max_uses}` : ''} usos
                  </span>
                  {totalCommission > 0 && (
                    <span style={{ color: '#00C17C' }}>
                      {formatCOP(totalCommission)} generado
                    </span>
                  )}
                </div>

                {/* Toggle */}
                <button
                  onClick={() => handleToggle(code)}
                  disabled={togglingId === code.id}
                  className="shrink-0 transition-colors"
                  style={{ color: code.is_active ? '#00C17C' : 'rgba(255,255,255,0.3)' }}
                  title={code.is_active ? 'Desactivar' : 'Activar'}
                >
                  {code.is_active
                    ? <ToggleRight className="w-7 h-7" />
                    : <ToggleLeft className="w-7 h-7" />}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
