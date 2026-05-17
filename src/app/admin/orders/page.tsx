import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'
import { ORDER_STATUS_CONFIG } from '@/lib/constants'

export const revalidate = 0

const STATUS_OPTIONS = ['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

interface AdminOrdersPageProps {
  searchParams: Promise<{ status?: string; page?: string }>
}

export default async function AdminOrdersPage(props: AdminOrdersPageProps) {
  const searchParams = await props.searchParams
  const supabase = await createClient()
  const status = searchParams.status && searchParams.status !== 'all' ? searchParams.status : null
  const page = Number(searchParams.page ?? 1)
  const limit = 20
  const from = (page - 1) * limit

  let query = supabase
    .from('orders')
    .select('id, order_code, status, payment_status, payment_method, total_amount, created_at, shipping_address', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, from + limit - 1)

  if (status) query = query.eq('status', status)

  const { data: orders, count } = await query
  const totalPages = Math.ceil((count ?? 0) / limit)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-white tracking-wide">ORDERS</h1>
        <p className="text-text-muted text-sm mt-1">{count ?? 0} total orders</p>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {STATUS_OPTIONS.map((s) => {
          const isActive = (searchParams.status ?? 'all') === s
          return (
            <Link
              key={s}
              href={`/admin/orders?status=${s}`}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                isActive
                  ? 'bg-brand-red text-white'
                  : 'bg-surface-elevated text-text-muted hover:text-white hover:bg-surface-border'
              }`}
            >
              {s}
            </Link>
          )
        })}
      </div>

      {/* Orders table */}
      <div className="bg-surface-card rounded-xl border border-surface-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border bg-surface-elevated/50">
                {['Order Code', 'Customer', 'Total', 'Payment', 'Status', 'Date', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-widest whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {orders?.map((o) => {
                const cfg = ORDER_STATUS_CONFIG[o.status as keyof typeof ORDER_STATUS_CONFIG]
                return (
                  <tr key={o.id} className="hover:bg-surface-elevated/40 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-brand-gold">{o.order_code}</td>
                    <td className="px-4 py-3">
                      <p className="text-text-primary font-medium">{o.shipping_address?.name ?? '—'}</p>
                      <p className="text-text-faint text-xs">{o.shipping_address?.phone ?? ''}</p>
                    </td>
                    <td className="px-4 py-3 font-semibold text-text-primary whitespace-nowrap">
                      {formatPrice(o.total_amount)}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-text-muted text-xs capitalize">
                        {o.payment_method === 'cod' ? 'COD' : o.payment_method}
                      </p>
                      <span className={`text-[10px] font-semibold ${o.payment_status === 'paid' ? 'text-green-400' : 'text-yellow-400'}`}>
                        {o.payment_status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {cfg ? (
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${cfg.color} ${cfg.bg}`}>
                          {cfg.label}
                        </span>
                      ) : (
                        <span className="text-text-faint text-xs capitalize">{o.status}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-text-faint text-xs whitespace-nowrap">
                      {new Date(o.created_at).toLocaleDateString('en-NP')}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="text-xs text-text-muted hover:text-white bg-surface-elevated hover:bg-surface-border px-2.5 py-1.5 rounded-lg transition-colors"
                        id={`admin-order-${o.id}`}
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                )
              })}
              {!orders?.length && (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-text-muted">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {[...Array(totalPages)].map((_, i) => {
            const p = i + 1
            return (
              <Link
                key={p}
                href={`/admin/orders?status=${searchParams.status ?? 'all'}&page=${p}`}
                className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                  p === page
                    ? 'bg-brand-red text-white'
                    : 'bg-surface-elevated text-text-muted hover:text-white'
                }`}
              >
                {p}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
