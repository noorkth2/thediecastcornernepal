export interface PreorderConfig {
  id: number
  product_id: number
  variant_id: number | null
  is_active: boolean
  estimated_arrival: string // YYYY-MM-DD
  deposit_amount: number | null // null means full amount required
  max_qty: number | null // null means unlimited
  reserved_qty: number
  closes_at: string | null // ISO string
  created_at: string
  updated_at: string
}
