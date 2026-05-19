import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getOrdersByUser } from '@/lib/supabase/queries/orders'
import { GarageClient } from './GarageClient'

export const revalidate = 0 // always fresh

export default async function GaragePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch orders to calculate stats
  const { orders } = await getOrdersByUser(user.id)
  
  // Fetch unified collector items
  const { data: items, error: itemsError } = await supabase
    .from('collector_items')
    .select('*')
    .eq('user_id', user.id)
    .order('acquired_at', { ascending: false })

  if (itemsError) {
    console.error('Error fetching collector items:', itemsError)
  }

  // Fetch all products (simplified) to allow quick adding by product selection
  const { data: products } = await supabase
    .from('products')
    .select('id, title, brand, image_url')
    .eq('is_active', true)
    .order('title', { ascending: true })

  return (
    <GarageClient
      profile={profile}
      initialItems={items || []}
      orders={orders}
      availableProducts={products || []}
    />
  )
}
