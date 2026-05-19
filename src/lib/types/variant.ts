export type VariantCondition = 'mint' | 'near-mint' | 'loose' | 'damaged'
export type VariantRarity = 'standard' | 'chase' | 'super-chase' | 'premium' | 'limited'
export type VariantPackaging = 'sealed' | 'opened' | 'card-only'

export interface ProductVariant {
  id: number
  product_id: number
  sku: string
  label: string
  scale: string | null
  color: string | null
  condition: VariantCondition | null
  rarity: VariantRarity | null
  packaging: VariantPackaging | null
  price_override: number | null
  stock_qty: number
  sort_order: number
  is_active: boolean
  image_url: string | null
  created_at: string
  updated_at: string
}
