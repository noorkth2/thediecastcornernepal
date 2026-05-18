import { getAccountingOverview } from '@/lib/supabase/queries/accounting'
import { getExpenses } from '@/lib/supabase/queries/accounting'
import { getPayouts } from '@/lib/supabase/queries/accounting'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import { Calculator, Plus, TrendingDown, TrendingUp, Wallet, ArrowRight, Receipt, Truck } from 'lucide-react'
import { format, subDays } from 'date-fns'

export const revalidate = 60

export default async function AdminAccountingPage() {
  const today = format(new Date(), 'yyyy-MM-dd')
  const start30 = format(subDays(new Date(), 29), 'yyyy-MM-dd')

  const [overview, { data: recentExpenses }, { data: recentPayouts }] = await Promise.all([
    getAccountingOverview(start30, today),
    getExpenses(start30, today, 1, 5),
    getPayouts(start30, today, 1, 5),
  ])

  const quickStats = [
    {
      label: 'Revenue (30d)',
      value: formatPrice(overview.totalRevenue),
      icon: TrendingUp,
      color: 'text-green-400',
      bg: 'bg-green-400/10 border-green-400/25',
    },
    {
      label: 'Expenses (30d)',
      value: formatPrice(overview.totalExpenses),
      icon: TrendingDown,
      color: 'text-red-400',
      bg: 'bg-red-400/10 border-red-400/25',
    },
    {
      label: 'Payouts (30d)',
      value: formatPrice(overview.totalPayouts),
      icon: Truck,
      color: 'text-orange-400',
      bg: 'bg-orange-400/10 border-orange-400/25',
    },
    {
      label: 'Cash Balance',
      value: formatPrice(overview.cashBalance),
      icon: Wallet,
      color: overview.cashBalance >= 0 ? 'text-brand-gold' : 'text-red-400',
      bg: overview.cashBalance >= 0 ? 'bg-brand-gold/10 border-brand-gold/25' : 'bg-red-400/10 border-red-400/25',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calculator className="w-6 h-6 text-brand-red" />
          <div>
            <h1 className="font-display text-3xl text-white tracking-wide">ACCOUNTING</h1>
            <p className="text-text-muted text-sm mt-0.5">Last 30 days · double-entry ready</p>
          </div>
        </div>
        <Link
          href="/admin/accounting/expenses/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-red text-white text-sm font-semibold rounded-xl hover:bg-brand-red-light transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Expense
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-surface-card border border-surface-border rounded-xl p-5">
            <div className={`w-9 h-9 rounded-lg border flex items-center justify-center mb-3 ${bg}`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className="text-text-faint text-[10px] uppercase tracking-widest">{label}</p>
            <p className={`font-bold text-xl mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Module links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { href: '/admin/accounting/expenses', label: 'Expense Ledger', desc: `${overview.expenseCount} entries this month`, icon: Receipt, color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20' },
          { href: '/admin/accounting/payouts',  label: 'Payout Records', desc: `${overview.payoutCount} payouts this month`, icon: Truck,    color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/20' },
          { href: '/admin/accounting/journal',  label: 'Journal Entries', desc: 'Double-entry ledger',                       icon: Calculator, color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/20' },
        ].map(({ href, label, desc, icon: Icon, color, bg }) => (
          <Link
            key={href}
            href={href}
            className="group bg-surface-card border border-surface-border rounded-xl p-5 hover:border-brand-red/40 hover:bg-surface-elevated/50 transition-all duration-200 flex items-center gap-4"
          >
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${bg}`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-text-primary text-sm group-hover:text-white transition-colors">{label}</p>
              <p className="text-text-faint text-xs mt-0.5">{desc}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-text-faint group-hover:text-brand-red transition-colors shrink-0" />
          </Link>
        ))}
      </div>

      {/* Recent activity row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent expenses */}
        <div className="bg-surface-card border border-surface-border rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-border flex items-center justify-between">
            <h2 className="font-semibold text-text-primary">Recent Expenses</h2>
            <Link href="/admin/accounting/expenses" className="text-xs text-brand-red hover:underline">View all</Link>
          </div>
          {recentExpenses.length === 0 ? (
            <p className="text-text-faint text-sm text-center py-8">No expenses recorded</p>
          ) : (
            <div className="divide-y divide-surface-border">
              {recentExpenses.map((exp) => (
                <div key={exp.id} className="flex items-center justify-between px-6 py-3">
                  <div>
                    <p className="text-text-primary text-sm font-medium">{exp.description}</p>
                    <p className="text-text-faint text-xs">{exp.category.replace(/_/g, ' ')} · {exp.expense_date}</p>
                  </div>
                  <span className="text-red-400 font-semibold text-sm">{formatPrice(exp.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent payouts */}
        <div className="bg-surface-card border border-surface-border rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-border flex items-center justify-between">
            <h2 className="font-semibold text-text-primary">Recent Payouts</h2>
            <Link href="/admin/accounting/payouts" className="text-xs text-brand-red hover:underline">View all</Link>
          </div>
          {recentPayouts.length === 0 ? (
            <p className="text-text-faint text-sm text-center py-8">No payouts recorded</p>
          ) : (
            <div className="divide-y divide-surface-border">
              {recentPayouts.map((p) => (
                <div key={p.id} className="flex items-center justify-between px-6 py-3">
                  <div>
                    <p className="text-text-primary text-sm font-medium">{p.recipient}</p>
                    <p className="text-text-faint text-xs">{p.recipient_type} · {p.payout_date}</p>
                  </div>
                  <span className="text-orange-400 font-semibold text-sm">{formatPrice(p.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
