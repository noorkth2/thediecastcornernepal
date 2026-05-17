'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { SCALES } from '@/lib/constants'
import type { Category } from '@/lib/types'
import type { Brand } from '@/lib/types/brand'
import { Upload } from 'lucide-react'

interface ProductFormData {
  title: string
  slug: string
  description: string
  brand: string
  scale: string
  series: string
  price: number
  compare_price: number
  stock_qty: number
  category_id: number
  is_active: boolean
  is_featured: boolean
  is_new_arrival: boolean
  is_treasure_hunt: boolean
  is_limited: boolean
  is_premium: boolean
  image_url: string
}

interface ProductFormProps {
  categories: Category[]
  brands: Brand[]
  defaultValues?: Partial<ProductFormData>
  productId?: number
  mode: 'create' | 'edit'
}

export function ProductForm({ categories, brands, defaultValues, productId, mode }: ProductFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<ProductFormData>({
    defaultValues: {
      is_active: true,
      is_treasure_hunt: false,
      is_limited: false,
      is_new_arrival: false,
      is_premium: false,
      is_featured: false,
      stock_qty: 1,
      ...defaultValues,
    },
  })

  const onSubmit = async (data: ProductFormData) => {
    setError(null)
    const supabase = createClient()
    const slug = data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    const payload = { ...data, slug, price: Number(data.price), stock_qty: Number(data.stock_qty), compare_price: data.compare_price ? Number(data.compare_price) : null, category_id: data.category_id ? Number(data.category_id) : null }

    if (mode === 'create') {
      const { data: created, error } = await supabase.from('products').insert(payload).select('id').single()
      if (error) { setError(error.message); return }

      // sync product_images so storefront gallery works
      if (data.image_url && created?.id) {
        await supabase.from('product_images')
          .delete().eq('product_id', created.id).eq('is_primary', true)
        await supabase.from('product_images').insert(
          { product_id: created.id, image_url: data.image_url, alt_text: data.title, is_primary: true, sort_order: 1 }
        )
      }
    } else {
      const { error } = await supabase.from('products').update(payload).eq('id', productId!)
      if (error) { setError(error.message); return }

      // sync product_images so storefront gallery works
      if (data.image_url && productId) {
        // delete all existing images then insert the new one to prevent ghost/broken duplicates
        await supabase.from('product_images').delete().eq('product_id', productId)
        await supabase.from('product_images').insert(
          { product_id: productId, image_url: data.image_url, alt_text: data.title, is_primary: true, sort_order: 1 }
        )
      }
    }

    router.push('/admin/products')
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
        <Input {...register('title', { required: 'Title required' })} id="title" label="Product Title *" error={errors.title?.message} />
        <Input {...register('slug')} id="slug" label="Slug (auto-generated if empty)" placeholder="hot-wheels-th-2024" />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-1.5">Description</label>
        <textarea {...register('description')} id="description" rows={4} className="input-base resize-none" placeholder="Product description..." />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">Brand</label>
          <select {...register('brand')} id="brand" className="input-base">
            <option value="">Select Brand</option>
            {brands.map((b) => <option key={b.id} value={b.name}>{b.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">Scale</label>
          <select {...register('scale')} id="scale" className="input-base">
            <option value="">Select Scale</option>
            {SCALES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <Input {...register('series')} id="series" label="Series" placeholder="e.g. Mainline 2024" />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-1.5">Category</label>
        <select {...register('category_id')} id="category_id" className="input-base">
          <option value="">Select Category</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input {...register('price', { required: 'Price required' })} id="price" type="number" min={0} step={0.01} label="Price (Rs.) *" error={errors.price?.message} />
        <Input {...register('compare_price')} id="compare_price" type="number" min={0} step={0.01} label="Compare Price (Rs.)" />
        <Input {...register('stock_qty')} id="stock_qty" type="number" min={0} label="Stock Qty *" />
      </div>

      <div>
        <p className="block text-sm font-medium text-text-primary mb-3">Product Flags</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { name: 'is_active', label: '✓ Active' },
            { name: 'is_featured', label: '⭐ Featured' },
            { name: 'is_new_arrival', label: '🔵 New Arrival' },
            { name: 'is_treasure_hunt', label: '⭐ Treasure Hunt' },
            { name: 'is_limited', label: '🔥 Limited' },
            { name: 'is_premium', label: '🏆 Premium' },
          ].map(({ name, label }) => (
            <label key={name} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register(name as keyof ProductFormData)} id={name} className="w-4 h-4 rounded accent-brand-red" />
              <span className="text-sm text-text-muted">{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-1.5">Primary Image</label>
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
        <Button type="button" variant="secondary" onClick={() => router.back()} id="cancel-product-btn">Cancel</Button>
        <Button type="submit" variant="primary" disabled={isSubmitting} id="save-product-btn">
          {isSubmitting ? 'Saving…' : mode === 'create' ? 'Create Product' : 'Save Changes'}
        </Button>
      </div>
    </form>
  )
}
