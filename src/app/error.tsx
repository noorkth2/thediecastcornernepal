'use client'

import { useEffect } from 'react'
import { RefreshCcw, Home, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Unhandled Error:', error)
  }, [error])

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-20 h-20 bg-brand-gold/10 rounded-2xl flex items-center justify-center mb-6 rotate-3">
        <Wrench className="w-10 h-10 text-brand-gold" />
      </div>

      <h1 className="font-display text-4xl text-white tracking-widest mb-4 uppercase">System Malfunction</h1>
      <h2 className="text-lg text-text-muted mb-8 max-w-lg mx-auto leading-relaxed">
        Our engines have stalled unexpectedly. Our team has been notified and we're working to get the site back on track.
      </h2>
      
      {process.env.NODE_ENV !== 'production' && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-8 text-left max-w-2xl overflow-auto">
          <p className="text-red-400 font-mono text-xs whitespace-pre-wrap">{error.message}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          onClick={() => reset()}
          variant="primary" 
          className="bg-brand-gold hover:bg-brand-gold-light text-black border-none px-8"
        >
          <RefreshCcw className="w-4 h-4 mr-2" /> Try Again
        </Button>
        <Button asChild variant="outline" className="px-8">
          <Link href="/">
            <Home className="w-4 h-4 mr-2" /> Return Home
          </Link>
        </Button>
      </div>
    </div>
  )
}
