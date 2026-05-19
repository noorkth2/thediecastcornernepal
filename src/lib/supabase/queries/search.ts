import { createClient } from '../server'
import type { Product } from '../../types/product'

export async function searchProducts(query: string, maxResults = 10): Promise<Product[]> {
  const supabase = await createClient()

  // First try the RPC function which handles FTS and pg_trgm fallback
  const { data, error } = await supabase.rpc('search_products', {
    search_query: query,
    max_results: maxResults
  })

  if (error) {
    console.error('Search error:', error)
    return []
  }

  return data as Product[]
}
