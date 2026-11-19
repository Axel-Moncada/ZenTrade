import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Review } from "@/lib/reviews/reviews";
import { requireAdmin, type AdminReview } from "@/lib/reviews/admin";

/** GET /api/admin/reviews — todas las reseñas con el email del autor (solo admin) */
export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<Review[]>();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: users } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
  const emailById = new Map((users?.users ?? []).map((u) => [u.id, u.email ?? null]));

  const reviews: AdminReview[] = (data ?? []).map((r) => ({ ...r, email: emailById.get(r.user_id) ?? null }));
  return NextResponse.json({ reviews });
}
