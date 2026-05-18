'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Upload } from 'lucide-react'
import type { FeaturedBanner } from '@/lib/types/media'
import { BannerSlide } from '@/components/home/BannerSlide'

interface BannerFormData extends Omit<FeaturedBanner, 'id' | 'created_at'> {}

interface BannerFormProps {
  defaultValues?: Partial<BannerFormData>
  bannerId?: number
  mode: 'create' | 'edit'
}

export function BannerForm({ defaultValues, bannerId, mode }: BannerFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<BannerFormData>({
    defaultValues: {
      is_active: true,
      sort_order: 0,
      ...defaultValues,
    },
  })

  const formValues = watch()

  const onSubmit = async (data: BannerFormData) => {
    setError(null)
    const supabase = createClient()

    const payload = { ...data, sort_order: Number(data.sort_order) }

    if (mode === 'create') {
      const { error } = await supabase.from('featured_banners').insert(payload)
      if (error) { setError(error.message); return }
    } else {
      const { error } = await supabase.from('featured_banners').update(payload).eq('id', bannerId!)
      if (error) { setError(error.message); return }
    }

    router.push('/admin/banners')
    router.refresh()
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError(null)
    const supabase = createClient()

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `banners/${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(fileName, file, { cacheControl: '3600', upsert: false })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('products').getPublicUrl(fileName)
      setValue('image_url', data.publicUrl, { shouldValidate: true })
    } catch (err: any) {
      setError(err.message || 'Error uploading image')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <Input {...register('title', { required: 'Title required' })} id="title" label="Banner Title *" error={errors.title?.message} />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input {...register('subtitle')} id="subtitle" label="Subtitle" placeholder="e.g. New Collection" />
            <Input {...register('badge')} id="badge" label="Badge" placeholder="e.g. LIMITED EDITION" />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Description</label>
            <textarea {...register('description')} id="description" rows={3} className="input-base resize-none" placeholder="Short description..." />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input {...register('button_text')} id="button_text" label="Button Text" placeholder="Shop Now" />
            <Input {...register('button_link')} id="button_link" label="Button Link" placeholder="/shop?category=..." />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input {...register('sort_order')} id="sort_order" type="number" label="Sort Order" />
            <div className="pt-8">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...register('is_active')} id="is_active" className="w-4 h-4 rounded accent-brand-red" />
                <span className="text-sm font-medium text-text-primary">Banner is Active</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Background Image</label>
            <Input {...register('image_url')} id="image_url" placeholder="https://... or upload below" />
            <div className="mt-2 relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                id="file-upload"
              />
              <Button type="button" variant="secondary" className="w-full flex items-center justify-center gap-2" disabled={isUploading}>
                <Upload className="w-4 h-4" />
                {isUploading ? 'Uploading...' : 'Upload Image to Storage'}
              </Button>
            </div>
          </div>
        </div>

        {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>}

        <div className="flex gap-3 pt-4 border-t border-surface-border">
          <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : mode === 'create' ? 'Create Banner' : 'Save Changes'}
          </Button>
        </div>
      </form>

      {/* Live Preview Panel */}
      <div className="hidden xl:block">
        <h3 className="text-lg font-display tracking-wider mb-4">Live Preview</h3>
        <div className="sticky top-8 pointer-events-none transform origin-top-left scale-[0.85]">
          <BannerSlide banner={formValues as FeaturedBanner} isActive={true} />
        </div>
      </div>
    </div>
  )
}
