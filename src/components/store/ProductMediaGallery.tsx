'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, ZoomIn, Play } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ProductImage } from '@/lib/types'
import type { ProductMedia } from '@/lib/types/media'
import { VideoEmbed } from '@/components/ui/VideoEmbed'

// Custom YouTube Icon to avoid missing export issues with older lucide-react versions
function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M2.25 8.005C2.25 5.518 4.267 3.5 6.755 3.5h10.49c2.488 0 4.505 2.018 4.505 4.505v7.99C21.75 18.482 19.733 20.5 17.245 20.5H6.755C4.267 20.5 2.25 18.482 2.25 15.995v-7.99z" />
      <path d="M9.75 15.75v-7.5l6.5 3.75-6.5 3.75z" fill="currentColor" />
    </svg>
  )
}

interface ProductMediaGalleryProps {
  images: ProductImage[]
  media: ProductMedia[]
  title: string
  imageUrlFallback?: string | null
}

type GalleryItem =
  | { type: 'image'; id: string; url: string; alt: string; order: number }
  | { type: 'video' | 'youtube' | 'instagram' | 'tiktok'; id: string; url: string; thumb: string | null; alt: string; order: number; ratio: string }

export function ProductMediaGallery({ images, media, title, imageUrlFallback }: ProductMediaGalleryProps) {
  // Normalize everything into a unified array of GalleryItems
  const unifiedMedia: GalleryItem[] = []

  // Add existing product_images
  images.forEach(img => {
    unifiedMedia.push({
      type: 'image',
      id: `img-${img.id}`,
      url: img.image_url,
      alt: img.alt_text ?? title,
      order: img.sort_order
    })
  })

  // Fallback if no images
  if (unifiedMedia.length === 0 && imageUrlFallback) {
    unifiedMedia.push({
      type: 'image',
      id: 'img-fallback',
      url: imageUrlFallback,
      alt: title,
      order: 1
    })
  }

  // Add new rich media
  media.forEach(m => {
    if (m.media_type === 'image') {
      unifiedMedia.push({
        type: 'image',
        id: `media-${m.id}`,
        url: m.media_url,
        alt: m.caption ?? title,
        order: m.sort_order + 100 // push rich media after standard images by default, unless sorting is managed globally
      })
    } else {
      unifiedMedia.push({
        type: m.media_type as any,
        id: `media-${m.id}`,
        url: m.media_url,
        thumb: m.thumbnail_url,
        alt: m.caption ?? title,
        order: m.sort_order + 100,
        ratio: m.aspect_ratio
      })
    }
  })

  unifiedMedia.sort((a, b) => a.order - b.order)

  const [activeIdx, setActiveIdx] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  if (!unifiedMedia.length) {
    return (
      <div className="w-full h-[420px] bg-surface-elevated rounded-xl flex items-center justify-center border border-surface-border">
        <span className="text-text-faint text-sm">No media available</span>
      </div>
    )
  }

  const activeItem = unifiedMedia[activeIdx] ?? unifiedMedia[0]

  const prev = () => setActiveIdx((i) => (i - 1 + unifiedMedia.length) % unifiedMedia.length)
  const next = () => setActiveIdx((i) => (i + 1) % unifiedMedia.length)

  return (
    <>
      {/* Main viewer */}
      <div className="space-y-3">
        <div
          className={cn(
            "relative w-full bg-[#1a1a1a] rounded-xl overflow-hidden group border border-surface-border flex items-center justify-center",
            activeItem.type === 'image' ? "h-[380px] sm:h-[420px] cursor-zoom-in" : "min-h-[380px]"
          )}
          onClick={() => activeItem.type === 'image' && setLightboxOpen(true)}
        >
          {activeItem.type === 'image' ? (
            <>
              <Image
                src={activeItem.url}
                alt={activeItem.alt}
                fill
                className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                priority
                sizes="(max-width: 1024px) 100vw, 55vw"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                <div className="bg-black/50 rounded-full p-2 backdrop-blur-sm">
                  <ZoomIn className="w-5 h-5 text-white" />
                </div>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center p-4">
              <div className="w-full max-w-[400px]">
                <VideoEmbed
                  url={activeItem.url}
                  mediaType={activeItem.type as any}
                  aspectRatio={activeItem.ratio as any}
                />
              </div>
            </div>
          )}

          {/* Arrow nav (only if multiple media items) */}
          {unifiedMedia.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev() }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/80 transition-colors opacity-0 group-hover:opacity-100 z-10"
                aria-label="Previous media"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next() }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/80 transition-colors opacity-0 group-hover:opacity-100 z-10"
                aria-label="Next media"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnails strip */}
        {unifiedMedia.length > 1 && (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {unifiedMedia.map((item, i) => {
              const isVideo = item.type !== 'image'
              const thumbUrl = item.type === 'image' ? item.url : (item.thumb ?? '/placeholder-car.jpg') // fallback if no thumb

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveIdx(i)}
                  className={cn(
                    'relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 bg-[#1a1a1a]',
                    i === activeIdx
                      ? 'border-brand-red'
                      : 'border-surface-border hover:border-surface-elevated'
                  )}
                  aria-label={`View media ${i + 1}`}
                  aria-pressed={i === activeIdx}
                >
                  <Image
                    src={thumbUrl}
                    alt={item.alt}
                    fill
                    className="object-cover opacity-80 hover:opacity-100 transition-opacity"
                    sizes="64px"
                  />
                  {isVideo && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      {item.type === 'youtube' ? (
                        <YoutubeIcon className="w-6 h-6 text-brand-red drop-shadow-md" />
                      ) : (
                        <Play className="w-5 h-5 text-white drop-shadow-md fill-white" />
                      )}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Lightbox for Images Only */}
      {lightboxOpen && activeItem.type === 'image' && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white text-2xl z-50"
            onClick={() => setLightboxOpen(false)}
          >
            ✕
          </button>

          {unifiedMedia.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev() }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-50"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next() }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-50"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <div className="relative w-full max-w-5xl h-[80vh]" onClick={(e) => e.stopPropagation()}>
            <Image
              src={activeItem.url}
              alt={activeItem.alt}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>

          <div className="absolute bottom-6 flex gap-2 z-50">
            {unifiedMedia.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setActiveIdx(i) }}
                className={`w-2 h-2 rounded-full transition-colors ${i === activeIdx ? 'bg-white' : 'bg-white/30'}`}
              />
            ))}
          </div>
        </div>
      )}
    </>
  )
}
