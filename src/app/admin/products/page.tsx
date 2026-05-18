import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'
import { Plus, Pencil, Eye, EyeOff } from 'lucide-react'
import { ProductBulkImport } from '@/components/admin/ProductBulkImport'

export const revalidate = 0

export default async function AdminProductsPage() {
  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products')
    .select('id, title, brand, price, stock_qty, is_active, is_treasure_hunt, slug, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-white tracking-wide">PRODUCTS</h1>
          <p className="text-text-muted text-sm mt-1">{products?.length ?? 0} total products</p>
        </div>
        <div className="flex items-center gap-3">
          <ProductBulkImport />
          <Link
            href="/admin/products/new"
            className="flex items-center gap-2 bg-brand-red hover:bg-brand-red-light text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-lg shadow-brand-red/20"
            id="admin-add-product-btn"
          >
            <Plus className="w-4 h-4" /> Add Product
          </Link>
        </div>
      </div>

      <div className="bg-surface-card rounded-xl border border-surface-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border bg-surface-elevated/50">
                {['Product', 'Brand', 'Price', 'Stock', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-widest whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {products?.map((p) => (
                <tr key={p.id} className="hover:bg-surface-elevated/40 transition-colors">
                  <td className="px-4 py-3 max-w-[260px]">
                    <p className="font-medium text-text-primary line-clamp-1">{p.title}</p>
                    {p.is_treasure_hunt && (
                      <span className="text-[10px] text-brand-gold">⭐ Treasure Hunt</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-text-muted whitespace-nowrap">{p.brand ?? '—'}</td>
                  <td className="px-4 py-3 font-semibold text-brand-gold whitespace-nowrap">
                    {formatPrice(p.price)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-medium ${
                      p.stock_qty === 0 ? 'text-red-400' :
                      p.stock_qty <= 5 ? 'text-orange-400' : 'text-green-400'
                    }`}>
                      {p.stock_qty}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                      p.is_active
                        ? 'text-green-400 bg-green-400/10'
                        : 'text-text-faint bg-surface-elevated'
                    }`}>
                      {p.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {p.is_active ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/products/${p.id}/edit`}
                      className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-white bg-surface-elevated hover:bg-surface-border px-2.5 py-1.5 rounded-lg transition-colors"
                      id={`edit-product-${p.id}`}
                    >
                      <Pencil className="w-3 h-3" /> Edit
                    </Link>
                  </td>
                </tr>
              ))}
              {!products?.length && (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-text-muted">
                    No products yet.{' '}
                    <Link href="/admin/products/new" className="text-brand-red-light hover:underline">
                      Add your first product →
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
