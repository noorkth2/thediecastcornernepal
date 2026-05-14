'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Eye, Star } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useUIStore } from '@/store/uiStore'
import { formatPrice, getPrimaryImage, discountPercent } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Product } from '@/lib/types'

interface ProductCardProps {
  product: Product
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { addItem, openCart } = useCartStore()
  const { addToast } = useUIStore()
  const primaryImage = getPrimaryImage(product.images)
  const discount = discountPercent(product.price, product.compare_price ?? 0)
  const isOutOfStock = product.stock_qty === 0

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

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
    openCart()
  }

  return (
    <Link
      href={`/product/${product.slug}`}
      className={cn(
        'group block bg-surface-card rounded-xl overflow-hidden border border-surface-border',
        'hover:border-brand-red/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-red/10',
        'product-card-top-bar relative',
        className
      )}
      aria-label={`View ${product.title}`}
    >
      {/* Image container */}
      <div className="relative w-full h-[180px] bg-[#1a1a1a] flex items-center justify-center overflow-hidden">
        <Image
          src={primaryImage}
          alt={product.images?.[0]?.alt_text ?? product.title}
          fill
          className="object-contain p-3 group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-white bg-black/60 rounded-full px-3 py-1.5 backdrop-blur-sm">
            <Eye className="w-3.5 h-3.5" />
            Quick View
          </span>
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {product.is_treasure_hunt && (
            <span className="badge-th">⭐ TH</span>
          )}
          {product.is_limited && !product.is_treasure_hunt && (
            <span className="badge-limited">🔥 LIMITED</span>
          )}
          {product.is_new_arrival && !product.is_treasure_hunt && (
            <Badge variant="blue" className="text-[10px]">NEW</Badge>
          )}
          {product.is_premium && (
            <Badge variant="gold" className="text-[10px]">PREMIUM</Badge>
          )}
        </div>

        {/* Discount badge */}
        {discount > 0 && (
          <div className="absolute top-2 right-2 bg-brand-red text-white text-[10px] font-bold px-1.5 py-0.5 rounded z-10">
            -{discount}%
          </div>
        )}

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
            <span className="text-text-muted text-xs font-semibold tracking-wider uppercase">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3.5">
        {/* Brand */}
        {product.brand && (
          <p className="text-[11px] text-text-faint uppercase tracking-widest mb-1 font-medium">
            {product.brand}
          </p>
        )}

        {/* Title */}
        <h3 className="text-sm font-semibold text-text-primary line-clamp-2 leading-snug group-hover:text-brand-red-light transition-colors">
          {product.title}
        </h3>

        {/* Scale / Series */}
        {(product.scale || product.series) && (
          <p className="text-[11px] text-text-faint mt-0.5">
            {[product.scale, product.series].filter(Boolean).join(' · ')}
          </p>
        )}

        {/* Price row */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-brand-gold text-base">
              {formatPrice(product.price)}
            </span>
            {product.compare_price && product.compare_price > product.price && (
              <span className="text-text-faint text-xs line-through">
                {formatPrice(product.compare_price)}
              </span>
            )}
          </div>

          {/* Stock indicator */}
          {product.stock_qty > 0 && product.stock_qty <= 5 && (
            <span className="text-[10px] text-orange-400 font-medium">
              Only {product.stock_qty} left
            </span>
          )}
        </div>

        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={cn(
            'w-full mt-3 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200',
            isOutOfStock
              ? 'bg-surface-elevated text-text-faint cursor-not-allowed'
              : 'bg-surface-elevated hover:bg-brand-red text-text-muted hover:text-white border border-surface-border hover:border-brand-red group-hover:border-brand-red/40'
          )}
          aria-label={`Add ${product.title} to cart`}
          id={`add-to-cart-${product.id}`}
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </Link>
  )
}
