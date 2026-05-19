'use client'

import { useState } from 'react'
import type { Product } from '@/lib/types'
import type { ProductVariant } from '@/lib/types/variant'
import type { PreorderConfig } from '@/lib/types/preorder'
import { ProductVariantSelector } from './ProductVariantSelector'
import { AddToCartDetailButton } from './AddToCartDetailButton'
import { PreorderButton } from './PreorderButton'

interface ProductClientActionsProps {
  product: Product
  variants: ProductVariant[]
  preorderConfigs: PreorderConfig[]
}

export function ProductClientActions({ product, variants, preorderConfigs }: ProductClientActionsProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<number | undefined>(
    variants.length > 0 ? variants[0].id : undefined
  )

  const selectedVariant = selectedVariantId 
    ? variants.find(v => v.id === selectedVariantId) 
    : null

  // Check if there is an active preorder config for the selected variant (or base product if no variants)
  const activePreorderConfig = preorderConfigs.find(c => 
    c.variant_id === (selectedVariant ? selectedVariant.id : null)
  )

  return (
    <div>
      {variants.length > 0 && (
        <ProductVariantSelector
          variants={variants}
          selectedVariantId={selectedVariantId}
          onSelectVariant={setSelectedVariantId}
        />
      )}
      
      {activePreorderConfig ? (
        <PreorderButton 
          product={product} 
          selectedVariant={selectedVariant} 
          config={activePreorderConfig} 
        />
      ) : (
        <AddToCartDetailButton 
          product={product} 
          selectedVariant={selectedVariant} 
        />
      )}
    </div>
  )
}
