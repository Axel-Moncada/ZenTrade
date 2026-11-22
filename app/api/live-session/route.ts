import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getUserPlan } from "@/lib/lemonsqueezy/get-user-plan";
import { getLiveSessionData } from "@/lib/live-session/get-live-session-data";

const QuerySchema = z.object({
  account_id: z.string().uuid("Invalid account_id"),
});

/**
 * GET /api/live-session?account_id=...
 * Snapshot en vivo para el Copiloto de Disciplina (solo ZenMode).
 * Las reglas se evalúan en el cliente con evaluateDiscipline() porque dependen de la hora.
 */
export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const plan = await getUserPlan(supabase, user.id);
  if (!plan.isZenMode) {
    return NextResponse.json(
      { error: "El Copiloto de Disciplina requiere el plan ZenMode." },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const parsed = QuerySchema.safeParse({ account_id: searchParams.get("account_id") });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "Invalid parameters" }, { status: 400 });
  }

  const data = await getLiveSessionData(supabase, user.id, parsed.data.account_id);
  if (!data) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
}
