'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import { BRANDS, SCALES } from '@/lib/constants'
import type { Category } from '@/lib/types'

interface ShopFiltersProps {
  categories: Category[]
  currentFilters: {
    category?: string
    brand?: string
    min?: string
    max?: string
    sort?: string
    q?: string
  }
}

export function ShopFilters({ categories, currentFilters }: ShopFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilter = useCallback(
    (key: string, value: string | undefined) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      params.delete('page') // reset to page 1
      router.push(`/shop?${params.toString()}`)
    },
    [router, searchParams]
  )

  const clearAll = () => router.push('/shop')

  const hasFilters = Object.values(currentFilters).some(Boolean)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-text-primary font-semibold">
          <SlidersHorizontal className="w-4 h-4 text-brand-red" />
          Filters
        </div>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="text-xs text-text-muted hover:text-brand-red transition-colors flex items-center gap-1"
          >
            <X className="w-3 h-3" /> Clear all
          </button>
        )}
      </div>

      {/* Sort */}
      <div>
        <label className="block text-xs font-semibold text-text-muted uppercase tracking-widest mb-2">
          Sort By
        </label>
        <select
          value={currentFilters.sort ?? 'newest'}
          onChange={(e) => updateFilter('sort', e.target.value)}
          className="input-base text-sm"
          id="sort-select"
        >
          <option value="newest">Newest First</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="name_asc">Name: A to Z</option>
        </select>
      </div>

      {/* Category */}
      {categories.length > 0 && (
        <div>
          <label className="block text-xs font-semibold text-text-muted uppercase tracking-widest mb-2">
            Category
          </label>
          <div className="space-y-1.5">
            <button
              onClick={() => updateFilter('category', undefined)}
              className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                !currentFilters.category
                  ? 'bg-brand-red/10 text-brand-red-light border border-brand-red/30'
                  : 'text-text-muted hover:text-white hover:bg-surface-elevated'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => updateFilter('category', cat.slug)}
                className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                  currentFilters.category === cat.slug
                    ? 'bg-brand-red/10 text-brand-red-light border border-brand-red/30'
                    : 'text-text-muted hover:text-white hover:bg-surface-elevated'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Brand */}
      <div>
        <label className="block text-xs font-semibold text-text-muted uppercase tracking-widest mb-2">
          Brand
        </label>
        <select
          value={currentFilters.brand ?? ''}
          onChange={(e) => updateFilter('brand', e.target.value || undefined)}
          className="input-base text-sm"
          id="brand-select"
        >
          <option value="">All Brands</option>
          {BRANDS.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-xs font-semibold text-text-muted uppercase tracking-widest mb-2">
          Price Range (Rs.)
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={currentFilters.min ?? ''}
            onChange={(e) => updateFilter('min', e.target.value || undefined)}
            className="input-base text-sm w-full"
            min={0}
            id="price-min"
          />
          <input
            type="number"
            placeholder="Max"
            value={currentFilters.max ?? ''}
            onChange={(e) => updateFilter('max', e.target.value || undefined)}
            className="input-base text-sm w-full"
            min={0}
            id="price-max"
          />
        </div>
      </div>
    </div>
  )
}
