import type { Metadata } from 'next'
import { BrandForm } from '@/components/admin/BrandForm'

export const metadata: Metadata = {
  title: 'New Brand — Admin | The Diecast Corner Nepal',
}

export default function NewBrandPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl text-white tracking-wide">NEW BRAND</h1>
        <p className="text-text-muted text-sm mt-1">Add a new brand to the storefront.</p>
      </div>
      <div className="bg-surface-card rounded-xl border border-surface-border p-6">
        <BrandForm mode="create" />
      </div>
    </div>
  )
}
