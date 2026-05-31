'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { VideoEmbed, detectMediaType, detectAspectRatio } from '@/components/ui/VideoEmbed'
import { Upload } from 'lucide-react'
import type { ProductMedia } from '@/lib/types/media'

type MediaFormData = Omit<ProductMedia, 'id' | 'created_at' | 'product_id'>

interface ProductMediaManagerProps {
  productId: number
  media: ProductMedia[]
}

export function ProductMediaManager({ productId, media }: ProductMediaManagerProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState<number | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm<MediaFormData>({
    defaultValues: {
      is_primary: false,
      sort_order: 0,
      media_type: 'youtube',
      aspect_ratio: '16:9',
    },
  })

  const mediaUrl = watch('media_url')
  const currentPlatform = watch('media_type')
  const currentRatio = watch('aspect_ratio')

  const handleUrlPaste = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    if (!url) return
    const platform = detectMediaType(url)
    const ratio = detectAspectRatio(url, platform)
    
    // Auto-fill platform and ratio based on the URL
    setValue('media_type', platform)
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

  const onSubmit = async (data: MediaFormData) => {
    setError(null)
    const supabase = createClient()
    const payload = { ...data, product_id: productId, sort_order: Number(data.sort_order) }

    const { error } = await supabase.from('product_media').insert(payload)
    
    if (error) {
      setError(error.message)
      return
    }

    reset()
    router.refresh()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to remove this media from the product?')) return
    setIsDeleting(id)
    const supabase = createClient()
    await supabase.from('product_media').delete().eq('id', id)
    setIsDeleting(null)
    router.refresh()
  }

  return (
    <div className="border border-surface-border rounded-xl bg-surface-base p-6">
      <h3 className="text-lg font-medium text-white mb-4">Rich Media Gallery</h3>
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input 
            {...register('media_url', { required: 'URL required' })} 
            id="media_url" 
            label="Media URL *" 
            placeholder="Paste YouTube, Instagram, or direct MP4 link..."
            error={errors.media_url?.message}
            onChange={(e) => {
              register('media_url').onChange(e)
              handleUrlPaste(e)
            }}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Type</label>
              <select {...register('media_type')} id="media_type" className="input-base">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input {...register('caption')} id="caption" label="Caption (Optional)" />
            <Input {...register('sort_order')} id="sort_order" type="number" label="Sort Order" />
          </div>

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

          {mediaUrl && (
            <div className="mt-4 border-t border-surface-border pt-4">
              <p className="text-xs text-text-muted mb-2">Live Preview</p>
              <div className="w-full max-w-[200px] pointer-events-none">
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
            {isSubmitting ? 'Adding...' : 'Add to Product'}
          </Button>
        </form>

        {/* Existing Media */}
        <div>
          <h4 className="text-sm font-medium text-text-muted mb-3">Attached Media ({media.length})</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {media.map((item) => (
              <div key={item.id} className="relative bg-surface-card border border-surface-border rounded-xl overflow-hidden group">
                <div className="p-3 pointer-events-none">
                  <VideoEmbed url={item.media_url} mediaType={item.media_type} aspectRatio={item.aspect_ratio} />
                </div>
                <div className="p-3 border-t border-surface-border bg-surface-elevated">
                  <p className="text-sm font-medium text-white line-clamp-1">{item.caption || 'Untitled'}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] uppercase tracking-wider bg-surface-base px-2 py-0.5 rounded text-text-muted">{item.media_type}</span>
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
            {media.length === 0 && (
              <div className="col-span-full py-8 text-center text-text-muted border border-dashed border-surface-border rounded-xl">
                No rich media attached to this product yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
