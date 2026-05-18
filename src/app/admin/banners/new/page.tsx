import { BannerForm } from '@/components/admin/BannerForm'

export default function NewBannerPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl tracking-wide text-white mb-2">Create Banner</h1>
        <p className="text-text-muted">Add a new banner to the homepage carousel.</p>
      </div>

      <div className="bg-surface-card border border-surface-border rounded-xl p-6">
        <BannerForm mode="create" />
      </div>
    </div>
  )
}
