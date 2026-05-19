import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import {
  LayoutDashboard, Package, ShoppingBag, Tag,
  Settings, ExternalLink, BarChart3, Layers, Flag, Video,
  FileBarChart2, Calculator, BookOpen, Zap, Calendar,
} from 'lucide-react'
import { AdminSignOutButton } from '@/components/admin/AdminSignOutButton'

const NAV_GROUPS = [
  {
    label: 'Operations',
    links: [
      { href: '/admin',            label: 'Dashboard',    icon: LayoutDashboard },
      { href: '/admin/products',   label: 'Products',     icon: Package },
      { href: '/admin/categories', label: 'Categories',   icon: Tag, isSubmenu: true },
      { href: '/admin/brands',     label: 'Brands',       icon: Layers, isSubmenu: true },
      { href: '/admin/orders',     label: 'Orders',       icon: ShoppingBag },
      { href: '/admin/preorders',  label: 'Preorders',    icon: Calendar },
      { href: '/admin/drops',      label: 'Product Drops', icon: Zap },
      { href: '/admin/banners',    label: 'Banners',      icon: Flag },
      { href: '/admin/media',      label: 'Media Gallery', icon: Video },
    ],
  },
  {
    label: 'Intelligence',
    links: [
      { href: '/admin/reports',   label: 'Reports',       icon: FileBarChart2 },
      { href: '/admin/audit',     label: 'Audit Trail',   icon: FileBarChart2 },
    ],
  },
  {
    label: 'Finance',
    links: [
      { href: '/admin/accounting',          label: 'Accounting', icon: Calculator },
      { href: '/admin/accounting/expenses', label: 'Expenses',   icon: BookOpen, isSubmenu: true },
      { href: '/admin/accounting/payouts',  label: 'Payouts',    icon: BookOpen, isSubmenu: true },
      { href: '/admin/accounting/journal',  label: 'Journal',    icon: BookOpen, isSubmenu: true },
    ],
  },
  {
    label: 'System',
    links: [
      { href: '/admin/settings', label: 'Settings', icon: Settings },
    ],
  },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/admin')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/')

  return (
    <div className="min-h-screen flex bg-surface-base">
      {/* Sidebar */}
      <aside className="w-64 bg-surface-card border-r border-surface-border flex flex-col fixed top-0 bottom-0 left-0 z-40">
        {/* Brand */}
        <div className="p-5 border-b border-surface-border shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-red flex items-center justify-center font-display text-white text-sm">DC</div>
            <div>
              <span className="font-display text-sm text-white tracking-wider">DIECAST CORNER</span>
              <p className="text-[10px] text-brand-red font-semibold tracking-widest">ADMIN PORTAL</p>
            </div>
          </div>
        </div>

        {/* Nav groups */}
        <nav className="flex-1 p-3 overflow-y-auto space-y-4">
          {NAV_GROUPS.map(({ label, links }) => (
            <div key={label}>
              <p className="text-[9px] text-text-faint uppercase tracking-widest px-3 mb-1 font-bold">{label}</p>
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2.5 rounded-lg text-sm transition-colors mb-0.5 ${
                    'isSubmenu' in link && link.isSubmenu
                      ? 'text-text-muted hover:text-white ml-8 py-1.5 border-l border-surface-border pl-3 text-xs'
                      : 'text-text-muted hover:text-white hover:bg-surface-elevated px-3 py-2'
                  }`}
                >
                  {(!('isSubmenu' in link) || !link.isSubmenu) && <link.icon className="w-4 h-4" />}
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-surface-border space-y-1 shrink-0">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-text-muted hover:text-white hover:bg-surface-elevated transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" /> View Store
          </Link>
          <div className="px-3 py-2">
            <p className="text-xs text-text-faint truncate">{profile?.full_name ?? 'Admin'}</p>
            <p className="text-[11px] text-text-faint truncate">{user.email}</p>
          </div>
          <AdminSignOutButton />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64 min-h-screen overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  )
}

