'use client'

import type { InventorySnapshot, LowStockProduct } from '@/lib/types/analytics'
import { Package, AlertTriangle, XCircle, TrendingDown } from 'lucide-react'

interface Props {
  snapshot: InventorySnapshot
  lowStock: LowStockProduct[]
}

export function InventorySnapshot({ snapshot, lowStock }: Props) {
  const cards = [
    {
      label: 'Total Products',
      value: snapshot.totalProducts,
      icon: Package,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10 border-blue-400/25',
    },
    {
      label: 'Total Stock Units',
      value: snapshot.totalStockUnits.toLocaleString('en-IN'),
      icon: Package,
      color: 'text-brand-gold',
      bg: 'bg-brand-gold/10 border-brand-gold/25',
    },
    {
      label: 'Stock Valuation (Cost)',
      value: `Rs. ${snapshot.totalStockValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
      icon: TrendingDown,
      color: 'text-purple-400',
      bg: 'bg-purple-400/10 border-purple-400/25',
    },
    {
      label: 'Low Stock Items',
      value: snapshot.lowStockCount,
      icon: AlertTriangle,
      color: 'text-orange-400',
      bg: 'bg-orange-400/10 border-orange-400/25',
    },
    {
      label: 'Out of Stock',
      value: snapshot.outOfStockCount,
      icon: XCircle,
      color: 'text-red-400',
      bg: 'bg-red-400/10 border-red-400/25',
    },
  ]

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-surface-card border border-surface-border rounded-xl p-5">
            <div className={`w-9 h-9 rounded-lg border flex items-center justify-center mb-3 ${bg}`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className="text-text-faint text-[10px] uppercase tracking-widest">{label}</p>
            <p className={`font-bold text-xl mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Low stock table */}
      {lowStock.length > 0 && (
        <div className="bg-surface-card border border-orange-400/30 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-orange-400/20 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-400" />
            <h2 className="font-semibold text-text-primary">Low / Out of Stock Products</h2>
            <span className="ml-auto text-xs text-orange-400 font-semibold bg-orange-400/10 px-2 py-0.5 rounded-full">
              {lowStock.length} items
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border bg-surface-elevated/50">
                  {['Product', 'Category', 'Brand', 'Stock', 'Threshold', 'Stock Value', 'Status'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-widest whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {lowStock.map((p) => {
                  const isOut = p.stock_qty === 0
                  const stockValue = p.stock_qty * (p.cost_price ?? 0)
                  return (
                    <tr key={p.id} className="hover:bg-surface-elevated/30 transition-colors">
                      <td className="px-4 py-3 text-text-primary font-medium max-w-[180px] truncate">{p.title}</td>
                      <td className="px-4 py-3 text-text-muted text-xs">{p.category_name ?? '—'}</td>
                      <td className="px-4 py-3 text-text-muted">{p.brand ?? '—'}</td>
                      <td className={`px-4 py-3 font-bold ${isOut ? 'text-red-400' : 'text-orange-400'}`}>{p.stock_qty}</td>
                      <td className="px-4 py-3 text-text-muted">{p.reorder_threshold}</td>
                      <td className="px-4 py-3 text-text-muted text-xs">
                        {p.cost_price ? `Rs. ${stockValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${isOut ? 'bg-red-500/15 text-red-400' : 'bg-orange-500/15 text-orange-400'}`}>
                          {isOut ? 'Out of Stock' : 'Low Stock'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
