import { createClient } from '../server'
import type { PreorderConfig } from '../../types/preorder'

export async function getProductPreorderConfigs(productId: number): Promise<PreorderConfig[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('preorder_configs')
    .select('*')
    .eq('product_id', productId)
    .eq('is_active', true)

  if (error) {
    console.error('Error fetching preorder configs:', error)
    return []
  }

  return data as PreorderConfig[]
}

export async function getAdminProductPreorderConfigs(productId: number): Promise<PreorderConfig[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('preorder_configs')
    .select('*')
    .eq('product_id', productId)

  if (error) {
    console.error('Error fetching admin preorder configs:', error)
    return []
  }

  return data as PreorderConfig[]
}
