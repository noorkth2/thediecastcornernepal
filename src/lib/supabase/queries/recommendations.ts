import { createClient } from '../server'
import type { Product } from '@/lib/types/product'

export async function getAlsoBought(productId: number, limit = 4): Promise<Product[]> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('get_also_bought_recommendations', {
    target_product_id: productId,
    max_results: limit,
  })

  if (error) {
    console.error('Error fetching Also Bought recommendations:', error)
    return []
  }

  // Hydrate images if needed, but since it's return setof products, we might want to fetch images
  if (data && data.length > 0) {
    const ids = data.map((p: any) => p.id)
    const { data: images } = await supabase
      .from('product_images')
      .select('*')
      .in('product_id', ids)

    return data.map((product: any) => ({
      ...product,
      images: images?.filter((img: any) => img.product_id === product.id) || [],
    }))
  }

  return []
}

export async function getTrending(limit = 8): Promise<Product[]> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('get_trending_products', {
    max_results: limit,
  })

  // Fallback to recent products if no trending records exist yet
  if (error || !data || data.length === 0) {
    const { data: fallbackData } = await supabase
      .from('products')
      .select('*, images:product_images(*)')
      .eq('is_active', true)
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit)

    return (fallbackData || []) as Product[]
  }

  // Hydrate images
  const ids = data.map((p: any) => p.id)
  const { data: images } = await supabase
    .from('product_images')
    .select('*')
    .in('product_id', ids)

  return data.map((product: any) => ({
    ...product,
    images: images?.filter((img: any) => img.product_id === product.id) || [],
  })) as Product[]
}

export async function getPersonalizedRecommendations(
  userId: string,
  limit = 4
): Promise<Product[]> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('get_collection_recommendations', {
    target_user_id: userId,
    max_results: limit,
  })

  if (error || !data || data.length === 0) {
    return getTrending(limit)
  }

  // Hydrate images
  const ids = data.map((p: any) => p.id)
  const { data: images } = await supabase
    .from('product_images')
    .select('*')
    .in('product_id', ids)

  return data.map((product: any) => ({
    ...product,
    images: images?.filter((img: any) => img.product_id === product.id) || [],
  })) as Product[]
}
