import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { User, Package, Settings, LogOut, LayoutDashboard } from 'lucide-react'

const accountLinks = [
  { href: '/account', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/account/orders', label: 'My Orders', icon: Package },
  { href: '/account/profile', label: 'Profile', icon: Settings },
]

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role, avatar_url')
    .eq('id', user.id)
    .single()

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="md:w-64 flex-shrink-0">
          <div className="bg-surface-card rounded-2xl border border-surface-border overflow-hidden">
            {/* User info */}
            <div className="p-5 border-b border-surface-border">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-brand-red/20 border border-brand-red/30 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-brand-red" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-text-primary text-sm truncate">
                    {profile?.full_name ?? 'Collector'}
                  </p>
                  <p className="text-text-faint text-xs truncate">{user.email}</p>
                </div>
              </div>
              {profile?.role === 'admin' && (
                <Link
                  href="/admin"
                  className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs font-medium text-brand-gold bg-brand-gold/10 border border-brand-gold/20 rounded-lg py-1.5 hover:bg-brand-gold/20 transition-colors"
                >
                  Admin Dashboard →
                </Link>
              )}
            </div>

            {/* Nav links */}
            <nav className="p-2">
              {accountLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-text-muted hover:text-white hover:bg-surface-elevated transition-colors"
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}
            </nav>

            {/* Sign out */}
            <div className="p-2 border-t border-surface-border">
              <form action="/api/auth/signout" method="POST">
                <button
                  type="submit"
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-text-muted hover:text-red-400 hover:bg-red-500/5 transition-colors"
                  id="signout-btn"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  )
}
