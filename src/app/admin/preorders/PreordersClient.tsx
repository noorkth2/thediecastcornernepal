'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import * as Dialog from '@radix-ui/react-dialog'
import {
  X,
  Plus,
  Trash2,
  Calendar,
  Layers,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface PreordersClientProps {
  initialConfigs: any[]
  products: any[]
  variants: any[]
}

export function PreordersClient({
  initialConfigs,
  products,
  variants,
}: PreordersClientProps) {
  const supabase = createClient()
  const [configs, setConfigs] = useState<any[]>(initialConfigs)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Form states
  const [productId, setProductId] = useState('')
  const [variantId, setVariantId] = useState('')
  const [estimatedArrival, setEstimatedArrival] = useState('')
  const [depositAmount, setDepositAmount] = useState('')
  const [maxQty, setMaxQty] = useState('')
  const [closesAt, setClosesAt] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [error, setError] = useState('')

  // Filter variants for selected product
  const filteredVariants = variants.filter(
    (v) => v.product_id === parseInt(productId)
  )

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!productId) {
      setError('Please select a product.')
      return
    }
    if (!estimatedArrival) {
      setError('Estimated arrival date is required.')
      return
    }

    try {
      setLoading(true)
      setError('')

      const payload = {
        product_id: parseInt(productId),
        variant_id: variantId ? parseInt(variantId) : null,
        estimated_arrival: estimatedArrival,
        deposit_amount: depositAmount ? parseFloat(depositAmount) : null,
        max_qty: maxQty ? parseInt(maxQty) : null,
        closes_at: closesAt ? new Date(closesAt).toISOString() : null,
        is_active: isActive,
        reserved_qty: 0,
      }

      const { data, error: dbError } = await supabase
        .from('preorder_configs')
        .insert(payload)
        .select(`
          *,
          product:products(title, image_url),
          variant:product_variants(label)
        `)
        .single()

      if (dbError) throw dbError

      setConfigs((prev) => [data, ...prev])
      setIsOpen(false)

      // Reset form
      setProductId('')
      setVariantId('')
      setEstimatedArrival('')
      setDepositAmount('')
      setMaxQty('')
      setClosesAt('')
      setIsActive(true)
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Failed to create campaign.')
    } finally {
      setLoading(false)
    }
  }

  const toggleActiveStatus = async (id: number, currentStatus: boolean) => {
    try {
      setActionLoading(`toggle-${id}`)
      const { error: dbError } = await supabase
        .from('preorder_configs')
        .update({ is_active: !currentStatus })
        .eq('id', id)

      if (dbError) throw dbError

      setConfigs((prev) =>
        prev.map((c) => (c.id === id ? { ...c, is_active: !currentStatus } : c))
      )
    } catch (err) {
      console.error('Error toggling campaign status:', err)
    } finally {
      setActionLoading(null)
    }
  }

  const deleteCampaign = async (id: number) => {
    if (!confirm('Are you sure you want to delete this preorder campaign?')) return

    try {
      setActionLoading(`delete-${id}`)
      const { error: dbError } = await supabase
        .from('preorder_configs')
        .delete()
        .eq('id', id)

      if (dbError) throw dbError

      setConfigs((prev) => prev.filter((c) => c.id !== id))
    } catch (err) {
      console.error('Error deleting campaign:', err)
    } finally {
      setActionLoading(null)
    }
  }

  const activeConfigs = configs.filter((c) => c.is_active)
  const closedConfigs = configs.filter((c) => !c.is_active)

  return (
    <div className="p-6 lg:p-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display text-white mb-2">Preorder Campaigns</h1>
          <p className="text-text-muted">Manage active and closed preorders, deposits, and ETAs.</p>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="btn-primary flex items-center gap-2 py-3 px-5 shadow-lg shadow-brand-red/20 font-medium"
        >
          <Plus className="w-4 h-4" /> New Campaign
        </button>
      </div>

      {/* KPI Stats widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface-card border border-surface-border rounded-xl p-5">
          <div className="pb-2">
            <p className="text-text-muted text-sm uppercase tracking-wider font-semibold">Active Campaigns</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-white">{activeConfigs.length}</p>
          </div>
        </div>
        <div className="bg-surface-card border border-surface-border rounded-xl p-5">
          <div className="pb-2">
            <p className="text-text-muted text-sm uppercase tracking-wider font-semibold">Total Reserved</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-white">
              {configs.reduce((sum, c) => sum + (c.reserved_qty || 0), 0)} items
            </p>
          </div>
        </div>
      </div>

      {/* Active Campaigns */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Active Campaigns</h2>
        {activeConfigs.length === 0 ? (
          <p className="text-text-muted text-sm">No active preorders at the moment.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeConfigs.map((config) => (
              <PreorderCard
                key={config.id}
                config={config}
                onToggle={() => toggleActiveStatus(config.id, config.is_active)}
                onDelete={() => deleteCampaign(config.id)}
                actionLoading={actionLoading}
              />
            ))}
          </div>
        )}
      </div>

      {/* Closed Campaigns */}
      <div className="space-y-4 pt-8 border-t border-surface-border">
        <h2 className="text-xl font-semibold text-white">Closed Campaigns</h2>
        {closedConfigs.length === 0 ? (
          <p className="text-text-muted text-sm">No closed preorders.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {closedConfigs.map((config) => (
              <PreorderCard
                key={config.id}
                config={config}
                isClosed
                onToggle={() => toggleActiveStatus(config.id, config.is_active)}
                onDelete={() => deleteCampaign(config.id)}
                actionLoading={actionLoading}
              />
            ))}
          </div>
        )}
      </div>

      {/* Creation Dialog Modal */}
      <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-lg bg-surface-card border border-surface-border rounded-2xl shadow-2xl z-50 animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
            <div className="p-6">
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-surface-elevated text-text-muted hover:text-white hover:bg-brand-red transition-colors z-10"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>

              <Dialog.Title className="text-xl font-display text-brand-gold tracking-wide mb-6">
                Create Preorder Campaign
              </Dialog.Title>

              {error && (
                <div className="mb-4 p-3 bg-brand-red/10 border border-brand-red/20 text-brand-red text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleCreateCampaign} className="space-y-4 text-xs">
                {/* Product Field */}
                <div className="space-y-1">
                  <label className="text-text-muted font-semibold">Select Product *</label>
                  <select
                    value={productId}
                    onChange={(e) => {
                      setProductId(e.target.value)
                      setVariantId('') // Reset variant on product change
                    }}
                    className="w-full bg-surface-base border border-surface-border text-white p-3 rounded-lg outline-none focus:border-brand-red"
                  >
                    <option value="">-- Choose Product --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Variant Field */}
                {productId && filteredVariants.length > 0 && (
                  <div className="space-y-1 animate-in fade-in slide-in-from-top-1">
                    <label className="text-text-muted font-semibold">Select Variant (Optional)</label>
                    <select
                      value={variantId}
                      onChange={(e) => setVariantId(e.target.value)}
                      className="w-full bg-surface-base border border-surface-border text-white p-3 rounded-lg outline-none focus:border-brand-red"
                    >
                      <option value="">-- Campaign applies to main product --</option>
                      {filteredVariants.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Date Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-text-muted font-semibold">Estimated Arrival *</label>
                    <input
                      type="date"
                      value={estimatedArrival}
                      onChange={(e) => setEstimatedArrival(e.target.value)}
                      className="w-full bg-surface-base border border-surface-border text-white p-3 rounded-lg outline-none focus:border-brand-red"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-text-muted font-semibold">Campaign Closes At (Optional)</label>
                    <input
                      type="datetime-local"
                      value={closesAt}
                      onChange={(e) => setClosesAt(e.target.value)}
                      className="w-full bg-surface-base border border-surface-border text-white p-3 rounded-lg outline-none"
                    />
                  </div>
                </div>

                {/* Numeric inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-text-muted font-semibold">Deposit Amount (Optional, Rs.)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 1000 (Empty = Full Price)"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="w-full bg-surface-base border border-surface-border text-white p-3 rounded-lg outline-none focus:border-brand-red"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-text-muted font-semibold">Limit Quantity (Optional)</label>
                    <input
                      type="number"
                      placeholder="e.g. 50 (Empty = Unlimited)"
                      value={maxQty}
                      onChange={(e) => setMaxQty(e.target.value)}
                      className="w-full bg-surface-base border border-surface-border text-white p-3 rounded-lg outline-none focus:border-brand-red"
                    />
                  </div>
                </div>

                {/* Active Checkbox */}
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded border-surface-border text-brand-red focus:ring-brand-red bg-surface-base"
                  />
                  <label htmlFor="isActive" className="text-text-primary select-none cursor-pointer">
                    Enable campaign immediately
                  </label>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-primary py-3.5 flex items-center justify-center gap-2 text-sm font-semibold shadow-lg shadow-brand-red/10"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Create Preorder Campaign'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}

function PreorderCard({
  config,
  isClosed = false,
  onToggle,
  onDelete,
  actionLoading,
}: {
  config: any
  isClosed?: boolean
  onToggle: () => void
  onDelete: () => void
  actionLoading: string | null
}) {
  const percentFilled = config.max_qty
    ? Math.min(100, Math.round((config.reserved_qty / config.max_qty) * 100))
    : 0

  const isToggling = actionLoading === `toggle-${config.id}`
  const isDeleting = actionLoading === `delete-${config.id}`

  return (
    <div
      className={`p-5 rounded-xl border relative ${
        isClosed
          ? 'bg-surface-base border-surface-elevated'
          : 'bg-surface-elevated border-surface-border'
      }`}
    >
      <div className="flex justify-between items-start gap-4 mb-4">
        <div>
          <h3 className="font-semibold text-white text-xs line-clamp-1">
            {config.product?.title}
          </h3>
          {config.variant && (
            <p className="text-[10px] text-brand-red font-medium mt-0.5">
              {config.variant.label}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={onToggle}
            disabled={!!actionLoading}
            className={`px-2.5 py-1 rounded text-[9px] uppercase tracking-wider font-bold border transition-colors flex items-center gap-1 ${
              config.is_active
                ? 'text-green-400 border-green-500/20 bg-green-500/10 hover:bg-green-500/20'
                : 'text-text-faint border-surface-border bg-surface-elevated hover:bg-surface-border'
            }`}
          >
            {isToggling ? (
              <Loader2 className="w-2.5 h-2.5 animate-spin" />
            ) : config.is_active ? (
              'Active'
            ) : (
              'Inactive'
            )}
          </button>

          <button
            onClick={onDelete}
            disabled={!!actionLoading}
            className="p-1.5 rounded-lg bg-surface-base text-text-muted hover:text-brand-red hover:bg-brand-red/10 border border-surface-border transition-colors"
            title="Delete campaign"
          >
            {isDeleting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 text-[10px]">
        <div>
          <p className="text-text-faint uppercase tracking-wider mb-0.5">ETA</p>
          <p className="text-white font-mono">
            {new Date(config.estimated_arrival).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </p>
        </div>
        <div>
          <p className="text-text-faint uppercase tracking-wider mb-0.5">Deposit Required</p>
          <p className="text-brand-gold font-semibold font-mono">
            {config.deposit_amount ? formatPrice(config.deposit_amount) : 'Full Price'}
          </p>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-end mb-1 text-[10px]">
          <p className="text-text-faint uppercase tracking-wider">Reserved slots</p>
          <p className="font-semibold text-white font-mono">
            {config.reserved_qty} {config.max_qty ? `/ ${config.max_qty}` : 'Total'}
          </p>
        </div>
        {config.max_qty && (
          <div className="w-full bg-surface-border rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                percentFilled >= 100 ? 'bg-brand-red animate-pulse' : 'bg-brand-gold'
              }`}
              style={{ width: `${percentFilled}%` }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
