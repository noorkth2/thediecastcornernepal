// ─── User & Auth ──────────────────────────────────────────────────────────────

export type UserRole = 'customer' | 'admin'

export interface Profile {
  id: string
  full_name: string | null
  phone: string | null
  address: string | null
  city: string | null
  role: UserRole
  avatar_url: string | null
  created_at: string
  updated_at: string
}

// ─── Categories ───────────────────────────────────────────────────────────────

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

// ─── Products ─────────────────────────────────────────────────────────────────

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
  created_at: string
  updated_at: string
  // Joined
  category?: Category
  images?: ProductImage[]
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export type PaymentMethod = 'khalti' | 'esewa' | 'cod'
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded'

export interface ShippingAddress {
  name: string
  phone: string
  address: string
  city: string
  landmark?: string
}

export interface Order {
  id: number
  user_id: string
  order_code: string
  status: OrderStatus
  payment_method: PaymentMethod
  payment_status: PaymentStatus
  total_amount: number
  shipping_charge: number
  shipping_address: ShippingAddress
  notes: string | null
  created_at: string
  updated_at: string
  // Joined
  order_items?: OrderItem[]
  profile?: Profile
}

export interface OrderItem {
  id: number
  order_id: number
  product_id: number
  product_title: string
  product_image: string
  product_brand: string | null
  quantity: number
  unit_price: number
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export interface CartItem {
  id: number
  user_id: string
  product_id: number
  quantity: number
  product?: Product
}

export interface CartProduct {
  id: number
  title: string
  slug: string
  price: number
  image: string
  brand: string | null
  stock_qty: number
}

export interface CartEntry {
  product: CartProduct
  quantity: number
}

// ─── Banners ──────────────────────────────────────────────────────────────────

export interface Banner {
  id: number
  type: 'hero' | 'popup' | 'announcement'
  title: string | null
  image_url: string | null
  link_url: string | null
  announcement_text: string | null
  popup_duration_sec: number
  is_active: boolean
  display_start: string | null
  display_end: string | null
  sort_order: number
}

// ─── Site Settings ────────────────────────────────────────────────────────────

export interface SiteSetting {
  key: string
  value: Record<string, unknown>
}

// ─── API Responses ────────────────────────────────────────────────────────────

export interface PaginatedProducts {
  products: Product[]
  count: number
  error: string | null
}

export interface GetProductsOptions {
  category?: string
  brand?: string
  minPrice?: number
  maxPrice?: number
  isFeatured?: boolean
  isNewArrival?: boolean
  isTreasureHunt?: boolean
  isPremium?: boolean
  search?: string
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'name_asc'
  page?: number
  limit?: number
}
