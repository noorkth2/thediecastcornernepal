import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'
import { TrendingUp, ShoppingBag, Package, Users, Star, Zap } from 'lucide-react'

export const revalidate = 60

export default async function AdminAnalyticsPage() {
  const supabase = await createClient()

  const [
    allOrders,
    topProducts,
    paymentMethods,
    stockLow,
    recentRevenue,
  ] = await Promise.all([
    // Orders with items for revenue calc
    supabase
      .from('orders')
      .select('id, total_amount, status, payment_method, payment_status, created_at')
      .order('created_at', { ascending: false }),

    // Top selling products via order_items
    supabase
      .from('order_items')
      .select('product_title, product_brand, quantity, unit_price')
      .order('quantity', { ascending: false })
      .limit(100),

    // Payment method breakdown
    supabase
      .from('orders')
      .select('payment_method'),

    // Low stock products
    supabase
      .from('products')
      .select('id, title, brand, stock_qty')
      .eq('is_active', true)
      .lte('stock_qty', 5)
      .order('stock_qty', { ascending: true })
      .limit(10),

    // Revenue last 7 days
    supabase
      .from('orders')
      .select('total_amount, created_at, payment_status')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .eq('payment_status', 'paid'),
  ])

  const orders = allOrders.data ?? []
  const paidOrders = orders.filter((o) => o.payment_status === 'paid')
  const totalRevenue = paidOrders.reduce((s, o) => s + (o.total_amount ?? 0), 0)
  const avgOrderValue = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0

  // Revenue last 7 days
  const weekRevenue = (recentRevenue.data ?? []).reduce((s, o) => s + (o.total_amount ?? 0), 0)

  // Payment method distribution
  const pmCounts: Record<string, number> = {}
  for (const o of paymentMethods.data ?? []) {
    pmCounts[o.payment_method] = (pmCounts[o.payment_method] ?? 0) + 1
  }
  const pmTotal = Object.values(pmCounts).reduce((s, v) => s + v, 0)

  // Top products by quantity sold
  const productMap: Record<string, { title: string; brand: string | null; qty: number; revenue: number }> = {}
  for (const item of topProducts.data ?? []) {
    const key = item.product_title
    if (!productMap[key]) {
      productMap[key] = { title: item.product_title, brand: item.product_brand, qty: 0, revenue: 0 }
    }
    productMap[key].qty += item.quantity
    productMap[key].revenue += item.quantity * item.unit_price
  }
  const topProductsList = Object.values(productMap)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 8)

  // Order status breakdown
  const statusCounts: Record<string, number> = {}
  for (const o of orders) {
    statusCounts[o.status] = (statusCounts[o.status] ?? 0) + 1
  }

  const pmLabels: Record<string, string> = { khalti: 'Khalti', esewa: 'eSewa', cod: 'Cash on Delivery' }
  const pmColors: Record<string, string> = {
    khalti: 'bg-purple-500',
    esewa: 'bg-green-500',
    cod: 'bg-brand-gold',
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-400',
    confirmed: 'bg-blue-400',
    processing: 'bg-purple-400',
    shipped: 'bg-orange-400',
    delivered: 'bg-green-400',
    cancelled: 'bg-red-400',
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-white tracking-wide">ANALYTICS</h1>
        <p className="text-text-muted text-sm mt-1">Store performance overview</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: formatPrice(totalRevenue), icon: TrendingUp, color: 'text-brand-gold', bg: 'bg-brand-gold/10 border-brand-gold/20' },
          { label: 'This Week', value: formatPrice(weekRevenue), icon: Zap, color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20' },
          { label: 'Avg. Order Value', value: formatPrice(avgOrderValue), icon: ShoppingBag, color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/20' },
          { label: 'Paid Orders', value: paidOrders.length, icon: Star, color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/20' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-surface-card rounded-xl border border-surface-border p-5">
            <div className={`w-10 h-10 rounded-lg border flex items-center justify-center mb-3 ${bg}`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-text-faint text-xs uppercase tracking-widest">{label}</p>
            <p className="font-bold text-2xl text-text-primary mt-1">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Method Distribution */}
        <div className="bg-surface-card rounded-xl border border-surface-border p-6">
          <h2 className="font-semibold text-text-primary mb-5 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-brand-red" />
            Payment Methods
          </h2>
          <div className="space-y-3">
            {Object.entries(pmCounts).map(([method, count]) => {
              const pct = pmTotal > 0 ? Math.round((count / pmTotal) * 100) : 0
              return (
                <div key={method}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-text-muted">{pmLabels[method] ?? method}</span>
                    <span className="text-sm font-semibold text-text-primary">{count} <span className="text-text-faint font-normal">({pct}%)</span></span>
                  </div>
                  <div className="h-2 bg-surface-elevated rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${pmColors[method] ?? 'bg-text-faint'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
            {pmTotal === 0 && (
              <p className="text-text-faint text-sm text-center py-6">No orders yet</p>
            )}
          </div>
        </div>

        {/* Order Status Breakdown */}
        <div className="bg-surface-card rounded-xl border border-surface-border p-6">
          <h2 className="font-semibold text-text-primary mb-5 flex items-center gap-2">
            <Package className="w-4 h-4 text-brand-red" />
            Order Status Breakdown
          </h2>
          <div className="space-y-3">
            {Object.entries(statusCounts).length === 0 ? (
              <p className="text-text-faint text-sm text-center py-6">No orders yet</p>
            ) : (
              Object.entries(statusCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([status, count]) => {
                  const pct = orders.length > 0 ? Math.round((count / orders.length) * 100) : 0
                  return (
                    <div key={status}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-text-muted capitalize">{status}</span>
                        <span className="text-sm font-semibold text-text-primary">{count} <span className="text-text-faint font-normal">({pct}%)</span></span>
                      </div>
                      <div className="h-2 bg-surface-elevated rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${statusColors[status] ?? 'bg-text-faint'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })
            )}
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-surface-card rounded-xl border border-surface-border overflow-hidden">
        <div className="px-6 py-4 border-b border-surface-border flex items-center gap-2">
          <Star className="w-4 h-4 text-brand-gold" />
          <h2 className="font-semibold text-text-primary">Top Selling Products</h2>
        </div>
        {topProductsList.length === 0 ? (
          <p className="text-text-faint text-sm text-center py-12">No sales data yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border bg-surface-elevated/50">
                  {['#', 'Product', 'Brand', 'Units Sold', 'Revenue'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-widest whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {topProductsList.map((p, i) => (
                  <tr key={p.title} className="hover:bg-surface-elevated/40 transition-colors">
                    <td className="px-4 py-3 text-text-faint font-mono text-xs">{i + 1}</td>
                    <td className="px-4 py-3 text-text-primary font-medium max-w-[240px] truncate">{p.title}</td>
                    <td className="px-4 py-3 text-text-muted">{p.brand ?? '—'}</td>
                    <td className="px-4 py-3 font-semibold text-text-primary">{p.qty}</td>
                    <td className="px-4 py-3 font-semibold text-brand-gold">{formatPrice(p.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Low Stock Warning */}
      {(stockLow.data?.length ?? 0) > 0 && (
        <div className="bg-surface-card rounded-xl border border-orange-400/30 overflow-hidden">
          <div className="px-6 py-4 border-b border-orange-400/20 flex items-center gap-2">
            <Package className="w-4 h-4 text-orange-400" />
            <h2 className="font-semibold text-text-primary">Low Stock Alert</h2>
            <span className="ml-auto text-xs text-orange-400 font-semibold bg-orange-400/10 px-2 py-0.5 rounded-full">
              {stockLow.data?.length} items
            </span>
          </div>
          <div className="divide-y divide-surface-border">
            {stockLow.data?.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-6 py-3">
                <div>
                  <p className="text-text-primary text-sm font-medium">{p.title}</p>
                  <p className="text-text-faint text-xs">{p.brand ?? 'No brand'}</p>
                </div>
                <span className={`text-sm font-bold ${p.stock_qty === 0 ? 'text-red-400' : 'text-orange-400'}`}>
                  {p.stock_qty === 0 ? 'OUT OF STOCK' : `${p.stock_qty} left`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
