import { getPayouts } from '@/lib/supabase/queries/accounting'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import { Plus, Truck, ArrowLeft } from 'lucide-react'

export const revalidate = 30

export default async function PayoutsPage() {
  const { data: payouts, count } = await getPayouts(undefined, undefined, 1, 50)
  const totalAmount = payouts.reduce((s, p) => s + p.amount, 0)

  const typeColors: Record<string, string> = {
    supplier:  'bg-slate-400/15 text-slate-400',
    logistics: 'bg-cyan-400/15 text-cyan-400',
    employee:  'bg-blue-400/15 text-blue-400',
    other:     'bg-surface-elevated text-text-muted',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/accounting" className="text-text-faint hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-display text-2xl text-white tracking-wide">PAYOUT RECORDS</h1>
            <p className="text-text-muted text-sm mt-0.5">{count} entries · {formatPrice(totalAmount)} total disbursed</p>
          </div>
        </div>
      </div>

      <div className="bg-surface-card border border-surface-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border bg-surface-elevated/50">
                {['Date', 'Recipient', 'Type', 'Method', 'Reference', 'Amount'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-widest whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {payouts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-text-faint text-sm">No payouts recorded yet</td>
                </tr>
              ) : (
                payouts.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-elevated/30 transition-colors">
                    <td className="px-4 py-3 text-text-muted text-xs tabular-nums">{p.payout_date}</td>
                    <td className="px-4 py-3 text-text-primary font-medium">{p.recipient}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${typeColors[p.recipient_type] ?? 'bg-surface-elevated text-text-muted'}`}>
                        {p.recipient_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-muted capitalize">{p.payment_method.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-3 text-text-faint text-xs">{p.reference ?? '—'}</td>
                    <td className="px-4 py-3 text-right font-semibold text-orange-400">{formatPrice(p.amount)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
