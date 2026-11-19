"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, EyeOff, RotateCcw, Star, X } from "lucide-react";
import type { AdminReview } from "@/lib/reviews/admin";
import type { ReviewStatus } from "@/lib/reviews/reviews";
import { MIN_PUBLIC_TESTIMONIALS, MIN_REVIEWS_FOR_RATING_SCHEMA } from "@/lib/reviews/reviews";

type Filter = "all" | ReviewStatus | "feedback";

const STATUS_BADGE: Record<ReviewStatus, string> = {
  pending: "bg-amber-500/15 text-amber-400 border-amber-500/40",
  approved: "bg-emerald-500/15 text-emerald-400 border-emerald-500/40",
  rejected: "bg-red-500/15 text-red-400 border-red-500/40",
};

const STATUS_LABEL: Record<ReviewStatus, string> = {
  pending: "Pendiente",
  approved: "Aprobada",
  rejected: "Rechazada",
};

export function ReviewsAdminPanel() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("pending");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/reviews", { cache: "no-store" });
    if (res.ok) setReviews(((await res.json()) as { reviews: AdminReview[] }).reviews);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function setStatus(id: string, status: ReviewStatus) {
    setReviews((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)));
    await fetch(`/api/admin/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }

  const stats = useMemo(() => {
    const approved = reviews.filter((r) => r.status === "approved");
    const publicCount = approved.filter((r) => r.allow_public && r.testimonial && r.display_name).length;
    const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
    return { total: reviews.length, approved: approved.length, publicCount, avg };
  }, [reviews]);

  const visible = reviews.filter((r) => {
    if (filter === "all") return true;
    if (filter === "feedback") return r.rating <= 3;
    return r.status === filter;
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-6 py-8">
      <div>
        <h1 className="text-2xl font-bold text-zen-anti-flash">Reseñas</h1>
        <p className="mt-1 text-sm text-zen-anti-flash/60">
          Los testimonios aprobados y públicos reemplazan a los del landing desde {MIN_PUBLIC_TESTIMONIALS}. El rating
          de estrellas en Google usa TODAS las reseñas (no se puede inflar rechazando) y se activa con{" "}
          {MIN_REVIEWS_FOR_RATING_SCHEMA}.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ["Total", String(stats.total)],
          ["Promedio", stats.avg ? `${stats.avg.toFixed(1)} ★` : "—"],
          ["Total para rating Google", `${stats.total} / ${MIN_REVIEWS_FOR_RATING_SCHEMA}`],
          ["Públicas en landing", `${stats.publicCount} / ${MIN_PUBLIC_TESTIMONIALS}`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-zen-forest/40 bg-zen-surface p-4">
            <p className="text-xs uppercase tracking-wider text-zen-anti-flash/50">{label}</p>
            <p className="mt-1 text-xl font-bold text-zen-anti-flash">{value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["pending", "Pendientes"],
            ["approved", "Aprobadas"],
            ["rejected", "Rechazadas"],
            ["feedback", "Feedback (≤3★)"],
            ["all", "Todas"],
          ] as Array<[Filter, string]>
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`rounded-full border px-3 py-1 text-sm ${
              filter === key
                ? "border-amber-400 bg-amber-400/10 text-amber-400"
                : "border-zen-forest/50 text-zen-anti-flash/70 hover:bg-zen-forest/20"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-zen-anti-flash/50">Cargando…</p>
      ) : visible.length === 0 ? (
        <p className="text-sm text-zen-anti-flash/50">No hay reseñas en esta vista.</p>
      ) : (
        <ul className="space-y-3">
          {visible.map((r) => (
            <li key={r.id} className="rounded-xl border border-zen-forest/40 bg-zen-surface p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="flex">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        className={`h-4 w-4 ${n <= r.rating ? "fill-amber-400 text-amber-400" : "text-zen-anti-flash/20"}`}
                      />
                    ))}
                  </span>
                  <span className={`rounded-full border px-2 py-0.5 text-xs ${STATUS_BADGE[r.status]}`}>
                    {STATUS_LABEL[r.status]}
                  </span>
                  {!r.allow_public && (
                    <span className="flex items-center gap-1 text-xs text-zen-anti-flash/50">
                      <EyeOff className="h-3 w-3" /> Privada
                    </span>
                  )}
                  <span className="text-xs text-zen-anti-flash/40">
                    {r.plan_key ?? "free"} · {r.source === "email" ? "email" : "app"}
                  </span>
                </div>
                <span className="text-xs text-zen-anti-flash/40">
                  {r.email ?? "—"} · {new Date(r.created_at).toLocaleDateString("es-CO")}
                </span>
              </div>

              {r.testimonial && <p className="mt-3 text-sm text-zen-anti-flash/90">“{r.testimonial}”</p>}
              {(r.display_name || r.role_label) && (
                <p className="mt-1 text-xs text-zen-anti-flash/60">
                  — {r.display_name ?? "Sin nombre"}
                  {r.role_label ? `, ${r.role_label}` : ""}
                </p>
              )}

              <div className="mt-3 flex gap-2">
                {r.status !== "approved" && (
                  <button
                    type="button"
                    onClick={() => setStatus(r.id, "approved")}
                    className="flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-500"
                  >
                    <Check className="h-3 w-3" /> Aprobar
                  </button>
                )}
                {r.status !== "rejected" && (
                  <button
                    type="button"
                    onClick={() => setStatus(r.id, "rejected")}
                    className="flex items-center gap-1 rounded-md border border-red-500/50 px-3 py-1 text-xs text-red-400 hover:bg-red-500/10"
                  >
                    <X className="h-3 w-3" /> Rechazar
                  </button>
                )}
                {r.status !== "pending" && (
                  <button
                    type="button"
                    onClick={() => setStatus(r.id, "pending")}
                    className="flex items-center gap-1 rounded-md border border-zen-forest/50 px-3 py-1 text-xs text-zen-anti-flash/70 hover:bg-zen-forest/20"
                  >
                    <RotateCcw className="h-3 w-3" /> Pendiente
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
