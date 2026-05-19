'use client'

import { useState } from 'react'
import { cn, formatPrice } from '@/lib/utils'
import type { ProductVariant } from '@/lib/types/variant'
import { Check } from 'lucide-react'

interface ProductVariantSelectorProps {
  variants: ProductVariant[]
  selectedVariantId?: number
  onSelectVariant: (variantId: number) => void
}

export function ProductVariantSelector({
  variants,
  selectedVariantId,
  onSelectVariant,
}: ProductVariantSelectorProps) {
  if (!variants || variants.length === 0) return null

  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-text-primary mb-3">Select Edition / Variant</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {variants.map((variant) => {
          const isSelected = selectedVariantId === variant.id
          const isOutOfStock = variant.stock_qty <= 0

          return (
            <button
              key={variant.id}
              onClick={() => {
                if (!isOutOfStock) {
                  onSelectVariant(variant.id)
                }
              }}
              disabled={isOutOfStock}
              className={cn(
                'relative flex flex-col p-3 rounded-xl border text-left transition-all duration-200',
                isSelected
                  ? 'border-brand-red bg-brand-red/10'
                  : isOutOfStock
                  ? 'border-surface-border bg-surface-base opacity-50 cursor-not-allowed'
                  : 'border-surface-border bg-surface-elevated hover:border-text-muted cursor-pointer'
              )}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={cn('text-sm font-semibold', isSelected ? 'text-brand-red' : 'text-text-primary')}>
                  {variant.label}
                </span>
                {isSelected && (
                  <Check className="w-4 h-4 text-brand-red flex-shrink-0 ml-2" />
                )}
              </div>

              <div className="flex flex-wrap gap-1 mb-2 text-[10px] uppercase font-bold">
                {variant.rarity && (
                  <span className={cn('px-1.5 py-0.5 rounded', variant.rarity.includes('chase') ? 'bg-brand-gold text-black' : 'bg-surface-border text-text-muted')}>
                    {variant.rarity}
                  </span>
                )}
                {variant.condition && (
                  <span className="bg-surface-border text-text-muted px-1.5 py-0.5 rounded">
                    {variant.condition.replace('-', ' ')}
                  </span>
                )}
              </div>

              <div className="mt-auto flex justify-between items-end w-full">
                <span className="text-sm font-bold text-brand-gold">
                  {variant.price_override ? formatPrice(variant.price_override) : 'Standard Price'}
                </span>
                <span className={cn("text-[10px] font-medium", isOutOfStock ? "text-red-400" : "text-green-400")}>
                  {isOutOfStock ? 'Out of Stock' : `${variant.stock_qty} available`}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
