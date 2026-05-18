import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import {
  LayoutDashboard, Package, ShoppingBag, Tag,
  Settings, ExternalLink, BarChart3, Layers, Flag, Video
} from 'lucide-react'
import { AdminSignOutButton } from '@/components/admin/AdminSignOutButton'

const adminLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/categories', label: 'Categories', icon: Tag },
  { href: '/admin/brands', label: 'Brands', icon: Layers },
  { href: '/admin/banners', label: 'Banners', icon: Flag },
  { href: '/admin/media', label: 'Media Gallery', icon: Video },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
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
        <div className="p-5 border-b border-surface-border">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-brand-red flex items-center justify-center font-display text-white text-sm">DC</div>
            <div>
              <span className="font-display text-sm text-white tracking-wider">DIECAST CORNER</span>
              <p className="text-[10px] text-brand-red font-semibold tracking-widest">ADMIN PORTAL</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 overflow-y-auto">
          <p className="text-[10px] text-text-faint uppercase tracking-widest px-3 mb-2">Navigation</p>
          {adminLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-text-muted hover:text-white hover:bg-surface-elevated transition-colors mb-0.5"
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-surface-border space-y-1">
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
