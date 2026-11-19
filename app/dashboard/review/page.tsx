import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ReviewForm } from "@/components/reviews/review-form";
import type { Review } from "@/lib/reviews/reviews";

export const dynamic = "force-dynamic";

/** Página directa para el enlace de los emails: /dashboard/review */
export default async function ReviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: review }, { data: profile }] = await Promise.all([
    supabase.from("reviews").select("*").eq("user_id", user.id).maybeSingle<Review>(),
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
  ]);

  return (
    <div className="mx-auto max-w-lg py-10">
      <div className="rounded-2xl border border-zen-caribbean-green/40 bg-zen-surface p-6">
        <ReviewForm
          source="email"
          initialReview={review ?? null}
          suggestedName={(profile?.full_name as string | null | undefined) ?? null}
        />
      </div>
    </div>
  );
}
