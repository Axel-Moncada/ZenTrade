'use client'

import { useRef, useCallback, useEffect, useState } from 'react'
import { Bold, Italic, Link2, Unlink, Image as ImageIcon, Minus, Code } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RichEmailEditorProps {
  value: string
  onChange: (html: string) => void
  disabled?: boolean
  placeholder?: string
  lang: 'es' | 'en'
}

export function RichEmailEditor({ value, onChange, disabled, placeholder, lang }: RichEmailEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const lastExternal = useRef(value)
  const [uploading, setUploading] = useState(false)
  const [htmlMode, setHtmlMode] = useState(false)

  // Sync external value → DOM only when the prop changes (e.g. lang tab switch)
  useEffect(() => {
    if (!editorRef.current) return
    if (value !== lastExternal.current) {
      lastExternal.current = value
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value
      }
    }
  }, [value])

  const emitChange = useCallback(() => {
    if (!editorRef.current) return
    const html = editorRef.current.innerHTML
    lastExternal.current = html
    onChange(html)
  }, [onChange])

  // Use mouseDown so the toolbar click doesn't blur the editor
  function exec(command: string, val?: string) {
    document.execCommand(command, false, val)
    editorRef.current?.focus()
    emitChange()
  }

  function insertHtml(html: string) {
    editorRef.current?.focus()
    document.execCommand('insertHTML', false, html)
    emitChange()
  }

  function insertHeading(level: 'h2' | 'h3') {
    const sel = window.getSelection()
    const text = sel?.toString() || (level === 'h2' ? 'Título' : 'Subtítulo')
    const style = level === 'h2'
      ? 'color:#0D1F18;font-size:20px;font-weight:700;margin:24px 0 12px;line-height:1.3;'
      : 'color:#0D1F18;font-size:16px;font-weight:600;margin:18px 0 8px;line-height:1.4;'
    insertHtml(`<${level} style="${style}">${text}</${level}><p style="margin:0 0 14px;"></p>`)
  }

  function handleLink() {
    const sel = window.getSelection()
    if (sel && !sel.isCollapsed) {
      const url = prompt(lang === 'es' ? 'URL del enlace:' : 'Link URL:', 'https://')
      if (url) exec('createLink', url)
    } else {
      const text = prompt(lang === 'es' ? 'Texto del enlace:' : 'Link text:') ?? ''
      const url  = prompt('URL:', 'https://') ?? ''
      if (text && url) {
        insertHtml(`<a href="${url}" style="color:#007A4D;text-decoration:none;font-weight:500;">${text}</a>`)
      }
    }
  }

  function insertDivider() {
    insertHtml('<hr style="border:none;border-top:1px solid #D1E8DC;margin:24px 0;" /><p style="margin:0 0 14px;"></p>')
  }

  function insertCTA() {
    const text = prompt(
      lang === 'es' ? 'Texto del botón:' : 'Button text:',
      lang === 'es' ? 'Ver más →' : 'Learn more →',
    ) ?? ''
    if (!text) return
    const url = prompt('URL:', 'https://www.zen-trader.com/pricing') ?? ''
    if (!url) return
    insertHtml(
      `<p style="text-align:center;margin:28px 0;"><a href="${url}" style="display:inline-block;padding:14px 32px;background:#00C17C;color:#000;font-weight:700;font-size:15px;border-radius:8px;text-decoration:none;">${text}</a></p><p style="margin:0 0 14px;"></p>`
    )
  }

  async function uploadImage(file: File) {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/admin/upload-image', { method: 'POST', body: fd })
      if (res.ok) {
        const { url } = await res.json() as { url: string }
        insertHtml(
          `<p style="text-align:center;margin:20px 0;"><img src="${url}" alt="" style="max-width:100%;height:auto;border-radius:8px;display:inline-block;" /></p><p style="margin:0 0 14px;"></p>`
        )
      } else {
        alert('Error al subir la imagen')
      }
    } finally {
      setUploading(false)
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    // Intercept image paste
    for (const item of e.clipboardData.items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault()
        const file = item.getAsFile()
        if (file) void uploadImage(file)
        return
      }
    }
    // Strip external rich text, paste plain text only
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, text)
    emitChange()
  }

  const charCount = value.replace(/<[^>]+>/g, '').length

  return (
    <>
      {/* Editor content styles (for editing UX, not email output) */}
      <style>{`
        .zen-rich [contenteditable]:empty::before {
          content: attr(data-placeholder);
          color: #9EADA6;
          font-style: italic;
          pointer-events: none;
        }
        .zen-rich [contenteditable]:focus { outline: none; }
        .zen-rich [contenteditable] h2 { color:#0D1F18; font-size:20px; font-weight:700; margin:20px 0 10px; }
        .zen-rich [contenteditable] h3 { color:#0D1F18; font-size:16px; font-weight:600; margin:16px 0 8px; }
        .zen-rich [contenteditable] p  { margin:0 0 14px; color:#0D1F18; }
        .zen-rich [contenteditable] a  { color:#007A4D; text-decoration:underline; }
        .zen-rich [contenteditable] hr { border:none; border-top:1px solid #D1E8DC; margin:20px 0; }
        .zen-rich [contenteditable] img { max-width:100%; border-radius:8px; }
        .zen-rich [contenteditable] strong,
        .zen-rich [contenteditable] b   { font-weight:700; }
        .zen-rich [contenteditable] em,
        .zen-rich [contenteditable] i   { font-style:italic; }
      `}</style>

      <div className="zen-rich rounded-xl border border-zen-forest/20 overflow-hidden">
        {/* ── Toolbar ── */}
        {!disabled && (
          <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-zen-forest/20 bg-[#0d1a14]">

            {/* Inline */}
            <TBtn onMouseDown={() => exec('bold')} title="Negrita (Ctrl+B)">
              <Bold className="w-3.5 h-3.5" />
            </TBtn>
            <TBtn onMouseDown={() => exec('italic')} title="Cursiva (Ctrl+I)">
              <Italic className="w-3.5 h-3.5" />
            </TBtn>
            <TBtn onMouseDown={() => exec('underline')} title="Subrayado">
              <span className="text-xs font-medium underline">U</span>
            </TBtn>

            <Sep />

            {/* Block */}
            <TBtn onMouseDown={() => insertHeading('h2')} title="Título H2">
              <span className="text-xs font-bold">H2</span>
            </TBtn>
            <TBtn onMouseDown={() => insertHeading('h3')} title="Subtítulo H3">
              <span className="text-xs font-bold">H3</span>
            </TBtn>

            <Sep />

            {/* Links */}
            <TBtn onMouseDown={handleLink} title={lang === 'es' ? 'Insertar enlace' : 'Insert link'}>
              <Link2 className="w-3.5 h-3.5" />
            </TBtn>
            <TBtn onMouseDown={() => exec('unlink')} title={lang === 'es' ? 'Quitar enlace' : 'Remove link'}>
              <Unlink className="w-3.5 h-3.5" />
            </TBtn>

            <Sep />

            {/* Blocks */}
            <TBtn onMouseDown={insertDivider} title={lang === 'es' ? 'Línea divisoria' : 'Divider'}>
              <Minus className="w-3.5 h-3.5" />
            </TBtn>
            <TBtn
              onMouseDown={insertCTA}
              title={lang === 'es' ? 'Botón CTA verde' : 'Green CTA button'}
              className="text-emerald-400 hover:bg-emerald-900/30 hover:text-emerald-300"
            >
              <span className="text-[10px] font-bold">BTN</span>
            </TBtn>

            <Sep />

            {/* Image */}
            <TBtn
              onMouseDown={() => fileInputRef.current?.click()}
              title={uploading ? 'Subiendo…' : lang === 'es' ? 'Insertar imagen' : 'Insert image'}
              className={uploading ? 'opacity-40' : ''}
            >
              <ImageIcon className="w-3.5 h-3.5" />
            </TBtn>
            {uploading && (
              <span className="text-[10px] text-zinc-500 ml-1 animate-pulse">Subiendo…</span>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) void uploadImage(file)
                e.target.value = ''
              }}
            />

            {/* HTML mode toggle — pushed to the right */}
            <div className="ml-auto">
              <Sep />
            </div>
            <TBtn
              onMouseDown={() => setHtmlMode(m => !m)}
              title={htmlMode ? 'Cambiar a editor visual' : 'Editar HTML directamente'}
              className={htmlMode ? 'bg-zinc-700 text-amber-300' : ''}
            >
              <Code className="w-3.5 h-3.5" />
            </TBtn>
          </div>
        )}

        {/* ── HTML mode: raw textarea ── */}
        {htmlMode && !disabled ? (
          <textarea
            value={value}
            onChange={e => { lastExternal.current = e.target.value; onChange(e.target.value) }}
            spellCheck={false}
            className="w-full min-h-[420px] p-5 font-mono text-xs leading-relaxed bg-[#0d1a14] text-emerald-300 outline-none resize-none"
            placeholder="<p>HTML directo aquí…</p>"
          />
        ) : (
          /* ── Visual mode: contenteditable ── */
          <div
            ref={editorRef}
            contentEditable={!disabled}
            suppressContentEditableWarning
            onInput={emitChange}
            onPaste={handlePaste}
            data-placeholder={placeholder}
            className={cn(
              'min-h-[420px] p-6 text-[#0D1F18] text-sm leading-relaxed bg-white',
              disabled && 'opacity-60 cursor-not-allowed bg-zinc-50',
            )}
          />
        )}

        {/* Footer */}
        <div className="px-4 py-2 border-t border-zen-forest/20 bg-[#0d1a14] text-xs text-zinc-600 flex justify-between">
          <span className="text-zinc-600">
            {htmlMode
              ? (lang === 'es' ? 'Modo HTML — edición directa' : 'HTML mode — direct edit')
              : (lang === 'es' ? 'Ctrl+V para pegar imágenes' : 'Ctrl+V to paste images')
            }
          </span>
          <span>{charCount} {lang === 'es' ? 'caracteres' : 'chars'}</span>
        </div>
      </div>
    </>
  )
}

// ── Small helpers ──────────────────────────────────────────────────────────────

function TBtn({
  onMouseDown, title, children, className,
}: {
  onMouseDown: () => void
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => { e.preventDefault(); onMouseDown() }}
      className={cn(
        'w-8 h-8 rounded flex items-center justify-center text-zinc-300 transition-colors',
        'hover:bg-zinc-700 hover:text-white',
        className,
      )}
    >
      {children}
    </button>
  )
}

function Sep() {
  return <div className="w-px h-5 bg-zinc-700 mx-0.5 self-center" />
}
