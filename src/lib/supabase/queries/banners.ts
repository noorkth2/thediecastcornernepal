import { createClient } from '@/lib/supabase/server'
import type { Banner } from '@/lib/types'

export async function getBannersByType(type: Banner['type']) {
  const supabase = createClient()
  const { data } = await supabase
    .from('banners')
    .select('*')
    .eq('type', type)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  return (data as Banner[]) ?? []
}

export async function getAllBannersAdmin() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('banners')
    .select('*')
    .order('sort_order', { ascending: true })

  return { banners: (data as Banner[]) ?? [], error }
}
