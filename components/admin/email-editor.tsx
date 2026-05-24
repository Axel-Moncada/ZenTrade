'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Send, Save, Clock, Eye, EyeOff, ChevronLeft,
  Users, Mail, Globe, FileText,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { RichEmailEditor } from '@/components/admin/rich-email-editor'

// ─── Types ────────────────────────────────────────────────────────────────────

interface EmailData {
  id?: string
  type: 'newsletter' | 'zennews'
  subject_es: string
  subject_en: string
  body_html_es: string
  body_html_en: string
  audience: 'all' | 'zenmode'
  scheduled_at: string | null
  status: 'draft' | 'scheduled' | 'sent'
}

interface EmailEditorProps {
  emailId: string | null
}

type Lang = 'es' | 'en'

// ─── Email preview wrapper ─────────────────────────────────────────────────────

const LOGO_URL = 'https://rsunvtanukainhbtnmlu.supabase.co/storage/v1/object/public/logo/logo-hori-white.png'
const APP_URL = 'https://www.zen-trader.com'

function buildPreviewHtml(body: string, subject: string, lang: Lang): string {
  const footerText = lang === 'es'
    ? 'Estás recibiendo este email porque te suscribiste a ZenTrade.'
    : "You're receiving this email because you subscribed to ZenTrade."
  const unsubText = lang === 'es' ? 'Cancelar suscripción' : 'Unsubscribe'
  const placeholder = lang === 'es'
    ? '<p style="color:#9EADA6;font-style:italic;">El cuerpo del email aparecerá aquí…</p>'
    : '<p style="color:#9EADA6;font-style:italic;">Email body will appear here…</p>'

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#e8e8e8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#e8e8e8;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0"
             style="max-width:600px;width:100%;border-radius:12px;overflow:hidden;border:1px solid #D4D4D4;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

        <!-- HEADER -->
        <tr>
          <td style="background:#112510;padding:24px 40px;border-bottom:3px solid #00C17C;">
            <a href="${APP_URL}" style="text-decoration:none;">
              <img src="${LOGO_URL}" alt="ZenTrade" height="30"
                   style="display:block;height:30px;border:0;" />
            </a>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td style="background:#ffffff;padding:40px;color:#1a1a1a;font-size:15px;line-height:1.75;">
            ${body || placeholder}
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:#112510;padding:22px 40px;border-top:1px solid #1d3a28;text-align:center;">
            <p style="margin:0 0 6px;color:rgba(242,243,244,0.45);font-size:12px;">
              ${footerText}
            </p>
            <a href="#" style="color:#00C17C;font-size:12px;text-decoration:none;">${unsubText}</a>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// ─── Component ────────────────────────────────────────────────────────────────

export function EmailEditor({ emailId }: EmailEditorProps) {
  const router = useRouter()

  const [lang, setLang] = useState<Lang>('es')
  const [showPreview, setShowPreview] = useState(false)
  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState(false)
  const [scheduledInput, setScheduledInput] = useState('')
  const [showScheduler, setShowScheduler] = useState(false)
  const [data, setData] = useState<EmailData>({
    type: 'newsletter',
    subject_es: '',
    subject_en: '',
    body_html_es: '',
    body_html_en: '',
    audience: 'all',
    scheduled_at: null,
    status: 'draft',
  })

  const isSent = data.status === 'sent'

  // Load existing email
  useEffect(() => {
    if (!emailId) return
    fetch(`/api/admin/emails/${emailId}`)
      .then(r => r.json())
      .then((d: EmailData) => {
        setData(d)
        if (d.scheduled_at) {
          setScheduledInput(d.scheduled_at.slice(0, 16))
          setShowScheduler(true)
        }
      })
  }, [emailId])

  const setField = useCallback(<K extends keyof EmailData>(key: K, value: EmailData[K]) => {
    setData(prev => ({ ...prev, [key]: value }))
  }, [])

  async function save(sendNow = false) {
    const payload = {
      type:         data.type,
      subject_es:   data.subject_es,
      subject_en:   data.subject_en,
      body_html_es: data.body_html_es,
      body_html_en: data.body_html_en,
      audience:     data.audience,
      scheduled_at: showScheduler && scheduledInput
        ? new Date(scheduledInput).toISOString()
        : null,
    }

    if (sendNow) setSending(true)
    else setSaving(true)

    let id = emailId

    if (!id) {
      const res = await fetch('/api/admin/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) { alert('Error al guardar'); setSaving(false); setSending(false); return }
      const created = await res.json() as EmailData
      id = created.id!
    } else {
      const res = await fetch(`/api/admin/emails/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) { alert('Error al guardar'); setSaving(false); setSending(false); return }
    }

    if (sendNow) {
      const res = await fetch(`/api/admin/emails/${id}/send`, { method: 'POST' })
      if (res.ok) {
        const result = await res.json() as { sent: number }
        alert(`Enviado a ${result.sent} destinatarios`)
        router.push('/dashboard/admin/emails')
      } else {
        alert('Error al enviar')
      }
      setSending(false)
    } else {
      setSaving(false)
      router.push('/dashboard/admin/emails')
    }
  }

  const currentBody = lang === 'es' ? data.body_html_es : data.body_html_en
  const currentSubject = lang === 'es' ? data.subject_es : data.subject_en

  return (
    <div className="space-y-6">
      {/* Back + title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/dashboard/admin/emails')}
          className="text-zen-text-muted hover:text-zen-anti-flash transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-semibold text-zen-anti-flash">
          {emailId ? 'Editar email' : 'Nuevo email'}
        </h2>
        {isSent && (
          <span className="px-2.5 py-1 rounded-full bg-emerald-900/50 text-emerald-300 text-xs font-medium">
            Enviado — solo lectura
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left: Settings ── */}
        <div className="space-y-5 lg:col-span-1">
          <div className="p-5 rounded-xl bg-zen-surface/40 border border-zen-forest/20 space-y-4">
            <h3 className="text-sm font-semibold text-zen-anti-flash uppercase tracking-wider">Configuración</h3>

            <div className="space-y-2">
              <Label className="text-xs text-zen-text-muted">Tipo de email</Label>
              <Select
                disabled={isSent}
                value={data.type}
                onValueChange={(v) => setField('type', v as EmailData['type'])}
              >
                <SelectTrigger className="bg-zen-surface border-zen-border-soft text-zen-anti-flash">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zen-surface border-zen-border-soft text-zen-anti-flash">
                  <SelectItem value="newsletter" className="text-zen-anti-flash focus:bg-zen-forest/30 focus:text-zen-anti-flash">
                    <span className="flex items-center gap-2"><Mail className="w-4 h-4" /> Newsletter</span>
                  </SelectItem>
                  <SelectItem value="zennews" className="text-zen-anti-flash focus:bg-zen-forest/30 focus:text-zen-anti-flash">
                    <span className="flex items-center gap-2"><Users className="w-4 h-4" /> ZenNews</span>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-zinc-500">
                {data.type === 'newsletter'
                  ? 'Promocional e informativo para todos los suscriptores.'
                  : 'Noticias económicas semanales solo para ZenMode.'}
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-zen-text-muted">Audiencia</Label>
              <Select
                disabled={isSent}
                value={data.audience}
                onValueChange={(v) => setField('audience', v as EmailData['audience'])}
              >
                <SelectTrigger className="bg-zen-surface border-zen-border-soft text-zen-anti-flash">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zen-surface border-zen-border-soft text-zen-anti-flash">
                  <SelectItem value="all" className="text-zen-anti-flash focus:bg-zen-forest/30 focus:text-zen-anti-flash">Todos los suscriptores</SelectItem>
                  <SelectItem value="zenmode" className="text-zen-anti-flash focus:bg-zen-forest/30 focus:text-zen-anti-flash">Solo usuarios ZenMode</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Scheduler */}
            <div className="space-y-2">
              <Label className="text-xs text-zen-text-muted">Envío</Label>
              <div className="flex gap-2">
                <button
                  disabled={isSent}
                  onClick={() => setShowScheduler(false)}
                  className={cn(
                    'flex-1 py-2 rounded-lg text-xs font-medium border transition-colors',
                    !showScheduler
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'border-zen-border-soft text-zen-text-muted hover:border-amber-400/50',
                  )}
                >
                  Inmediato
                </button>
                <button
                  disabled={isSent}
                  onClick={() => setShowScheduler(true)}
                  className={cn(
                    'flex-1 py-2 rounded-lg text-xs font-medium border transition-colors flex items-center justify-center gap-1',
                    showScheduler
                      ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                      : 'border-zen-border-soft text-zen-text-muted hover:border-blue-400/50',
                  )}
                >
                  <Clock className="w-3 h-3" /> Programar
                </button>
              </div>
              {showScheduler && (
                <Input
                  type="datetime-local"
                  disabled={isSent}
                  value={scheduledInput}
                  onChange={e => setScheduledInput(e.target.value)}
                  className="bg-zen-surface border-zen-border-soft text-zen-anti-flash text-sm [color-scheme:dark]"
                />
              )}
            </div>
          </div>

          {/* Actions */}
          {!isSent && (
            <div className="space-y-2">
              <Button
                className="w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold gap-2"
                onClick={() => void save(false)}
                disabled={saving || sending}
              >
                <Save className="w-4 h-4" />
                {saving ? 'Guardando…' : showScheduler ? 'Guardar y programar' : 'Guardar borrador'}
              </Button>
              {!showScheduler && (
                <Button
                  variant="outline"
                  className="w-full border-emerald-700 hover:border-emerald-500 text-emerald-400 gap-2"
                  onClick={() => void save(true)}
                  disabled={saving || sending}
                >
                  <Send className="w-4 h-4" />
                  {sending ? 'Enviando…' : 'Enviar ahora'}
                </Button>
              )}
            </div>
          )}
        </div>

        {/* ── Right: Editor ── */}
        <div className="lg:col-span-2 space-y-4">
          {/* Language tabs */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-zen-surface/60 w-fit">
            {(['es', 'en'] as Lang[]).map(l => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors',
                  lang === l
                    ? 'bg-amber-500 text-black'
                    : 'text-zen-text-muted hover:text-zen-anti-flash',
                )}
              >
                <Globe className="w-3.5 h-3.5" />
                {l === 'es' ? 'Español' : 'English'}
              </button>
            ))}
            <button
              onClick={() => setShowPreview(p => !p)}
              className={cn(
                'ml-2 flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors border',
                showPreview
                  ? 'border-amber-500/50 text-amber-300 bg-amber-500/10'
                  : 'border-zen-border-soft text-zen-text-muted hover:text-zen-anti-flash',
              )}
            >
              {showPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              Preview
            </button>
          </div>

          {showPreview ? (
            /* ── Preview mode ── */
            <div className="rounded-xl overflow-hidden border border-zen-forest/30 bg-[#0D1117]" style={{ height: '70vh' }}>
              <div className="px-4 py-2 bg-[#161B27] border-b border-zen-forest/20 flex items-center gap-2 text-xs text-zinc-500">
                <FileText className="w-3.5 h-3.5" />
                Vista previa del email ({lang === 'es' ? 'Español' : 'English'})
              </div>
              <iframe
                srcDoc={buildPreviewHtml(currentBody, currentSubject, lang)}
                style={{ width: '100%', height: 'calc(70vh - 33px)', border: 'none' }}
                title="email preview"
              />
            </div>
          ) : (
            /* ── Editor mode ── */
            <div className="space-y-3">
              {/* Subject */}
              <div className="p-4 rounded-xl border border-zen-forest/20 bg-zen-surface/40">
                <Label className="text-xs text-zinc-500 mb-1.5 block">
                  Asunto ({lang === 'es' ? 'Español' : 'English'})
                </Label>
                <Input
                  disabled={isSent}
                  placeholder={lang === 'es' ? 'Asunto del email…' : 'Email subject…'}
                  value={lang === 'es' ? data.subject_es : data.subject_en}
                  onChange={e => setField(
                    lang === 'es' ? 'subject_es' : 'subject_en',
                    e.target.value,
                  )}
                  className="bg-transparent border-zen-border-soft text-zen-anti-flash text-base"
                />
              </div>

              {/* Rich body editor */}
              <RichEmailEditor
                value={currentBody}
                onChange={html => setField(
                  lang === 'es' ? 'body_html_es' : 'body_html_en',
                  html,
                )}
                disabled={isSent}
                placeholder={lang === 'es'
                  ? 'Escribe el cuerpo del email aquí…'
                  : 'Write the email body here…'}
                lang={lang}
              />
            </div>
          )}

          {/* Helper */}
          <p className="text-xs text-zinc-600">
            El header y footer de ZenTrade se añaden automáticamente. Solo escribe el cuerpo del email.
            Los estilos inline funcionan en todos los clientes de email.
          </p>
        </div>
      </div>
    </div>
  )
}
