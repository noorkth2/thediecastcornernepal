import { createClient } from '@/lib/supabase/server'
import type { Brand } from '@/lib/types/brand'

/** Storefront — active brands ordered by sort_order */
export async function getActiveBrands(): Promise<Brand[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('brands')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
  return (data as Brand[]) ?? []
}

/** Admin — all brands including inactive */
export async function getAllBrandsAdmin(): Promise<{ brands: Brand[]; error: string | null }> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .order('sort_order', { ascending: true })
  return { brands: (data as Brand[]) ?? [], error: error?.message ?? null }
}

/** Get a single brand by slug */
export async function getBrandBySlug(slug: string): Promise<Brand | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('brands')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()
  return (data as Brand) ?? null
}

/** Get a single brand by ID (admin) */
export async function getBrandById(id: number): Promise<Brand | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('brands')
    .select('*')
    .eq('id', id)
    .single()
  return (data as Brand) ?? null
}
