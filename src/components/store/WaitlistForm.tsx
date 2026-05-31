'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Bell, CheckCircle2 } from 'lucide-react'
import { joinWaitlistAction } from '@/app/(store)/product/actions'

interface WaitlistFormProps {
  productId: number
  productTitle: string
}

export function WaitlistForm({ productId, productTitle }: WaitlistFormProps) {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isJoined, setIsJoined] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      await joinWaitlistAction(productId, email)
      setIsJoined(true)
    } catch (err: any) {
      setError(err.message || 'Failed to join waitlist')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isJoined) {
    return (
      <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center gap-3">
        <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
        <p className="text-sm text-green-400 font-medium">
          You're on the list! We'll notify you when {productTitle} is back.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-surface-elevated rounded-2xl border border-surface-border p-5">
      <div className="flex items-center gap-2 mb-3">
        <Bell className="w-4 h-4 text-brand-gold" />
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Back in Stock Notification</h3>
      </div>
      <p className="text-xs text-text-muted mb-4 leading-relaxed">
        This model is currently out of stock. Leave your email and we'll let you know as soon as it returns!
      </p>
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="w-full bg-surface-card border border-surface-border rounded-lg px-3 py-2 text-sm text-text-primary focus:border-brand-gold outline-none transition-colors"
          />
        </div>
        <Button 
          type="submit" 
          variant="primary" 
          size="sm" 
          isLoading={isSubmitting}
          className="bg-brand-gold hover:bg-brand-gold-light text-black border-none"
        >
          Notify Me
        </Button>
      </form>
      {error && <p className="text-[10px] text-red-400 mt-2">{error}</p>}
    </div>
  )
}
