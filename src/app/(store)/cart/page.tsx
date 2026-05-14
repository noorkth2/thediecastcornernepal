'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING } from '@/lib/constants'

export default function CartPage() {
  const { items, removeItem, updateQty, totalPrice, totalItems, clearCart } =
    useCartStore()

  const total = totalPrice()
  const count = totalItems()
  const shipping = total >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING
  const grand = total + shipping

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-4xl text-white tracking-wide">
          YOUR CART
        </h1>
        {items.length > 0 && (
          <button
            onClick={clearCart}
            className="text-sm text-text-muted hover:text-red-400 transition-colors flex items-center gap-1.5"
            id="clear-cart-btn"
          >
            <Trash2 className="w-4 h-4" /> Clear Cart
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-24">
          <ShoppingBag className="w-20 h-20 text-surface-border mx-auto mb-5" />
          <h2 className="font-display text-3xl text-white mb-2">CART IS EMPTY</h2>
          <p className="text-text-muted text-sm mb-8">
            Looks like you haven&apos;t added any models yet.
          </p>
          <Button variant="primary" size="lg" asChild>
            <Link href="/shop">Browse Shop</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="flex gap-4 bg-surface-card rounded-xl p-4 border border-surface-border"
              >
                <Link
                  href={`/product/${product.slug}`}
                  className="flex-shrink-0 w-24 h-24 bg-[#1a1a1a] rounded-xl overflow-hidden flex items-center justify-center"
                >
                  <Image
                    src={product.image || '/placeholder-car.jpg'}
                    alt={product.title}
                    width={96}
                    height={96}
                    className="object-contain w-full h-full p-2"
                  />
                </Link>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      {product.brand && (
                        <p className="text-[11px] text-text-faint uppercase tracking-widest mb-0.5">
                          {product.brand}
                        </p>
                      )}
                      <Link
                        href={`/product/${product.slug}`}
                        className="font-semibold text-text-primary hover:text-brand-red-light transition-colors text-sm leading-snug line-clamp-2"
                      >
                        {product.title}
                      </Link>
                    </div>
                    <button
                      onClick={() => removeItem(product.id)}
                      className="text-text-faint hover:text-red-400 transition-colors flex-shrink-0 p-1"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    {/* Qty */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQty(product.id, quantity - 1)}
                        className="w-7 h-7 rounded-lg bg-surface-elevated flex items-center justify-center text-text-muted hover:text-white hover:bg-surface-border transition-colors"
                        aria-label="Decrease"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-semibold text-text-primary w-6 text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQty(product.id, Math.min(quantity + 1, product.stock_qty))
                        }
                        disabled={quantity >= product.stock_qty}
                        className="w-7 h-7 rounded-lg bg-surface-elevated flex items-center justify-center text-text-muted hover:text-white hover:bg-surface-border transition-colors disabled:opacity-30"
                        aria-label="Increase"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Line total */}
                    <span className="font-bold text-brand-gold text-sm">
                      {formatPrice(product.price * quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-surface-card rounded-xl border border-surface-border p-5 sticky top-24">
              <h2 className="font-semibold text-text-primary mb-5 pb-3 border-b border-surface-border">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-text-muted">
                  <span>Subtotal ({count} items)</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-text-muted">
                  <span>Shipping</span>
                  <span>
                    {shipping === 0 ? (
                      <span className="text-green-400 font-medium">FREE</span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>

                {total < FREE_SHIPPING_THRESHOLD && (
                  <p className="text-xs text-text-faint">
                    Add{' '}
                    <span className="text-brand-gold font-medium">
                      {formatPrice(FREE_SHIPPING_THRESHOLD - total)}
                    </span>{' '}
                    more for free shipping
                  </p>
                )}

                <div className="flex justify-between font-bold text-text-primary text-base pt-3 border-t border-surface-border">
                  <span>Total</span>
                  <span className="text-brand-gold">{formatPrice(grand)}</span>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full mt-5 gap-2"
                asChild
                id="proceed-to-checkout-btn"
              >
                <Link href="/checkout">
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>

              <Button
                variant="ghost"
                size="md"
                className="w-full mt-2 text-text-muted"
                asChild
              >
                <Link href="/shop">← Continue Shopping</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
