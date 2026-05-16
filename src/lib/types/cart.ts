import type { Product } from './product'

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
