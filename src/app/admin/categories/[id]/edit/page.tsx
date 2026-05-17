import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CategoryForm } from '@/components/admin/CategoryForm'

export default async function EditCategoryPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const supabase = await createClient()

  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('id', Number(params.id))
    .single()

  if (!category) notFound()

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <a href="/admin/categories" className="text-xs text-text-muted hover:text-white transition-colors">
          ← Back to Categories
        </a>
        <h1 className="font-display text-3xl text-white tracking-wide mt-1">EDIT CATEGORY</h1>
        <p className="text-text-faint text-sm mt-1 line-clamp-1">{category.name}</p>
      </div>
      <div className="bg-surface-card rounded-xl border border-surface-border p-6">
        <CategoryForm
          mode="edit"
          categoryId={category.id}
          defaultValues={{
            name: category.name,
            slug: category.slug,
            description: category.description ?? '',
            sort_order: category.sort_order,
            is_active: category.is_active,
            image_url: category.image_url ?? '',
          }}
        />
      </div>
    </div>
  )
}
