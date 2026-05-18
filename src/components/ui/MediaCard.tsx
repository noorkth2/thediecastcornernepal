'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Play, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MediaType, AspectRatio } from '@/lib/types/media'
import { VideoEmbed } from '@/components/ui/VideoEmbed'

interface MediaCardProps {
  mediaType: MediaType
  mediaUrl: string
  thumbnailUrl?: string | null
  aspectRatio?: AspectRatio
  title?: string | null
  className?: string
  onClick?: () => void
}

/** Maps AspectRatio to a Tailwind aspect-ratio class */
const ratioClassMap: Record<AspectRatio, string> = {
  '16:9': 'aspect-video',
  '9:16': 'aspect-[9/16]',
  '1:1': 'aspect-square',
  '21:9': 'aspect-[21/9]',
}

/** Returns a small platform badge icon */
function PlatformBadge({ type }: { type: MediaType }) {
  if (type === 'youtube') return (
    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-red-500" aria-hidden>
      <path d="M23.5 6.19a3 3 0 00-2.11-2.12C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.39.57A3 3 0 00.5 6.19C0 8.04 0 12 0 12s0 3.96.5 5.81a3 3 0 002.11 2.12C4.46 20.5 12 20.5 12 20.5s7.54 0 9.39-.57a3 3 0 002.11-2.12C24 15.96 24 12 24 12s0-3.96-.5-5.81zM9.75 15.5v-7l6.5 3.5-6.5 3.5z" />
    </svg>
  )
  if (type === 'instagram') return (
    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-pink-500" aria-hidden>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  )
  if (type === 'tiktok') return (
    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-white" aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.22a8.27 8.27 0 004.83 1.54V7.32a4.85 4.85 0 01-1.06-.63z" />
    </svg>
  )
  if (type === 'video') return <Play className="w-3.5 h-3.5 text-blue-400" />
  return <ImageIcon className="w-3.5 h-3.5 text-text-muted" />
}

export function MediaCard({
  mediaType,
  mediaUrl,
  thumbnailUrl,
  aspectRatio = '16:9',
  title,
  className,
  onClick,
}: MediaCardProps) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current
    if (!card) return
    const { left, top, width, height } = card.getBoundingClientRect()
    const x = ((e.clientX - left) / width - 0.5) * 8
    const y = ((e.clientY - top) / height - 0.5) * -8
    setTilt({ x, y })
  }

  const handleMouseLeave = () => setTilt({ x: 0, y: 0 })

  const isVideo = mediaType !== 'image'
  // For videos without thumbnail, render the VideoEmbed inline (YouTube/direct video),
  // or for Instagram/TikTok the VideoEmbed itself renders a beautiful styled card.
  const hasCustomThumbnail = !!thumbnailUrl
  const showInlineEmbed = isVideo && !hasCustomThumbnail
  const displayImage = hasCustomThumbnail ? thumbnailUrl : (mediaType === 'image' ? mediaUrl : null)

  return (
    <div
      ref={cardRef}
      onClick={showInlineEmbed ? undefined : onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'relative group rounded-xl overflow-hidden border border-surface-border bg-surface-elevated',
        showInlineEmbed ? '' : 'cursor-pointer',
        'transition-all duration-300',
        'hover:border-brand-red/40 hover:shadow-xl hover:shadow-brand-red/10',
        ratioClassMap[aspectRatio],
        className
      )}
      style={{
        transform: showInlineEmbed
          ? undefined
          : `perspective(800px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
        transition: 'transform 0.15s ease-out, box-shadow 0.3s ease-out',
      }}
    >
      {/* If we have no thumbnail and it's a video — render embed/styled card directly */}
      {showInlineEmbed ? (
        <div className="absolute inset-0">
          <VideoEmbed
            url={mediaUrl}
            mediaType={mediaType}
            aspectRatio={aspectRatio}
            thumbnailUrl={thumbnailUrl}
            title={title ?? undefined}
            className="w-full h-full"
          />
        </div>
      ) : (
        <>
          {/* Thumbnail or plain image */}
          {displayImage && (
            <Image
              src={displayImage}
              alt={title ?? 'Media'}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          )}

          {/* Dark overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

          {/* Play button for videos with thumbnail */}
          {isVideo && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-12 h-12 rounded-full bg-brand-red/90 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-brand-red/30 opacity-90 group-hover:opacity-100">
                <Play className="w-5 h-5 text-white fill-white ml-0.5" />
              </div>
            </div>
          )}
        </>
      )}

      {/* Platform badge — always visible in top-left */}
      <div className="absolute top-2 left-2 z-20 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded px-1.5 py-0.5 pointer-events-none">
        <PlatformBadge type={mediaType} />
      </div>

      {/* Title on hover — only if thumbnail-based card */}
      {title && !showInlineEmbed && (
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none">
          <p className="text-xs font-medium text-white line-clamp-2">{title}</p>
        </div>
      )}

      {/* Glow ring */}
      <div className="absolute inset-0 rounded-xl ring-0 group-hover:ring-1 group-hover:ring-brand-red/30 transition-all duration-300 pointer-events-none" />
    </div>
  )
}
