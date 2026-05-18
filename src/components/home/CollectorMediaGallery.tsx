'use client'

import { useState } from 'react'
import { VideoEmbed } from '@/components/ui/VideoEmbed'
import { MediaCard } from '@/components/ui/MediaCard'
import type { SocialGalleryItem } from '@/lib/types/media'

interface CollectorMediaGalleryProps {
  items: SocialGalleryItem[]
}

export function CollectorMediaGallery({ items }: CollectorMediaGalleryProps) {
  const [activeItem, setActiveItem] = useState<SocialGalleryItem | null>(null)
  
  if (!items || items.length === 0) return null

  return (
    <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-surface-base">
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-16">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-px w-8 bg-brand-red" />
          <span className="text-brand-red text-xs font-semibold tracking-widest uppercase">
            Collector Showcase
          </span>
          <div className="h-px w-8 bg-brand-red" />
        </div>
        <h2 className="font-display text-4xl sm:text-5xl text-white tracking-wide mb-4">
          COMMUNITY <span className="text-gradient">GALLERY</span>
        </h2>
        <p className="text-text-muted max-w-2xl mx-auto">
          See the latest drops in action. Tag us on Instagram or TikTok to be featured in the collector showcase.
        </p>
      </div>

      {/* Masonry Grid */}
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
        {items.map((item) => (
          <div key={item.id} className="break-inside-avoid">
            <MediaCard
              mediaType={item.platform === 'image' ? 'image' : (item.platform === 'youtube' ? 'youtube' : (item.platform === 'instagram' ? 'instagram' : (item.platform === 'tiktok' ? 'tiktok' : 'video')))}
              mediaUrl={item.media_url}
              thumbnailUrl={item.thumbnail_url}
              aspectRatio={item.aspect_ratio}
              title={item.title}
              onClick={() => setActiveItem(item)}
              className="w-full"
            />
          </div>
        ))}
      </div>

      {/* Lightbox / Video Player Modal */}
      {activeItem && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8"
          onClick={() => setActiveItem(null)}
          role="dialog"
          aria-modal="true"
        >
          <button
            className="absolute top-4 right-4 sm:top-8 sm:right-8 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all z-50"
            onClick={() => setActiveItem(null)}
            aria-label="Close"
          >
            <span className="text-xl">✕</span>
          </button>

          <div
            className="relative w-full max-w-5xl max-h-[90vh] flex flex-col lg:flex-row bg-surface-elevated rounded-2xl overflow-hidden shadow-2xl border border-surface-border"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Media Area */}
            <div className="flex-1 bg-black flex items-center justify-center relative">
              {activeItem.platform === 'image' ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={activeItem.media_url}
                  alt={activeItem.title || 'Community media'}
                  className="max-w-full max-h-[70vh] lg:max-h-[90vh] object-contain"
                />
              ) : (
                <div className="w-full p-4 lg:p-8 flex items-center justify-center">
                  <div className="w-full max-w-[400px] mx-auto">
                    {/* Render VideoEmbed inside a constrained container for vertical videos */}
                    <VideoEmbed
                      url={activeItem.media_url}
                      mediaType={activeItem.platform === 'youtube' ? 'youtube' : (activeItem.platform === 'instagram' ? 'instagram' : (activeItem.platform === 'tiktok' ? 'tiktok' : 'video'))}
                      aspectRatio={activeItem.aspect_ratio}
                      thumbnailUrl={activeItem.thumbnail_url}
                      title={activeItem.title ?? undefined}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Details Area */}
            {(activeItem.title || activeItem.description) && (
              <div className="w-full lg:w-80 p-6 flex flex-col bg-surface-card border-t lg:border-t-0 lg:border-l border-surface-border">
                {activeItem.title && (
                  <h3 className="font-display text-xl text-white mb-2">{activeItem.title}</h3>
                )}
                {activeItem.description && (
                  <p className="text-sm text-text-muted mb-6 whitespace-pre-wrap flex-1">
                    {activeItem.description}
                  </p>
                )}
                
                <a
                  href={activeItem.media_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto w-full py-3 rounded-lg border border-surface-border text-center text-sm font-semibold text-white hover:bg-surface-elevated hover:border-brand-red/50 transition-all"
                >
                  View Original Post
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
