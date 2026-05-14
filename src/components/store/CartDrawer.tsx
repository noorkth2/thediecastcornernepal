'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { formatPrice, getPrimaryImage } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING } from '@/lib/constants'

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQty, totalPrice, totalItems } =
    useCartStore()
  const drawerRef = useRef<HTMLDivElement>(null)
  const total = totalPrice()
  const count = totalItems()
  const shippingCharge = total >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING
  const grandTotal = total + shippingCharge

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) closeCart()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, closeCart])

  // Trap scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className={`fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-surface-card border-l border-surface-border flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-brand-red" />
            <h2 className="font-semibold text-text-primary">
              Cart{' '}
              {count > 0 && (
                <span className="text-text-muted font-normal text-sm">
                  ({count} {count === 1 ? 'item' : 'items'})
                </span>
              )}
            </h2>
          </div>
          <button
            onClick={closeCart}
            className="p-2 rounded-lg text-text-muted hover:text-white hover:bg-surface-elevated transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto py-4 px-5 space-y-4 scrollbar-hide">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <ShoppingBag className="w-16 h-16 text-surface-border mb-4" />
              <p className="text-text-muted font-medium">Your cart is empty</p>
              <p className="text-text-faint text-sm mt-1 mb-6">
                Add some diecast models to get started!
              </p>
              <Button variant="primary" size="md" onClick={closeCart} asChild>
                <Link href="/shop">Browse Shop</Link>
              </Button>
            </div>
          ) : (
            items.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="flex gap-3 bg-surface-elevated rounded-xl p-3 border border-surface-border"
              >
                {/* Product image */}
                <Link
                  href={`/product/${product.slug}`}
                  onClick={closeCart}
                  className="flex-shrink-0 w-20 h-20 rounded-lg bg-[#1a1a1a] flex items-center justify-center overflow-hidden"
                >
                  <Image
                    src={product.image || '/placeholder-car.jpg'}
                    alt={product.title}
                    width={80}
                    height={80}
                    className="object-contain p-1 w-full h-full"
                  />
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/product/${product.slug}`}
                    onClick={closeCart}
                    className="text-sm font-medium text-text-primary hover:text-brand-red-light transition-colors line-clamp-2 leading-snug"
                  >
                    {product.title}
                  </Link>
                  {product.brand && (
                    <p className="text-xs text-text-muted mt-0.5">{product.brand}</p>
                  )}
                  <p className="text-brand-gold font-semibold text-sm mt-1">
                    {formatPrice(product.price)}
                  </p>

                  {/* Qty controls */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQty(product.id, quantity - 1)}
                      className="w-6 h-6 rounded bg-surface-border flex items-center justify-center text-text-muted hover:text-white hover:bg-surface-elevated transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-medium text-text-primary min-w-[1.5rem] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQty(
                          product.id,
                          Math.min(quantity + 1, product.stock_qty)
                        )
                      }
                      disabled={quantity >= product.stock_qty}
                      className="w-6 h-6 rounded bg-surface-border flex items-center justify-center text-text-muted hover:text-white hover:bg-surface-elevated transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3 h-3" />
                    </button>

                    {/* Remove */}
                    <button
                      onClick={() => removeItem(product.id)}
                      className="ml-auto p-1 rounded text-text-faint hover:text-red-400 transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer — totals + checkout */}
        {items.length > 0 && (
          <div className="border-t border-surface-border px-5 py-4 space-y-3">
            {/* Free shipping progress */}
            {total < FREE_SHIPPING_THRESHOLD && (
              <div className="text-xs text-text-muted">
                <div className="flex justify-between mb-1.5">
                  <span>
                    Add{' '}
                    <span className="text-brand-gold font-medium">
                      {formatPrice(FREE_SHIPPING_THRESHOLD - total)}
                    </span>{' '}
                    for free shipping
                  </span>
                  <span>{Math.round((total / FREE_SHIPPING_THRESHOLD) * 100)}%</span>
                </div>
                <div className="h-1.5 bg-surface-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand-red to-brand-gold rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min((total / FREE_SHIPPING_THRESHOLD) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Totals */}
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-text-muted">
                <span>Subtotal</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-text-muted">
                <span>Shipping</span>
                <span>
                  {shippingCharge === 0 ? (
                    <span className="text-green-400 font-medium">FREE</span>
                  ) : (
                    formatPrice(shippingCharge)
                  )}
                </span>
              </div>
              <div className="flex justify-between font-semibold text-text-primary pt-2 border-t border-surface-border">
                <span>Total</span>
                <span className="text-brand-gold">{formatPrice(grandTotal)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <Button variant="secondary" size="md" className="flex-1" asChild>
                <Link href="/cart" onClick={closeCart}>
                  View Cart
                </Link>
              </Button>
              <Button variant="primary" size="md" className="flex-1 gap-1" asChild>
                <Link href="/checkout" onClick={closeCart}>
                  Checkout <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
