'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { ProductVariant } from '@/lib/types/variant'
import { useUIStore } from '@/store/uiStore'

interface VariantManagerProps {
  productId: number
  productSkuBase: string
}

export function VariantManager({ productId, productSkuBase }: VariantManagerProps) {
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { addToast } = useUIStore()

  const loadVariants = useCallback(async () => {
    setIsLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', productId)
      .order('sort_order', { ascending: true })
    
    if (data) setVariants(data as ProductVariant[])
    setIsLoading(false)
  }, [productId])

  useEffect(() => {
    loadVariants()
  }, [loadVariants])

  const handleAddVariant = () => {
    const newVariant: Partial<ProductVariant> = {
      product_id: productId,
      sku: `${productSkuBase}-V${variants.length + 1}`,
      label: 'New Variant',
      stock_qty: 0,
      is_active: true,
      sort_order: variants.length,
    }
    
    // We add a temporary negative ID so we know it's not saved yet
    setVariants([...variants, { ...newVariant, id: -Date.now() } as ProductVariant])
  }

  const handleChange = (id: number, field: keyof ProductVariant, value: any) => {
    setVariants(variants.map(v => v.id === id ? { ...v, [field]: value } : v))
  }

  const handleSave = async (variant: ProductVariant) => {
    const supabase = createClient()
    const isNew = variant.id < 0

    const payload = {
      product_id: variant.product_id,
      sku: variant.sku,
      label: variant.label,
      scale: variant.scale || null,
      color: variant.color || null,
      condition: variant.condition || null,
      rarity: variant.rarity || null,
      packaging: variant.packaging || null,
      price_override: variant.price_override ? Number(variant.price_override) : null,
      stock_qty: Number(variant.stock_qty),
      sort_order: Number(variant.sort_order),
      is_active: variant.is_active,
    }

    if (isNew) {
      const { data, error } = await supabase.from('product_variants').insert(payload).select().single()
      if (error) {
        addToast({ message: error.message, type: 'error' })
      } else {
        addToast({ message: 'Variant created', type: 'success' })
        setVariants(variants.map(v => v.id === variant.id ? (data as ProductVariant) : v))
      }
    } else {
      const { error } = await supabase.from('product_variants').update(payload).eq('id', variant.id)
      if (error) {
        addToast({ message: error.message, type: 'error' })
      } else {
        addToast({ message: 'Variant updated', type: 'success' })
      }
    }
  }

  const handleDelete = async (id: number) => {
    if (id > 0) {
      if (!confirm('Are you sure you want to delete this variant?')) return
      const supabase = createClient()
      const { error } = await supabase.from('product_variants').delete().eq('id', id)
      if (error) {
        addToast({ message: error.message, type: 'error' })
        return
      }
      addToast({ message: 'Variant deleted', type: 'success' })
    }
    setVariants(variants.filter(v => v.id !== id))
  }

  if (isLoading) return <div className="animate-pulse h-20 bg-surface-elevated rounded-lg" />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Product Variants</h3>
        <Button type="button" onClick={handleAddVariant} variant="secondary" className="flex items-center gap-2 text-xs">
          <Plus className="w-4 h-4" /> Add Variant
        </Button>
      </div>

      {variants.length === 0 ? (
        <p className="text-sm text-text-muted italic">No variants configured. The product will act as a single item.</p>
      ) : (
        <div className="space-y-4">
          {variants.map((variant) => (
            <div key={variant.id} className="p-4 bg-surface-elevated border border-surface-border rounded-xl space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input 
                  label="SKU *" 
                  value={variant.sku} 
                  onChange={(e) => handleChange(variant.id, 'sku', e.target.value)} 
                />
                <Input 
                  label="Label (e.g. Red / Chase) *" 
                  value={variant.label} 
                  onChange={(e) => handleChange(variant.id, 'label', e.target.value)} 
                />
                <Input 
                  label="Price Override (Optional)" 
                  type="number" 
                  value={variant.price_override || ''} 
                  onChange={(e) => handleChange(variant.id, 'price_override', e.target.value)} 
                  placeholder="Uses base price if empty"
                />
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Input 
                  label="Stock Qty" 
                  type="number" 
                  value={variant.stock_qty} 
                  onChange={(e) => handleChange(variant.id, 'stock_qty', e.target.value)} 
                />
                <div>
                  <label className="block text-[11px] font-medium text-text-muted mb-1.5 uppercase">Condition</label>
                  <select 
                    className="input-base" 
                    value={variant.condition || ''} 
                    onChange={(e) => handleChange(variant.id, 'condition', e.target.value)}
                  >
                    <option value="">None</option>
                    <option value="mint">Mint</option>
                    <option value="near-mint">Near Mint</option>
                    <option value="loose">Loose</option>
                    <option value="damaged">Damaged</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-text-muted mb-1.5 uppercase">Rarity</label>
                  <select 
                    className="input-base" 
                    value={variant.rarity || ''} 
                    onChange={(e) => handleChange(variant.id, 'rarity', e.target.value)}
                  >
                    <option value="">Standard</option>
                    <option value="chase">Chase</option>
                    <option value="super-chase">Super Chase</option>
                    <option value="premium">Premium</option>
                    <option value="limited">Limited</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-text-muted mb-1.5 uppercase">Packaging</label>
                  <select 
                    className="input-base" 
                    value={variant.packaging || ''} 
                    onChange={(e) => handleChange(variant.id, 'packaging', e.target.value)}
                  >
                    <option value="">None</option>
                    <option value="sealed">Sealed</option>
                    <option value="opened">Opened</option>
                    <option value="card-only">Card Only</option>
                  </select>
                </div>
                
                <div className="flex items-end gap-2 h-full pb-1">
                  <label className="flex items-center gap-2 cursor-pointer flex-1">
                    <input 
                      type="checkbox" 
                      checked={variant.is_active} 
                      onChange={(e) => handleChange(variant.id, 'is_active', e.target.checked)}
                      className="w-4 h-4 rounded accent-brand-red" 
                    />
                    <span className="text-xs text-text-muted">Active</span>
                  </label>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      type="button"
                      onClick={() => handleSave(variant)}
                      className="p-2 bg-brand-red/20 text-brand-red hover:bg-brand-red hover:text-white rounded-lg transition-colors"
                      title="Save Variant"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleDelete(variant.id)}
                      className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                      title="Delete Variant"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
