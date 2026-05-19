'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Plus,
  Calendar,
  Clock,
  Trash2,
  Edit2,
  Check,
  Zap,
  Flame,
  Loader2,
  User,
} from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'

interface DropsAdminClientProps {
  initialDrops: any[]
  products: any[]
}

export function DropsAdminClient({ initialDrops, products }: DropsAdminClientProps) {
  const supabase = createClient()
  const [drops, setDrops] = useState<any[]>(initialDrops)
  
  // Modal state
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [selectedProductId, setSelectedProductId] = useState('')
  const [dropName, setDropName] = useState('')
  const [dropsAt, setDropsAt] = useState('')
  const [waitingRoomOpensAt, setWaitingRoomOpensAt] = useState('')
  const [maxPerUser, setMaxPerUser] = useState(1)
  const [antiBotDelay, setAntiBotDelay] = useState(3)

  // Handle create drop
  const handleCreateDrop = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Validations
    const dropsTime = new Date(dropsAt)
    const waitingTime = new Date(waitingRoomOpensAt)
    const now = new Date()

    if (dropsTime <= now) {
      alert('Drop launch date/time must be in the future!')
      setIsSubmitting(false)
      return
    }

    if (waitingTime >= dropsTime) {
      alert('Waiting room must open before the drop launch time!')
      setIsSubmitting(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('product_drops')
        .insert([
          {
            product_id: parseInt(selectedProductId),
            drop_name: dropName.trim(),
            drops_at: dropsTime.toISOString(),
            waiting_room_opens_at: waitingTime.toISOString(),
            max_per_user: maxPerUser,
            anti_bot_delay: antiBotDelay,
            status: 'scheduled',
          },
        ])
        .select(`
          *,
          product:products(id, title, brand)
        `)

      if (error) throw error

      if (data) {
        setDrops([data[0], ...drops])
      }

      // Close and reset
      setIsOpen(false)
      setSelectedProductId('')
      setDropName('')
      setDropsAt('')
      setWaitingRoomOpensAt('')
      setMaxPerUser(1)
      setAntiBotDelay(3)
    } catch (err: any) {
      alert(err.message || 'Failed to create drop')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle status update
  const handleStatusUpdate = async (id: number, currentStatus: string) => {
    let nextStatus = 'scheduled'
    if (currentStatus === 'scheduled') nextStatus = 'waiting'
    else if (currentStatus === 'waiting') nextStatus = 'live'
    else if (currentStatus === 'live') nextStatus = 'ended'
    else return

    const confirmMsg = `Transition drop status to "${nextStatus.toUpperCase()}"?`
    if (!confirm(confirmMsg)) return

    try {
      const { error } = await supabase
        .from('product_drops')
        .update({ status: nextStatus })
        .eq('id', id)

      if (error) throw error

      setDrops(
        drops.map((d) => (d.id === id ? { ...d, status: nextStatus } : d))
      )
    } catch (err: any) {
      alert(err.message || 'Failed to update drop status')
    }
  }

  // Handle delete drop
  const handleDeleteDrop = async (id: number) => {
    if (!confirm('Are you sure you want to delete this scheduled drop?')) return

    try {
      const { error } = await supabase
        .from('product_drops')
        .delete()
        .eq('id', id)

      if (error) throw error

      setDrops(drops.filter((d) => d.id !== id))
    } catch (err: any) {
      alert(err.message || 'Failed to delete drop')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-surface-border pb-5">
        <div>
          <h1 className="font-display text-2xl text-white tracking-wide">
            PRODUCT DROPS MANAGER
          </h1>
          <p className="text-text-muted text-xs mt-1">
            Schedule new limited edition drops, configure waiting rooms, and manage launch status.
          </p>
        </div>

        <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
          <Dialog.Trigger asChild>
            <button className="btn-primary flex items-center gap-1.5 text-xs py-2">
              <Plus className="w-4 h-4" /> Schedule Drop
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
            <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md bg-surface-card border border-surface-border rounded-2xl shadow-2xl p-6 z-50 animate-in zoom-in-95 duration-200 max-h-[85vh] overflow-y-auto">
              <Dialog.Title className="text-lg font-display text-white mb-4">
                SCHEDULE NEW DROP
              </Dialog.Title>

              <form onSubmit={handleCreateDrop} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-text-muted font-medium">Select Product</label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="input-base w-full bg-surface-elevated text-xs"
                    required
                  >
                    <option value="">-- Choose Product --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} ({p.brand})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-text-muted font-medium">Drop Campaign Name</label>
                  <input
                    type="text"
                    placeholder="e.g. May Release Drop, Gold Series R34 Launch"
                    value={dropName}
                    onChange={(e) => setDropName(e.target.value)}
                    className="input-base text-xs"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-text-muted font-medium">Drops At (Launch)</label>
                    <input
                      type="datetime-local"
                      value={dropsAt}
                      onChange={(e) => setDropsAt(e.target.value)}
                      className="input-base text-xs font-mono"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-text-muted font-medium">Waiting Room Opens</label>
                    <input
                      type="datetime-local"
                      value={waitingRoomOpensAt}
                      onChange={(e) => setWaitingRoomOpensAt(e.target.value)}
                      className="input-base text-xs font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-text-muted font-medium">Limit Per User</label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={maxPerUser}
                      onChange={(e) => setMaxPerUser(parseInt(e.target.value))}
                      className="input-base text-xs"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-text-muted font-medium">Anti-Bot Delay (sec)</label>
                    <input
                      type="number"
                      min={0}
                      max={10}
                      value={antiBotDelay}
                      onChange={(e) => setAntiBotDelay(parseInt(e.target.value))}
                      className="input-base text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Dialog.Close asChild>
                    <button type="button" className="btn-secondary flex-1 text-xs">
                      Cancel
                    </button>
                  </Dialog.Close>
                  <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 text-xs">
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Schedule'}
                  </button>
                </div>
              </form>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>

      {/* Drops Table */}
      {drops.length === 0 ? (
        <div className="text-center py-12 bg-surface-card border border-surface-border rounded-xl">
          <Calendar className="w-12 h-12 text-surface-border mx-auto mb-3" />
          <p className="text-text-muted text-sm">No scheduled drops yet.</p>
        </div>
      ) : (
        <div className="bg-surface-card border border-surface-border rounded-xl overflow-hidden">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-surface-border bg-surface-elevated/40 text-[10px] text-text-muted uppercase tracking-widest font-semibold">
                <th className="p-4">Campaign / Product</th>
                <th className="p-4">Launch Time</th>
                <th className="p-4">Limits</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border text-xs">
              {drops.map((drop) => {
                const product = drop.product
                const statusColor =
                  drop.status === 'live'
                    ? 'text-green-400 bg-green-500/10 border-green-500/20'
                    : drop.status === 'waiting'
                    ? 'text-brand-orange bg-brand-orange/10 border-brand-orange/20'
                    : drop.status === 'ended'
                    ? 'text-text-faint bg-surface-elevated border-surface-border'
                    : 'text-blue-400 bg-blue-500/10 border-blue-500/20'

                return (
                  <tr key={drop.id} className="hover:bg-surface-elevated/20 transition-colors">
                    <td className="p-4">
                      <span className="font-semibold text-white block">
                        {drop.drop_name}
                      </span>
                      <span className="text-[10px] text-text-muted block mt-0.5">
                        {product?.title} ({product?.brand})
                      </span>
                    </td>
                    <td className="p-4 font-mono text-[10px] text-text-muted">
                      {new Date(drop.drops_at).toLocaleString()}
                    </td>
                    <td className="p-4 text-text-muted">
                      <span className="block">Max: {drop.max_per_user} per user</span>
                      <span className="block text-[10px]">Delay: {drop.anti_bot_delay}s</span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-block text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded border ${statusColor}`}>
                        {drop.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-1.5 shrink-0">
                      {drop.status !== 'ended' && (
                        <button
                          onClick={() => handleStatusUpdate(drop.id, drop.status)}
                          className="bg-brand-red/10 border border-brand-red/20 text-brand-red-light px-2.5 py-1 rounded hover:bg-brand-red/20 transition-colors text-[10px]"
                        >
                          {drop.status === 'scheduled' ? 'Open Waiting Room' : drop.status === 'waiting' ? 'Go Live' : 'End Drop'}
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDeleteDrop(drop.id)}
                        className="p-1.5 rounded bg-surface-elevated border border-surface-border text-text-muted hover:text-brand-red hover:bg-brand-red/10 transition-colors inline-flex items-center align-middle"
                        aria-label="Delete Drop"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
