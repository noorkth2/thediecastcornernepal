import { createClient } from '@/lib/supabase/server'
import type { ProductMedia, SocialGalleryItem } from '@/lib/types/media'

// ─── Product Media ────────────────────────────────────────────────────────────

export async function getProductMedia(productId: number) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('product_media')
    .select('*')
    .eq('product_id', productId)
    .order('sort_order', { ascending: true })

  return { media: (data as ProductMedia[]) ?? [], error }
}

export async function createProductMedia(payload: Omit<ProductMedia, 'id' | 'created_at'>) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('product_media')
    .insert(payload)
    .select()
    .single()

  return { media: data as ProductMedia | null, error }
}

export async function updateProductMedia(id: number, payload: Partial<Omit<ProductMedia, 'id' | 'created_at'>>) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('product_media')
    .update(payload)
    .eq('id', id)

  return { error }
}

export async function deleteProductMedia(id: number) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('product_media')
    .delete()
    .eq('id', id)

  return { error }
}

// ─── Social Gallery ───────────────────────────────────────────────────────────

export async function getSocialGallery(limit = 20) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('social_gallery')
    .select('*')
    .order('is_featured', { ascending: false })
    .order('sort_order', { ascending: true })
    .limit(limit)

  return { gallery: (data as SocialGalleryItem[]) ?? [], error }
}

export async function getAllSocialGalleryAdmin() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('social_gallery')
    .select('*')
    .order('sort_order', { ascending: true })

  return { gallery: (data as SocialGalleryItem[]) ?? [], error }
}

export async function createSocialGallery(payload: Omit<SocialGalleryItem, 'id' | 'created_at'>) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('social_gallery')
    .insert(payload)
    .select()
    .single()

  return { item: data as SocialGalleryItem | null, error }
}

export async function updateSocialGallery(id: number, payload: Partial<Omit<SocialGalleryItem, 'id' | 'created_at'>>) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('social_gallery')
    .update(payload)
    .eq('id', id)

  return { error }
}

export async function deleteSocialGallery(id: number) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('social_gallery')
    .delete()
    .eq('id', id)

  return { error }
}
