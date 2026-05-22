import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EmailsAdminPanel } from '@/components/admin/emails-admin-panel'

function isAdmin(email: string): boolean {
  const adminEmails = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
  return adminEmails.includes(email.toLowerCase())
}

export default async function EmailsAdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')
  if (!user.email || !isAdmin(user.email)) redirect('/dashboard')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zen-anti-flash">Emails</h1>
        <p className="text-sm text-zen-text-muted mt-1">
          Crea y envía newsletters y ZenNews a tus suscriptores.
        </p>
      </div>
      <EmailsAdminPanel />
    </div>
  )
}
