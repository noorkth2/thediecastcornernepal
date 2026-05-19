'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface CountdownTimerProps {
  targetDate: string | Date
  onComplete?: () => void
  className?: string
  label?: string
}

export function CountdownTimer({
  targetDate,
  onComplete,
  className,
  label,
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number
    hours: number
    minutes: number
    seconds: number
  } | null>(null)

  useEffect(() => {
    const target = new Date(targetDate).getTime()

    const updateTimer = () => {
      const now = new Date().getTime()
      const difference = target - now

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        onComplete?.()
        return true
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      })
      return false
    }

    // Run once immediately
    if (updateTimer()) return

    const interval = setInterval(() => {
      if (updateTimer()) clearInterval(interval)
    }, 1000)

    return () => clearInterval(interval)
  }, [targetDate, onComplete])

  if (!timeLeft) {
    return <div className={cn("animate-pulse h-10 bg-surface-elevated rounded-lg", className)} />
  }

  return (
    <div className={cn("flex flex-col items-center", className)}>
      {label && <span className="text-xs text-text-muted uppercase tracking-widest mb-2 font-semibold">{label}</span>}
      <div className="flex items-center gap-2 md:gap-4">
        <TimeUnit value={timeLeft.days} label="Days" />
        <span className="text-text-muted font-bold text-xl pb-5">:</span>
        <TimeUnit value={timeLeft.hours} label="Hours" />
        <span className="text-text-muted font-bold text-xl pb-5">:</span>
        <TimeUnit value={timeLeft.minutes} label="Mins" />
        <span className="text-text-muted font-bold text-xl pb-5">:</span>
        <TimeUnit value={timeLeft.seconds} label="Secs" />
      </div>
    </div>
  )
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-12 h-14 md:w-16 md:h-16 flex items-center justify-center bg-surface-elevated border border-surface-border rounded-lg shadow-inner mb-1">
        <span className="text-xl md:text-2xl font-display text-white tracking-wider">
          {value.toString().padStart(2, '0')}
        </span>
      </div>
      <span className="text-[10px] md:text-xs text-text-faint uppercase tracking-wider">{label}</span>
    </div>
  )
}
