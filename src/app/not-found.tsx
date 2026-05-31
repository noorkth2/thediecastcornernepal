import Link from 'next/link'
import { AlertCircle, Home, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-brand-red/20 blur-3xl rounded-full" />
        <AlertCircle className="w-24 h-24 text-brand-red relative animate-pulse" />
      </div>

      <h1 className="font-display text-6xl text-white tracking-widest mb-4">404</h1>
      <h2 className="text-2xl font-display text-text-primary tracking-wide mb-6">MODEL NOT FOUND</h2>
      
      <p className="max-w-md text-text-muted mb-10 leading-relaxed">
        It looks like the scale model you&apos;re looking for has sped off the track. The page might have been moved or no longer exists.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild variant="primary" className="bg-brand-red hover:bg-brand-red-light border-none px-8">
          <Link href="/">
            <Home className="w-4 h-4 mr-2" /> Back to Home
          </Link>
        </Button>
        <Button asChild variant="outline" className="px-8">
          <Link href="/shop">
            <ShoppingBag className="w-4 h-4 mr-2" /> Continue Shopping
          </Link>
        </Button>
      </div>

      <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-8 opacity-20 grayscale pointer-events-none">
        <div className="font-display text-4xl text-white">MINIGT</div>
        <div className="font-display text-4xl text-white">TOMICA</div>
        <div className="font-display text-4xl text-white">MATCHBOX</div>
        <div className="font-display text-4xl text-white">MAJORETTE</div>
      </div>
    </div>
  )
}
