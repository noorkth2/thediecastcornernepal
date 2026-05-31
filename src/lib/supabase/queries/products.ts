import { createClient } from '@/lib/supabase/server'
import type { Product, GetProductsOptions } from '@/lib/types'

export async function getProducts(opts: GetProductsOptions = {}) {
  const supabase = await createClient()
  const {
    category,
    brand,
    minPrice,
    maxPrice,
    isFeatured,
    isNewArrival,
    isTreasureHunt,
    isPremium,
    search,
    sort = 'newest',
    page = 1,
    limit = 12,
  } = opts

  let query = supabase
    .from('products')
    .select(
      `
      *,
      category:categories!inner(id, name, slug),
      images:product_images(*)
    `,
      { count: 'exact' }
    )
    .eq('is_active', true)

  if (category) query = query.eq('category.slug', category)
  if (brand) query = query.ilike('brand', brand)
  if (status) query = query.eq('status', status)
  if (minPrice !== undefined) query = query.gte('price', minPrice)
  if (maxPrice !== undefined) query = query.lte('price', maxPrice)
  if (isFeatured) query = query.eq('is_featured', true)
  if (isNewArrival) query = query.eq('is_new_arrival', true)
  if (isTreasureHunt) query = query.eq('is_treasure_hunt', true)
  if (isPremium) query = query.eq('is_premium', true)
  if (search) {
    // Use Postgres full-text search with prefix matching support
    query = query.textSearch('fts', search, {
      config: 'english',
      type: 'websearch'
    })
  }

  switch (sort) {
    case 'price_asc':
      query = query.order('price', { ascending: true })
      break
    case 'price_desc':
      query = query.order('price', { ascending: false })
      break
    case 'name_asc':
      query = query.order('title', { ascending: true })
      break
    default:
      query = query.order('created_at', { ascending: false })
  }

  const from = (page - 1) * limit
  query = query.range(from, from + limit - 1)

  const { data, error, count } = await query

  const products = (data as Product[]) ?? []

  return { products, count: count ?? 0, error: error?.message ?? null }
}

export async function getProductBySlug(slug: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select(
      `
      *,
      category:categories(id, name, slug),
      images:product_images(*)
    `
    )
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  return { product: data as Product | null, error }
}

export async function getRelatedProducts(
  productId: number,
  categoryId: number,
  limit = 4
) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('*, images:product_images(*)')
    .eq('category_id', categoryId)
    .eq('is_active', true)
    .neq('id', productId)
    .limit(limit)

  return (data as Product[]) ?? []
}

export async function getFeaturedProducts(limit = 8) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('*, images:product_images(*)')
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('sort_order', { ascending: true })
    .limit(limit)

  return (data as Product[]) ?? []
}

export async function getNewArrivals(limit = 8) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('*, images:product_images(*)')
    .eq('is_active', true)
    .eq('is_new_arrival', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  return (data as Product[]) ?? []
}

export async function getTreasureHuntProducts(limit = 8) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('*, images:product_images(*)')
    .eq('is_active', true)
    .eq('is_treasure_hunt', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  return (data as Product[]) ?? []
}

// Admin — all products including inactive
export async function getAllProductsAdmin() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(id, name, slug), images:product_images(*)')
    .order('created_at', { ascending: false })

  return { products: (data as Product[]) ?? [], error }
}
