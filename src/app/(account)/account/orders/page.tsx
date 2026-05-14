import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getOrdersByUser } from '@/lib/supabase/queries/orders'
import { formatPrice, formatDate } from '@/lib/utils'
import { ORDER_STATUS_CONFIG } from '@/lib/constants'
import { Package } from 'lucide-react'

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { orders } = await getOrdersByUser(user.id)

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-white tracking-wide">MY ORDERS</h1>

      {orders.length === 0 ? (
        <div className="bg-surface-card rounded-xl border border-surface-border p-16 text-center">
          <Package className="w-16 h-16 text-surface-border mx-auto mb-4" />
          <p className="text-text-muted mb-2">No orders found.</p>
          <Link href="/shop" className="text-brand-red-light text-sm hover:underline">
            Start shopping →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const cfg = ORDER_STATUS_CONFIG[order.status]
            return (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="block bg-surface-card rounded-xl border border-surface-border p-5 hover:border-brand-red/30 transition-colors group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-mono font-bold text-brand-gold">{order.order_code}</p>
                    <p className="text-text-faint text-xs mt-1">{formatDate(order.created_at)}</p>
                    <p className="text-text-muted text-sm mt-2">
                      {order.order_items?.length ?? 0} item(s) ·{' '}
                      <span className="capitalize">
                        {order.payment_method === 'cod' ? 'Cash on Delivery' : order.payment_method}
                      </span>
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-text-primary">{formatPrice(order.total_amount)}</p>
                    <span className={`inline-block mt-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full ${cfg.color} ${cfg.bg}`}>
                      {cfg.label}
                    </span>
                    <p className="text-xs text-text-faint mt-1 group-hover:text-brand-red-light transition-colors">
                      View Details →
                    </p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
