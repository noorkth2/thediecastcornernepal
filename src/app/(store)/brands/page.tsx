import type { Metadata } from 'next'
import Link from 'next/link'
import { BRANDS } from '@/lib/constants'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Brands — The Diecast Corner Nepal',
  description: 'Browse diecast models by brand — Hot Wheels, MiniGT, Matchbox, Tomica, Majorette and more at The Diecast Corner Nepal.',
}

export const revalidate = 300

const BRAND_DESCRIPTIONS: Record<string, string> = {
  'Hot Wheels': 'The world\'s #1 toy car brand. Mainline, TH, Super TH, and premium releases.',
  'MiniGT': '1:64 precision supercar replicas with jaw-dropping detail.',
  'Matchbox': 'Iconic since 1953. Real-world vehicles in miniature.',
  'Tomica': 'Japan\'s premium diecast brand. Clean, accurate, collectible.',
  'Majorette': 'French precision meets everyday cars in 1:64 scale.',
  'Bburago': 'Affordable high-quality 1:24 and 1:18 European models.',
  'INNO64': 'Ultra-detailed Japanese street cars for serious collectors.',
  'Tarmac Works': 'Racing and track pedigree in 1:64 scale.',
}

export default async function BrandsPage() {
  const supabase = await createClient()

  // Get product count per brand
  const { data: brandCounts } = await supabase
    .from('products')
    .select('brand')
    .eq('is_active', true)
    .not('brand', 'is', null)

  const countMap: Record<string, number> = {}
  brandCounts?.forEach(({ brand }) => {
    if (brand) countMap[brand] = (countMap[brand] ?? 0) + 1
  })

  const activeBrands = BRANDS.filter((b) => b !== 'Other' && (countMap[b] ?? 0) > 0)
  const allBrands = activeBrands.length > 0 ? activeBrands : BRANDS.filter((b) => b !== 'Other')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-px w-8 bg-brand-red" />
          <span className="text-brand-red text-xs font-semibold tracking-widest uppercase">Our Collection</span>
        </div>
        <h1 className="font-display text-5xl text-white tracking-wide">SHOP BY BRAND</h1>
        <p className="text-text-muted text-sm mt-2">
          Browse the finest diecast manufacturers available in Nepal.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {allBrands.map((brand) => (
          <Link
            key={brand}
            href={`/shop?brand=${encodeURIComponent(brand)}`}
            className="group bg-surface-card rounded-xl border border-surface-border hover:border-brand-red/40 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-red/10"
            id={`brand-${brand.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-2xl text-white tracking-wide group-hover:text-brand-red-light transition-colors">
                {brand}
              </h2>
              {countMap[brand] != null && (
                <span className="text-xs text-text-faint bg-surface-elevated px-2 py-0.5 rounded-full">
                  {countMap[brand]} {countMap[brand] === 1 ? 'model' : 'models'}
                </span>
              )}
            </div>
            <p className="text-text-muted text-sm leading-relaxed">
              {BRAND_DESCRIPTIONS[brand] ?? `Premium ${brand} diecast models available in Nepal.`}
            </p>
            <span className="inline-flex items-center gap-1 mt-4 text-xs text-brand-red-light group-hover:gap-2 transition-all">
              Shop {brand} →
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
