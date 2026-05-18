'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createExpenseAction } from '../../actions'
import { EXPENSE_CATEGORY_LABELS } from '@/lib/types/accounting'
import type { ExpenseCategory, NewExpenseInput } from '@/lib/types/accounting'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

const CATEGORIES = Object.entries(EXPENSE_CATEGORY_LABELS) as [ExpenseCategory, string][]

export default function NewExpensePage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState<NewExpenseInput>({
    expense_date: format(new Date(), 'yyyy-MM-dd'),
    category: 'operations',
    amount: 0,
    description: '',
    vendor: '',
    receipt_url: '',
    is_recurring: false,
  })

  function set<K extends keyof NewExpenseInput>(key: K, value: NewExpenseInput[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!form.description.trim()) { setError('Description is required'); return }
    if (!form.amount || form.amount <= 0) { setError('Amount must be greater than 0'); return }

    startTransition(async () => {
      try {
        await createExpenseAction(form)
        router.push('/admin/accounting/expenses')
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save expense')
      }
    })
  }

  const inputClass = 'w-full bg-surface-elevated border border-surface-border rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-faint focus:outline-none focus:border-brand-red transition-colors'
  const labelClass = 'block text-xs font-semibold text-text-muted uppercase tracking-widest mb-2'

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/accounting/expenses" className="text-text-faint hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-display text-2xl text-white tracking-wide">ADD EXPENSE</h1>
          <p className="text-text-muted text-sm mt-0.5">Record an operational expense</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-surface-card border border-surface-border rounded-xl p-6 space-y-5">
        {/* Date + Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Expense Date</label>
            <input
              type="date"
              value={form.expense_date}
              onChange={(e) => set('expense_date', e.target.value)}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Category</label>
            <select
              value={form.category}
              onChange={(e) => set('category', e.target.value as ExpenseCategory)}
              className={inputClass}
              required
            >
              {CATEGORIES.map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className={labelClass}>Description <span className="text-brand-red">*</span></label>
          <input
            type="text"
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="e.g. Facebook Ads — May 2026"
            className={inputClass}
            required
          />
        </div>

        {/* Amount + Vendor */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Amount (NPR) <span className="text-brand-red">*</span></label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-faint text-sm font-semibold">Rs.</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.amount || ''}
                onChange={(e) => set('amount', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className={cn(inputClass, 'pl-10 tabular-nums')}
                required
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Vendor / Payee</label>
            <input
              type="text"
              value={form.vendor ?? ''}
              onChange={(e) => set('vendor', e.target.value)}
              placeholder="e.g. Facebook, NTC, Landlord"
              className={inputClass}
            />
          </div>
        </div>

        {/* Receipt URL */}
        <div>
          <label className={labelClass}>Receipt URL (optional)</label>
          <input
            type="url"
            value={form.receipt_url ?? ''}
            onChange={(e) => set('receipt_url', e.target.value)}
            placeholder="https://drive.google.com/…"
            className={inputClass}
          />
        </div>

        {/* Recurring toggle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={form.is_recurring}
            onClick={() => set('is_recurring', !form.is_recurring)}
            className={cn(
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200',
              form.is_recurring ? 'bg-brand-red' : 'bg-surface-elevated border border-surface-border'
            )}
          >
            <span className={cn(
              'inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200',
              form.is_recurring ? 'translate-x-6' : 'translate-x-1'
            )} />
          </button>
          <div>
            <p className="text-sm text-text-primary font-medium">Recurring Expense</p>
            <p className="text-text-faint text-xs">Mark if this repeats monthly (e.g. rent, subscription)</p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/admin/accounting/expenses"
            className="px-4 py-2.5 text-sm text-text-muted hover:text-white border border-surface-border rounded-xl hover:border-surface-elevated transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 px-6 py-2.5 bg-brand-red text-white text-sm font-semibold rounded-xl hover:bg-brand-red-light transition-colors disabled:opacity-50"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isPending ? 'Saving…' : 'Save Expense'}
          </button>
        </div>
      </form>
    </div>
  )
}
