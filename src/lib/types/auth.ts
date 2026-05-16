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
