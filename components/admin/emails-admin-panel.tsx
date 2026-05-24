'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Send, Clock, FileText, Trash2, Mail, Users, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface ScheduledEmail {
  id: string
  type: 'newsletter' | 'zennews'
  subject_es: string
  subject_en: string
  audience: 'all' | 'zenmode'
  status: 'draft' | 'scheduled' | 'sent'
  scheduled_at: string | null
  sent_at: string | null
  recipients_count: number | null
  created_at: string
}

const STATUS_CONFIG = {
  draft:     { label: 'Borrador',    color: 'bg-zinc-700 text-zinc-300' },
  scheduled: { label: 'Programado', color: 'bg-blue-900/60 text-blue-300' },
  sent:      { label: 'Enviado',     color: 'bg-emerald-900/60 text-emerald-300' },
}

const TYPE_CONFIG = {
  newsletter: { label: 'Newsletter', icon: Mail },
  zennews:    { label: 'ZenNews',    icon: Users },
}

export function EmailsAdminPanel() {
  const [emails, setEmails] = useState<ScheduledEmail[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [sending, setSending] = useState<string | null>(null)
  const [runningScheduled, setRunningScheduled] = useState(false)

  async function fetchEmails() {
    const res = await fetch('/api/admin/emails')
    if (res.ok) setEmails(await res.json() as ScheduledEmail[])
    setLoading(false)
  }

  useEffect(() => { void fetchEmails() }, [])

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este email?')) return
    setDeleting(id)
    await fetch(`/api/admin/emails/${id}`, { method: 'DELETE' })
    setEmails(prev => prev.filter(e => e.id !== id))
    setDeleting(null)
  }

  async function handleRunScheduled() {
    setRunningScheduled(true)
    const res = await fetch('/api/admin/send-scheduled', { method: 'POST' })
    if (res.ok) {
      const { sent, emails } = await res.json() as { sent: number; emails: number }
      if (emails === 0) alert('No hay emails programados pendientes para este momento.')
      else alert(`Enviados ${emails} email(s) a ${sent} destinatarios.`)
      void fetchEmails()
    } else {
      alert('Error al ejecutar programados')
    }
    setRunningScheduled(false)
  }

  async function handleSendNow(id: string) {
    if (!confirm('¿Enviar este email ahora a todos los destinatarios?')) return
    setSending(id)
    const res = await fetch(`/api/admin/emails/${id}/send`, { method: 'POST' })
    if (res.ok) {
      const result = await res.json() as { sent: number }
      alert(`Enviado a ${result.sent} destinatarios`)
      void fetchEmails()
    } else {
      alert('Error al enviar')
    }
    setSending(null)
  }

  function formatDate(iso: string | null) {
    if (!iso) return '—'
    return new Date(iso).toLocaleString('es-CO', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', timeZone: 'America/Bogota',
    })
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 rounded-xl bg-zen-surface/40 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          className="border-blue-700 hover:border-blue-500 text-blue-400 gap-2 text-xs"
          onClick={() => void handleRunScheduled()}
          disabled={runningScheduled}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${runningScheduled ? 'animate-spin' : ''}`} />
          {runningScheduled ? 'Enviando…' : 'Ejecutar programados ahora'}
        </Button>
        <Link href="/dashboard/admin/emails/new">
          <Button className="bg-amber-500 hover:bg-amber-400 text-black font-semibold gap-2">
            <Plus className="w-4 h-4" />
            Nuevo email
          </Button>
        </Link>
      </div>

      {emails.length === 0 ? (
        <div className="text-center py-20 text-zen-text-muted">
          <Mail className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No hay emails aún. Crea el primero.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {emails.map(email => {
            const TypeIcon = TYPE_CONFIG[email.type].icon
            const statusCfg = STATUS_CONFIG[email.status]
            const isSent = email.status === 'sent'

            return (
              <div
                key={email.id}
                className="flex items-center gap-4 p-4 rounded-xl bg-zen-surface/40 border border-zen-forest/20 hover:border-amber-500/30 transition-colors"
              >
                {/* Type icon */}
                <div className="shrink-0 w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <TypeIcon className="w-5 h-5 text-amber-400" />
                </div>

                {/* Main info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-zen-anti-flash truncate">
                      {email.subject_es || '(sin asunto)'}
                    </span>
                    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', statusCfg.color)}>
                      {statusCfg.label}
                    </span>
                    <Badge variant="outline" className="text-xs border-zinc-600 text-zinc-400">
                      {TYPE_CONFIG[email.type].label}
                    </Badge>
                    <Badge variant="outline" className="text-xs border-zinc-600 text-zinc-400">
                      {email.audience === 'all' ? 'Todos' : 'ZenMode'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-zen-text-muted">
                    {email.status === 'scheduled' && email.scheduled_at && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Programado: {formatDate(email.scheduled_at)}
                      </span>
                    )}
                    {isSent && (
                      <span className="flex items-center gap-1">
                        <Send className="w-3 h-3" />
                        Enviado: {formatDate(email.sent_at)} · {email.recipients_count ?? 0} destinatarios
                      </span>
                    )}
                    {email.status === 'draft' && (
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        Creado: {formatDate(email.created_at)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {!isSent && (
                    <>
                      <Link href={`/dashboard/admin/emails/${email.id}`}>
                        <Button size="sm" variant="outline" className="border-zinc-600 hover:border-amber-400 text-xs">
                          Editar
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-emerald-700 hover:border-emerald-500 text-emerald-400 text-xs gap-1"
                        onClick={() => void handleSendNow(email.id)}
                        disabled={sending === email.id}
                      >
                        <Send className="w-3 h-3" />
                        {sending === email.id ? 'Enviando…' : 'Enviar ya'}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20 px-2"
                        onClick={() => void handleDelete(email.id)}
                        disabled={deleting === email.id}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
