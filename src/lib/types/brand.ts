export interface Brand {
  id: number
  name: string
  slug: string
  description: string | null
  logo_url: string | null
  website_url: string | null
  is_active: boolean
  sort_order: number
  created_at: string
}
