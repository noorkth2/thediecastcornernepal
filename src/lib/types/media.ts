// Types for the Media Gallery Ecosystem and Banner System

export type MediaType = 'image' | 'video' | 'youtube' | 'instagram' | 'tiktok'
export type AspectRatio = '16:9' | '9:16' | '1:1' | '21:9'
export type Platform = 'youtube' | 'instagram' | 'tiktok' | 'video' | 'image'

export interface FeaturedBanner {
  id: number
  title: string
  subtitle: string | null
  description: string | null
  badge: string | null
  button_text: string | null
  button_link: string | null
  image_url: string | null
  is_active: boolean
  sort_order: number
  created_at: string
}

export interface ProductMedia {
  id: number
  product_id: number
  media_type: MediaType
  media_url: string
  thumbnail_url: string | null
  aspect_ratio: AspectRatio
  caption: string | null
  sort_order: number
  is_primary: boolean
  created_at: string
}

export interface SocialGalleryItem {
  id: number
  title: string | null
  description: string | null
  platform: Platform
  media_url: string
  thumbnail_url: string | null
  aspect_ratio: AspectRatio
  linked_product_id: number | null
  is_featured: boolean
  sort_order: number
  created_at: string
}
