import { getAllSocialGalleryAdmin } from '@/lib/supabase/queries/media'
import { SocialGalleryManager } from '@/components/admin/SocialGalleryManager'

export const revalidate = 0

export default async function AdminMediaPage() {
  const { gallery } = await getAllSocialGalleryAdmin()

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl tracking-wide text-white mb-2">Media Gallery</h1>
        <p className="text-text-muted">Manage community showcase media on the homepage.</p>
      </div>

      <SocialGalleryManager items={gallery} />
    </div>
  )
}
