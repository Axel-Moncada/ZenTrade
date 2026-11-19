import { supabaseAdmin } from "@/lib/supabase/admin";
import type { PublicReviewStats, PublicTestimonial } from "./reviews";

interface ApprovedRow {
  id: string;
  rating: number;
  testimonial: string | null;
  display_name: string | null;
  role_label: string | null;
  allow_public: boolean;
  status: "pending" | "approved" | "rejected";
}

/**
 * Reseñas para el landing (solo servidor, service role).
 * Solo expone nombre visible, rol y texto — nunca user_id ni email.
 */
export async function getPublicReviews(): Promise<PublicReviewStats> {
  const { data, error } = await supabaseAdmin
    .from("reviews")
    .select("id, rating, testimonial, display_name, role_label, allow_public, status")
    .order("rating", { ascending: false })
    .order("updated_at", { ascending: false })
    .returns<ApprovedRow[]>();

  if (error || !data) {
    return { testimonials: [], ratingValue: 0, ratingCount: 0 };
  }

  // Testimonios publicados: solo los aprobados (moderación de texto/nombre)
  const testimonials: PublicTestimonial[] = data
    .filter((r) => r.status === "approved" && r.allow_public && r.testimonial && r.display_name)
    .map((r) => ({
      id: r.id,
      rating: r.rating,
      testimonial: r.testimonial ?? "",
      displayName: r.display_name ?? "",
      roleLabel: r.role_label,
    }));

  // Rating: TODAS las reseñas recibidas, para no inflar el promedio rechazando las negativas (FTC)
  const ratingCount = data.length;
  const ratingValue =
    ratingCount > 0 ? Math.round((data.reduce((s, r) => s + r.rating, 0) / ratingCount) * 10) / 10 : 0;

  return { testimonials, ratingValue, ratingCount };
}
