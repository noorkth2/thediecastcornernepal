import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProductForm } from '@/components/admin/ProductForm'
import type { Category } from '@/lib/types'

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase.from('products').select('*').eq('id', Number(params.id)).single(),
    supabase.from('categories').select('id, name, slug').order('name'),
  ])

  if (!product) notFound()

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <a href="/admin/products" className="text-xs text-text-muted hover:text-white transition-colors">
          ← Back to Products
        </a>
        <h1 className="font-display text-3xl text-white tracking-wide mt-1">EDIT PRODUCT</h1>
        <p className="text-text-faint text-sm mt-1 line-clamp-1">{product.title}</p>
      </div>
      <div className="bg-surface-card rounded-xl border border-surface-border p-6">
        <ProductForm
          categories={(categories as Category[]) ?? []}
          mode="edit"
          productId={product.id}
          defaultValues={{
            title: product.title,
            slug: product.slug,
            description: product.description ?? '',
            brand: product.brand ?? '',
            scale: product.scale ?? '',
            series: product.series ?? '',
            price: product.price,
            compare_price: product.compare_price ?? undefined,
            stock_qty: product.stock_qty,
            category_id: product.category_id ?? undefined,
            is_active: product.is_active,
            is_featured: product.is_featured,
            is_new_arrival: product.is_new_arrival,
            is_treasure_hunt: product.is_treasure_hunt,
            is_limited: product.is_limited,
            is_premium: product.is_premium,
            image_url: product.image_url ?? '',
          }}
        />
      </div>
    </div>
  )
}
