import type { Metadata } from 'next'
import { getNewArrivals } from '@/lib/supabase/queries/products'
import { ProductGrid } from '@/components/store/ProductGrid'
import { Zap } from 'lucide-react'

export const metadata: Metadata = {
  title: 'New Arrivals — The Diecast Corner Nepal',
  description: 'Shop the latest diecast arrivals — MiniGT, Tomica, Greenlight and more, freshly stocked at The Diecast Corner Nepal.',
}

export const revalidate = 60

export default async function NewArrivalsPage() {
  const products = await getNewArrivals(24)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-5 h-5 text-brand-orange fill-brand-orange" />
          <span className="text-brand-orange text-xs font-semibold tracking-widest uppercase">Just Landed</span>
        </div>
        <h1 className="font-display text-5xl text-white tracking-wide">NEW ARRIVALS</h1>
        <p className="text-text-muted text-sm mt-2 max-w-lg">
          Fresh stock added regularly. Be the first to grab newly listed diecast models before they sell out.
        </p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-24">
          <Zap className="w-16 h-16 text-surface-border mx-auto mb-4" />
          <p className="text-text-muted">No new arrivals right now — check back soon!</p>
        </div>
      ) : (
        <ProductGrid initialProducts={products} />
      )}
    </div>
  )
}
