import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Plus, Pencil, Eye, EyeOff, Tag } from 'lucide-react'

export const revalidate = 0

export default async function AdminCategoriesPage() {
  const supabase = await createClient()
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug, description, is_active, sort_order, created_at')
    .order('sort_order', { ascending: true })

  // Get product counts per category using the optimized database view
  const { data: productCounts } = await supabase
    .from('category_product_counts')
    .select('*')

  const countMap: Record<number, number> = {}
  for (const row of productCounts ?? []) {
    if (row.category_id) {
      countMap[row.category_id] = Number(row.product_count)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-white tracking-wide">CATEGORIES</h1>
          <p className="text-text-muted text-sm mt-1">{categories?.length ?? 0} total categories</p>
        </div>
        <Link
          href="/admin/categories/new"
          className="flex items-center gap-2 bg-brand-red hover:bg-brand-red-light text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-lg shadow-brand-red/20"
          id="admin-add-category-btn"
        >
          <Plus className="w-4 h-4" /> Add Category
        </Link>
      </div>

      {categories?.length === 0 ? (
        <div className="bg-surface-card rounded-xl border border-surface-border p-16 text-center">
          <Tag className="w-14 h-14 text-surface-border mx-auto mb-4" />
          <p className="text-text-muted mb-2">No categories yet.</p>
          <Link href="/admin/categories/new" className="text-brand-red-light text-sm hover:underline">
            Create your first category →
          </Link>
        </div>
      ) : (
        <div className="bg-surface-card rounded-xl border border-surface-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border bg-surface-elevated/50">
                  {['Sort', 'Category', 'Slug', 'Products', 'Status', 'Actions'].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-widest whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {categories?.map((cat) => (
                  <tr key={cat.id} className="hover:bg-surface-elevated/40 transition-colors">
                    <td className="px-4 py-3 text-text-faint font-mono text-xs">{cat.sort_order}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-text-primary">{cat.name}</p>
                      {cat.description && (
                        <p className="text-text-faint text-xs line-clamp-1 mt-0.5">{cat.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-xs text-brand-gold bg-brand-gold/10 px-2 py-0.5 rounded">
                        {cat.slug}
                      </code>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-text-primary">
                        {countMap[cat.id] ?? 0}
                      </span>
                      <span className="text-text-faint text-xs ml-1">active</span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                          cat.is_active
                            ? 'text-green-400 bg-green-400/10'
                            : 'text-text-faint bg-surface-elevated'
                        }`}
                      >
                        {cat.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {cat.is_active ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/categories/${cat.id}/edit`}
                        className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-white bg-surface-elevated hover:bg-surface-border px-2.5 py-1.5 rounded-lg transition-colors"
                        id={`edit-category-${cat.id}`}
                      >
                        <Pencil className="w-3 h-3" /> Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
