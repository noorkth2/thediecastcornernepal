'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Upload } from 'lucide-react'

interface CategoryFormData {
  name: string
  slug: string
  description: string
  sort_order: number
  is_active: boolean
  image_url: string
}

interface CategoryFormProps {
  defaultValues?: Partial<CategoryFormData>
  categoryId?: number
  mode: 'create' | 'edit'
}

export function CategoryForm({ defaultValues, categoryId, mode }: CategoryFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<CategoryFormData>({
    defaultValues: {
      is_active: true,
      sort_order: 0,
      ...defaultValues,
    },
  })

  const onSubmit = async (data: CategoryFormData) => {
    setError(null)
    const supabase = createClient()
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    const payload = { ...data, slug, sort_order: Number(data.sort_order) }

    if (mode === 'create') {
      const { error } = await supabase.from('categories').insert(payload)
      if (error) { setError(error.message); return }
    } else {
      const { error } = await supabase.from('categories').update(payload).eq('id', categoryId!)
      if (error) { setError(error.message); return }
    }

    router.push('/admin/categories')
    router.refresh()
  }

  const imageUrl = watch('image_url')

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError(null)
    const supabase = createClient()

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`

      // Re-using the products bucket for simplicity
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input {...register('name', { required: 'Name required' })} id="name" label="Category Name *" error={errors.name?.message} />
        <Input {...register('slug')} id="slug" label="Slug (auto-generated if empty)" placeholder="e.g. hot-wheels" />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-1.5">Description</label>
        <textarea {...register('description')} id="description" rows={3} className="input-base resize-none" placeholder="Category description..." />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input {...register('sort_order')} id="sort_order" type="number" label="Sort Order" />
        <div>
          <p className="block text-sm font-medium text-text-primary mb-3 mt-1">Category Flags</p>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...register('is_active')} id="is_active" className="w-4 h-4 rounded accent-brand-red" />
            <span className="text-sm text-text-muted">✓ Active</span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-1.5">Category Image</label>
        <div className="flex items-start gap-4">
          <div className="flex-1">
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
          {imageUrl && (
            <div className="w-24 h-24 rounded-lg bg-surface-elevated border border-surface-border overflow-hidden flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      </div>

      {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={() => router.back()} id="cancel-category-btn">Cancel</Button>
        <Button type="submit" variant="primary" disabled={isSubmitting} id="save-category-btn">
          {isSubmitting ? 'Saving…' : mode === 'create' ? 'Create Category' : 'Save Changes'}
        </Button>
      </div>
    </form>
  )
}
