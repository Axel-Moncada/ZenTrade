'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

const TABS = [
  { href: '/dashboard/admin/users', label: 'Usuarios' },
  { href: '/dashboard/admin/affiliates', label: 'Afiliados' },
  { href: '/dashboard/admin/metrics', label: 'Métricas' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen">
      {/* Tab nav */}
      <div className="border-b border-zen-forest/30 bg-zen-surface/30 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 flex items-center gap-1">
          <span className="text-xs font-semibold tracking-widest uppercase text-amber-400/70 mr-4">Admin</span>
          {TABS.map((tab) => {
            const isActive = pathname.startsWith(tab.href)
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`px-4 py-3.5 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-zen-text-muted hover:text-zen-anti-flash hover:border-zen-border-soft'
                }`}
              >
                {tab.label}
              </Link>
            )
          })}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {children}
      </div>
    </div>
  )
}
