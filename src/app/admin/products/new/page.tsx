import { createClient } from '@/lib/supabase/server'
import { ProductForm } from '@/components/admin/ProductForm'
import type { Category } from '@/lib/types'

export default async function NewProductPage() {
  const supabase = await createClient()
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('name')

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <a href="/admin/products" className="text-xs text-text-muted hover:text-white transition-colors">
          ← Back to Products
        </a>
        <h1 className="font-display text-3xl text-white tracking-wide mt-1">NEW PRODUCT</h1>
      </div>
      <div className="bg-surface-card rounded-xl border border-surface-border p-6">
        <ProductForm
          categories={(categories as Category[]) ?? []}
          mode="create"
        />
      </div>
    </div>
  )
}
