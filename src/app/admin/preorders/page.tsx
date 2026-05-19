import { createClient } from '@/lib/supabase/server'
import { PreordersClient } from './PreordersClient'

export const dynamic = 'force-dynamic'

export default async function AdminPreordersPage() {
  const supabase = await createClient()

  // Verify admin access
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return <div className="p-8 text-white">Unauthorized</div>

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return <div className="p-8 text-white">Unauthorized</div>

  // Fetch data in parallel
  const [configsRes, productsRes, variantsRes] = await Promise.all([
    supabase
      .from('preorder_configs')
      .select(`
        *,
        product:products(title, image_url),
        variant:product_variants(label)
      `)
      .order('created_at', { ascending: false }),
    
    supabase
      .from('products')
      .select('id, title')
      .eq('is_active', true)
      .order('title', { ascending: true }),

    supabase
      .from('product_variants')
      .select('id, label, product_id')
      .eq('is_active', true)
      .order('label', { ascending: true })
  ])

  if (configsRes.error) {
    return <div className="p-8 text-red-500">Error loading preorders: {configsRes.error.message}</div>
  }

  return (
    <PreordersClient
      initialConfigs={configsRes.data || []}
      products={productsRes.data || []}
      variants={variantsRes.data || []}
    />
  )
}
