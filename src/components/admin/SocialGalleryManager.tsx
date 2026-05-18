'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { VideoEmbed, detectMediaType, detectAspectRatio } from '@/components/ui/VideoEmbed'
import { Upload } from 'lucide-react'
import type { SocialGalleryItem } from '@/lib/types/media'

interface SocialFormData extends Omit<SocialGalleryItem, 'id' | 'created_at'> { }

interface SocialGalleryManagerProps {
  items: SocialGalleryItem[]
}

export function SocialGalleryManager({ items }: SocialGalleryManagerProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState<number | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm<SocialFormData>({
    defaultValues: {
      is_featured: false,
      sort_order: 0,
      platform: 'youtube',
      aspect_ratio: '16:9',
    },
  })

  const mediaUrl = watch('media_url')
  const currentPlatform = watch('platform')
  const currentRatio = watch('aspect_ratio')

  const handleUrlPaste = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    if (!url) return
    const platform = detectMediaType(url)
    const ratio = detectAspectRatio(url, platform)

    // Auto-fill platform and ratio based on the URL
    setValue('platform', platform)
    setValue('aspect_ratio', ratio)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError(null)
    const supabase = createClient()

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `thumbnails/${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(fileName, file, { cacheControl: '3600', upsert: false })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('products').getPublicUrl(fileName)
      setValue('thumbnail_url', data.publicUrl, { shouldValidate: true })
    } catch (err: any) {
      setError(err.message || 'Error uploading image')
    } finally {
      setIsUploading(false)
    }
  }

  const onSubmit = async (data: SocialFormData) => {
    setError(null)
    const supabase = createClient()
    const payload = { ...data, sort_order: Number(data.sort_order), linked_product_id: data.linked_product_id ? Number(data.linked_product_id) : null }

    const { error } = await supabase.from('social_gallery').insert(payload)

    if (error) {
      setError(error.message)
      return
    }

    reset()
    router.refresh()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to remove this media?')) return
    setIsDeleting(id)
    const supabase = createClient()
    await supabase.from('social_gallery').delete().eq('id', id)
    setIsDeleting(null)
    router.refresh()
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      {/* Form */}
      <div className="xl:col-span-1 bg-surface-card border border-surface-border rounded-xl p-6">
        <h2 className="text-lg font-display tracking-wider mb-6">Add New Media</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            {...register('media_url', { required: 'URL required' })}
            id="media_url"
            label="Media URL *"
            placeholder="Paste YouTube, Instagram, or TikTok link..."
            error={errors.media_url?.message}
            onChange={(e) => {
              register('media_url').onChange(e)
              handleUrlPaste(e)
            }}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Platform</label>
              <select {...register('platform')} id="platform" className="input-base">
                <option value="youtube">YouTube</option>
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
                <option value="video">Direct Video</option>
                <option value="image">Direct Image</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Ratio</label>
              <select {...register('aspect_ratio')} id="aspect_ratio" className="input-base">
                <option value="16:9">16:9 Landscape</option>
                <option value="9:16">9:16 Vertical</option>
                <option value="1:1">1:1 Square</option>
                <option value="21:9">21:9 Cinematic</option>
              </select>
            </div>
          </div>

          <Input {...register('title')} id="title" label="Title (Optional)" />

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Thumbnail URL (Optional)</label>
            <div className="flex flex-col gap-2">
              <Input
                {...register('thumbnail_url')}
                id="thumbnail_url"
                placeholder="https://... or upload below"
              />
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
                <Button type="button" variant="secondary" className="w-full flex items-center justify-center gap-2" disabled={isUploading}>
                  <Upload className="w-4 h-4" />
                  {isUploading ? 'Uploading...' : 'Upload Thumbnail Image'}
                </Button>
              </div>
            </div>
            <p className="text-xs text-text-faint mt-1">Upload any image or paste a URL to show as the preview card. Especially useful for Instagram &amp; TikTok.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Description</label>
            <textarea {...register('description')} id="description" rows={2} className="input-base resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input {...register('sort_order')} id="sort_order" type="number" label="Sort Order" />
            <Input {...register('linked_product_id')} id="linked_product_id" type="number" label="Product ID Link" />
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register('is_featured')} id="is_featured" className="w-4 h-4 rounded accent-brand-red" />
              <span className="text-sm font-medium text-text-primary">Featured (Shows first)</span>
            </label>
          </div>

          {mediaUrl && (
            <div className="mt-6 border-t border-surface-border pt-4">
              <p className="text-xs text-text-muted mb-2">Live Preview</p>
              <div className="w-full max-w-[200px] mx-auto pointer-events-none">
                <VideoEmbed
                  url={mediaUrl}
                  mediaType={currentPlatform}
                  aspectRatio={currentRatio}
                  thumbnailUrl={watch('thumbnail_url') || undefined}
                />
              </div>
            </div>
          )}

          {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>}

          <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Adding...' : 'Add to Gallery'}
          </Button>
        </form>
      </div>

      {/* Grid */}
      <div className="xl:col-span-2">
        <h2 className="text-lg font-display tracking-wider mb-6">Existing Gallery ({items.length})</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.id} className="relative bg-surface-card border border-surface-border rounded-xl overflow-hidden group">
              <div className="p-4 pointer-events-none">
                <VideoEmbed url={item.media_url} mediaType={item.platform} aspectRatio={item.aspect_ratio} />
              </div>
              <div className="p-4 border-t border-surface-border bg-surface-elevated">
                <p className="text-sm font-medium text-white line-clamp-1">{item.title || 'Untitled'}</p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex gap-2">
                    <span className="text-[10px] uppercase tracking-wider bg-surface-base px-2 py-0.5 rounded text-text-muted">{item.platform}</span>
                    {item.is_featured && <span className="text-[10px] uppercase tracking-wider bg-brand-gold/10 text-brand-gold border border-brand-gold/20 px-2 py-0.5 rounded">Featured</span>}
                  </div>
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={isDeleting === item.id}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors"
                  >
                    {isDeleting === item.id ? '...' : 'Remove'}
                  </button>
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="col-span-full py-12 text-center text-text-muted border border-dashed border-surface-border rounded-xl">
              No media in the gallery yet.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
