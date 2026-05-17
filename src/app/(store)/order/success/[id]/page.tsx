import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Package, MapPin, CreditCard, ArrowRight } from 'lucide-react'
import { getOrderById } from '@/lib/supabase/queries/orders'
import { formatPrice, formatDate } from '@/lib/utils'
import { ORDER_STATUS_CONFIG } from '@/lib/constants'
import { Button } from '@/components/ui/button'

export const revalidate = 30

interface OrderSuccessPageProps {
  params: Promise<{ id: string }>
}

export default async function OrderSuccessPage(props: OrderSuccessPageProps) {
  const params = await props.params
  const { order } = await getOrderById(Number(params.id))
  if (!order) notFound()

  const statusConfig = ORDER_STATUS_CONFIG[order.status]

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
      {/* Success header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 border border-green-500/30 mb-5">
          <CheckCircle className="w-10 h-10 text-green-400" />
        </div>
        <h1 className="font-display text-4xl text-white tracking-wide mb-2">
          ORDER PLACED!
        </h1>
        <p className="text-text-muted">
          Thank you for your order. We&apos;ll start processing it right away.
        </p>
        <div className="mt-3 inline-flex items-center gap-2 bg-surface-elevated rounded-full px-4 py-2">
          <span className="text-text-muted text-sm">Order Code:</span>
          <span className="font-bold text-brand-gold font-mono">{order.order_code}</span>
        </div>
      </div>

      {/* Order details card */}
      <div className="bg-surface-card rounded-2xl border border-surface-border overflow-hidden mb-6">
        {/* Status */}
        <div className="p-5 border-b border-surface-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-text-muted" />
            <span className="text-sm font-medium text-text-muted">Status</span>
          </div>
          <span className={`text-sm font-semibold px-3 py-1 rounded-full ${statusConfig.color} ${statusConfig.bg}`}>
            {statusConfig.label}
          </span>
        </div>

        {/* Shipping address */}
        <div className="p-5 border-b border-surface-border">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-text-muted" />
            <span className="text-sm font-medium text-text-muted">Delivering To</span>
          </div>
          <p className="font-semibold text-text-primary">{order.shipping_address.name}</p>
          <p className="text-text-muted text-sm">{order.shipping_address.phone}</p>
          <p className="text-text-muted text-sm">
            {order.shipping_address.address}, {order.shipping_address.city}
          </p>
        </div>

        {/* Payment */}
        <div className="p-5 border-b border-surface-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-text-muted" />
            <span className="text-sm text-text-muted">Payment</span>
          </div>
          <div className="text-right">
            <span className="text-sm font-medium text-text-primary capitalize">
              {order.payment_method === 'cod' ? 'Cash on Delivery' : order.payment_method}
            </span>
            <span className={`ml-2 text-xs ${order.payment_status === 'paid' ? 'text-green-400' : 'text-yellow-400'}`}>
              ({order.payment_status})
            </span>
          </div>
        </div>

        {/* Order items */}
        {order.order_items && order.order_items.length > 0 && (
          <div className="p-5 border-b border-surface-border">
            <p className="text-sm font-medium text-text-muted mb-3">Items Ordered</p>
            <div className="space-y-2.5">
              {order.order_items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-text-primary line-clamp-1 flex-1 pr-2">
                    {item.product_title}
                    <span className="text-text-faint ml-1">×{item.quantity}</span>
                  </span>
                  <span className="text-brand-gold font-semibold flex-shrink-0">
                    {formatPrice(item.unit_price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Totals */}
        <div className="p-5 space-y-2 text-sm">
          <div className="flex justify-between text-text-muted">
            <span>Shipping</span>
            <span>{order.shipping_charge === 0 ? <span className="text-green-400">FREE</span> : formatPrice(order.shipping_charge)}</span>
          </div>
          <div className="flex justify-between font-bold text-base pt-2 border-t border-surface-border">
            <span className="text-text-primary">Total Paid</span>
            <span className="text-brand-gold">{formatPrice(order.total_amount)}</span>
          </div>
        </div>
      </div>

      {/* Date */}
      <p className="text-center text-text-faint text-xs mb-8">
        Order placed on {formatDate(order.created_at)}
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="primary" size="lg" className="flex-1 gap-2" asChild>
          <Link href="/account/orders">
            Track My Order <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
        <Button variant="secondary" size="lg" className="flex-1" asChild>
          <Link href="/shop">Continue Shopping</Link>
        </Button>
      </div>
    </div>
  )
}
