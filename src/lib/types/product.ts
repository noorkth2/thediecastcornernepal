export interface Category {
  id: number
  name: string
  slug: string
  description: string | null
  image_url: string | null
  sort_order: number
  is_active: boolean
  created_at: string
}

export interface ProductImage {
  id: number
  product_id: number
  image_url: string
  alt_text: string | null
  orientation: 'landscape' | 'portrait' | 'square'
  sort_order: number
  is_primary: boolean
}

export interface Product {
  id: number
  title: string
  slug: string
  description: string | null
  price: number
  compare_price: number | null
  category_id: number | null
  brand: string | null
  scale: string | null
  series: string | null
  stock_qty: number
  is_limited: boolean
  is_treasure_hunt: boolean
  is_premium: boolean
  is_featured: boolean
  is_new_arrival: boolean
  is_active: boolean
  tags: string[]
  sort_order: number
  image_url: string | null
  created_at: string
  updated_at: string
  // Joined
  category?: Category
  images?: ProductImage[]
}
