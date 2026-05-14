import { getAdminStats } from '@/lib/supabase/queries/orders'
import { formatPrice } from '@/lib/utils'
import { ShoppingBag, Package, Users, TrendingUp, Clock, CheckCircle } from 'lucide-react'

export const revalidate = 60

export default async function AdminDashboardPage() {
  const { stats } = await getAdminStats()

  const statCards = [
    { label: 'Total Revenue', value: formatPrice(stats.totalRevenue), icon: TrendingUp, color: 'text-brand-gold', bg: 'bg-brand-gold/10 border-brand-gold/20' },
    { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'text-brand-red', bg: 'bg-brand-red/10 border-brand-red/20' },
    { label: 'Pending Orders', value: stats.pendingOrders, icon: Clock, color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/20' },
    { label: 'Products', value: stats.totalProducts, icon: Package, color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20' },
    { label: 'Customers', value: stats.totalCustomers, icon: Users, color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/20' },
    { label: 'Delivered', value: stats.deliveredOrders, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/20' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-white tracking-wide">DASHBOARD</h1>
        <p className="text-text-muted text-sm mt-1">Overview of your store performance</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-surface-card rounded-xl border border-surface-border p-5">
            <div className={`w-10 h-10 rounded-lg border flex items-center justify-center mb-3 ${bg}`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-text-faint text-xs uppercase tracking-widest">{label}</p>
            <p className="font-bold text-2xl text-text-primary mt-1">{value}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      {stats.recentOrders?.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-text-primary">Recent Orders</h2>
            <a href="/admin/orders" className="text-sm text-brand-red-light hover:underline">View All →</a>
          </div>
          <div className="bg-surface-card rounded-xl border border-surface-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border">
                  {['Order', 'Customer', 'Amount', 'Status', 'Date'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {stats.recentOrders.map((o: any) => (
                  <tr key={o.id} className="hover:bg-surface-elevated/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-brand-gold font-semibold">{o.order_code}</td>
                    <td className="px-4 py-3 text-text-muted">{o.shipping_address?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-text-primary font-medium">{formatPrice(o.total_amount)}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs capitalize font-medium text-text-muted bg-surface-elevated px-2 py-0.5 rounded-full">{o.status}</span>
                    </td>
                    <td className="px-4 py-3 text-text-faint text-xs">{new Date(o.created_at).toLocaleDateString('en-NP')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
