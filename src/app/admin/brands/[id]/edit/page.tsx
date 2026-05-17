import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getBrandById } from '@/lib/supabase/queries/brands'
import { BrandForm } from '@/components/admin/BrandForm'

export const metadata: Metadata = {
  title: 'Edit Brand — Admin | The Diecast Corner Nepal',
}

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditBrandPage({ params }: Props) {
  const { id } = await params
  const brand = await getBrandById(Number(id))
  if (!brand) notFound()

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl text-white tracking-wide">EDIT BRAND</h1>
        <p className="text-text-muted text-sm mt-1">Editing: {brand.name}</p>
      </div>
      <div className="bg-surface-card rounded-xl border border-surface-border p-6">
        <BrandForm
          mode="edit"
          brandId={brand.id}
          defaultValues={{
            name:        brand.name,
            slug:        brand.slug,
            description: brand.description ?? '',
            logo_url:    brand.logo_url ?? '',
            website_url: brand.website_url ?? '',
            is_active:   brand.is_active,
            sort_order:  brand.sort_order,
          }}
        />
      </div>
    </div>
  )
}
