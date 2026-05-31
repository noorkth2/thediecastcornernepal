import { getCustomersWithStats } from '@/lib/supabase/queries/customers'
import { formatPrice, formatDate } from '@/lib/utils'
import { User, ShoppingBag, TrendingUp, Calendar } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export const revalidate = 0

export default async function AdminCustomersPage() {
  const { customers, error } = await getCustomersWithStats()

  const totalCustomers = customers.length
  const totalLTV = customers.reduce((acc, c) => acc + c.total_spent, 0)
  const avgLTV = totalCustomers > 0 ? totalLTV / totalCustomers : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-white tracking-wide uppercase">Customer CRM</h1>
        <p className="text-text-muted text-sm mt-1">Manage collectors and monitor lifetime value.</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-surface-card border border-surface-border p-5 rounded-xl">
          <div className="flex justify-between items-start mb-2">
            <User className="w-5 h-5 text-brand-gold" />
            <span className="text-[10px] font-bold text-text-faint uppercase tracking-widest">Total Collectors</span>
          </div>
          <p className="text-2xl font-bold text-white">{totalCustomers}</p>
        </div>
        <div className="bg-surface-card border border-surface-border p-5 rounded-xl">
          <div className="flex justify-between items-start mb-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <span className="text-[10px] font-bold text-text-faint uppercase tracking-widest">Lifetime Value</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatPrice(totalLTV)}</p>
        </div>
        <div className="bg-surface-card border border-surface-border p-5 rounded-xl">
          <div className="flex justify-between items-start mb-2">
            <ShoppingBag className="w-5 h-5 text-brand-red" />
            <span className="text-[10px] font-bold text-text-faint uppercase tracking-widest">Avg. Spend/User</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatPrice(avgLTV)}</p>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-surface-card rounded-xl border border-surface-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border bg-surface-elevated/50">
                {['Customer', 'Orders', 'LTV', 'Last Order', 'Joined', 'Role'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-widest whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-surface-elevated/40 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-text-primary font-medium">{c.full_name || 'Anonymous'}</p>
                    <p className="text-text-faint text-xs">{c.phone || 'No phone'}</p>
                  </td>
                  <td className="px-4 py-3 font-semibold text-text-primary">
                    {c.total_orders}
                  </td>
                  <td className="px-4 py-3 font-bold text-brand-gold">
                    {formatPrice(c.total_spent)}
                  </td>
                  <td className="px-4 py-3 text-text-faint text-xs">
                    {c.last_order_date ? (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" />
                        {formatDate(c.last_order_date)}
                      </div>
                    ) : 'Never'}
                  </td>
                  <td className="px-4 py-3 text-text-faint text-xs">
                    {formatDate(c.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={c.role === 'admin' ? 'gold' : 'blue'} className="text-[10px] uppercase">
                      {c.role}
                    </Badge>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-text-muted">
                    No customers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
