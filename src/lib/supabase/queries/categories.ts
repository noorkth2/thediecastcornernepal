import { createClient } from '@/lib/supabase/server'
import type { Category } from '@/lib/types'

export async function getCategories() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  return { categories: (data as Category[]) ?? [], error }
}

export async function getCategoryBySlug(slug: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  return { category: data as Category | null, error }
}

// Admin — all categories
export async function getAllCategoriesAdmin() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })

  return { categories: (data as Category[]) ?? [], error }
}
