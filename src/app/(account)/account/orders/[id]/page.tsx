import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getOrderById } from '@/lib/supabase/queries/orders'
import { formatPrice, formatDate } from '@/lib/utils'
import { ORDER_STATUS_CONFIG } from '@/lib/constants'
import { CheckCircle, Circle, Package, Truck, MapPin, CreditCard } from 'lucide-react'

const TIMELINE_STEPS: Array<{ status: string; label: string; desc: string }> = [
  { status: 'pending', label: 'Order Placed', desc: 'Your order has been received' },
  { status: 'confirmed', label: 'Confirmed', desc: 'Order confirmed by the store' },
  { status: 'processing', label: 'Processing', desc: 'Your order is being packed' },
  { status: 'shipped', label: 'Shipped', desc: 'Out for delivery' },
  { status: 'delivered', label: 'Delivered', desc: 'Order delivered successfully' },
]

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { order } = await getOrderById(Number(params.id))
  if (!order || order.user_id !== user.id) notFound()

  const currentStep = ORDER_STATUS_CONFIG[order.status].step

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/account/orders" className="text-xs text-text-muted hover:text-white transition-colors">
            ← Back to Orders
          </Link>
          <h1 className="font-display text-3xl text-white tracking-wide mt-1">
            {order.order_code}
          </h1>
          <p className="text-text-faint text-sm">{formatDate(order.created_at)}</p>
        </div>
        <span className={`text-sm font-semibold px-3 py-1.5 rounded-full ${ORDER_STATUS_CONFIG[order.status].color} ${ORDER_STATUS_CONFIG[order.status].bg}`}>
          {ORDER_STATUS_CONFIG[order.status].label}
        </span>
      </div>

      {/* Status Timeline */}
      {order.status !== 'cancelled' && (
        <div className="bg-surface-card rounded-xl border border-surface-border p-5">
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-widest mb-5">
            Order Progress
          </h2>
          <div className="relative">
            <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-surface-border" />
            <div className="space-y-5">
              {TIMELINE_STEPS.map((step, i) => {
                const done = currentStep >= i
                const active = currentStep === i
                return (
                  <div key={step.status} className="relative flex items-start gap-4 pl-10">
                    <div className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                      done
                        ? 'bg-green-500/20 border-green-500'
                        : active
                        ? 'bg-brand-red/20 border-brand-red'
                        : 'bg-surface-elevated border-surface-border'
                    }`}>
                      {done ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <Circle className={`w-4 h-4 ${active ? 'text-brand-red' : 'text-text-faint'}`} />
                      )}
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${done ? 'text-text-primary' : 'text-text-faint'}`}>
                        {step.label}
                      </p>
                      <p className="text-xs text-text-faint mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Shipping info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-surface-card rounded-xl border border-surface-border p-4">
          <div className="flex items-center gap-2 mb-2 text-text-muted">
            <MapPin className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Shipping To</span>
          </div>
          <p className="font-semibold text-text-primary text-sm">{order.shipping_address.name}</p>
          <p className="text-text-muted text-sm">{order.shipping_address.phone}</p>
          <p className="text-text-muted text-sm">{order.shipping_address.address}</p>
          <p className="text-text-muted text-sm">{order.shipping_address.city}</p>
        </div>
        <div className="bg-surface-card rounded-xl border border-surface-border p-4">
          <div className="flex items-center gap-2 mb-2 text-text-muted">
            <CreditCard className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Payment</span>
          </div>
          <p className="font-semibold text-text-primary text-sm capitalize">
            {order.payment_method === 'cod' ? 'Cash on Delivery' : order.payment_method}
          </p>
          <p className={`text-sm font-medium mt-1 ${
            order.payment_status === 'paid' ? 'text-green-400' : 'text-yellow-400'
          }`}>
            {order.payment_status === 'paid' ? '✓ Paid' : '⏳ Pending'}
          </p>
        </div>
      </div>

      {/* Items */}
      {order.order_items && (
        <div className="bg-surface-card rounded-xl border border-surface-border overflow-hidden">
          <div className="p-4 border-b border-surface-border flex items-center gap-2">
            <Package className="w-4 h-4 text-text-muted" />
            <span className="text-sm font-semibold text-text-muted uppercase tracking-wider">Items</span>
          </div>
          <div className="divide-y divide-surface-border">
            {order.order_items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-text-primary text-sm line-clamp-2">{item.product_title}</p>
                  {item.product_brand && (
                    <p className="text-text-faint text-xs">{item.product_brand}</p>
                  )}
                  <p className="text-text-muted text-xs mt-1">Qty: {item.quantity} × {formatPrice(item.unit_price)}</p>
                </div>
                <p className="font-bold text-brand-gold text-sm flex-shrink-0">
                  {formatPrice(item.unit_price * item.quantity)}
                </p>
              </div>
            ))}
          </div>
          {/* Totals */}
          <div className="p-4 bg-surface-elevated space-y-2 text-sm border-t border-surface-border">
            <div className="flex justify-between text-text-muted">
              <span>Shipping</span>
              <span>{order.shipping_charge === 0 ? <span className="text-green-400">FREE</span> : formatPrice(order.shipping_charge)}</span>
            </div>
            <div className="flex justify-between font-bold text-base">
              <span className="text-text-primary">Total</span>
              <span className="text-brand-gold">{formatPrice(order.total_amount)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
