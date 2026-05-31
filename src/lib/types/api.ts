import type { Product, ProductStatus } from './product'

export interface SiteSetting {
  key: string
  value: Record<string, unknown>
}

export interface PaginatedProducts {
  products: Product[]
  count: number
  error: string | null
}

export interface GetProductsOptions {
  category?: string
  brand?: string
  status?: ProductStatus
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
