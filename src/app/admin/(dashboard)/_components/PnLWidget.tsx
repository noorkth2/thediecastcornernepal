'use client'

import type { PnLStatement } from '@/lib/types/analytics'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface Props { pnl: PnLStatement }

function Row({
  label, value, sub, color = 'text-text-primary', bold = false, indent = false, separator = false,
}: {
  label: string; value: string; sub?: string
  color?: string; bold?: boolean; indent?: boolean; separator?: boolean
}) {
  return (
    <>
      {separator && <div className="border-t border-surface-border my-1" />}
      <div className={`flex items-center justify-between py-2.5 ${indent ? 'pl-4' : ''}`}>
        <span className={`text-sm ${bold ? 'font-semibold text-text-primary' : 'text-text-muted'}`}>{label}</span>
        <div className="text-right">
          <span className={`text-sm font-semibold ${color}`}>{value}</span>
          {sub && <p className="text-[10px] text-text-faint">{sub}</p>}
        </div>
      </div>
    </>
  )
}

export function PnLWidget({ pnl }: Props) {
  const fmt = (n: number) => `Rs. ${Math.abs(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
  const isProfit = pnl.netProfit >= 0

  return (
    <div className="bg-surface-card border border-surface-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-surface-border flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-text-primary">Profit &amp; Loss Statement</h2>
          <p className="text-text-faint text-xs mt-0.5">{pnl.period}</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold ${isProfit ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
          {isProfit ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {isProfit ? 'Profitable' : 'Loss'}
        </div>
      </div>

      <div className="px-6 py-2">
        {/* Revenue section */}
        <p className="text-[10px] font-bold text-text-faint uppercase tracking-widest pt-3 pb-1">Revenue</p>
        <Row label="Gross Sales Revenue"  value={fmt(pnl.grossRevenue)}    bold />
        <Row label="+ Shipping Collected" value={fmt(pnl.shippingRevenue)} indent />
        <Row label="− Discounts Given"    value={`−${fmt(pnl.discounts)}`} indent color="text-red-400" />
        <Row label="Net Revenue"          value={fmt(pnl.netRevenue)}      bold separator />

        {/* Cost section */}
        <p className="text-[10px] font-bold text-text-faint uppercase tracking-widest pt-3 pb-1">Cost of Goods</p>
        <Row label="COGS (cost price × units)"  value={fmt(pnl.cogs)}        indent color="text-orange-400" />
        <Row label="Gross Profit"               value={fmt(pnl.grossProfit)} bold separator
             color={pnl.grossProfit >= 0 ? 'text-green-400' : 'text-red-400'}
             sub={`${pnl.grossMarginPct}% margin${pnl.cogs === 0 ? ' (cost price not set)' : ''}`} />

        {/* Expenses */}
        <p className="text-[10px] font-bold text-text-faint uppercase tracking-widest pt-3 pb-1">Operating Expenses</p>
        {pnl.expenseBreakdown.length === 0
          ? <Row label="No expenses recorded" value="—" indent />
          : pnl.expenseBreakdown.map((e) => (
              <Row key={e.category} label={e.label} value={fmt(e.amount)} indent />
            ))
        }
        <Row label="Total Expenses" value={fmt(pnl.totalExpenses)} bold separator color="text-red-400" />

        {/* Bottom line */}
        <p className="text-[10px] font-bold text-text-faint uppercase tracking-widest pt-3 pb-1">Net</p>
        <Row label="Operating Profit"  value={fmt(pnl.operatingProfit)} bold color={pnl.operatingProfit >= 0 ? 'text-green-400' : 'text-red-400'} />
        <Row label="Est. Tax (13% VAT)" value={`−${fmt(pnl.taxAmount)}`} indent color="text-orange-400" />
        <Row
          label="Net Profit"
          value={`${isProfit ? '' : '−'}${fmt(pnl.netProfit)}`}
          bold separator
          color={isProfit ? 'text-green-400' : 'text-red-400'}
          sub={`${pnl.netMarginPct}% net margin`}
        />
      </div>

      {/* Net profit banner */}
      <div className={`mx-6 mb-6 mt-2 rounded-xl p-4 flex items-center justify-between ${isProfit ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
        <span className="text-sm font-semibold text-text-muted">NET {isProfit ? 'PROFIT' : 'LOSS'}</span>
        <span className={`text-2xl font-bold ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
          {isProfit ? '' : '−'}{fmt(pnl.netProfit)}
        </span>
      </div>
    </div>
  )
}
