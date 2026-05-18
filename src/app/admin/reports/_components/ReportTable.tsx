'use client'

import { useState } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ReportType } from '@/lib/types/analytics'

interface Column {
  key: string
  label: string
  align?: 'right'
  format?: string
}

interface Props {
  data: Record<string, unknown>[]
  columns: Column[]
  reportType: ReportType
}

const STATUS_COLORS: Record<string, string> = {
  pending:    'bg-yellow-400/15 text-yellow-400',
  confirmed:  'bg-blue-400/15 text-blue-400',
  processing: 'bg-purple-400/15 text-purple-400',
  shipped:    'bg-orange-400/15 text-orange-400',
  delivered:  'bg-green-400/15 text-green-400',
  cancelled:  'bg-red-400/15 text-red-400',
  refunded:   'bg-pink-400/15 text-pink-400',
  paid:       'bg-green-400/15 text-green-400',
  unpaid:     'bg-yellow-400/15 text-yellow-400',
  cod:        'bg-brand-gold/15 text-brand-gold',
  khalti:     'bg-purple-400/15 text-purple-400',
  esewa:      'bg-green-400/15 text-green-400',
  admin:      'bg-brand-red/15 text-brand-red',
  customer:   'bg-blue-400/15 text-blue-400',
  supplier:   'bg-slate-400/15 text-slate-400',
  logistics:  'bg-cyan-400/15 text-cyan-400',
}

function formatCell(value: unknown, format?: string): React.ReactNode {
  if (value === null || value === undefined || value === '') return <span className="text-text-faint">—</span>

  switch (format) {
    case 'currency':
      return (
        <span className="font-semibold text-brand-gold tabular-nums">
          Rs. {Number(value).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
        </span>
      )
    case 'percent':
      return <span className="tabular-nums">{String(value)}%</span>
    case 'date':
      return (
        <span className="text-text-muted tabular-nums text-xs">
          {new Date(String(value)).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </span>
      )
    case 'badge': {
      const str = String(value).toLowerCase().replace(/_/g, ' ')
      const cls = STATUS_COLORS[String(value).toLowerCase()] ?? 'bg-surface-elevated text-text-muted'
      return (
        <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap', cls)}>
          {str}
        </span>
      )
    }
    default:
      return <span className="text-text-primary">{String(value)}</span>
  }
}

export function ReportTable({ data, columns, reportType }: Props) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortAsc, setSortAsc] = useState(false)
  const [search, setSearch]   = useState('')
  const [page, setPage]       = useState(1)
  const PAGE_SIZE = 50

  const filtered = data.filter((row) => {
    if (!search) return true
    return Object.values(row).some((v) =>
      String(v ?? '').toLowerCase().includes(search.toLowerCase())
    )
  })

  const sorted = sortKey
    ? [...filtered].sort((a, b) => {
        const av = a[sortKey] ?? ''
        const bv = b[sortKey] ?? ''
        const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true })
        return sortAsc ? cmp : -cmp
      })
    : filtered

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE)
  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function toggleSort(key: string) {
    if (sortKey === key) setSortAsc((v) => !v)
    else { setSortKey(key); setSortAsc(false) }
    setPage(1)
  }

  if (data.length === 0) {
    return (
      <div className="bg-surface-card border border-surface-border rounded-xl p-12 text-center">
        <p className="text-text-faint text-sm">No data found for the selected filters</p>
      </div>
    )
  }

  return (
    <div className="bg-surface-card border border-surface-border rounded-xl overflow-hidden">
      {/* Table toolbar */}
      <div className="px-4 py-3 border-b border-surface-border flex items-center justify-between gap-4">
        <p className="text-text-faint text-xs">{filtered.length} rows</p>
        <input
          type="text"
          placeholder="Search results…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="bg-surface-elevated border border-surface-border rounded-lg px-3 py-1.5 text-sm text-text-primary placeholder:text-text-faint focus:outline-none focus:border-brand-red w-48"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm print:text-xs">
          <thead>
            <tr className="border-b border-surface-border bg-surface-elevated/60">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => toggleSort(col.key)}
                  className={cn(
                    'px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-widest whitespace-nowrap cursor-pointer select-none hover:text-text-primary transition-colors',
                    col.align === 'right' ? 'text-right' : 'text-left'
                  )}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {sortKey === col.key
                      ? sortAsc ? <ChevronUp className="w-3 h-3 text-brand-gold" /> : <ChevronDown className="w-3 h-3 text-brand-gold" />
                      : <ChevronUp className="w-3 h-3 opacity-20" />
                    }
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border/50">
            {paged.map((row, i) => (
              <tr key={i} className="hover:bg-surface-elevated/30 transition-colors">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn('px-4 py-3', col.align === 'right' ? 'text-right' : 'text-left')}
                  >
                    {formatCell(row[col.key], col.format)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-surface-border flex items-center justify-between">
          <p className="text-text-faint text-xs">
            Page {page} of {totalPages} · {sorted.length} total rows
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-xs bg-surface-elevated border border-surface-border rounded-lg text-text-muted hover:text-white disabled:opacity-40 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-xs bg-surface-elevated border border-surface-border rounded-lg text-text-muted hover:text-white disabled:opacity-40 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
