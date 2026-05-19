'use client'

import { ProductCard } from './ProductCard'
import type { Product } from '@/lib/types'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRef } from 'react'

interface RecommendationRailProps {
  products: Product[]
  title: string
  subtitle?: string
}

export function RecommendationRail({ products, title, subtitle }: RecommendationRailProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current
      const scrollTo =
        direction === 'left' ? scrollLeft - clientWidth * 0.75 : scrollLeft + clientWidth * 0.75
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' })
    }
  }

  if (!products || products.length === 0) return null

  return (
    <div className="space-y-4 relative group/rail">
      {/* Title Header */}
      <div className="flex items-end justify-between px-1">
        <div>
          <h2 className="font-display text-xl text-white tracking-wide uppercase">
            {title}
          </h2>
          {subtitle && (
            <p className="text-text-muted text-xs mt-1">
              {subtitle}
            </p>
          )}
        </div>

        {/* Scroll Controls */}
        <div className="flex gap-1.5 opacity-0 group-hover/rail:opacity-100 transition-opacity duration-300">
          <button
            onClick={() => scroll('left')}
            className="p-1.5 rounded-lg bg-surface-card border border-surface-border text-text-muted hover:text-white hover:border-brand-red transition-all"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-1.5 rounded-lg bg-surface-card border border-surface-border text-text-muted hover:text-white hover:border-brand-red transition-all"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Rail Container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-none pb-4 scroll-smooth -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 snap-x snap-mandatory"
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="w-[200px] sm:w-[220px] md:w-[240px] flex-shrink-0 snap-start"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  )
}
