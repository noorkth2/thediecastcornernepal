'use client'

import { formatPrice, getPrimaryImage } from '@/lib/utils'
import { useCartStore } from '@/store/cartStore'
import { useUIStore } from '@/store/uiStore'
import type { Product } from '@/lib/types'

export function AddToCartDetailButton({ product }: { product: Product }) {
  const { addItem, openCart } = useCartStore()
  const { addToast } = useUIStore()

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      title: product.title,
      slug: product.slug,
      price: product.price,
      image: getPrimaryImage(product.images),
      brand: product.brand,
      stock_qty: product.stock_qty,
    })
    addToast({ message: 'Added to cart!', type: 'success' })
    openCart()
  }

  if (product.stock_qty === 0) {
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
      🛒 Add to Cart — {formatPrice(product.price)}
    </button>
  )
}
