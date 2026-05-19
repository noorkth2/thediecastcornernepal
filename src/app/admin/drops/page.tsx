import { createClient } from '@/lib/supabase/server'
import { DropsAdminClient } from './DropsAdminClient'

export const revalidate = 0 // fresh dashboard

export default async function AdminDropsPage() {
  const supabase = await createClient()

  // Fetch all drops
  const { data: drops, error: dropsError } = await supabase
    .from('product_drops')
    .select(`
      *,
      product:products (id, title, brand)
    `)
    .order('drops_at', { ascending: false })

  if (dropsError) {
    console.error('Error fetching admin drops:', dropsError)
  }

  // Fetch active products to allow drop scheduling
  const { data: products } = await supabase
    .from('products')
    .select('id, title, brand')
    .eq('is_active', true)
    .order('title', { ascending: true })

  return (
    <DropsAdminClient
      initialDrops={drops || []}
      products={products || []}
    />
  )
}
