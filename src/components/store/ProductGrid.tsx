'use client'

import { ProductCard } from './ProductCard'
import { ProductCardSkeleton } from '@/components/ui/skeleton'
import type { Product } from '@/lib/types'

interface ProductGridProps {
  initialProducts: Product[]
  loading?: boolean
  emptyMessage?: string
}

export function ProductGrid({
  initialProducts: products,
  loading = false,
  emptyMessage = 'No products found.',
}: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(12)].map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (!products.length) {
    return (
      <div className="text-center py-24">
        <p className="text-4xl mb-4">🚗</p>
        <p className="text-text-muted">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
