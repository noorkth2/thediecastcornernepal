import { PAYMENT_METHODS } from '../constants'
import type { Profile } from './auth'

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export type PaymentMethod = typeof PAYMENT_METHODS[number]['id']
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded'

export interface ShippingAddress {
  name: string
  phone: string
  address: string
  city: string
  landmark?: string
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
