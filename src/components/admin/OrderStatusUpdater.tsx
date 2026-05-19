'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateOrderStatus } from '@/app/admin/orders/actions'

const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

interface OrderStatusUpdaterProps {
  orderId: number
  currentStatus: string
  currentPaymentStatus: string
}

export function OrderStatusUpdater({ orderId, currentStatus, currentPaymentStatus }: OrderStatusUpdaterProps) {
  const router = useRouter()
  const [status, setStatus] = useState(currentStatus)
  const [paymentStatus, setPaymentStatus] = useState(currentPaymentStatus)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    setSuccess(false)
    try {
      await updateOrderStatus(orderId, status, paymentStatus)
      setSuccess(true)
      router.refresh()
      setTimeout(() => setSuccess(false), 2500)
    } catch (err) {
      console.error('Failed to update order status:', err)
      alert(err instanceof Error ? err.message : 'Failed to update order')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-surface-card rounded-xl border border-surface-border p-5 space-y-4">
      <h2 className="font-semibold text-text-primary text-sm uppercase tracking-widest">Update Order</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-text-muted mb-1.5">Order Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="input-base text-sm"
            id="order-status-select"
          >
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-text-muted mb-1.5">Payment Status</label>
          <select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
            className="input-base text-sm"
            id="payment-status-select"
          >
            {['unpaid', 'paid', 'refunded'].map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>
      <button
        onClick={handleSave}
        disabled={saving}
        className="px-4 py-2 bg-brand-red hover:bg-brand-red-light text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
        id="save-order-status-btn"
      >
        {saving ? 'Saving…' : success ? '✓ Saved!' : 'Save Changes'}
      </button>
    </div>
  )
}
