import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/reviews/admin";

const PatchSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  // El admin puede corregir typos del texto / nombre visible antes de publicar
  testimonial: z.string().trim().max(600).nullable().optional(),
  display_name: z.string().trim().max(60).nullable().optional(),
  role_label: z.string().trim().max(80).nullable().optional(),
});

interface Params {
  params: Promise<{ id: string }>;
}

/** PATCH /api/admin/reviews/[id] — aprobar / rechazar / editar (solo admin) */
export async function PATCH(request: Request, { params }: Params) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const parsed = PatchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "Invalid data" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("reviews")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
