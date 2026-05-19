import { createClient } from '../server'
import type { ProductDrop } from '../../types/drop'

export async function getUpcomingDrops(): Promise<ProductDrop[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('product_drops')
    .select(`
      *,
      product:products (
        *,
        images:product_images(*)
      )
    `)
    .neq('status', 'ended')
    .order('drops_at', { ascending: true })

  if (error) {
    console.error('Error fetching upcoming drops:', error)
    return []
  }

  return data as ProductDrop[]
}

export async function getDropById(id: number): Promise<ProductDrop | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('product_drops')
    .select(`
      *,
      product:products (
        *,
        images:product_images(*)
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error(`Error fetching drop ${id}:`, error)
    return null
  }

  return data as ProductDrop
}

export async function updateDropStatus(id: number, status: string): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('product_drops')
    .update({ status })
    .eq('id', id)

  if (error) {
    console.error(`Error updating drop ${id} status:`, error)
    return false
  }

  return true
}
