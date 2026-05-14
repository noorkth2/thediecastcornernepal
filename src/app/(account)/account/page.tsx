import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getOrdersByUser } from '@/lib/supabase/queries/orders'
import { formatPrice, formatDate } from '@/lib/utils'
import { ORDER_STATUS_CONFIG } from '@/lib/constants'
import { Package, ShoppingBag, User } from 'lucide-react'

export default async function AccountDashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { orders } = await getOrdersByUser(user.id)
  const recentOrders = orders.slice(0, 3)
  const totalSpent = orders
    .filter((o) => o.payment_status === 'paid')
    .reduce((sum, o) => sum + o.total_amount, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-white tracking-wide">
          MY ACCOUNT
        </h1>
        <p className="text-text-muted text-sm mt-1">
          Welcome back, {profile?.full_name ?? 'Collector'}!
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Orders', value: orders.length, icon: Package, color: 'text-brand-red' },
          { label: 'Total Spent', value: formatPrice(totalSpent), icon: ShoppingBag, color: 'text-brand-gold' },
          { label: 'Account Status', value: 'Active', icon: User, color: 'text-green-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-surface-card rounded-xl border border-surface-border p-5">
            <div className="flex items-center gap-3 mb-2">
              <Icon className={`w-5 h-5 ${color}`} />
              <span className="text-text-muted text-xs uppercase tracking-wider">{label}</span>
            </div>
            <p className="font-bold text-xl text-text-primary">{value}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-text-primary">Recent Orders</h2>
          <Link href="/account/orders" className="text-sm text-brand-red-light hover:underline">
            View All →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="bg-surface-card rounded-xl border border-surface-border p-8 text-center">
            <Package className="w-12 h-12 text-surface-border mx-auto mb-3" />
            <p className="text-text-muted">No orders yet.</p>
            <Link href="/shop" className="text-brand-red-light text-sm hover:underline mt-2 inline-block">
              Start shopping →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => {
              const cfg = ORDER_STATUS_CONFIG[order.status]
              return (
                <Link
                  key={order.id}
                  href={`/account/orders/${order.id}`}
                  className="block bg-surface-card rounded-xl border border-surface-border p-4 hover:border-brand-red/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mono text-sm font-semibold text-brand-gold">
                        {order.order_code}
                      </p>
                      <p className="text-text-faint text-xs mt-0.5">
                        {formatDate(order.created_at)} · {order.order_items?.length ?? 0} item(s)
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-text-primary text-sm">
                        {formatPrice(order.total_amount)}
                      </p>
                      <span className={`text-xs font-semibold ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
