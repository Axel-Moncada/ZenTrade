import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserPlan } from "@/lib/lemonsqueezy/get-user-plan";
import { getLiveInstruments, getLiveSessionData } from "@/lib/live-session/get-live-session-data";
import { LiveSessionClient } from "@/components/live-session/live-session-client";
import { UpgradePrompt } from "@/components/shared/upgrade-prompt";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ account?: string }>;
}

export default async function LiveSessionPage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const plan = await getUserPlan(supabase, user.id);
  if (!plan.isZenMode) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 py-10">
        <h1 className="text-3xl font-bold text-zen-anti-flash">Sesión en Vivo · Live Session</h1>
        <p className="text-zen-anti-flash/70">
          Un copiloto de disciplina en una ventana flotante sobre tu plataforma: te avisa cuando te acercas a tu
          límite diario, al drawdown de tu prop firm, cuando entras en racha de pérdidas o intentas revenge trading.
        </p>
        <UpgradePrompt
          requiredPlan="zenmode"
          variant="card"
          message={{
            es: "El Copiloto de Disciplina en vivo es exclusivo del plan ZenMode.",
            en: "The Live Discipline Copilot is exclusive to the ZenMode plan.",
          }}
        />
      </div>
    );
  }

  const { data: accounts } = await supabase
    .from("accounts")
    .select("id, name, status")
    .eq("user_id", user.id)
    .order("name");

  const accountList = (accounts ?? []) as Array<{ id: string; name: string; status: string }>;
  if (accountList.length === 0) {
    return (
      <div className="mx-auto max-w-xl py-10 text-center">
        <p className="text-zen-anti-flash/70">Crea una cuenta para iniciar tu sesión en vivo.</p>
        <Link href="/dashboard/accounts/new" className="mt-4 inline-block text-zen-caribbean-green underline">
          Crear cuenta
        </Link>
      </div>
    );
  }

  const { account: requested } = await searchParams;
  const selected =
    accountList.find((a) => a.id === requested) ??
    accountList.find((a) => a.status === "active") ??
    accountList[0];

  const [initialData, instruments] = await Promise.all([
    getLiveSessionData(supabase, user.id, selected.id),
    getLiveInstruments(supabase),
  ]);
  if (!initialData) redirect("/dashboard/live-session");

  return (
    <LiveSessionClient
      accounts={accountList.map((a) => ({ id: a.id, name: a.name }))}
      initialData={initialData}
      instruments={instruments}
    />
  );
}
