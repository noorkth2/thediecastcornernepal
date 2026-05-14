import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getOrderById } from '@/lib/supabase/queries/orders'
import { formatPrice, formatDate } from '@/lib/utils'
import { ORDER_STATUS_CONFIG } from '@/lib/constants'
import { OrderStatusUpdater } from '@/components/admin/OrderStatusUpdater'
import { MapPin, CreditCard, Package } from 'lucide-react'

export const revalidate = 0

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const { order } = await getOrderById(Number(params.id))
  if (!order) notFound()

  const cfg = ORDER_STATUS_CONFIG[order.status]

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link href="/admin/orders" className="text-xs text-text-muted hover:text-white transition-colors">
            ← Back to Orders
          </Link>
          <h1 className="font-display text-3xl text-white tracking-wide mt-1">{order.order_code}</h1>
          <p className="text-text-faint text-sm">{formatDate(order.created_at)}</p>
        </div>
        {cfg && (
          <span className={`text-sm font-semibold px-3 py-1.5 rounded-full ${cfg.color} ${cfg.bg}`}>
            {cfg.label}
          </span>
        )}
      </div>

      {/* Status updater */}
      <OrderStatusUpdater
        orderId={order.id}
        currentStatus={order.status}
        currentPaymentStatus={order.payment_status}
      />

      {/* Info grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-surface-card rounded-xl border border-surface-border p-5">
          <div className="flex items-center gap-2 mb-3 text-text-muted">
            <MapPin className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Ship To</span>
          </div>
          <p className="font-semibold text-text-primary">{order.shipping_address.name}</p>
          <p className="text-text-muted text-sm">{order.shipping_address.phone}</p>
          <p className="text-text-muted text-sm">{order.shipping_address.address}</p>
          <p className="text-text-muted text-sm">{order.shipping_address.city}</p>
          {order.shipping_address.landmark && (
            <p className="text-text-faint text-xs mt-1">Near: {order.shipping_address.landmark}</p>
          )}
        </div>

        <div className="bg-surface-card rounded-xl border border-surface-border p-5">
          <div className="flex items-center gap-2 mb-3 text-text-muted">
            <CreditCard className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Payment</span>
          </div>
          <p className="font-semibold text-text-primary capitalize">
            {order.payment_method === 'cod' ? 'Cash on Delivery' : order.payment_method}
          </p>
          <p className={`text-sm font-semibold mt-1.5 ${order.payment_status === 'paid' ? 'text-green-400' : order.payment_status === 'refunded' ? 'text-blue-400' : 'text-yellow-400'}`}>
            {order.payment_status === 'paid' ? '✓ Paid' : order.payment_status === 'refunded' ? '↩ Refunded' : '⏳ Unpaid'}
          </p>
          {order.notes && (
            <div className="mt-3 pt-3 border-t border-surface-border">
              <p className="text-xs text-text-muted">Customer Note:</p>
              <p className="text-sm text-text-primary mt-0.5">{order.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Order items */}
      {order.order_items && order.order_items.length > 0 && (
        <div className="bg-surface-card rounded-xl border border-surface-border overflow-hidden">
          <div className="flex items-center gap-2 p-4 border-b border-surface-border">
            <Package className="w-4 h-4 text-text-muted" />
            <span className="text-sm font-semibold text-text-muted uppercase tracking-wider">
              Items ({order.order_items.length})
            </span>
          </div>
          <div className="divide-y divide-surface-border">
            {order.order_items.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4">
                <div className="min-w-0 flex-1 pr-4">
                  <p className="font-medium text-text-primary text-sm line-clamp-2">{item.product_title}</p>
                  {item.product_brand && (
                    <p className="text-text-faint text-xs">{item.product_brand}</p>
                  )}
                  <p className="text-text-muted text-xs mt-1">
                    {formatPrice(item.unit_price)} × {item.quantity}
                  </p>
                </div>
                <p className="font-bold text-brand-gold text-sm flex-shrink-0">
                  {formatPrice(item.unit_price * item.quantity)}
                </p>
              </div>
            ))}
          </div>
          <div className="p-4 bg-surface-elevated border-t border-surface-border space-y-2 text-sm">
            <div className="flex justify-between text-text-muted">
              <span>Shipping</span>
              <span>
                {order.shipping_charge === 0
                  ? <span className="text-green-400">FREE</span>
                  : formatPrice(order.shipping_charge)}
              </span>
            </div>
            <div className="flex justify-between font-bold text-base border-t border-surface-border pt-2">
              <span className="text-text-primary">Order Total</span>
              <span className="text-brand-gold">{formatPrice(order.total_amount)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
