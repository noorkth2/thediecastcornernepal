'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface AnnouncementBarProps {
  text?: string
  isActive?: boolean
}

const DEFAULT_TEXT =
  '🚗 FREE SHIPPING on orders above Rs. 2,000 · 🏆 Nepal\'s #1 Diecast Store · 🔥 New Arrivals Every Week · 🎯 Exclusive Treasure Hunts In Stock · 🚗 FREE SHIPPING on orders above Rs. 2,000 · 🏆 Nepal\'s #1 Diecast Store · 🔥 New Arrivals Every Week · 🎯 Exclusive Treasure Hunts In Stock'

export function AnnouncementBar({ text, isActive = true }: AnnouncementBarProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible((v) => (v ? v : true))
  }, [])

  if (!isActive || !visible) return null

  const content = text ? `${text} · ${text} · ${text}` : DEFAULT_TEXT

  return (
    <div
      className="bg-brand-red text-white text-xs font-medium py-2 overflow-hidden"
      role="marquee"
      aria-label="Site announcements"
    >
      <div className="flex whitespace-nowrap">
        <span className="animate-marquee inline-block pr-8">{content}</span>
        <span className="animate-marquee inline-block pr-8" aria-hidden="true">
          {content}
        </span>
      </div>
    </div>
  )
}
