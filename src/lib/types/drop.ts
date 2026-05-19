import type { Product } from './product'

export type DropStatus = 'scheduled' | 'waiting' | 'live' | 'sold_out' | 'ended'

export interface ProductDrop {
  id: number
  product_id: number
  drop_name: string
  drops_at: string
  max_per_user: number
  waiting_room_opens_at: string
  status: DropStatus
  anti_bot_delay: number
  created_at: string
  // Joined
  product?: Product
}
