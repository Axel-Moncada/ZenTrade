import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserPlan } from "@/lib/lemonsqueezy/get-user-plan";
import {
  REVIEW_MIN_DAYS,
  REVIEW_MIN_TRADES,
  REVIEW_PROMPT_COOLDOWN_DAYS,
  reviewInputSchema,
  type Review,
} from "@/lib/reviews/reviews";

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * GET /api/reviews
 * Devuelve la reseña del usuario (si existe) y si corresponde mostrarle el prompt.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [reviewRes, profileRes, tradesRes] = await Promise.all([
    supabase.from("reviews").select("*").eq("user_id", user.id).maybeSingle<Review>(),
    supabase.from("profiles").select("review_prompted_at, full_name").eq("id", user.id).maybeSingle(),
    supabase.from("trades").select("id", { count: "exact", head: true }).eq("user_id", user.id),
  ]);

  const review = reviewRes.data ?? null;
  const tradesCount = tradesRes.count ?? 0;
  const accountAgeDays = (Date.now() - new Date(user.created_at).getTime()) / DAY_MS;
  const promptedAt = profileRes.data?.review_prompted_at as string | null | undefined;
  const cooledDown =
    !promptedAt || Date.now() - new Date(promptedAt).getTime() > REVIEW_PROMPT_COOLDOWN_DAYS * DAY_MS;

  const shouldPrompt =
    !review && tradesCount >= REVIEW_MIN_TRADES && accountAgeDays >= REVIEW_MIN_DAYS && cooledDown;

  return NextResponse.json({
    review,
    shouldPrompt,
    suggestedName: (profileRes.data?.full_name as string | null | undefined) ?? null,
  });
}

/**
 * POST /api/reviews
 * Crea o actualiza la reseña del usuario. Siempre queda en estado "pending"
 * hasta que el admin la apruebe (también lo exige la política RLS).
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body: unknown = await request.json().catch(() => null);
  const parsed = reviewInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "Invalid data" }, { status: 400 });
  }

  const input = parsed.data;
  const plan = await getUserPlan(supabase, user.id);
  // Solo se puede publicar si hay texto y nombre visible
  const allowPublic = input.allow_public && !!input.testimonial && !!input.display_name;

  const { data, error } = await supabase
    .from("reviews")
    .upsert(
      {
        user_id: user.id,
        rating: input.rating,
        testimonial: input.testimonial || null,
        display_name: input.display_name || null,
        role_label: input.role_label || null,
        allow_public: allowPublic,
        status: "pending",
        source: input.source,
        plan_key: plan.planKey,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    )
    .select("*")
    .single<Review>();

  if (error) {
    console.error("Error saving review:", error.message);
    return NextResponse.json({ error: "Could not save your review" }, { status: 500 });
  }

  // Ya no volver a pedir reseña
  await supabase.from("profiles").update({ review_prompted_at: new Date().toISOString() }).eq("id", user.id);

  return NextResponse.json({ review: data });
}
