import type { Metadata } from 'next'
import { getTreasureHuntProducts } from '@/lib/supabase/queries/products'
import { ProductGrid } from '@/components/store/ProductGrid'
import { Star } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Treasure Hunts — The Diecast Corner Nepal',
  description: 'Shop rare Hot Wheels Treasure Hunt and Super Treasure Hunt models — exclusively curated for Nepal collectors.',
}

export const revalidate = 60

export default async function TreasureHuntPage() {
  const products = await getTreasureHuntProducts(24)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Gold hero strip */}
      <div className="relative bg-gradient-to-r from-brand-gold/10 via-brand-gold/5 to-transparent rounded-2xl border border-brand-gold/20 p-8 mb-12 overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'radial-gradient(circle, #F5C518 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }} />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-5 h-5 text-brand-gold fill-brand-gold" />
            <span className="text-brand-gold text-xs font-semibold tracking-widest uppercase">Rare Finds</span>
          </div>
          <h1 className="font-display text-5xl text-white tracking-wide mb-3">
            TREASURE HUNT ZONE
          </h1>
          <p className="text-text-muted text-sm max-w-lg leading-relaxed">
            The rarest Hot Wheels Treasure Hunts and Super Treasure Hunts in Nepal.
            These sell out fast — add to cart before they&apos;re gone forever.
          </p>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-24">
          <Star className="w-16 h-16 text-surface-border mx-auto mb-4" />
          <p className="text-text-muted">No Treasure Hunts in stock right now. Check back soon!</p>
        </div>
      ) : (
        <ProductGrid initialProducts={products} />
      )}
    </div>
  )
}
