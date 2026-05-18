import { createClient } from '@/lib/supabase/server'
import type { Banner } from '@/lib/types'
import type { FeaturedBanner } from '@/lib/types/media'

// ─── Existing announcement/hero banner functions ──────────────────────────────

export async function getBannersByType(type: Banner['type']) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('banners')
    .select('*')
    .eq('type', type)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  return (data as Banner[]) ?? []
}

export async function getAllBannersAdmin() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('banners')
    .select('*')
    .order('sort_order', { ascending: true })

  return { banners: (data as Banner[]) ?? [], error }
}

// ─── Featured Banner Carousel functions (new featured_banners table) ──────────

export async function getActiveFeaturedBanners() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('featured_banners')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  return (data as FeaturedBanner[]) ?? []
}

export async function getAllFeaturedBannersAdmin() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('featured_banners')
    .select('*')
    .order('sort_order', { ascending: true })

  return { banners: (data as FeaturedBanner[]) ?? [], error }
}

export async function getFeaturedBannerById(id: number) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('featured_banners')
    .select('*')
    .eq('id', id)
    .single()

  return { banner: data as FeaturedBanner | null, error }
}

export async function createFeaturedBanner(payload: Omit<FeaturedBanner, 'id' | 'created_at'>) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('featured_banners')
    .insert(payload)
    .select()
    .single()

  return { banner: data as FeaturedBanner | null, error }
}

export async function updateFeaturedBanner(id: number, payload: Partial<Omit<FeaturedBanner, 'id' | 'created_at'>>) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('featured_banners')
    .update(payload)
    .eq('id', id)

  return { error }
}

export async function deleteFeaturedBanner(id: number) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('featured_banners')
    .delete()
    .eq('id', id)

  return { error }
}
