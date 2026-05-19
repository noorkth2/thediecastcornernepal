'use client'

import { useState, useEffect, useRef } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Search, X, Loader2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/lib/types'
import { formatPrice, getPrimaryImage } from '@/lib/utils'

export function SearchModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Listen for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Debounced search fetching
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        if (res.ok) {
          const data = await res.json()
          setResults(data)
        }
      } catch (error) {
        console.error('Failed to fetch search results:', error)
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      setQuery('')
      setResults([])
    }
  }, [isOpen])

  return (
    <>
      {/* Search trigger button in Navbar/Header */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-elevated hover:bg-surface-border text-text-muted hover:text-white transition-all text-sm border border-surface-border"
        aria-label="Search products"
      >
        <Search className="w-4 h-4" />
        <span className="hidden md:inline">Search models...</span>
        <kbd className="hidden md:inline-flex h-5 select-none items-center gap-0.5 rounded border border-surface-border bg-surface-card px-1.5 font-mono text-[10px] font-medium text-text-faint">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
          <Dialog.Content className="fixed top-[15%] left-1/2 -translate-x-1/2 w-[90vw] max-w-2xl bg-surface-card border border-surface-border rounded-2xl shadow-2xl z-50 animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[70vh]">
            
            {/* Input wrapper */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-surface-border bg-surface-elevated/50">
              <Search className="w-5 h-5 text-text-muted flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search Hot Wheels, Matchbox, Inno64..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-white placeholder-text-faint text-base focus:ring-0 focus:outline-none"
              />
              {isLoading ? (
                <Loader2 className="w-5 h-5 text-brand-gold animate-spin" />
              ) : query ? (
                <button
                  onClick={() => setQuery('')}
                  className="p-1 rounded-full hover:bg-surface-border text-text-muted hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : null}
            </div>

            {/* Results area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {query && !isLoading && results.length === 0 && (
                <p className="text-center text-text-muted py-8 text-sm">
                  No products found matching "{query}"
                </p>
              )}

              {!query && (
                <p className="text-center text-text-faint py-8 text-xs">
                  Tip: Search by brand, scale, series or model name.
                </p>
              )}

              {results.map((product) => {
                const primaryImage = getPrimaryImage(product.images, product.image_url)
                return (
                  <Link
                    key={product.id}
                    href={`/product/${product.slug}`}
                    onClick={() => setIsOpen(false)}
                    className="flex gap-4 p-3 rounded-xl hover:bg-surface-elevated transition-colors border border-transparent hover:border-surface-border group"
                  >
                    <div className="relative w-16 h-16 bg-surface-base rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center">
                      <Image
                        src={primaryImage}
                        alt={product.title}
                        fill
                        className="object-contain p-1 group-hover:scale-105 transition-transform"
                        sizes="64px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-white truncate text-sm group-hover:text-brand-red-light transition-colors">
                        {product.title}
                      </h4>
                      <p className="text-xs text-text-muted uppercase tracking-widest mt-0.5 font-medium">
                        {product.brand || 'No Brand'}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-sm font-bold text-brand-gold">
                          {formatPrice(product.price)}
                        </span>
                        {product.scale && (
                          <span className="text-[10px] bg-surface-border px-1.5 py-0.5 rounded text-text-muted font-medium">
                            {product.scale}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}
