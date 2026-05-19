import type { Metadata } from 'next'
import { getUpcomingDrops } from '@/lib/supabase/queries/drops'
import { Calendar, Hourglass, ArrowRight, ShieldCheck, Flame } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { formatPrice, getPrimaryImage } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Drops & Releases — Live Launches',
  description:
    'Join our live drops for rare and limited edition Hot Wheels, MiniGT, Tomica and INNO64 models. Secure yours before they sell out.',
}

export const revalidate = 0 // Keep upcoming drops list fresh

export default async function DropsPage() {
  const drops = await getUpcomingDrops()

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Page Header */}
      <div className="border-b border-surface-border pb-6 text-center md:text-left">
        <h1 className="font-display text-4xl text-white tracking-wide flex items-center justify-center md:justify-start gap-2.5">
          <Flame className="w-8 h-8 text-brand-red animate-pulse" /> LIVE LAUNCHES & DROPS
        </h1>
        <p className="text-text-muted text-sm mt-1 max-w-xl">
          High-demand, ultra-limited collectibles. Drop times are absolute. Ensure your address details are pre-saved.
        </p>
      </div>

      {drops.length === 0 ? (
        <div className="bg-surface-card border border-surface-border rounded-2xl p-12 text-center">
          <Hourglass className="w-12 h-12 text-surface-border mx-auto mb-4 animate-spin-slow" />
          <h2 className="font-semibold text-white">No Scheduled Drops</h2>
          <p className="text-text-muted text-sm mt-1">
            Check back later or follow our social channels for release announcements.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {drops.map((drop) => {
            const product = drop.product
            if (!product) return null

            const primaryImage = getPrimaryImage(product.images, product.image_url)
            const dropsAt = new Date(drop.drops_at)
            const waitingOpens = new Date(drop.waiting_room_opens_at)
            const now = new Date()

            const isLive = drop.status === 'live' || now >= dropsAt
            const isWaiting = drop.status === 'waiting' || (now >= waitingOpens && now < dropsAt)
            
            return (
              <div
                key={drop.id}
                className="bg-surface-card border border-surface-border rounded-2xl p-6 flex flex-col md:flex-row gap-6 relative overflow-hidden product-card-top-bar"
              >
                {/* Image */}
                <div className="relative aspect-square w-full md:w-44 bg-surface-base rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                  <Image
                    src={primaryImage}
                    alt={drop.drop_name}
                    fill
                    className="object-contain p-4"
                    sizes="(max-width: 768px) 100vw, 176px"
                  />
                  {product.is_treasure_hunt && (
                    <span className="absolute top-2 left-2 badge-th text-[9px] px-1.5 py-0.5">
                      ⭐ TH
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <span className="text-[10px] text-brand-gold uppercase tracking-widest font-bold">
                      {drop.drop_name}
                    </span>
                    <h2 className="text-lg font-bold text-white truncate mt-1">
                      {product.title}
                    </h2>
                    <p className="text-xs text-text-muted uppercase mt-0.5 tracking-wider font-semibold">
                      {product.brand} · {product.scale}
                    </p>

                    <div className="flex items-center gap-2 mt-4 text-xs font-mono text-text-primary bg-surface-elevated/50 border border-surface-border py-2 px-3 rounded-lg max-w-max">
                      <Calendar className="w-4 h-4 text-brand-red" />
                      <span>{dropsAt.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-surface-border flex items-center justify-between gap-4">
                    <span className="text-base font-bold text-brand-gold">
                      {formatPrice(product.price)}
                    </span>

                    {isLive ? (
                      <Link
                        href={`/drop/${drop.id}`}
                        className="btn-primary py-2 px-4 text-xs flex items-center gap-1.5"
                      >
                        Join Drop <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    ) : isWaiting ? (
                      <Link
                        href={`/drop/${drop.id}/waiting`}
                        className="bg-brand-orange hover:bg-brand-orange/95 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 text-xs flex items-center gap-1.5"
                      >
                        Enter Waiting Room <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    ) : (
                      <span className="text-xs font-semibold text-text-faint bg-surface-elevated px-3 py-2 rounded-lg border border-surface-border">
                        Scheduled
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Buying Guidelines Info box */}
      <div className="bg-surface-elevated border border-surface-border rounded-2xl p-5 flex items-start gap-4 max-w-3xl mx-auto">
        <ShieldCheck className="w-8 h-8 text-brand-gold flex-shrink-0" />
        <div className="text-xs text-text-muted space-y-1.5 leading-relaxed">
          <h4 className="font-semibold text-white uppercase tracking-wider text-[10px]">
            Fair Drop Rules & Bot Protection
          </h4>
          <p>
            To prevent botting and scaling scripts, we implement click delays and transaction limits. 
            All checkouts must occur manually. Users attempting to place multiple orders exceeding the 
            stated limit per account will have their orders automatically cancelled and payments refunded.
          </p>
        </div>
      </div>
    </div>
  )
}
