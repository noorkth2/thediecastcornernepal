'use client'

import { useEffect, useState } from 'react'

interface DropCountdownProps {
  targetDate: string
  onComplete?: () => void
  label?: string
}

export function DropCountdown({ targetDate, onComplete, label }: DropCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number
    hours: number
    minutes: number
    seconds: number
  } | null>(null)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date()
      if (difference <= 0) {
        setTimeLeft(null)
        onComplete?.()
        return
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      })
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [targetDate, onComplete])

  if (!timeLeft) {
    return (
      <div className="text-center font-display text-2xl text-brand-red animate-pulse tracking-wider py-2 uppercase">
        DROP GOING LIVE NOW!
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center">
      {label && (
        <span className="text-[10px] text-text-muted uppercase tracking-widest mb-2.5 font-bold">
          {label}
        </span>
      )}
      <div className="flex gap-3 text-center font-mono">
        {[
          { label: 'd', value: timeLeft.days },
          { label: 'h', value: timeLeft.hours },
          { label: 'm', value: timeLeft.minutes },
          { label: 's', value: timeLeft.seconds },
        ].map(({ label: unit, value }) => (
          <div key={unit} className="flex flex-col">
            <div className="bg-surface-elevated border border-surface-border text-white text-xl md:text-2xl font-bold w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center shadow-lg shadow-black/20">
              {String(value).padStart(2, '0')}
            </div>
            <span className="text-[9px] text-text-faint uppercase font-bold mt-1.5">
              {unit}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
