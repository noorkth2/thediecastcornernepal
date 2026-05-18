'use client'

import { useState, useEffect, useCallback } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { BannerSlide } from './BannerSlide'
import { HeroSection } from './HeroSection'
import type { FeaturedBanner } from '@/lib/types/media'
import { cn } from '@/lib/utils'

interface BannerCarouselProps {
  banners: FeaturedBanner[]
}

export function BannerCarousel({ banners }: BannerCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' }, [
    Autoplay({ delay: 6000, stopOnInteraction: true, stopOnMouseEnter: true }),
  ])
  const [selectedIndex, setSelectedIndex] = useState(0)

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi])
  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
  }, [emblaApi, onSelect])

  // Total slides = 1 (default hero) + number of custom banners
  const totalSlides = 1 + (banners?.length || 0)

  return (
    <section className="relative w-full min-h-[92vh] bg-surface-base overflow-hidden group">
      <div className="w-full h-full" ref={emblaRef}>
        <div className="flex touch-pan-y h-full">
          {/* Slide 0: The Original Fallback Hero Section */}
          <div className="flex-[0_0_100%] min-w-0 h-full relative">
            <HeroSection isActive={selectedIndex === 0} />
          </div>

          {/* Dynamic Banners */}
          {banners?.map((banner, index) => (
            <div key={banner.id} className="flex-[0_0_100%] min-w-0 h-full relative">
              <BannerSlide banner={banner} isActive={index + 1 === selectedIndex} />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      {totalSlides > 1 && (
        <>
          <button
            onClick={scrollPrev}
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/20 backdrop-blur-md border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-black/60 hover:scale-105 active:scale-95 z-20"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/20 backdrop-blur-md border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-black/60 hover:scale-105 active:scale-95 z-20"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Pagination Dots */}
      {totalSlides > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-30">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={cn(
                'w-12 h-1.5 rounded-full transition-all duration-300',
                index === selectedIndex
                  ? 'bg-brand-red w-16 shadow-[0_0_10px_rgba(192,57,43,0.8)]'
                  : 'bg-white/30 hover:bg-white/50'
              )}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === selectedIndex ? 'true' : 'false'}
            />
          ))}
        </div>
      )}
    </section>
  )
}
