'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowRight, Zap, Star, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function HeroSection() {
  const headlineRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const el = headlineRef.current
    if (!el) return
    el.style.opacity = '0'
    el.style.transform = 'translateY(40px)'
    requestAnimationFrame(() => {
      el.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out'
      el.style.opacity = '1'
      el.style.transform = 'translateY(0)'
    })
  }, [])

  return (
    <section
      className="relative min-h-[92vh] flex items-center overflow-hidden bg-hero-gradient"
      aria-label="Hero section"
    >
      {/* Animated background grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(192,57,43,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(192,57,43,0.5) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Speed lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute h-px bg-gradient-to-r from-transparent via-brand-red/30 to-transparent"
            style={{
              top: `${15 + i * 14}%`,
              left: 0,
              right: 0,
              animationDelay: `${i * 0.4}s`,
              animation: 'speedLine 3s ease-in-out infinite',
            }}
          />
        ))}
      </div>

      {/* Red glow */}
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-brand-red/8 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-3xl">
          {/* Eyebrow */}
          <div className="flex items-center gap-2 mb-6">
            <div className="h-px w-12 bg-brand-red" />
            <span className="text-brand-red text-sm font-semibold tracking-widest uppercase">
              Nepal&apos;s #1 Diecast Store
            </span>
          </div>

          {/* Headline */}
          <h1
            ref={headlineRef}
            className="font-display text-6xl sm:text-7xl lg:text-8xl text-white leading-none tracking-wide mb-6"
          >
            COLLECT THE
            <span className="block text-gradient">IMPOSSIBLE</span>
          </h1>

          <p className="text-text-muted text-lg leading-relaxed mb-10 max-w-xl">
            Hot Wheels Treasure Hunts, MiniGT Supercar replicas, Tomica 
            exclusives — curated diecast collectibles delivered across Nepal.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-wrap gap-4">
            <Button variant="primary" size="lg" asChild>
              <Link href="/shop" id="hero-shop-btn">
                Shop Now <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/treasure-hunt" id="hero-th-btn">
                <Star className="w-5 h-5 text-brand-gold" />
                Treasure Hunts
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-8 mt-14 pt-10 border-t border-surface-border/60">
            {[
              { icon: Trophy, label: 'Brands', value: '15+' },
              { icon: Star, label: 'Products', value: '500+' },
              { icon: Zap, label: 'Happy Collectors', value: '1,000+' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-brand-red/10 border border-brand-red/20 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-brand-red" />
                </div>
                <div>
                  <div className="font-display text-2xl text-white leading-none">
                    {value}
                  </div>
                  <div className="text-text-faint text-xs mt-0.5">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-surface-base to-transparent" />
    </section>
  )
}
