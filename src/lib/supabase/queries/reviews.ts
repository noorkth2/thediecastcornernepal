import { createClient } from '../server'
import { Review } from '@/lib/types'

export async function getReviewsByProduct(productId: number) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      profile:profiles(full_name, avatar_url)
    `)
    .eq('product_id', productId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching reviews:', error)
    return { reviews: [] as Review[], error }
  }

  return { reviews: data as Review[], error: null }
}

export async function submitReview(review: Omit<Review, 'id' | 'created_at' | 'updated_at' | 'profile'>) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('reviews')
    .upsert({
      ...review,
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  return { data, error }
}

export async function getUserReviewForProduct(productId: number, userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', productId)
    .eq('user_id', userId)
    .maybeSingle()

  return { review: data as Review | null, error }
}
