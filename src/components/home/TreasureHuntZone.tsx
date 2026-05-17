import Link from 'next/link'
import Image from 'next/image'
import { Star, ArrowRight } from 'lucide-react'
import { getPrimaryImage, formatPrice } from '@/lib/utils'
import type { Product } from '@/lib/types'

interface TreasureHuntZoneProps {
  products: Product[]
}

export function TreasureHuntZone({ products }: TreasureHuntZoneProps) {
  if (!products.length) return null

  return (
    <section className="py-16 bg-surface-card border-y border-surface-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-brand-gold fill-brand-gold" />
              <span className="text-brand-gold text-xs font-semibold tracking-widest uppercase">
                Rare Finds
              </span>
            </div>
            <h2 className="font-display text-4xl text-white tracking-wide">
              TREASURE HUNT ZONE
            </h2>
            <p className="text-text-muted text-sm mt-1">
              The rarest chase models and limited editions — grab them before they&apos;re gone
            </p>
          </div>
          <Link
            href="/treasure-hunt"
            className="hidden sm:flex items-center gap-1.5 text-sm text-text-muted hover:text-brand-gold transition-colors group"
            id="th-view-all"
          >
            View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* TH product row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => {
            const img = getPrimaryImage(product.images, product.image_url)
            const isOutOfStock = product.stock_qty === 0

            return (
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                className="group relative bg-surface-base rounded-xl overflow-hidden border border-brand-gold/20 hover:border-brand-gold/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-gold/10"
                aria-label={`View ${product.title}`}
              >
                {/* Gold shimmer top bar */}
                <div className="h-0.5 w-full badge-th rounded-none" />

                {/* Image */}
                <div className="relative w-full h-[160px] bg-[#111] flex items-center justify-center overflow-hidden">
                  <Image
                    src={img}
                    alt={product.title}
                    fill
                    className="object-contain p-3 group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />
                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-text-muted text-xs font-semibold uppercase tracking-wider">
                        Sold Out
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-3">
                  <span className="badge-th text-[10px] mb-2 inline-block">⭐ TH</span>
                  <h3 className="text-sm font-semibold text-text-primary line-clamp-2 leading-snug">
                    {product.title}
                  </h3>
                  {product.brand && (
                    <p className="text-[11px] text-text-faint mt-0.5">{product.brand}</p>
                  )}
                  <p className="font-bold text-brand-gold mt-2 text-sm">
                    {formatPrice(product.price)}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
