import { createClient } from '../server'
import type { ProductVariant } from '../../types/variant'

export async function getProductVariants(productId: number): Promise<ProductVariant[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('product_variants')
    .select('*')
    .eq('product_id', productId)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Error fetching product variants:', error)
    return []
  }

  return data as ProductVariant[]
}

export async function getAdminProductVariants(productId: number): Promise<ProductVariant[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('product_variants')
    .select('*')
    .eq('product_id', productId)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Error fetching admin product variants:', error)
    return []
  }

  return data as ProductVariant[]
}
