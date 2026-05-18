import { notFound } from 'next/navigation'
import { getFeaturedBannerById } from '@/lib/supabase/queries/banners'
import { BannerForm } from '@/components/admin/BannerForm'

interface EditBannerPageProps {
  params: Promise<{ id: string }>
}

export default async function EditBannerPage(props: EditBannerPageProps) {
  const params = await props.params
  const id = parseInt(params.id)
  if (isNaN(id)) notFound()

  const { banner } = await getFeaturedBannerById(id)
  if (!banner) notFound()

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl tracking-wide text-white mb-2">Edit Banner</h1>
        <p className="text-text-muted">Update banner details.</p>
      </div>

      <div className="bg-surface-card border border-surface-border rounded-xl p-6">
        <BannerForm mode="edit" bannerId={banner.id} defaultValues={banner} />
      </div>
    </div>
  )
}
