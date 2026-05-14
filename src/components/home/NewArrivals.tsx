import Link from 'next/link'
import { ArrowRight, Zap } from 'lucide-react'
import { ProductCard } from '@/components/store/ProductCard'
import type { Product } from '@/lib/types'

interface NewArrivalsProps {
  products: Product[]
}

export function NewArrivals({ products }: NewArrivalsProps) {
  if (!products.length) return null

  return (
    <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-brand-orange fill-brand-orange" />
            <span className="text-brand-orange text-xs font-semibold tracking-widest uppercase">
              Just Landed
            </span>
          </div>
          <h2 className="font-display text-4xl text-white tracking-wide">
            NEW ARRIVALS
          </h2>
        </div>
        <Link
          href="/new-arrivals"
          className="hidden sm:flex items-center gap-1.5 text-sm text-text-muted hover:text-white transition-colors group"
          id="new-arrivals-view-all"
        >
          View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
