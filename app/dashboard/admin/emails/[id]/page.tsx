import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EmailEditor } from '@/components/admin/email-editor'

function isAdmin(email: string): boolean {
  const adminEmails = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
  return adminEmails.includes(email.toLowerCase())
}

export default async function EmailEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')
  if (!user.email || !isAdmin(user.email)) redirect('/dashboard')

  const { id } = await params

  return (
    <div className="space-y-6">
      <EmailEditor emailId={id === 'new' ? null : id} />
    </div>
  )
}
