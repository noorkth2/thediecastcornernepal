'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitReviewAction(productId: number, rating: number, comment: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('You must be logged in to submit a review')

  const { error } = await supabase
    .from('reviews')
    .upsert({
      product_id: productId,
      user_id: user.id,
      rating,
      comment,
      updated_at: new Date().toISOString()
    })

  if (error) throw error

  revalidatePath(`/product/[slug]`, 'page')
}

export async function joinWaitlistAction(productId: number, email: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('waitlist')
    .insert({
      product_id: productId,
      user_email: email
    })

  if (error) {
    if (error.code === '23505') return // Already joined
    throw error
  }
}
