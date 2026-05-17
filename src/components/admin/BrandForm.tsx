'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Upload, Globe } from 'lucide-react'
import { brandSchema, type BrandFormData } from '@/lib/validations/brand'

interface BrandFormProps {
  defaultValues?: Partial<BrandFormData>
  brandId?: number
  mode: 'create' | 'edit'
}

export function BrandForm({ defaultValues, brandId, mode }: BrandFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BrandFormData>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      is_active: true,
      sort_order: 0,
      ...defaultValues,
    },
  })

  const onSubmit = async (data: BrandFormData) => {
    setError(null)
    const supabase = createClient()
    const slug =
      data.slug ||
      data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

    const payload = {
      ...data,
      slug,
      sort_order: Number(data.sort_order),
      website_url: data.website_url || null,
      logo_url: data.logo_url || null,
      description: data.description || null,
    }

    if (mode === 'create') {
      const { error } = await supabase.from('brands').insert(payload)
      if (error) { setError(error.message); return }
    } else {
      const { error } = await supabase.from('brands').update(payload).eq('id', brandId!)
      if (error) { setError(error.message); return }
    }

    router.push('/admin/brands')
    router.refresh()
  }

  const logoUrl = watch('logo_url')

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError(null)
    const supabase = createClient()

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `brands/${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(fileName, file, { cacheControl: '3600', upsert: false })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('products').getPublicUrl(fileName)
      setValue('logo_url', data.publicUrl, { shouldValidate: true })
    } catch (err: unknown) {
      setError((err as Error).message || 'Error uploading logo')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Name + Slug */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          {...register('name')}
          id="brand-name"
          label="Brand Name *"
          error={errors.name?.message}
        />
        <Input
          {...register('slug')}
          id="brand-slug"
          label="Slug (auto-generated if empty)"
          placeholder="e.g. minigt"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1.5">
          Description
        </label>
        <textarea
          {...register('description')}
          id="brand-description"
          rows={3}
          className="input-base resize-none"
          placeholder="Short description shown on the Brands page..."
        />
      </div>

      {/* Website URL */}
      <div className="relative">
        <Globe className="absolute left-3 top-9 w-4 h-4 text-text-faint pointer-events-none" />
        <Input
          {...register('website_url')}
          id="brand-website"
          label="Official Website URL"
          placeholder="https://minigt.com"
          className="pl-9"
          error={errors.website_url?.message}
        />
      </div>

      {/* Sort order + Active */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          {...register('sort_order')}
          id="brand-sort-order"
          type="number"
          label="Sort Order"
        />
        <div>
          <p className="block text-sm font-medium text-text-primary mb-3 mt-1">Status</p>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register('is_active')}
              id="brand-is-active"
              className="w-4 h-4 rounded accent-brand-red"
            />
            <span className="text-sm text-text-muted">✓ Active (visible on storefront)</span>
          </label>
        </div>
      </div>

      {/* Logo upload */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1.5">Brand Logo</label>
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <Input
              {...register('logo_url')}
              id="brand-logo-url"
              placeholder="https://... or upload below"
            />
            <div className="mt-2 relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                disabled={isUploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                id="brand-logo-file-upload"
              />
              <Button
                type="button"
                variant="secondary"
                className="w-full flex items-center justify-center gap-2"
                disabled={isUploading}
              >
                <Upload className="w-4 h-4" />
                {isUploading ? 'Uploading…' : 'Upload Logo to Storage'}
              </Button>
            </div>
          </div>
          {logoUrl && (
            <div className="w-24 h-24 rounded-lg bg-surface-elevated border border-surface-border overflow-hidden flex-shrink-0 flex items-center justify-center p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoUrl} alt="Logo preview" className="w-full h-full object-contain" />
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
          id="cancel-brand-btn"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
          id="save-brand-btn"
        >
          {isSubmitting ? 'Saving…' : mode === 'create' ? 'Create Brand' : 'Save Changes'}
        </Button>
      </div>
    </form>
  )
}
