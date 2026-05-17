'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ProductImage } from '@/lib/types'

interface ProductGalleryProps {
  images: ProductImage[]
  title: string
  imageUrlFallback?: string | null
}

export function ProductGallery({ images, title, imageUrlFallback }: ProductGalleryProps) {
  // If product_images table is empty but image_url exists on the product, use it
  const effectiveImages: ProductImage[] =
    images.length > 0
      ? images
      : imageUrlFallback
      ? [{ id: -1, product_id: -1, image_url: imageUrlFallback, alt_text: title, orientation: 'square', sort_order: 1, is_primary: true }]
      : []

  const [activeIdx, setActiveIdx] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  if (!effectiveImages.length) {
    return (
      <div className="w-full h-[420px] bg-surface-elevated rounded-xl flex items-center justify-center">
        <span className="text-text-faint text-sm">No images available</span>
      </div>
    )
  }

  const activeImage = effectiveImages[activeIdx] ?? effectiveImages[0]

  const prev = () => setActiveIdx((i) => (i - 1 + effectiveImages.length) % effectiveImages.length)
  const next = () => setActiveIdx((i) => (i + 1) % effectiveImages.length)

  return (
    <>
      {/* Main image */}
      <div className="space-y-3">
        <div
          className="relative w-full h-[380px] sm:h-[420px] bg-[#1a1a1a] rounded-xl overflow-hidden group cursor-zoom-in flex items-center justify-center border border-surface-border"
          onClick={() => setLightboxOpen(true)}
          role="button"
          aria-label="Open image lightbox"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setLightboxOpen(true)}
        >
          <Image
            src={activeImage.image_url}
            alt={activeImage.alt_text ?? title}
            fill
            className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
            priority
            sizes="(max-width: 1024px) 100vw, 55vw"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="bg-black/50 rounded-full p-2 backdrop-blur-sm">
              <ZoomIn className="w-5 h-5 text-white" />
            </div>
          </div>

          {/* Arrow nav (only if multiple images) */}
          {effectiveImages.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev() }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/80 transition-colors opacity-0 group-hover:opacity-100"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next() }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/80 transition-colors opacity-0 group-hover:opacity-100"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {effectiveImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {effectiveImages.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setActiveIdx(i)}
                className={cn(
                  'relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200',
                  i === activeIdx
                    ? 'border-brand-red'
                    : 'border-surface-border hover:border-surface-elevated'
                )}
                aria-label={`View image ${i + 1}`}
                aria-pressed={i === activeIdx}
              >
                <Image
                  src={img.image_url}
                  alt={img.alt_text ?? `${title} image ${i + 1}`}
                  fill
                  className="object-contain p-1 bg-[#1a1a1a]"
                  sizes="64px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Product image lightbox"
        >
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white text-2xl"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close lightbox"
          >
            ✕
          </button>

          {effectiveImages.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev() }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next() }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <div
            className="relative w-full max-w-3xl max-h-[80vh]"
            style={{ aspectRatio: '4/3' }}
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={activeImage.image_url}
              alt={activeImage.alt_text ?? title}
              fill
              className="object-contain"
              sizes="90vw"
            />
          </div>

          {/* Dot indicators */}
          {effectiveImages.length > 1 && (
            <div className="absolute bottom-6 flex gap-2">
              {effectiveImages.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setActiveIdx(i) }}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === activeIdx ? 'bg-white' : 'bg-white/30'
                  }`}
                  aria-label={`Image ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}
