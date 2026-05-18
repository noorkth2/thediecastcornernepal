'use client'

import { useState } from 'react'
import type { ProductRevenueSummary } from '@/lib/types/analytics'
import { TrendingUp, TrendingDown, ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  products: ProductRevenueSummary[]
}

type SortKey = 'unitsSold' | 'grossRevenue' | 'grossProfit' | 'grossMarginPct'

export function TopProductsTable({ products }: Props) {
  const [sortKey, setSortKey]   = useState<SortKey>('grossRevenue')
  const [sortAsc, setSortAsc]   = useState(false)
  const [search, setSearch]     = useState('')

  const filtered = products
    .filter((p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.brand ?? '').toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const diff = a[sortKey] - b[sortKey]
      return sortAsc ? diff : -diff
    })

  const maxRevenue = Math.max(...products.map((p) => p.grossRevenue), 1)

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc((v) => !v)
    else { setSortKey(key); setSortAsc(false) }
  }

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ChevronUp className="w-3 h-3 opacity-25" />
    return sortAsc
      ? <ChevronUp className="w-3 h-3 text-brand-gold" />
      : <ChevronDown className="w-3 h-3 text-brand-gold" />
  }

  return (
    <div className="bg-surface-card border border-surface-border rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-surface-border flex items-center justify-between gap-4 flex-wrap">
        <h2 className="font-semibold text-text-primary">Top Products</h2>
        <input
          type="text"
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-surface-elevated border border-surface-border rounded-lg px-3 py-1.5 text-sm text-text-primary placeholder:text-text-faint focus:outline-none focus:border-brand-red w-52"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-text-faint text-sm text-center py-12">No sales data yet</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border bg-surface-elevated/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-widest">#</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-widest">Product</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-widest">Category</th>
                {([ ['unitsSold', 'Units'], ['grossRevenue', 'Revenue'], ['grossProfit', 'Profit'], ['grossMarginPct', 'Margin'] ] as [SortKey, string][]).map(([k, label]) => (
                  <th
                    key={k}
                    className="text-right px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-widest cursor-pointer select-none hover:text-text-primary transition-colors whitespace-nowrap"
                    onClick={() => toggleSort(k)}
                  >
                    <span className="inline-flex items-center gap-1 justify-end">
                      {label} <SortIcon k={k} />
                    </span>
                  </th>
                ))}
                <th className="px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-widest w-32">Rev Bar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {filtered.slice(0, 20).map((p, i) => (
                <tr key={p.productId} className="hover:bg-surface-elevated/30 transition-colors">
                  <td className="px-4 py-3 text-text-faint font-mono text-xs">{i + 1}</td>
                  <td className="px-4 py-3">
                    <p className="text-text-primary font-medium max-w-[200px] truncate">{p.title}</p>
                    <p className="text-text-faint text-xs">{p.brand ?? '—'}</p>
                  </td>
                  <td className="px-4 py-3 text-text-muted text-xs">{p.categoryName ?? '—'}</td>
                  <td className="px-4 py-3 text-right font-semibold text-text-primary">{p.unitsSold}</td>
                  <td className="px-4 py-3 text-right font-semibold text-brand-gold">
                    Rs. {p.grossRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </td>
                  <td className={cn('px-4 py-3 text-right font-semibold', p.grossProfit >= 0 ? 'text-green-400' : 'text-red-400')}>
                    <span className="flex items-center justify-end gap-1">
                      {p.grossProfit >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      Rs. {Math.abs(p.grossProfit).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </span>
                  </td>
                  <td className={cn('px-4 py-3 text-right font-semibold text-xs', p.grossMarginPct >= 30 ? 'text-green-400' : p.grossMarginPct >= 10 ? 'text-orange-400' : 'text-red-400')}>
                    {p.cogs === 0 ? '—' : `${p.grossMarginPct}%`}
                  </td>
                  {/* Mini revenue bar */}
                  <td className="px-4 py-3">
                    <div className="h-2 bg-surface-elevated rounded-full overflow-hidden w-full">
                      <div
                        className="h-full bg-gradient-to-r from-brand-red to-brand-gold rounded-full transition-all duration-700"
                        style={{ width: `${Math.round((p.grossRevenue / maxRevenue) * 100)}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
