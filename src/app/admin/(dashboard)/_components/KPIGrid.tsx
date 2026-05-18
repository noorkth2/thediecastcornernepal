'use client'

import type { KPISummary } from '@/lib/types/analytics'
import { TrendingUp, TrendingDown, ShoppingBag, DollarSign, Percent, Package } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  kpi: KPISummary
}

export function KPIGrid({ kpi }: Props) {
  const cards = [
    {
      label: 'Total Revenue',
      value: `Rs. ${kpi.totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
      growth: kpi.revenueGrowthPct,
      icon: DollarSign,
      color: 'text-brand-gold',
      bg: 'bg-brand-gold/10 border-brand-gold/25',
      glow: 'shadow-[0_0_20px_rgba(245,197,24,0.08)]',
    },
    {
      label: 'Total Orders',
      value: kpi.totalOrders,
      growth: kpi.ordersGrowthPct,
      icon: ShoppingBag,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10 border-blue-400/25',
      glow: 'shadow-[0_0_20px_rgba(96,165,250,0.08)]',
    },
    {
      label: 'Avg Order Value',
      value: `Rs. ${kpi.avgOrderValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
      growth: null,
      icon: TrendingUp,
      color: 'text-purple-400',
      bg: 'bg-purple-400/10 border-purple-400/25',
      glow: 'shadow-[0_0_20px_rgba(192,132,252,0.08)]',
    },
    {
      label: 'Gross Margin',
      value: `${kpi.grossMarginPct}%`,
      growth: null,
      icon: Percent,
      color: 'text-green-400',
      bg: 'bg-green-400/10 border-green-400/25',
      glow: 'shadow-[0_0_20px_rgba(74,222,128,0.08)]',
    },
    {
      label: 'Gross Profit',
      value: `Rs. ${kpi.grossProfit.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
      growth: null,
      icon: TrendingUp,
      color: kpi.grossProfit >= 0 ? 'text-emerald-400' : 'text-red-400',
      bg: kpi.grossProfit >= 0 ? 'bg-emerald-400/10 border-emerald-400/25' : 'bg-red-400/10 border-red-400/25',
      glow: 'shadow-[0_0_20px_rgba(52,211,153,0.08)]',
    },
    {
      label: 'Delivered',
      value: kpi.deliveredCount,
      growth: null,
      icon: Package,
      color: 'text-orange-400',
      bg: 'bg-orange-400/10 border-orange-400/25',
      glow: 'shadow-[0_0_20px_rgba(251,146,60,0.08)]',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map(({ label, value, growth, icon: Icon, color, bg, glow }) => (
        <div
          key={label}
          className={cn(
            'bg-surface-card rounded-xl border p-5 relative overflow-hidden group',
            'hover:scale-[1.02] transition-all duration-300',
            glow
          )}
        >
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />

          <div className={cn('w-9 h-9 rounded-lg border flex items-center justify-center mb-3', bg)}>
            <Icon className={cn('w-4 h-4', color)} />
          </div>

          <p className="text-text-faint text-[10px] uppercase tracking-widest leading-none">{label}</p>
          <p className={cn('font-bold text-xl mt-1.5 leading-tight', color)}>{value}</p>

          {growth !== null && (
            <div className={cn(
              'flex items-center gap-1 mt-2 text-xs font-medium',
              growth >= 0 ? 'text-green-400' : 'text-red-400'
            )}>
              {growth >= 0
                ? <TrendingUp className="w-3 h-3" />
                : <TrendingDown className="w-3 h-3" />
              }
              <span>{Math.abs(growth)}% vs prev</span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
