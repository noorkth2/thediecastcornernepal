'use client'

import { useEffect, useState } from 'react'
import { DropCountdown } from '@/components/store/DropCountdown'
import { Hourglass, Users, Info, ShieldCheck, ExternalLink } from 'lucide-react'
import Image from 'next/image'
import { getPrimaryImage } from '@/lib/utils'

interface WaitingRoomClientProps {
  drop: any
  product: any
}

export function WaitingRoomClient({ drop, product }: WaitingRoomClientProps) {
  const primaryImage = getPrimaryImage(product.images, product.image_url)

  // Mock queue position details that dynamically tick down slightly
  const [queuePosition, setQueuePosition] = useState<number>(() => 
    Math.floor(Math.random() * (180 - 45 + 1) + 45)
  )

  useEffect(() => {
    const interval = setInterval(() => {
      setQueuePosition((prev) => {
        if (prev <= 1) return 1
        const delta = Math.floor(Math.random() * 3) + 1
        return Math.max(prev - delta, 1)
      })
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  const handleCountdownFinished = () => {
    // Drop is live! Redirect to detail page
    setTimeout(() => {
      window.location.href = `/drop/${drop.id}`
    }, 1000)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-8">
      {/* Waiting Room Header */}
      <div className="space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-brand-orange text-xs font-semibold uppercase animate-pulse">
          <Hourglass className="w-3.5 h-3.5" /> Waiting Room Active
        </span>
        <h1 className="font-display text-4xl text-white tracking-wide uppercase mt-2">
          {drop.drop_name}
        </h1>
        <p className="text-text-muted text-sm max-w-md mx-auto">
          The queue is open. Stay on this page. You will automatically redirect when the drop goes live.
        </p>
      </div>

      {/* Countdown Card */}
      <div className="bg-surface-card border border-surface-border rounded-2xl p-8 max-w-md mx-auto shadow-2xl relative overflow-hidden product-card-top-bar">
        <DropCountdown
          targetDate={drop.drops_at}
          onComplete={handleCountdownFinished}
          label="TIME UNTIL LAUNCH"
        />

        {/* Dynamic Queue Position */}
        <div className="mt-8 pt-6 border-t border-surface-border flex items-center justify-center gap-6">
          <div className="flex items-center gap-2 text-text-muted">
            <Users className="w-5 h-5 text-brand-gold" />
            <span className="text-xs font-semibold uppercase tracking-wider">Queue Position</span>
          </div>
          <span className="text-xl font-mono font-bold text-brand-gold animate-bounce">
            #{queuePosition}
          </span>
        </div>
      </div>

      {/* Preview of item */}
      <div className="bg-surface-card/50 border border-surface-border rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 max-w-lg mx-auto">
        <div className="relative aspect-square w-24 bg-surface-base border border-surface-border rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
          <Image
            src={primaryImage}
            alt={product.title}
            fill
            className="object-contain p-2"
            sizes="96px"
          />
        </div>
        <div className="text-left min-w-0">
          <span className="text-[10px] text-text-faint uppercase font-bold tracking-widest block">Featured Model</span>
          <h3 className="text-sm font-bold text-white truncate mt-0.5">{product.title}</h3>
          <p className="text-[10px] text-text-muted mt-0.5 uppercase tracking-wider font-semibold">
            {product.brand} · {product.scale}
          </p>
        </div>
      </div>

      {/* Guidelines info */}
      <div className="bg-surface-elevated/40 border border-surface-border rounded-2xl p-5 text-left max-w-lg mx-auto space-y-3">
        <div className="flex items-center gap-2 text-text-primary text-xs font-semibold">
          <Info className="w-4 h-4 text-brand-gold" />
          <span>IMPORTANT PREPARATION</span>
        </div>
        <ul className="text-xs text-text-muted space-y-2 list-disc pl-4 leading-relaxed">
          <li>Do not refresh this page. Doing so may reset your queue position.</li>
          <li>Ensure your internet connection is stable.</li>
          <li>An anti-bot delay will verify human presence before checkout activates.</li>
          <li>Items added to cart will reserve stock for exactly 15 minutes.</li>
        </ul>
      </div>
    </div>
  )
}
