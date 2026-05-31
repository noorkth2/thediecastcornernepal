'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import Link from 'next/link'
import {
  Plus,
  Pencil,
  Eye,
  EyeOff,
  Search,
  Filter,
  ChevronDown,
  Check,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Package,
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { ProductBulkImport } from '@/components/admin/ProductBulkImport'

interface ProductsClientProps {
  initialProducts: any[]
}

const ITEMS_PER_PAGE = 15

export function ProductsClient({ initialProducts }: ProductsClientProps) {
  const [products] = useState<any[]>(initialProducts)
  const [search, setSearch] = useState('')
  
  // Custom dropdown states
  const [brandFilter, setBrandFilter] = useState('all')
  const [stockFilter, setStockFilter] = useState('all')
  const [isBrandOpen, setIsBrandOpen] = useState(false)
  const [isStockOpen, setIsStockOpen] = useState(false)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)

  const brandRef = useRef<HTMLDivElement>(null)
  const stockRef = useRef<HTMLDivElement>(null)

  // Click outside listener to close custom dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (brandRef.current && !brandRef.current.contains(event.target as Node)) {
        setIsBrandOpen(false)
      }
      if (stockRef.current && !stockRef.current.contains(event.target as Node)) {
        setIsStockOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Reset to page 1 whenever filters change
  useEffect(() => {
    if (currentPage !== 1) {
      const timer = setTimeout(() => setCurrentPage(1), 0)
      return () => clearTimeout(timer)
    }
  }, [search, brandFilter, stockFilter, currentPage])

  // Get unique brands dynamically from products list
  const uniqueBrands = useMemo(() => {
    const set = new Set<string>()
    products.forEach((p) => {
      if (p.brand) set.add(p.brand)
    })
    return Array.from(set).sort()
  }, [products])

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // 1. Search filter
      const matchSearch =
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        (p.brand && p.brand.toLowerCase().includes(search.toLowerCase())) ||
        (p.slug && p.slug.toLowerCase().includes(search.toLowerCase()))

      // 2. Brand filter
      const matchBrand = brandFilter === 'all' || p.brand === brandFilter

      // 3. Stock status filter
      let matchStock = true
      if (stockFilter === 'instock') {
        matchStock = p.stock_qty > 0
      } else if (stockFilter === 'lowstock') {
        matchStock = p.stock_qty > 0 && p.stock_qty <= 5
      } else if (stockFilter === 'outofstock') {
        matchStock = p.stock_qty === 0
      }

      return matchSearch && matchBrand && matchStock
    })
  }, [products, search, brandFilter, stockFilter])

  // Pagination calculation
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE)
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredProducts, currentPage])

  const hasActiveFilters = search !== '' || brandFilter !== 'all' || stockFilter !== 'all'

  const resetFilters = () => {
    setSearch('')
    setBrandFilter('all')
    setStockFilter('all')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-white tracking-wide uppercase">PRODUCTS</h1>
          <p className="text-text-muted text-sm mt-1">
            {filteredProducts.length === products.length
              ? `${products.length} total products`
              : `Found ${filteredProducts.length} of ${products.length} products`}
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <ProductBulkImport />
          <Link
            href="/admin/products/new"
            className="flex items-center justify-center gap-2 bg-brand-red hover:bg-brand-red-light text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-lg shadow-brand-red/20 w-full sm:w-auto shrink-0"
            id="admin-add-product-btn"
          >
            <Plus className="w-4 h-4" /> Add Product
          </Link>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 bg-surface-card border border-surface-border p-4 rounded-xl">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-faint" />
          <input
            type="text"
            placeholder="Search products by title, brand, or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-base pl-9 text-xs"
          />
        </div>

        {/* Filters and resets */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Brand Custom Dropdown */}
          <div className="relative" ref={brandRef}>
            <button
              type="button"
              onClick={() => setIsBrandOpen(!isBrandOpen)}
              className="input-base bg-surface-elevated text-xs flex items-center justify-between gap-2 min-w-[150px] cursor-pointer hover:bg-surface-elevated/80 transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-text-faint" />
                <span>{brandFilter === 'all' ? 'All Brands' : brandFilter}</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-text-muted transition-transform duration-200 ${isBrandOpen ? 'rotate-180' : ''}`} />
            </button>

            {isBrandOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-surface-card/95 backdrop-blur-md border border-surface-border rounded-xl shadow-2xl overflow-hidden z-30 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="p-1.5 space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setBrandFilter('all')
                      setIsBrandOpen(false)
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                      brandFilter === 'all'
                        ? 'bg-brand-red/10 text-white font-semibold border border-brand-red/20'
                        : 'text-text-muted hover:bg-surface-elevated hover:text-white'
                    }`}
                  >
                    <span>All Brands</span>
                    {brandFilter === 'all' && <Check className="w-3.5 h-3.5 text-brand-red" />}
                  </button>

                  {uniqueBrands.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => {
                        setBrandFilter(b)
                        setIsBrandOpen(false)
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                        brandFilter === b
                          ? 'bg-brand-red/10 text-white font-semibold border border-brand-red/20'
                          : 'text-text-muted hover:bg-surface-elevated hover:text-white'
                      }`}
                    >
                      <span>{b}</span>
                      {brandFilter === b && <Check className="w-3.5 h-3.5 text-brand-red" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Stock Custom Dropdown */}
          <div className="relative" ref={stockRef}>
            <button
              type="button"
              onClick={() => setIsStockOpen(!isStockOpen)}
              className="input-base bg-surface-elevated text-xs flex items-center justify-between gap-2 min-w-[150px] cursor-pointer hover:bg-surface-elevated/80 transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-text-faint" />
                <span>
                  {stockFilter === 'all' && 'All Stock Statuses'}
                  {stockFilter === 'instock' && 'In Stock'}
                  {stockFilter === 'lowstock' && 'Low Stock (≤ 5)'}
                  {stockFilter === 'outofstock' && 'Out of Stock'}
                </span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-text-muted transition-transform duration-200 ${isStockOpen ? 'rotate-180' : ''}`} />
            </button>

            {isStockOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-surface-card/95 backdrop-blur-md border border-surface-border rounded-xl shadow-2xl overflow-hidden z-30 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="p-1.5 space-y-1">
                  {[
                    { value: 'all', label: 'All Stock Statuses' },
                    { value: 'instock', label: 'In Stock' },
                    { value: 'lowstock', label: 'Low Stock (≤ 5)' },
                    { value: 'outofstock', label: 'Out of Stock' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setStockFilter(opt.value)
                        setIsStockOpen(false)
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                        stockFilter === opt.value
                          ? 'bg-brand-red/10 text-white font-semibold border border-brand-red/20'
                          : 'text-text-muted hover:bg-surface-elevated hover:text-white'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {stockFilter === opt.value && <Check className="w-3.5 h-3.5 text-brand-red" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Reset Filters button */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="p-2.5 rounded-lg border border-surface-border bg-surface-elevated hover:bg-surface-border text-text-muted hover:text-white transition-all text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-surface-card rounded-xl border border-surface-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border bg-surface-elevated/50">
                {['Product', 'Brand', 'Price', 'Stock', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-widest whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {paginatedProducts.map((p) => (
                <tr key={p.id} className="hover:bg-surface-elevated/40 transition-colors">
                  <td className="px-4 py-3 max-w-[260px]">
                    <p className="font-medium text-text-primary line-clamp-1">{p.title}</p>
                    {p.is_treasure_hunt && (
                      <span className="text-[10px] text-brand-gold">⭐ Treasure Hunt</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-text-muted whitespace-nowrap">{p.brand ?? '—'}</td>
                  <td className="px-4 py-3 font-semibold text-brand-gold whitespace-nowrap">
                    {formatPrice(p.price)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-medium ${
                      p.stock_qty === 0 ? 'text-red-400' :
                      p.stock_qty <= 5 ? 'text-orange-400' : 'text-green-400'
                    }`}>
                      {p.stock_qty}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                      p.is_active
                        ? 'text-green-400 bg-green-400/10'
                        : 'text-text-faint bg-surface-elevated'
                    }`}>
                      {p.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {p.is_active ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/products/${p.id}/edit`}
                      className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-white bg-surface-elevated hover:bg-surface-border px-2.5 py-1.5 rounded-lg transition-colors"
                      id={`edit-product-${p.id}`}
                    >
                      <Pencil className="w-3 h-3" /> Edit
                    </Link>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-text-muted">
                    No products matching your filters.{' '}
                    <button onClick={resetFilters} className="text-brand-red hover:underline">
                      Reset all filters
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
          <p className="text-xs text-text-muted">
            Showing{' '}
            <span className="font-semibold text-white">
              {(currentPage - 1) * ITEMS_PER_PAGE + 1}
            </span>{' '}
            to{' '}
            <span className="font-semibold text-white">
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)}
            </span>{' '}
            of{' '}
            <span className="font-semibold text-white">{filteredProducts.length}</span>{' '}
            products
          </p>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-surface-border bg-surface-card hover:bg-surface-elevated text-text-muted hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              aria-label="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }).map((_, index) => {
              const pageNum = index + 1
              // Logic to limit number of visible page buttons on small screens
              if (
                totalPages > 5 &&
                Math.abs(currentPage - pageNum) > 1 &&
                pageNum !== 1 &&
                pageNum !== totalPages
              ) {
                if (pageNum === 2 || pageNum === totalPages - 1) {
                  return (
                    <span key={pageNum} className="px-2 text-text-faint select-none">
                      ...
                    </span>
                  )
                }
                return null
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-9 h-9 rounded-lg border transition-all text-xs font-semibold cursor-pointer ${
                    currentPage === pageNum
                      ? 'border-brand-red bg-brand-red/10 text-white'
                      : 'border-surface-border bg-surface-card hover:bg-surface-elevated text-text-muted hover:text-white'
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-surface-border bg-surface-card hover:bg-surface-elevated text-text-muted hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              aria-label="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
