import { createClient } from '@/lib/supabase/server'
import { ProductsClient } from './ProductsClient'

export const revalidate = 0

export default async function AdminProductsPage() {
  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products')
    .select('id, title, brand, price, stock_qty, is_active, is_treasure_hunt, slug, created_at')
    .order('created_at', { ascending: false })

  return <ProductsClient initialProducts={products ?? []} />
}
