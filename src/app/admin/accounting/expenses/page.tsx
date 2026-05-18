import { getExpenses } from '@/lib/supabase/queries/accounting'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import { ArrowLeft, Plus, Receipt } from 'lucide-react'
import { EXPENSE_CATEGORY_LABELS } from '@/lib/types/accounting'
import type { ExpenseCategory } from '@/lib/types/accounting'

export const revalidate = 30

export default async function ExpensesPage() {
  const { data: expenses, count } = await getExpenses(undefined, undefined, 1, 50)

  const totalAmount = expenses.reduce((s, e) => s + e.amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/accounting" className="text-text-faint hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-display text-2xl text-white tracking-wide">EXPENSE LEDGER</h1>
            <p className="text-text-muted text-sm mt-0.5">{count} entries · {formatPrice(totalAmount)} total</p>
          </div>
        </div>
        <Link
          href="/admin/accounting/expenses/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-red text-white text-sm font-semibold rounded-xl hover:bg-brand-red-light transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Expense
        </Link>
      </div>

      <div className="bg-surface-card border border-surface-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border bg-surface-elevated/50">
                {['Date', 'Category', 'Description', 'Vendor', 'Amount', 'Recurring'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-widest whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-text-faint text-sm">No expenses recorded yet</td>
                </tr>
              ) : (
                expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-surface-elevated/30 transition-colors">
                    <td className="px-4 py-3 text-text-muted text-xs tabular-nums">{exp.expense_date}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-surface-elevated text-text-muted uppercase tracking-wide">
                        {EXPENSE_CATEGORY_LABELS[exp.category as ExpenseCategory] ?? exp.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-primary max-w-[200px] truncate">{exp.description}</td>
                    <td className="px-4 py-3 text-text-muted">{exp.vendor ?? '—'}</td>
                    <td className="px-4 py-3 text-right font-semibold text-red-400">{formatPrice(exp.amount)}</td>
                    <td className="px-4 py-3 text-center">
                      {exp.is_recurring
                        ? <span className="text-xs text-brand-gold font-semibold">Yes</span>
                        : <span className="text-text-faint text-xs">—</span>
                      }
                    </td>
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
