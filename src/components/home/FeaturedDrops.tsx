import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { ProductCard } from '@/components/store/ProductCard'
import type { Product } from '@/lib/types'

interface FeaturedDropsProps {
  products: Product[]
}

export function FeaturedDrops({ products }: FeaturedDropsProps) {
  if (!products.length) return null

  return (
    <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Heading */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-px w-8 bg-brand-red" />
            <span className="text-brand-red text-xs font-semibold tracking-widest uppercase">
              Hand-Picked
            </span>
          </div>
          <h2 className="font-display text-4xl text-white tracking-wide">
            FEATURED DROPS
          </h2>
        </div>
        <Link
          href="/shop"
          className="hidden sm:flex items-center gap-1.5 text-sm text-text-muted hover:text-white transition-colors group"
          id="featured-view-all"
        >
          View All
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <div className="sm:hidden mt-6 text-center">
        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-white transition-colors"
        >
          View All Products <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  )
}
