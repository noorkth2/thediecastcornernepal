'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { FeaturedBanner } from '@/lib/types/media'

interface BannerSlideProps {
  banner: FeaturedBanner
  isActive: boolean
}

export function BannerSlide({ banner, isActive }: BannerSlideProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })

  /** Subtle parallax tilt on mouse movement — hardware accelerated via transform */
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current
    if (!el) return
    const { left, top, width, height } = el.getBoundingClientRect()
    const x = ((e.clientX - left) / width - 0.5) * 6
    const y = ((e.clientY - top) / height - 0.5) * -6
    setTilt({ x, y })
  }

  const handleMouseLeave = () => setTilt({ x: 0, y: 0 })

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-full min-h-[92vh] overflow-hidden flex-shrink-0"
      style={{ willChange: 'transform' }}
    >
      {/* Background image with subtle parallax scale */}
      {banner.image_url ? (
        <Image
          src={banner.image_url}
          alt={banner.title}
          fill
          priority
          className="object-cover transition-transform duration-700 ease-out"
          style={{
            transform: `scale(1.05) translate(${tilt.x * 0.5}px, ${tilt.y * 0.5}px)`,
          }}
          sizes="100vw"
        />
      ) : (
        // Gradient fallback when no image is set
        <div className="absolute inset-0 bg-gradient-to-br from-surface-elevated via-surface-base to-black" />
      )}

      {/* Multi-layer cinematic overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      {/* Animated ambient glow blob */}
      <div
        className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(192,57,43,0.15) 0%, transparent 70%)',
          animation: 'pulse 4s ease-in-out infinite',
          transform: `translate(${tilt.x * 2}px, ${tilt.y * 2}px)`,
          transition: 'transform 0.2s ease-out',
        }}
      />

      {/* Subtle animated grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(192,57,43,0.8) 1px, transparent 1px),
            linear-gradient(90deg, rgba(192,57,43,0.8) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Content */}
      <div
        className="absolute inset-0 z-10 flex flex-col justify-end pb-24 sm:pb-32 px-8 sm:px-16 lg:px-24 max-w-3xl pointer-events-none"
        style={{
          transform: `translate(${tilt.x * -0.3}px, ${tilt.y * -0.3}px)`,
          transition: 'transform 0.2s ease-out',
        }}
      >
        {/* We need to re-enable pointer events on the inner content wrapper so the button is clickable */}
        <div className="pointer-events-auto w-full">
        {/* Badge */}
        {banner.badge && (
          <div
            className="inline-flex items-center gap-1.5 mb-4 self-start"
            style={{
              opacity: isActive ? 1 : 0,
              transform: isActive ? 'translateY(0)' : 'translateY(12px)',
              transition: 'opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s',
            }}
          >
            <span className="badge-limited text-xs tracking-widest">{banner.badge}</span>
          </div>
        )}

        {/* Title */}
        <h2
          className="font-display text-4xl sm:text-5xl lg:text-6xl text-white leading-none tracking-wide mb-3"
          style={{
            opacity: isActive ? 1 : 0,
            transform: isActive ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s',
          }}
        >
          {banner.title}
        </h2>

        {/* Subtitle */}
        {banner.subtitle && (
          <p
            className="text-brand-gold font-semibold text-lg tracking-widest uppercase mb-3"
            style={{
              opacity: isActive ? 1 : 0,
              transform: isActive ? 'translateY(0)' : 'translateY(20px)',
              transition: 'opacity 0.6s ease 0.3s, transform 0.6s ease 0.3s',
            }}
          >
            {banner.subtitle}
          </p>
        )}

        {/* Description */}
        {banner.description && (
          <p
            className="text-text-muted text-base leading-relaxed mb-8 max-w-md"
            style={{
              opacity: isActive ? 1 : 0,
              transform: isActive ? 'translateY(0)' : 'translateY(20px)',
              transition: 'opacity 0.6s ease 0.4s, transform 0.6s ease 0.4s',
            }}
          >
            {banner.description}
          </p>
        )}

        {/* CTA Button */}
        {banner.button_text && banner.button_link && (
          <div
            style={{
              opacity: isActive ? 1 : 0,
              transform: isActive ? 'translateY(0)' : 'translateY(20px)',
              transition: 'opacity 0.6s ease 0.5s, transform 0.6s ease 0.5s',
            }}
          >
            <Link
              href={banner.button_link}
              className="group inline-flex items-center gap-2 bg-brand-red hover:bg-brand-red-light text-white font-semibold px-7 py-3 rounded-lg transition-all duration-200 active:scale-95 shadow-lg shadow-brand-red/30 hover:shadow-brand-red/50"
            >
              {banner.button_text}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        )}
        </div>
      </div>

      {/* Bottom speed-line accent */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-red/60 to-transparent" />
    </div>
  )
}
