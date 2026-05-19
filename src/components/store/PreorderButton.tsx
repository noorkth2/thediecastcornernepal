'use client'

import { useState } from 'react'
import type { Product } from '@/lib/types'
import type { ProductVariant } from '@/lib/types/variant'
import type { PreorderConfig } from '@/lib/types/preorder'
import { formatPrice } from '@/lib/utils'
import { Clock } from 'lucide-react'
import { PreorderModal } from './PreorderModal'

interface PreorderButtonProps {
  product: Product
  selectedVariant?: ProductVariant | null
  config: PreorderConfig
}

export function PreorderButton({ product, selectedVariant, config }: PreorderButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const activePrice = selectedVariant?.price_override ?? product.price
  const isClosed = config.closes_at && new Date(config.closes_at) < new Date()
  const isSoldOut = config.max_qty !== null && config.reserved_qty >= config.max_qty

  if (isClosed || isSoldOut) {
    return (
      <button
        disabled
        className="w-full py-3.5 rounded-xl bg-surface-elevated text-text-faint font-semibold cursor-not-allowed flex flex-col items-center justify-center gap-1"
      >
        <span>{isClosed ? 'Pre-Order Closed' : 'Pre-Order Sold Out'}</span>
      </button>
    )
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full py-3.5 rounded-xl bg-brand-gold hover:bg-yellow-400 text-black font-semibold transition-colors shadow-lg shadow-brand-gold/20 active:scale-[0.98] flex flex-col items-center justify-center gap-1"
      >
        <span className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Pre-Order Now
        </span>
        <span className="text-xs font-medium opacity-80">
          {config.deposit_amount 
            ? `Deposit: ${formatPrice(config.deposit_amount)}` 
            : `Total: ${formatPrice(activePrice)}`}
        </span>
      </button>

      <PreorderModal
        product={product}
        selectedVariant={selectedVariant}
        config={config}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        activePrice={activePrice}
      />
    </>
  )
}
