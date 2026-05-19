'use client'

import { formatPrice, getPrimaryImage } from '@/lib/utils'
import { useCartStore } from '@/store/cartStore'
import { useUIStore } from '@/store/uiStore'
import type { Product } from '@/lib/types'
import type { ProductVariant } from '@/lib/types/variant'

interface AddToCartDetailButtonProps {
  product: Product
  selectedVariant?: ProductVariant | null
}

export function AddToCartDetailButton({ product, selectedVariant }: AddToCartDetailButtonProps) {
  const { addItem, openCart } = useCartStore()
  const { addToast } = useUIStore()

  const activePrice = selectedVariant?.price_override ?? product.price
  const activeStock = selectedVariant ? selectedVariant.stock_qty : product.stock_qty
  const label = selectedVariant ? `${product.title} - ${selectedVariant.label}` : product.title

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      title: label,
      slug: product.slug,
      price: activePrice,
      image: getPrimaryImage(product.images, product.image_url),
      brand: product.brand,
      stock_qty: activeStock,
      variant_id: selectedVariant?.id,
      variant_label: selectedVariant?.label,
    })
    addToast({ message: 'Added to cart!', type: 'success' })
    openCart()
  }

  if (activeStock === 0) {
    return (
      <button
        disabled
        className="w-full py-3.5 rounded-xl bg-surface-elevated text-text-faint font-semibold cursor-not-allowed"
        id="add-to-cart-detail"
      >
        Out of Stock
      </button>
    )
  }

  return (
    <button
      onClick={handleAddToCart}
      className="w-full py-3.5 rounded-xl bg-brand-red hover:bg-brand-red-light text-white font-semibold transition-colors shadow-lg shadow-brand-red/20 active:scale-[0.98]"
      id="add-to-cart-detail"
    >
      🛒 Add to Cart — {formatPrice(activePrice)}
    </button>
  )
}
