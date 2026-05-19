'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import Image from 'next/image'
import type { Product } from '@/lib/types'
import { formatPrice, discountPercent, getPrimaryImage } from '@/lib/utils'
import { useCartStore } from '@/store/cartStore'
import { useUIStore } from '@/store/uiStore'
import { Badge } from '@/components/ui/badge'

interface QuickViewModalProps {
  product: Product
  isOpen: boolean
  onClose: () => void
}

export function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const { addItem, openCart } = useCartStore()
  const { addToast } = useUIStore()

  const primaryImage = getPrimaryImage(product.images, product.image_url)
  const discount = discountPercent(product.price, product.compare_price ?? 0)
  const isOutOfStock = product.stock_qty === 0

  const handleAddToCart = () => {
    if (isOutOfStock) return
    addItem({
      id: product.id,
      title: product.title,
      slug: product.slug,
      price: product.price,
      image: primaryImage,
      brand: product.brand,
      stock_qty: product.stock_qty,
    })
    addToast({ message: `${product.title} added to cart!`, type: 'success' })
    onClose()
    openCart()
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-3xl max-h-[90vh] overflow-y-auto bg-surface-card border border-surface-border rounded-2xl shadow-2xl z-50 animate-in zoom-in-95 duration-200">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-surface-elevated text-text-muted hover:text-white hover:bg-brand-red transition-colors z-10"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Image Section */}
            <div className="relative aspect-square bg-[#1a1a1a] flex items-center justify-center p-8">
              <Image
                src={primaryImage}
                alt={product.title}
                fill
                className="object-contain p-8 drop-shadow-2xl"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              
              <div className="absolute top-4 left-4 flex flex-col gap-1">
                {product.is_treasure_hunt && <span className="badge-th">⭐ TH</span>}
                {product.is_limited && !product.is_treasure_hunt && <span className="badge-limited">🔥 LIMITED</span>}
                {product.is_new_arrival && !product.is_treasure_hunt && <Badge variant="blue" className="text-xs">NEW</Badge>}
              </div>
            </div>

            {/* Content Section */}
            <div className="p-6 md:p-8 flex flex-col">
              {product.brand && (
                <p className="text-xs text-text-faint uppercase tracking-widest mb-2 font-medium">
                  {product.brand}
                </p>
              )}
              
              <Dialog.Title className="text-2xl font-display text-white tracking-wide mb-4">
                {product.title}
              </Dialog.Title>

              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-2xl font-bold text-brand-gold">
                  {formatPrice(product.price)}
                </span>
                {product.compare_price && product.compare_price > product.price && (
                  <>
                    <span className="text-text-faint text-sm line-through">
                      {formatPrice(product.compare_price)}
                    </span>
                    <span className="text-xs font-bold text-brand-red bg-brand-red/10 px-1.5 py-0.5 rounded">
                      -{discount}%
                    </span>
                  </>
                )}
              </div>

              {(product.scale || product.series) && (
                <div className="flex flex-wrap gap-2 mb-6 text-sm">
                  {product.scale && (
                    <span className="bg-surface-elevated text-text-muted px-3 py-1 rounded-md">
                      Scale: {product.scale}
                    </span>
                  )}
                  {product.series && (
                    <span className="bg-surface-elevated text-text-muted px-3 py-1 rounded-md">
                      Series: {product.series}
                    </span>
                  )}
                </div>
              )}

              {product.description && (
                <p className="text-sm text-text-muted mb-8 line-clamp-4">
                  {product.description}
                </p>
              )}

              <div className="mt-auto space-y-3">
                <p className={`text-sm font-medium ${isOutOfStock ? 'text-red-400' : product.stock_qty <= 5 ? 'text-orange-400' : 'text-green-400'}`}>
                  {isOutOfStock ? 'Out of Stock' : product.stock_qty <= 5 ? `Only ${product.stock_qty} left` : 'In Stock'}
                </p>
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className="w-full btn-primary py-3"
                >
                  {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                </button>
                <a
                  href={`/product/${product.slug}`}
                  className="w-full block text-center py-3 text-sm text-text-muted hover:text-white transition-colors"
                >
                  View Full Details
                </a>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
