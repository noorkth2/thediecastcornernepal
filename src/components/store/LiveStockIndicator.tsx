'use client'

import { Flame } from 'lucide-react'

interface LiveStockIndicatorProps {
  stockQty: number
  maxStock?: number
}

export function LiveStockIndicator({ stockQty, maxStock = 20 }: LiveStockIndicatorProps) {
  const percent = Math.min(Math.max((stockQty / maxStock) * 100, 0), 100)
  const isLowStock = stockQty > 0 && stockQty <= 5
  const isOutOfStock = stockQty === 0

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold">
        <span className="text-text-muted uppercase tracking-wider">Stock Status</span>
        <span
          className={`flex items-center gap-1 ${
            isOutOfStock
              ? 'text-brand-red'
              : isLowStock
              ? 'text-brand-orange animate-pulse font-bold'
              : 'text-green-400'
          }`}
        >
          {isLowStock && <Flame className="w-3.5 h-3.5 fill-current" />}
          {isOutOfStock ? 'Sold Out' : isLowStock ? `Only ${stockQty} Left!` : `${stockQty} In Stock`}
        </span>
      </div>

      <div className="w-full h-2.5 bg-surface-elevated border border-surface-border rounded-full overflow-hidden relative">
        <div
          className={`h-full transition-all duration-500 rounded-full ${
            isOutOfStock
              ? 'bg-transparent'
              : isLowStock
              ? 'bg-gradient-to-r from-brand-red to-brand-orange animate-pulse shadow-[0_0_8px_rgba(230,126,34,0.5)]'
              : 'bg-green-500'
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
