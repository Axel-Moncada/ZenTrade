import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/reviews/admin";
import { ReviewsAdminPanel } from "@/components/admin/reviews-admin-panel";

export default async function ReviewsAdminPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/dashboard");
  return <ReviewsAdminPanel />;
}
