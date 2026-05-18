import { getAllFeaturedBannersAdmin } from '@/lib/supabase/queries/banners'
import Link from 'next/link'
import { Plus, Edit, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const revalidate = 0

export default async function AdminBannersPage() {
  const { banners } = await getAllFeaturedBannersAdmin()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl tracking-wide text-white mb-2">Banner Management</h1>
          <p className="text-text-muted">Manage homepage featured carousel banners.</p>
        </div>
        <Button variant="primary" asChild>
          <Link href="/admin/banners/new" className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Banner
          </Link>
        </Button>
      </div>

      <div className="bg-surface-card border border-surface-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-surface-border bg-surface-elevated text-xs uppercase tracking-wider text-text-muted">
                <th className="px-6 py-4 font-semibold">Banner</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Order</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border text-sm">
              {banners.map((b) => (
                <tr key={b.id} className="hover:bg-surface-elevated/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-10 bg-surface-base border border-surface-border rounded overflow-hidden flex items-center justify-center flex-shrink-0">
                        {b.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={b.image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-4 h-4 text-text-faint" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">{b.title}</p>
                        <p className="text-xs text-text-muted mt-0.5 max-w-xs truncate">{b.subtitle || b.description || 'No description'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      b.is_active ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-surface-base text-text-muted border border-surface-border'
                    }`}>
                      {b.is_active ? 'Active' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-text-muted">
                    {b.sort_order}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/banners/${b.id}/edit`}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-text-muted hover:text-white hover:bg-surface-border transition-colors"
                      title="Edit banner"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
              {banners.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-text-muted">
                    No banners found. Create one to get started.
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
