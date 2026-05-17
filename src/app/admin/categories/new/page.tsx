import { CategoryForm } from '@/components/admin/CategoryForm'

export default function NewCategoryPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <a href="/admin/categories" className="text-xs text-text-muted hover:text-white transition-colors">
          ← Back to Categories
        </a>
        <h1 className="font-display text-3xl text-white tracking-wide mt-1">NEW CATEGORY</h1>
      </div>
      <div className="bg-surface-card rounded-xl border border-surface-border p-6">
        <CategoryForm mode="create" />
      </div>
    </div>
  )
}
