'use client'

import { useState } from 'react'
import { ExternalLink, Play } from 'lucide-react'
import Image from 'next/image'
import type { MediaType, AspectRatio } from '@/lib/types/media'

interface VideoEmbedProps {
  url: string
  mediaType: MediaType
  aspectRatio?: AspectRatio
  title?: string
  thumbnailUrl?: string | null
  className?: string
}

/**
 * Extracts a YouTube video ID from any YouTube URL format.
 */
export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match?.[1]) return match[1]
  }
  return null
}

/**
 * Extracts an Instagram reel ID from a URL.
 */
export function extractInstagramId(url: string): string | null {
  const match = url.match(/instagram\.com\/reel\/([a-zA-Z0-9_-]+)/)
  return match?.[1] ?? null
}

/**
 * Auto-detects media type from a URL string.
 */
export function detectMediaType(url: string): MediaType {
  if (/youtube\.com|youtu\.be/.test(url)) return 'youtube'
  if (/instagram\.com\/reel/.test(url)) return 'instagram'
  if (/tiktok\.com/.test(url)) return 'tiktok'
  if (/\.(mp4|webm|ogg)(\?|$)/i.test(url)) return 'video'
  return 'image'
}

/**
 * Auto-detects aspect ratio from URL/type.
 */
export function detectAspectRatio(url: string, mediaType: MediaType): AspectRatio {
  if (mediaType === 'instagram') return '9:16'
  if (mediaType === 'youtube' && /shorts/.test(url)) return '9:16'
  if (mediaType === 'tiktok') return '9:16'
  return '16:9'
}

/** Maps AspectRatio to CSS padding-bottom for responsive containers */
const ratioPaddingMap: Record<AspectRatio, string> = {
  '16:9': '56.25%',
  '9:16': '177.78%',
  '1:1': '100%',
  '21:9': '42.86%',
}

/** Instagram SVG gradient icon */
function InstagramIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f09433" />
          <stop offset="25%" stopColor="#e6683c" />
          <stop offset="50%" stopColor="#dc2743" />
          <stop offset="75%" stopColor="#cc2366" />
          <stop offset="100%" stopColor="#bc1888" />
        </linearGradient>
      </defs>
      <path fill="url(#ig-grad)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  )
}

/** TikTok SVG icon */
function TikTokIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.22a8.27 8.27 0 004.83 1.54V7.32a4.85 4.85 0 01-1.06-.63z" />
    </svg>
  )
}

export function VideoEmbed({
  url,
  mediaType,
  aspectRatio = '16:9',
  title,
  thumbnailUrl,
  className = '',
}: VideoEmbedProps) {
  const [playing, setPlaying] = useState(false)

  // ── YouTube — native iframe embed, works perfectly ─────────────────────────
  if (mediaType === 'youtube') {
    const videoId = extractYouTubeId(url)
    if (!videoId) return <PlatformLinkCard url={url} platform="YouTube" />

    if (!playing && thumbnailUrl) {
      return (
        <button
          onClick={() => setPlaying(true)}
          className={`relative w-full rounded-xl overflow-hidden bg-black group ${className}`}
          style={{ paddingBottom: ratioPaddingMap[aspectRatio] }}
          aria-label="Play YouTube video"
        >
          <Image src={thumbnailUrl} alt={title ?? 'YouTube'} fill className="object-cover" />
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl">
              <Play className="w-7 h-7 text-white fill-white ml-1" />
            </div>
          </div>
        </button>
      )
    }

    return (
      <div
        className={`relative w-full rounded-xl overflow-hidden bg-black ${className}`}
        style={{ paddingBottom: ratioPaddingMap[aspectRatio] }}
      >
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
          title={title ?? 'YouTube video'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
        />
      </div>
    )
  }

  // ── Instagram — cannot be reliably embedded. Show beautiful preview card. ──
  if (mediaType === 'instagram') {
    return (
      <div className={`relative w-full rounded-xl overflow-hidden ${className}`}
        style={{ paddingBottom: ratioPaddingMap[aspectRatio] }}
      >
        {/* Thumbnail or gradient background */}
        {thumbnailUrl ? (
          <Image src={thumbnailUrl} alt={title ?? 'Instagram Reel'} fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#f09433] via-[#dc2743] to-[#bc1888]" />
        )}

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
          <InstagramIcon size={48} />
          <div>
            {title && <p className="text-white font-semibold text-sm mb-1 line-clamp-2">{title}</p>}
            <p className="text-white/70 text-xs">Instagram Reel</p>
          </div>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors shadow-lg"
          >
            <Play className="w-4 h-4 fill-black" />
            Watch Reel
          </a>
        </div>
      </div>
    )
  }

  // ── TikTok — same approach as Instagram, stylish card ─────────────────────
  if (mediaType === 'tiktok') {
    return (
      <div
        className={`relative w-full rounded-xl overflow-hidden ${className}`}
        style={{ paddingBottom: ratioPaddingMap[aspectRatio] }}
      >
        {thumbnailUrl ? (
          <Image src={thumbnailUrl} alt={title ?? 'TikTok'} fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 bg-black" />
        )}
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">
            <TikTokIcon size={32} />
          </div>
          {title && <p className="text-white font-semibold text-sm line-clamp-2">{title}</p>}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors shadow-lg"
          >
            <Play className="w-4 h-4 fill-black" />
            Watch on TikTok
          </a>
        </div>
      </div>
    )
  }

  // ── Direct MP4 / WebM ──────────────────────────────────────────────────────
  if (mediaType === 'video') {
    return (
      <div
        className={`relative w-full rounded-xl overflow-hidden bg-black ${className}`}
        style={{ paddingBottom: ratioPaddingMap[aspectRatio] }}
      >
        {!playing ? (
          <button
            onClick={() => setPlaying(true)}
            className="absolute inset-0 w-full h-full flex items-center justify-center bg-black/40 group"
            aria-label="Play video"
          >
            {thumbnailUrl && <Image src={thumbnailUrl} alt={title ?? 'Video'} fill className="object-cover" />}
            <div className="relative w-14 h-14 rounded-full bg-brand-red/90 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-brand-red/40">
              <Play className="w-6 h-6 text-white fill-white ml-0.5" />
            </div>
          </button>
        ) : (
          <video
            src={url}
            controls
            autoPlay
            className="absolute inset-0 w-full h-full object-contain"
          />
        )}
      </div>
    )
  }

  return null
}

/** Fallback link card for broken/unsupported URLs */
function PlatformLinkCard({ url, platform }: { url: string; platform: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 p-3 rounded-lg border border-surface-border text-text-muted hover:text-white hover:border-brand-red/50 transition-colors text-xs"
    >
      <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
      Open on {platform}
    </a>
  )
}
