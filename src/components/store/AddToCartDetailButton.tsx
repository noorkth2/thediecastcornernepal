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

  const isPreOrder = product.status === 'PRE_ORDER'

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
    addToast({ message: isPreOrder ? 'Added to pre-orders!' : 'Added to cart!', type: 'success' })
    openCart()
  }

  if (activeStock === 0 && !isPreOrder) {
    return (
      <WaitlistForm productId={product.id} productTitle={product.title} />
    )
  }

  return (
    <button
      onClick={handleAddToCart}
      className={`w-full py-3.5 rounded-xl font-semibold transition-colors shadow-lg active:scale-[0.98] ${
        isPreOrder 
          ? 'bg-brand-gold hover:bg-brand-gold-light text-black shadow-brand-gold/20' 
          : 'bg-brand-red hover:bg-brand-red-light text-white shadow-brand-red/20'
      }`}
      id="add-to-cart-detail"
    >
      {isPreOrder ? '📦 Pre-order Now' : '🛒 Add to Cart'} — {formatPrice(activePrice)}
    </button>
  )
}
 text-white shadow-brand-red/20'
      }`}
      id="add-to-cart-detail"
    >
      {isPreOrder ? '📦 Pre-order Now' : '🛒 Add to Cart'} — {formatPrice(activePrice)}
    </button>
  )
}
