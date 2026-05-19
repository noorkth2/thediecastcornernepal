'use client'

import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'

export function ReservationTimer({ expiresAt }: { expiresAt: string }) {
  const [timeLeft, setTimeLeft] = useState('')
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    const target = new Date(expiresAt).getTime()
    
    const interval = setInterval(() => {
      const now = new Date().getTime()
      const diff = target - now
      
      if (diff <= 0) {
        setIsExpired(true)
        setTimeLeft('Expired')
        clearInterval(interval)
      } else {
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)
        setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`)
      }
    }, 1000)
    
    return () => clearInterval(interval)
  }, [expiresAt])

  if (isExpired) {
    return (
      <div className="flex items-center gap-1 mt-1 text-[10px] uppercase font-bold tracking-wider text-red-500">
        <Clock className="w-3 h-3" />
        Reservation Expired
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1 mt-1 text-[10px] uppercase font-bold tracking-wider text-brand-gold">
      <Clock className="w-3 h-3" />
      Reserved: {timeLeft}
    </div>
  )
}
