import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SidebarLayout } from "@/components/dashboard/sidebar-layout";

function isAdminEmail(email: string): boolean {
  const adminEmails = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return adminEmails.includes(email.toLowerCase());
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  return (
    <SidebarLayout
      userEmail={user.email || ""}
      userName={profile?.full_name || ""}
      isAdmin={!!user.email && isAdminEmail(user.email)}
    >
      {children}
    </SidebarLayout>
  );
}
