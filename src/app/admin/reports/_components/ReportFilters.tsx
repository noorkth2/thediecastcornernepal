'use client'

import { useState } from 'react'
import type { ReportFilters, ReportType } from '@/lib/types/analytics'
import { Search, Play, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  filters: ReportFilters
  onApply: (filters: ReportFilters) => void
  loading: boolean
  reportType: ReportType
}

const PAYMENT_METHODS = [
  { value: '', label: 'All Methods' },
  { value: 'cod', label: 'Cash on Delivery' },
  { value: 'khalti', label: 'Khalti' },
  { value: 'esewa', label: 'eSewa' },
]

// Reports that support payment filter
const HAS_PAYMENT_FILTER: ReportType[] = ['sales-daily', 'product-sales', 'refunds', 'payment-gateway', 'tax-summary', 'customer-purchase']
// Reports that support search
const HAS_SEARCH: ReportType[] = ['sales-daily', 'product-sales', 'inventory-valuation', 'customer-purchase', 'audit-log', 'fast-movers', 'dead-inventory']

export function ReportFiltersBar({ filters, onApply, loading, reportType }: Props) {
  const [local, setLocal] = useState<ReportFilters>(filters)

  const showPayment = HAS_PAYMENT_FILTER.includes(reportType)
  const showSearch  = HAS_SEARCH.includes(reportType)

  function apply() {
    onApply({ ...local, page: 1 })
  }

  return (
    <div className="bg-surface-card border border-surface-border rounded-xl p-4">
      <div className="flex flex-wrap items-end gap-3">
        {/* Date range */}
        <div className="flex-1 min-w-[140px]">
          <label className="text-[10px] text-text-faint uppercase tracking-widest block mb-1.5">Start Date</label>
          <input
            type="date"
            value={local.startDate}
            onChange={(e) => setLocal((f) => ({ ...f, startDate: e.target.value }))}
            className="w-full bg-surface-elevated border border-surface-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brand-red"
          />
        </div>
        <div className="flex-1 min-w-[140px]">
          <label className="text-[10px] text-text-faint uppercase tracking-widest block mb-1.5">End Date</label>
          <input
            type="date"
            value={local.endDate}
            onChange={(e) => setLocal((f) => ({ ...f, endDate: e.target.value }))}
            className="w-full bg-surface-elevated border border-surface-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brand-red"
          />
        </div>

        {/* Payment filter */}
        {showPayment && (
          <div className="flex-1 min-w-[160px]">
            <label className="text-[10px] text-text-faint uppercase tracking-widest block mb-1.5">Payment Method</label>
            <select
              value={local.paymentMethod ?? ''}
              onChange={(e) => setLocal((f) => ({ ...f, paymentMethod: e.target.value || undefined }))}
              className="w-full bg-surface-elevated border border-surface-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brand-red"
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
        )}

        {/* Search */}
        {showSearch && (
          <div className="flex-1 min-w-[180px]">
            <label className="text-[10px] text-text-faint uppercase tracking-widest block mb-1.5">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-faint" />
              <input
                type="text"
                placeholder="Filter results…"
                value={local.search ?? ''}
                onChange={(e) => setLocal((f) => ({ ...f, search: e.target.value || undefined }))}
                className="w-full bg-surface-elevated border border-surface-border rounded-lg pl-8 pr-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brand-red"
              />
            </div>
          </div>
        )}

        {/* Run button */}
        <button
          onClick={apply}
          disabled={loading}
          className={cn(
            'flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200',
            'bg-brand-red text-white hover:bg-brand-red-light disabled:opacity-50 disabled:cursor-not-allowed',
            'min-w-[100px] justify-center'
          )}
        >
          {loading
            ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Running…</>
            : <><Play className="w-3.5 h-3.5" /> Run</>
          }
        </button>
      </div>
    </div>
  )
}
