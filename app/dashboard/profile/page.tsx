"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import {
  Globe,
  DollarSign,
  Crown,
  LogOut,
  Edit2,
  Check,
  X,
  Lock,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n/context";
import type { Profile } from "@/types/accounts";

// Active plan for this user (placeholder — always Free for now)
const ACTIVE_PLAN = "free" as const;

export default function ProfilePage() {
  const { t, locale } = useI18n();
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: "",
    timezone: "",
    currency: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/profile");
        const data = await res.json();
        if (res.ok) {
          setProfile(data.profile);
          setEditForm({
            full_name: data.profile.full_name || "",
            timezone: data.profile.timezone || "America/Bogota",
            currency: data.profile.currency || "USD",
          });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setSaveError(data.error || t.profile.saveError);
      } else {
        setProfile(data.profile);
        setEditing(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch {
      setSaveError(t.profile.saveError);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const initials = (profile?.full_name || profile?.email || "?")
    .split(" ")
    .slice(0, 2)
    .map((w: string) => w[0]?.toUpperCase())
    .join("");

  const memberSince = profile?.created_at
    ? format(new Date(profile.created_at), "MMMM yyyy", {
        locale: locale === "es" ? es : enUS,
      })
    : "";

  const plans = [
    {
      id: "free" as const,
      name: t.profile.planFreeName,
      price: t.profile.planFreePrice,
      desc: t.profile.planFreeDesc,
      features: [...t.profile.planFreeFeatures],
      cta: t.profile.planFreeCtaLabel,
      comingSoon: false,
    },
    {
      id: "pro" as const,
      name: t.profile.planProName,
      price: t.profile.planProPrice,
      desc: t.profile.planProDesc,
      features: [...t.profile.planProFeatures],
      cta: t.profile.planProCtaLabel,
      comingSoon: false,
    },
    {
      id: "max" as const,
      name: t.profile.planMaxName,
      price: t.profile.planMaxPrice,
      desc: t.profile.planMaxDesc,
      features: [...t.profile.planMaxFeatures],
      cta: t.profile.planMaxCtaLabel,
      comingSoon: true,
    },
  ];

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="h-8 w-48 bg-zen-surface rounded animate-pulse" />
        <div className="h-48 bg-zen-surface rounded-2xl animate-pulse" />
        <div className="h-64 bg-zen-surface rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-zen-anti-flash">{t.profile.title}</h1>
        <p className="text-zen-anti-flash/60 mt-1">{t.profile.subtitle}</p>
      </div>

      {/* ── User info card ── */}
      <div className="bg-zen-dark-green border border-zen-forest/40 rounded-2xl p-6 space-y-5">
        {/* Avatar + identity row */}
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-zen-caribbean-green flex items-center justify-center text-zen-rich-black font-bold text-2xl flex-shrink-0 select-none">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xl font-bold text-zen-anti-flash truncate">
              {profile?.full_name || profile?.email}
            </p>
            <p className="text-sm text-zen-anti-flash/60 truncate">{profile?.email}</p>
            {memberSince && (
              <p className="text-xs text-zen-anti-flash/40 mt-0.5">
                {t.profile.memberSince} {memberSince}
              </p>
            )}
          </div>
          {!editing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditing(true)}
              className="gap-2 border-zen-caribbean-green text-zen-caribbean-green hover:bg-zen-caribbean-green/10 flex-shrink-0"
            >
              <Edit2 className="h-4 w-4" />
              {t.profile.editProfile}
            </Button>
          )}
        </div>

        {/* Edit form */}
        {editing ? (
          <div className="space-y-4 pt-4 border-t border-zen-forest/30">
            <div className="space-y-2">
              <Label className="text-zen-anti-flash">{t.profile.fullName}</Label>
              <Input
                value={editForm.full_name}
                onChange={(e) => setEditForm((f) => ({ ...f, full_name: e.target.value }))}
                className="border-zen-forest/40 bg-zen-dark-green text-zen-anti-flash placeholder:text-zen-anti-flash/40"
                placeholder="John Doe"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-zen-anti-flash">{t.profile.timezone}</Label>
                <Input
                  value={editForm.timezone}
                  onChange={(e) => setEditForm((f) => ({ ...f, timezone: e.target.value }))}
                  className="border-zen-forest/40 bg-zen-dark-green text-zen-anti-flash placeholder:text-zen-anti-flash/40"
                  placeholder="America/Bogota"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zen-anti-flash">{t.profile.currency}</Label>
                <Input
                  value={editForm.currency}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      currency: e.target.value.toUpperCase().slice(0, 3),
                    }))
                  }
                  className="border-zen-forest/40 bg-zen-dark-green text-zen-anti-flash placeholder:text-zen-anti-flash/40"
                  placeholder="USD"
                  maxLength={3}
                />
              </div>
            </div>
            {saveError && <p className="text-zen-danger text-sm">{saveError}</p>}
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="gap-2 bg-zen-caribbean-green hover:bg-zen-mountain-meadow text-zen-rich-black"
              >
                <Check className="h-4 w-4" />
                {saving ? `${t.common.save}…` : t.profile.saveChanges}
              </Button>
              <Button
                variant="outline"
                onClick={() => { setEditing(false); setSaveError(""); }}
                className="gap-2 border-zen-forest/60 text-zen-anti-flash hover:bg-zen-surface"
              >
                <X className="h-4 w-4" />
                {t.common.cancel}
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zen-forest/30">
            <div className="flex items-center gap-3">
              <Globe className="h-4 w-4 text-zen-caribbean-green flex-shrink-0" />
              <div>
                <p className="text-xs text-zen-anti-flash/50">{t.profile.timezone}</p>
                <p className="text-sm font-medium text-zen-anti-flash">{profile?.timezone || "—"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DollarSign className="h-4 w-4 text-zen-caribbean-green flex-shrink-0" />
              <div>
                <p className="text-xs text-zen-anti-flash/50">{t.profile.currency}</p>
                <p className="text-sm font-medium text-zen-anti-flash">{profile?.currency || "—"}</p>
              </div>
            </div>
          </div>
        )}

        {saveSuccess && (
          <p className="text-zen-caribbean-green text-sm">{t.profile.saveSuccess}</p>
        )}
      </div>

      {/* ── Membership card ── */}
      <div className="bg-zen-dark-green border border-zen-forest/40 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-zen-caribbean-green" />
          <h2 className="text-lg font-semibold text-zen-anti-flash">{t.profile.membership}</h2>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-3 gap-4">
          {plans.map((plan) => {
            const isActive = plan.id === ACTIVE_PLAN;
            const isLocked = !isActive;

            return (
              <div
                key={plan.id}
                className={
                  isActive
                    ? "relative rounded-xl border-2 border-zen-caribbean-green bg-zen-rich-black p-5 flex flex-col"
                    : "relative rounded-xl border border-zen-forest/30 bg-zen-rich-black/40 p-5 flex flex-col opacity-60"
                }
              >
                {/* Lock icon for locked plans */}
                {isLocked && (
                  <div className="absolute top-3 right-3">
                    <Lock className="h-4 w-4 text-zen-anti-flash/30" />
                  </div>
                )}

                {/* Active badge */}
                {isActive && (
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-zen-caribbean-green text-zen-rich-black border-0 font-semibold text-xs">
                      {t.profile.planCurrentBadge}
                    </Badge>
                  </div>
                )}

                {/* Plan name + price */}
                <div className="mb-3 pr-14">
                  <p
                    className={`text-lg font-bold ${
                      isActive ? "text-zen-caribbean-green" : "text-zen-anti-flash/60"
                    }`}
                  >
                    {plan.name}
                  </p>
                  <p
                    className={`text-sm font-semibold mt-0.5 ${
                      isActive ? "text-zen-anti-flash" : "text-zen-anti-flash/50"
                    }`}
                  >
                    {plan.price}
                  </p>
                </div>

                {/* Description */}
                <p className="text-xs text-zen-anti-flash/50 mb-4 leading-relaxed">
                  {plan.desc}
                </p>

                {/* Features */}
                <ul className="space-y-2 flex-1 mb-5">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2
                        className={`h-3.5 w-3.5 mt-0.5 flex-shrink-0 ${
                          isActive
                            ? "text-zen-caribbean-green"
                            : "text-zen-anti-flash/25"
                        }`}
                      />
                      <span
                        className={`text-xs leading-tight ${
                          isActive ? "text-zen-anti-flash/80" : "text-zen-anti-flash/40"
                        }`}
                      >
                        {feat}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA button */}
                {isActive ? (
                  <Button
                    disabled
                    className="w-full bg-zen-caribbean-green/20 text-zen-caribbean-green border border-zen-caribbean-green/40 cursor-default text-sm font-semibold"
                  >
                    {plan.cta}
                  </Button>
                ) : plan.comingSoon ? (
                  <Button
                    disabled
                    variant="outline"
                    className="w-full border-zen-forest/30 text-zen-anti-flash/30 text-sm cursor-not-allowed"
                  >
                    {t.profile.planComingSoon}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full border-zen-caribbean-green text-zen-caribbean-green hover:bg-zen-caribbean-green/10 text-sm"
                  >
                    {plan.cta}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Session card ── */}
      <div className="bg-zen-dark-green border border-zen-forest/40 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zen-anti-flash">{t.profile.session}</h2>
            <p className="text-sm text-zen-anti-flash/60">{profile?.email}</p>
          </div>
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="gap-2 bg-zen-danger/10 hover:bg-zen-danger/20 text-zen-danger border border-zen-danger/40"
          >
            <LogOut className="h-4 w-4" />
            {t.profile.signOut}
          </Button>
        </div>
      </div>
    </div>
  );
}
