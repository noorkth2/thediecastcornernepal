import { User } from '@supabase/supabase-js'
import { ShippingAddress } from './order'
import { UserRole } from './auth'

export interface CustomerProfile {
  id: string
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  shipping_address: ShippingAddress | null
  role: UserRole
  created_at: string
  updated_at: string
  // Included from auth.users for convenience
  email?: string
}

export interface UserWithProfile {
  user: User
  profile: CustomerProfile | null
}
