'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SlidersHorizontal, X, ChevronDown, Check } from 'lucide-react'
import type { Category } from '@/lib/types'
import type { Brand } from '@/lib/types/brand'

interface ShopFiltersProps {
  categories: Category[]
  brands: Brand[]
  currentFilters: {
    category?: string
    brand?: string
    min?: string
    max?: string
    sort?: string
    q?: string
  }
}

export function ShopFilters({ categories, brands, currentFilters }: ShopFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [sortOpen, setSortOpen] = useState(false)
  const [brandOpen, setBrandOpen] = useState(false)
  const sortRef = useRef<HTMLDivElement>(null)
  const brandRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setSortOpen(false)
      }
      if (brandRef.current && !brandRef.current.contains(event.target as Node)) {
        setBrandOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
      <div className="relative" ref={sortRef}>
        <label className="block text-xs font-semibold text-text-muted uppercase tracking-widest mb-2">
          Sort By
        </label>
        <button
          type="button"
          onClick={() => setSortOpen(!sortOpen)}
          className="input-base text-sm flex items-center justify-between gap-2 cursor-pointer hover:bg-surface-elevated/80 transition-colors"
          id="sort-select"
        >
          <span>
            {currentFilters.sort === 'price_asc' && 'Price: Low to High'}
            {currentFilters.sort === 'price_desc' && 'Price: High to Low'}
            {currentFilters.sort === 'name_asc' && 'Name: A to Z'}
            {(!currentFilters.sort || currentFilters.sort === 'newest') && 'Newest First'}
          </span>
          <ChevronDown className={`w-4 h-4 text-text-muted transition-transform duration-200 ${sortOpen ? 'rotate-180' : ''}`} />
        </button>

        {sortOpen && (
          <div className="absolute left-0 right-0 mt-2 bg-surface-card/95 backdrop-blur-md border border-surface-border rounded-xl shadow-2xl overflow-hidden z-30 animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="p-1.5 space-y-1">
              {[
                { value: 'newest', label: 'Newest First' },
                { value: 'price_asc', label: 'Price: Low to High' },
                { value: 'price_desc', label: 'Price: High to Low' },
                { value: 'name_asc', label: 'Name: A to Z' },
              ].map((opt) => {
                const isSelected = (currentFilters.sort ?? 'newest') === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      updateFilter('sort', opt.value)
                      setSortOpen(false)
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-brand-red/10 text-white font-semibold border border-brand-red/20'
                        : 'text-text-muted hover:bg-surface-elevated hover:text-white'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-brand-red" />}
                  </button>
                )
              })}
            </div>
          </div>
        )}
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
      <div className="relative" ref={brandRef}>
        <label className="block text-xs font-semibold text-text-muted uppercase tracking-widest mb-2">
          Brand
        </label>
        <button
          type="button"
          onClick={() => setBrandOpen(!brandOpen)}
          className="input-base text-sm flex items-center justify-between gap-2 cursor-pointer hover:bg-surface-elevated/80 transition-colors"
          id="brand-select"
        >
          <span>
            {currentFilters.brand || 'All Brands'}
          </span>
          <ChevronDown className={`w-4 h-4 text-text-muted transition-transform duration-200 ${brandOpen ? 'rotate-180' : ''}`} />
        </button>

        {brandOpen && (
          <div className="absolute left-0 right-0 mt-2 bg-surface-card/95 backdrop-blur-md border border-surface-border rounded-xl shadow-2xl overflow-hidden z-30 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="p-1.5 space-y-1">
              <button
                type="button"
                onClick={() => {
                  updateFilter('brand', undefined)
                  setBrandOpen(false)
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                  !currentFilters.brand
                    ? 'bg-brand-red/10 text-white font-semibold border border-brand-red/20'
                    : 'text-text-muted hover:bg-surface-elevated hover:text-white'
                }`}
              >
                <span>All Brands</span>
                {!currentFilters.brand && <Check className="w-3.5 h-3.5 text-brand-red" />}
              </button>

              {brands.map((b) => {
                const isSelected = currentFilters.brand === b.name
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => {
                      updateFilter('brand', b.name)
                      setBrandOpen(false)
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-brand-red/10 text-white font-semibold border border-brand-red/20'
                        : 'text-text-muted hover:bg-surface-elevated hover:text-white'
                    }`}
                  >
                    <span>{b.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-brand-red" />}
                  </button>
                )
              })}
            </div>
          </div>
        )}
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
