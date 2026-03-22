import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import AffiliatesAdminPanel from '@/components/admin/affiliates-admin-panel';

function isAdmin(email: string): boolean {
  const adminEmails = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return adminEmails.includes(email.toLowerCase());
}

export default async function AffiliatesAdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');
  if (!user.email || !isAdmin(user.email)) redirect('/dashboard');

  const { data: codes } = await supabaseAdmin
    .from('affiliate_codes')
    .select('*, affiliate_conversions(id, commission_cents, discounted_amount_cents, created_at)')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zen-anti-flash">Afiliados</h1>
        <p className="text-sm text-zen-text-muted mt-1">
          Gestiona códigos de influencers y códigos de descuento
        </p>
      </div>

      <AffiliatesAdminPanel codes={codes ?? []} />
    </div>
  );
}
