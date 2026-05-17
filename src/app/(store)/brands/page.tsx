import type { Metadata } from 'next'
import Link from 'next/link'
import { getActiveBrands } from '@/lib/supabase/queries/brands'
import { createClient } from '@/lib/supabase/server'
import { Globe } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Brands — The Diecast Corner Nepal',
  description: 'Browse diecast models by brand — MiniGT, PopRace, Tarmac Works, INNO64, Tomica, Greenlight and more at The Diecast Corner Nepal.',
}

export const revalidate = 300

export default async function BrandsPage() {
  const supabase = await createClient()

  // Get active brands from DB
  const brands = await getActiveBrands()

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

  // Filter out brands with no active products, unless there are NO brands with products
  const activeBrands = brands.filter((b) => (countMap[b.name] ?? 0) > 0)
  const allBrands = activeBrands.length > 0 ? activeBrands : brands

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
          <div
            key={brand.id}
            className="group bg-surface-card rounded-xl border border-surface-border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-red/10 flex flex-col"
            id={`brand-${brand.slug}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {brand.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={brand.logo_url}
                    alt={brand.name}
                    className="w-10 h-10 rounded object-contain bg-white/5 p-1"
                  />
                ) : (
                  <div className="w-10 h-10 rounded bg-white/5 flex items-center justify-center text-sm font-bold text-text-faint">
                    {brand.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <h2 className="font-display text-2xl text-white tracking-wide group-hover:text-brand-red-light transition-colors">
                    {brand.name}
                  </h2>
                  {countMap[brand.name] != null && (
                    <span className="text-xs text-text-faint bg-surface-elevated px-2 py-0.5 rounded-full mt-1 inline-block">
                      {countMap[brand.name]} {countMap[brand.name] === 1 ? 'model' : 'models'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <p className="text-text-muted text-sm leading-relaxed flex-1">
              {brand.description ?? `Premium ${brand.name} diecast models available in Nepal.`}
            </p>

            <div className="flex items-center gap-4 mt-6 pt-4 border-t border-surface-border/50">
              <Link
                href={`/shop?brand=${encodeURIComponent(brand.name)}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-brand-red-light hover:text-brand-red transition-colors"
              >
                Shop Collection →
              </Link>
              {brand.website_url && (
                <a
                  href={brand.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-white transition-colors"
                >
                  <Globe className="w-3.5 h-3.5" />
                  Visit Site
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

