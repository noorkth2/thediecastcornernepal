'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function bulkImportProducts(products: any[]) {
  const supabase = await createClient()

  // Verify admin access
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    // Process and validate products
    const payloads = products.map((row) => {
      const slug = row.slug || row.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      
      return {
        title: row.title,
        slug: slug,
        description: row.description || null,
        price: Number(row.price),
        compare_price: row.compare_price ? Number(row.compare_price) : null,
        category_id: row.category_id ? Number(row.category_id) : null,
        brand: row.brand || null,
        scale: row.scale || null,
        series: row.series || null,
        stock_qty: row.stock_qty ? Number(row.stock_qty) : 0,
        is_limited: row.is_limited === 'true' || row.is_limited === true,
        is_treasure_hunt: row.is_treasure_hunt === 'true' || row.is_treasure_hunt === true,
        is_premium: row.is_premium === 'true' || row.is_premium === true,
        is_featured: row.is_featured === 'true' || row.is_featured === true,
        is_new_arrival: row.is_new_arrival === 'true' || row.is_new_arrival === true,
        is_active: row.is_active === 'true' || row.is_active === true || row.is_active === undefined, // default true
        image_url: row.image_url || null,
        sort_order: row.sort_order ? Number(row.sort_order) : 0,
      }
    })

    const { error } = await supabase.from('products').insert(payloads)

    if (error) {
      console.error('Error inserting bulk products:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/products')
    revalidatePath('/(store)/shop', 'page')
    
    return { success: true, count: payloads.length }
  } catch (err: any) {
    console.error('Bulk import exception:', err)
    return { success: false, error: err.message || 'An error occurred during import' }
  }
}
