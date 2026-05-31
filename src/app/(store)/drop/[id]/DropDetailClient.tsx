'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useCartStore } from '@/store/cartStore'
import { useUIStore } from '@/store/uiStore'
import { LiveStockIndicator } from '@/components/store/LiveStockIndicator'
import { ShieldCheck, Flame, ShoppingBag, Loader2, Clock } from 'lucide-react'
import Image from 'next/image'
import { formatPrice, getPrimaryImage } from '@/lib/utils'

interface DropDetailClientProps {
  drop: any
  product: any
  user: any
}

export function DropDetailClient({ drop, product, user }: DropDetailClientProps) {
  const supabase = createClient()
  const { addItem, openCart } = useCartStore()
  const { addToast } = useUIStore()

  // Real-time stock state
  const [stock, setStock] = useState<number>(product.stock_qty)

  // Anti-bot CTA countdown state
  const [antiBotTime, setAntiBotTime] = useState<number>(drop.anti_bot_delay)
  const [isVerifying, setIsVerifying] = useState(true)

  const primaryImage = getPrimaryImage(product.images, product.image_url)

  // Real-time stock subscription
  useEffect(() => {
    const channel = supabase
      .channel(`drop-stock-${product.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'products',
          filter: `id=eq.${product.id}`,
        },
        (payload: any) => {
          if (payload.new && typeof payload.new.stock_qty === 'number') {
            setStock(payload.new.stock_qty)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [product.id, supabase])

  // Anti-bot checkout button timer
  useEffect(() => {
    if (antiBotTime <= 0) {
      return
    }

    const timer = setTimeout(() => {
      setAntiBotTime((prev) => prev - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [antiBotTime])

  const handlePurchase = () => {
    if (!user) {
      window.location.href = `/login?redirect=/drop/${drop.id}`
      return
    }

    if (stock <= 0) {
      addToast({ message: 'This item is sold out!', type: 'error' })
      return
    }

    // Add to cart with reservation flow
    addItem({
      id: product.id,
      title: product.title,
      slug: product.slug,
      price: product.price,
      image: primaryImage,
      brand: product.brand,
      stock_qty: stock,
    })

    addToast({ message: 'Model reserved! Proceed to checkout.', type: 'success' })
    openCart()
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        
        {/* Left Side: Product Image & Badges */}
        <div className="relative aspect-square bg-[#171717] border border-surface-border rounded-2xl flex items-center justify-center p-8 overflow-hidden group">
          <Image
            src={primaryImage}
            alt={product.title}
            fill
            className="object-contain p-8 drop-shadow-[0_15px_30px_rgba(0,0,0,0.6)] group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
          <div className="absolute top-4 left-4 flex flex-col gap-1.5">
            <span className="badge-limited text-xs px-2.5 py-1">
              🔥 LIVE DROP
            </span>
            {product.is_treasure_hunt && (
              <span className="badge-th text-xs px-2.5 py-1">
                ⭐ TREASURE HUNT
              </span>
            )}
          </div>
        </div>

        {/* Right Side: Details & Live Stock Checkout */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div>
              <span className="text-xs text-brand-gold uppercase tracking-widest font-bold">
                {drop.drop_name}
              </span>
              <h1 className="font-display text-3xl md:text-4xl text-white tracking-wide mt-1">
                {product.title}
              </h1>
              <p className="text-sm text-text-muted uppercase tracking-widest mt-1 font-medium">
                {product.brand} · {product.scale} · {product.series || 'Limited Series'}
              </p>
            </div>

            {/* Price section */}
            <div className="bg-surface-card border border-surface-border p-4 rounded-xl flex items-center justify-between">
              <span className="text-text-muted text-xs uppercase tracking-wider font-semibold">Drop Price</span>
              <span className="text-2xl font-bold text-brand-gold">{formatPrice(product.price)}</span>
            </div>

            {/* Realtime stock level */}
            <div className="bg-surface-card border border-surface-border p-5 rounded-xl">
              <LiveStockIndicator stockQty={stock} maxStock={20} />
            </div>

            {product.description && (
              <div className="space-y-2">
                <h4 className="text-xs text-text-muted uppercase tracking-wider font-bold">Description</h4>
                <p className="text-sm text-text-muted leading-relaxed">{product.description}</p>
              </div>
            )}
          </div>

          {/* Checkout CTA */}
          <div className="space-y-3 pt-6 border-t border-surface-border">
            {isVerifying ? (
              <button
                disabled
                className="w-full bg-surface-elevated text-text-muted py-4 rounded-xl border border-surface-border text-sm font-semibold flex items-center justify-center gap-2 cursor-not-allowed"
              >
                <Clock className="w-4 h-4 animate-pulse text-brand-orange" />
                Anti-Bot Validation ({antiBotTime}s)
              </button>
            ) : (
              <button
                onClick={handlePurchase}
                disabled={stock <= 0}
                className="w-full btn-primary py-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 text-white hover:bg-brand-red-light transition-all shadow-lg shadow-brand-red/10 active:scale-95 disabled:bg-surface-elevated disabled:text-text-faint disabled:border-surface-border disabled:cursor-not-allowed"
              >
                <ShoppingBag className="w-4.5 h-4.5" />
                {stock <= 0 ? 'SOLD OUT' : 'ADD & RESERVE NOW'}
              </button>
            )}

            {/* Bot notice */}
            <div className="flex items-center gap-2 text-[10px] text-text-faint bg-surface-elevated/40 border border-surface-border px-3 py-2 rounded-lg justify-center">
              <ShieldCheck className="w-4 h-4 text-green-400" />
              <span>Limit {drop.max_per_user} per customer. Real-time stock reserved for 15 minutes at cart.</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
