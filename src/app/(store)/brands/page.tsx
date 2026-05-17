import type { Metadata } from 'next'
import Link from 'next/link'
import { BRANDS } from '@/lib/constants'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Brands — The Diecast Corner Nepal',
  description: 'Browse diecast models by brand — MiniGT, PopRace, Tarmac Works, INNO64, Tomica, Greenlight and more at The Diecast Corner Nepal.',
}

export const revalidate = 300

const BRAND_DESCRIPTIONS: Record<string, string> = {
  'MiniGT':        '1:64 precision replicas of supercars, JDMs and exotics with jaw-dropping detail.',
  'PopRace':       'Hong Kong brand crafting ultra-detailed 1:64 Japanese street and race cars.',
  'Tarmac Works':  'Racing and motorsport heritage captured in stunning 1:64 and 1:43 scale.',
  'INNO64':        'Ultra-detailed JDM and Asian market exclusives for serious collectors.',
  'TimeMicro':     'Highly accurate Chinese and Asian vehicle replicas in 1:64 scale.',
  'Tomica':        'Japan\'s iconic diecast brand — clean, accurate and endlessly collectible.',
  'DCM':           'Diecast Masters — premium large-scale construction and work vehicle models.',
  'Street Warrior': 'Bold, detailed 1:64 street car replicas straight from the garage.',
  'Mini Station':  'Niche brand producing limited-run Asian and JDM collector pieces.',
  'Maasdi':        'Unique diecast models with a focus on South and Southeast Asian markets.',
  'Greenlight':    'US-licensed diecast — Hollywood, muscle cars & pop culture icons.',
  'Fine Works':    'High-fidelity artisan diecast models built for display collectors.',
  'Fine Works 64': 'Fine Works precision engineering in the popular 1:64 scale format.',
  'Xcartoys':      'Chinese brand delivering sharp detail and exciting liveries in 1:64.',
  'BMC':           'Boutique manufacturer specialising in rare and limited collector models.',
  'MJ Model':      'Meticulously crafted replicas with a focus on Asian vehicle culture.',
  'Mortal':        'Edgy, street-inspired diecast with bold paint jobs and custom details.',
  'HKM':           'Hong Kong Miniatures — affordable yet finely detailed 1:64 collectibles.',
  'AR Box':        'Artist-run brand releasing limited-edition themed diecast collections.',
  'Trends Hobby':  'Asia-based brand covering popular car culture and lifestyle vehicles.',
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
