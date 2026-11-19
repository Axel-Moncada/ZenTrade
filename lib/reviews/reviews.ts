import { z } from "zod";

export const REVIEW_MIN_TRADES = 10;
export const REVIEW_MIN_DAYS = 7;
export const REVIEW_PROMPT_COOLDOWN_DAYS = 30;
/** Mínimo de reseñas aprobadas para reemplazar los testimonios del landing */
export const MIN_PUBLIC_TESTIMONIALS = 2;
/** Mínimo de reseñas para publicar AggregateRating en el schema */
export const MIN_REVIEWS_FOR_RATING_SCHEMA = 5;

export type ReviewStatus = "pending" | "approved" | "rejected";

export interface Review {
  id: string;
  user_id: string;
  rating: number;
  testimonial: string | null;
  display_name: string | null;
  role_label: string | null;
  allow_public: boolean;
  status: ReviewStatus;
  source: "in_app" | "email";
  plan_key: string | null;
  created_at: string;
  updated_at: string;
}

export interface PublicTestimonial {
  id: string;
  rating: number;
  testimonial: string;
  displayName: string;
  roleLabel: string | null;
}

export interface PublicReviewStats {
  testimonials: PublicTestimonial[];
  /** Promedio y conteo de TODAS las reseñas aprobadas (públicas o no) */
  ratingValue: number;
  ratingCount: number;
}

export const reviewInputSchema = z.object({
  rating: z.number().int().min(1).max(5),
  testimonial: z.string().trim().max(600).optional().nullable(),
  display_name: z.string().trim().max(60).optional().nullable(),
  role_label: z.string().trim().max(80).optional().nullable(),
  allow_public: z.boolean().default(false),
  source: z.enum(["in_app", "email"]).default("in_app"),
});

export type ReviewInput = z.infer<typeof reviewInputSchema>;
