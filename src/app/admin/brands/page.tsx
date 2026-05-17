import Link from 'next/link'
import type { Metadata } from 'next'
import { Plus, Pencil, Globe } from 'lucide-react'
import { getAllBrandsAdmin } from '@/lib/supabase/queries/brands'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Brands — Admin | The Diecast Corner Nepal',
}

export const dynamic = 'force-dynamic'

export default async function AdminBrandsPage() {
  const { brands } = await getAllBrandsAdmin()

  // Count products per brand
  const supabase = await createClient()
  const { data: productCounts } = await supabase
    .from('products')
    .select('brand')
    .not('brand', 'is', null)

  const countMap: Record<string, number> = {}
  productCounts?.forEach(({ brand }) => {
    if (brand) countMap[brand] = (countMap[brand] ?? 0) + 1
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-white tracking-wide">BRANDS</h1>
          <p className="text-text-muted text-sm mt-1">{brands.length} brands configured</p>
        </div>
        <Link
          href="/admin/brands/new"
          id="add-brand-btn"
          className="flex items-center gap-2 px-4 py-2 bg-brand-red hover:bg-brand-red-dark text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Brand
        </Link>
      </div>

      <div className="bg-surface-card rounded-xl border border-surface-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-border">
              <th className="text-left px-5 py-3.5 text-text-faint font-medium text-xs uppercase tracking-wider">Brand</th>
              <th className="text-left px-5 py-3.5 text-text-faint font-medium text-xs uppercase tracking-wider">Slug</th>
              <th className="text-left px-5 py-3.5 text-text-faint font-medium text-xs uppercase tracking-wider">Products</th>
              <th className="text-left px-5 py-3.5 text-text-faint font-medium text-xs uppercase tracking-wider">Sort</th>
              <th className="text-left px-5 py-3.5 text-text-faint font-medium text-xs uppercase tracking-wider">Status</th>
              <th className="text-left px-5 py-3.5 text-text-faint font-medium text-xs uppercase tracking-wider">Website</th>
              <th className="px-5 py-3.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {brands.map((brand) => (
              <tr key={brand.id} className="hover:bg-surface-elevated/40 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    {brand.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={brand.logo_url}
                        alt={brand.name}
                        className="w-8 h-8 rounded object-contain bg-surface-elevated p-1"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded bg-surface-elevated flex items-center justify-center text-xs font-bold text-text-faint">
                        {brand.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <span className="font-medium text-text-primary">{brand.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-text-muted font-mono text-xs">{brand.slug}</td>
                <td className="px-5 py-4">
                  <span className="text-text-muted">
                    {countMap[brand.name] ?? 0} product{(countMap[brand.name] ?? 0) !== 1 ? 's' : ''}
                  </span>
                </td>
                <td className="px-5 py-4 text-text-muted">{brand.sort_order}</td>
                <td className="px-5 py-4">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      brand.is_active
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-surface-elevated text-text-faint'
                    }`}
                  >
                    {brand.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-5 py-4">
                  {brand.website_url ? (
                    <a
                      href={brand.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-red-light hover:text-brand-red text-xs flex items-center gap-1"
                    >
                      <Globe className="w-3 h-3" /> Visit
                    </a>
                  ) : (
                    <span className="text-text-faint text-xs">—</span>
                  )}
                </td>
                <td className="px-5 py-4 text-right">
                  <Link
                    href={`/admin/brands/${brand.id}/edit`}
                    id={`edit-brand-${brand.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-surface-elevated hover:bg-surface-border rounded-lg text-text-muted hover:text-white transition-colors"
                  >
                    <Pencil className="w-3 h-3" /> Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {brands.length === 0 && (
          <div className="text-center py-16 text-text-faint">
            <p className="text-sm">No brands yet. <Link href="/admin/brands/new" className="text-brand-red-light hover:text-brand-red">Add your first brand →</Link></p>
          </div>
        )}
      </div>
    </div>
  )
}
