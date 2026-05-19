'use client'

import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { computeBadges, type CollectorStats } from '@/lib/badges/compute'
import { formatPrice } from '@/lib/utils'
import {
  Car,
  Award,
  Globe,
  Lock,
  Plus,
  Trash2,
  Check,
  Loader2,
  ChevronRight,
  ExternalLink,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import * as Dialog from '@radix-ui/react-dialog'

interface GarageClientProps {
  profile: any
  initialItems: any[]
  orders: any[]
  availableProducts: any[]
}

export function GarageClient({
  profile,
  initialItems,
  orders,
  availableProducts,
}: GarageClientProps) {
  const supabase = createClient()
  const [items, setItems] = useState<any[]>(initialItems)
  
  // Profile settings state
  const [username, setUsername] = useState(profile?.username || '')
  const [bio, setBio] = useState(profile?.bio || '')
  const [isPublic, setIsPublic] = useState(profile?.is_public || false)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [profileMsg, setProfileMsg] = useState({ text: '', type: '' })

  // Active tab state
  const [activeTab, setActiveTab] = useState<'garage' | 'badges'>('garage')

  // Add Item Modal state
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [addType, setAddType] = useState<'official' | 'custom'>('official')
  const [selectedProductId, setSelectedProductId] = useState<string>('')
  const [customName, setCustomName] = useState('')
  const [customBrand, setCustomBrand] = useState('')
  const [customImage, setCustomImage] = useState('')
  const [notes, setNotes] = useState('')
  const [acquiredAt, setAcquiredAt] = useState(new Date().toISOString().split('T')[0])

  // Calculate stats
  const stats = useMemo<CollectorStats>(() => {
    const totalSpent = orders
      .filter((o) => o.payment_status === 'paid')
      .reduce((sum, o) => sum + o.total_amount, 0)

    const totalModels = items.length

    const uniqueBrands = new Set(
      items.map((i) => i.brand?.toLowerCase()).filter(Boolean)
    ).size

    const uniqueScales = new Set(
      items.map((i) => i.scale?.toLowerCase()).filter(Boolean)
    )
    const uniqueScalesCount = uniqueScales.size

    const hasTreasureHunt = items.some((i) => i.is_treasure_hunt)

    return {
      totalSpent,
      totalModels,
      uniqueBrands,
      ordersCount: orders.length,
      hasTreasureHunt,
      uniqueScalesCount,
    }
  }, [items, orders])

  // Compute badges
  const badges = useMemo(() => computeBadges(stats), [stats])

  // Save profile changes
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingProfile(true)
    setProfileMsg({ text: '', type: '' })

    try {
      // Validate username regex: alphanumeric + underscores/dashes, min 3 chars
      if (username) {
        const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/
        if (!usernameRegex.test(username)) {
          setProfileMsg({
            text: 'Username must be 3-20 characters and contain only letters, numbers, underscores, or dashes.',
            type: 'error',
          })
          setIsSavingProfile(false)
          return
        }
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          username: username.toLowerCase().trim() || null,
          bio: bio.trim() || null,
          is_public: isPublic,
        })
        .eq('id', profile.id)

      if (error) {
        if (error.code === '23505') {
          setProfileMsg({ text: 'Username is already taken by another collector.', type: 'error' })
        } else {
          setProfileMsg({ text: error.message, type: 'error' })
        }
      } else {
        setProfileMsg({ text: 'Profile updated successfully!', type: 'success' })
      }
    } catch (err: any) {
      setProfileMsg({ text: err.message || 'Something went wrong', type: 'error' })
    } finally {
      setIsSavingProfile(false)
    }
  }

  // Handle adding item
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const payload: any = {
        user_id: profile.id,
        acquired_at: new Date(acquiredAt).toISOString(),
        notes: notes.trim() || null,
      }

      if (addType === 'official') {
        if (!selectedProductId) {
          alert('Please select a product')
          setIsSubmitting(false)
          return
        }
        payload.product_id = parseInt(selectedProductId)
      } else {
        if (!customName.trim()) {
          alert('Please enter a model name')
          setIsSubmitting(false)
          return
        }
        payload.custom_name = customName.trim()
        payload.custom_brand = customBrand.trim() || null
        payload.custom_image = customImage.trim() || null
      }

      const { data, error } = await supabase
        .from('collector_garage')
        .insert([payload])
        .select()

      if (error) throw error

      // Refresh items list
      const { data: updatedItems } = await supabase
        .from('collector_items')
        .select('*')
        .eq('user_id', profile.id)
        .order('acquired_at', { ascending: false })

      if (updatedItems) setItems(updatedItems)

      // Reset form
      setIsAddOpen(false)
      setSelectedProductId('')
      setCustomName('')
      setCustomBrand('')
      setCustomImage('')
      setNotes('')
    } catch (err: any) {
      alert(err.message || 'Failed to add item')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle deleting manual item
  const handleDeleteItem = async (garageId: string) => {
    if (!confirm('Are you sure you want to remove this model from your garage?')) return

    try {
      const { error } = await supabase
        .from('collector_garage')
        .delete()
        .eq('id', garageId)

      if (error) throw error

      setItems(items.filter((i) => i.garage_id !== garageId))
    } catch (err: any) {
      alert(err.message || 'Failed to delete item')
    }
  }

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-surface-border pb-6">
        <div>
          <h1 className="font-display text-3xl text-white tracking-wide uppercase">
            My Collector Garage
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Display your models, earn badges, and share your passion.
          </p>
        </div>

        <Dialog.Root open={isAddOpen} onOpenChange={setIsAddOpen}>
          <Dialog.Trigger asChild>
            <button className="btn-primary flex items-center gap-2 text-sm py-2">
              <Plus className="w-4 h-4" /> Add to Garage
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
            <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-lg bg-surface-card border border-surface-border rounded-2xl shadow-2xl p-6 z-50 animate-in zoom-in-95 duration-200 max-h-[85vh] overflow-y-auto">
              <Dialog.Title className="text-xl font-display text-white mb-4">
                ADD A MODEL TO YOUR GARAGE
              </Dialog.Title>

              <form onSubmit={handleAddItem} className="space-y-4">
                {/* Type Selection */}
                <div className="flex bg-surface-elevated p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setAddType('official')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                      addType === 'official'
                        ? 'bg-brand-red text-white'
                        : 'text-text-muted hover:text-white'
                    }`}
                  >
                    Official Store Product
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddType('custom')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                      addType === 'custom'
                        ? 'bg-brand-red text-white'
                        : 'text-text-muted hover:text-white'
                    }`}
                  >
                    Custom / External Model
                  </button>
                </div>

                {addType === 'official' ? (
                  <div className="space-y-1.5">
                    <label className="text-xs text-text-muted font-medium">Select Product</label>
                    <select
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                      className="input-base w-full bg-surface-elevated"
                      required
                    >
                      <option value="">-- Choose from Catalog --</option>
                      {availableProducts.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title} ({p.brand})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-xs text-text-muted font-medium">Model Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Custom Datsun 510 Wagon"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        className="input-base"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-text-muted font-medium">Brand (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. Hot Wheels / Custom"
                        value={customBrand}
                        onChange={(e) => setCustomBrand(e.target.value)}
                        className="input-base"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-text-muted font-medium">Image URL (Optional)</label>
                      <input
                        type="url"
                        placeholder="https://..."
                        value={customImage}
                        onChange={(e) => setCustomImage(e.target.value)}
                        className="input-base"
                      />
                    </div>
                  </>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs text-text-muted font-medium">Acquisition Date</label>
                  <input
                    type="date"
                    value={acquiredAt}
                    onChange={(e) => setAcquiredAt(e.target.value)}
                    className="input-base"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-text-muted font-medium">Notes / Specs</label>
                  <textarea
                    placeholder="Describe custom builds, card condition, or memories..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="input-base min-h-[80px]"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Dialog.Close asChild>
                    <button type="button" className="btn-secondary flex-1">
                      Cancel
                    </button>
                  </Dialog.Close>
                  <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Add Model'}
                  </button>
                </div>
              </form>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>

      {/* Profile Settings Section */}
      <div className="bg-surface-card border border-surface-border rounded-2xl p-6">
        <h2 className="font-display text-lg text-white mb-4 flex items-center gap-2">
          {isPublic ? <Globe className="w-4 h-4 text-green-400" /> : <Lock className="w-4 h-4 text-text-muted" />}
          GARAGE PUBLIC SHARING & PROFILE
        </h2>
        
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_public"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="w-4 h-4 accent-brand-red rounded border-surface-border bg-surface-elevated text-brand-red"
            />
            <label htmlFor="is_public" className="text-sm font-medium text-text-primary">
              Make my collector garage public at:
            </label>
          </div>

          {isPublic && (
            <div className="flex items-center gap-1.5 text-xs text-brand-gold bg-brand-gold/5 border border-brand-gold/20 p-2.5 rounded-lg font-mono">
              <Globe className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">
                {window.location.origin}/collector/{username || 'your-username'}
              </span>
              {username && (
                <Link
                  href={`/collector/${username}`}
                  target="_blank"
                  className="hover:text-white flex items-center gap-0.5 ml-auto"
                >
                  Visit <ExternalLink className="w-3 h-3" />
                </Link>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-text-muted font-medium">Username (Unique handle)</label>
              <input
                type="text"
                placeholder="e.g. SkylineCollector99"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-base"
                required={isPublic}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-text-muted font-medium">Short Bio</label>
              <input
                type="text"
                placeholder="MiniGT lover, mostly collecting 1:64 JDM..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="input-base"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {profileMsg.text && (
              <span className={`text-xs font-medium ${profileMsg.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                {profileMsg.text}
              </span>
            )}
            <button
              type="submit"
              disabled={isSavingProfile}
              className="btn-secondary ml-auto py-2 text-xs flex items-center gap-1.5"
            >
              {isSavingProfile ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              Save Settings
            </button>
          </div>
        </form>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Models', value: stats.totalModels, color: 'text-brand-red' },
          { label: 'Unique Brands', value: stats.uniqueBrands, color: 'text-brand-orange' },
          { label: 'Unique Scales', value: stats.uniqueScalesCount, color: 'text-blue-400' },
          { label: 'Total Value', value: formatPrice(stats.totalSpent), color: 'text-brand-gold' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-surface-card border border-surface-border rounded-xl p-4">
            <p className="text-[10px] text-text-faint uppercase tracking-wider font-semibold">
              {label}
            </p>
            <p className={`text-lg font-bold mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Tab Control */}
      <div className="flex border-b border-surface-border gap-6">
        <button
          onClick={() => setActiveTab('garage')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'garage'
              ? 'border-brand-red text-white'
              : 'border-transparent text-text-muted hover:text-white'
          }`}
        >
          <Car className="w-4 h-4" /> My Collection ({items.length})
        </button>
        <button
          onClick={() => setActiveTab('badges')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'badges'
              ? 'border-brand-red text-white'
              : 'border-transparent text-text-muted hover:text-white'
          }`}
        >
          <Award className="w-4 h-4" /> Badges ({badges.filter((b) => b.unlocked).length})
        </button>
      </div>

      {/* Tab Content: Garage Collection */}
      {activeTab === 'garage' && (
        <div className="space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-12 bg-surface-card border border-surface-border rounded-2xl">
              <Car className="w-12 h-12 text-surface-border mx-auto mb-3" />
              <p className="text-text-muted">Your virtual garage is empty.</p>
              <button
                onClick={() => setIsAddOpen(true)}
                className="text-brand-red-light hover:underline text-sm font-medium mt-2 inline-flex items-center gap-1"
              >
                Add your first model <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map((item, index) => (
                <div
                  key={item.garage_id || `${item.product_id}-${index}`}
                  className="bg-surface-card border border-surface-border rounded-xl p-3 flex flex-col group relative overflow-hidden product-card-top-bar"
                >
                  <div className="relative aspect-video w-full bg-surface-base rounded-lg flex items-center justify-center overflow-hidden mb-3">
                    {item.image_url ? (
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        fill
                        className="object-contain p-1.5 transition-transform group-hover:scale-105"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                    ) : (
                      <Car className="w-8 h-8 text-surface-border" />
                    )}
                    
                    <span className="absolute top-2 left-2 text-[9px] bg-black/60 backdrop-blur px-1.5 py-0.5 rounded text-text-muted font-mono uppercase">
                      {item.source === 'purchase' ? '🛒 Bought' : '🔧 Custom'}
                    </span>

                    {item.is_treasure_hunt && (
                      <span className="absolute top-2 right-2 badge-th text-[8px] px-1 py-0">
                        ⭐ TH
                      </span>
                    )}
                  </div>

                  <h3 className="font-semibold text-white text-xs truncate leading-tight">
                    {item.name}
                  </h3>
                  <p className="text-[10px] text-text-muted uppercase tracking-widest mt-1">
                    {item.brand || 'Unknown Brand'}
                  </p>

                  {item.notes && (
                    <p className="text-[10px] text-text-faint mt-2 italic line-clamp-2">
                      "{item.notes}"
                    </p>
                  )}

                  {/* Actions (Delete only if custom/manual addition) */}
                  {item.source === 'manual' && item.garage_id && (
                    <button
                      onClick={() => handleDeleteItem(item.garage_id)}
                      className="absolute bottom-3 right-3 p-1.5 rounded bg-surface-elevated border border-surface-border text-text-muted hover:text-brand-red hover:bg-brand-red/10 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remove model"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Badges */}
      {activeTab === 'badges' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`border rounded-2xl p-5 flex items-start gap-4 transition-all duration-300 ${
                badge.unlocked
                  ? 'bg-surface-card border-brand-gold/30 shadow-lg shadow-brand-gold/5'
                  : 'bg-surface-card/40 border-surface-border opacity-50'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${
                  badge.unlocked
                    ? 'bg-brand-gold/10 border border-brand-gold/30'
                    : 'bg-surface-elevated border border-surface-border'
                }`}
              >
                {badge.icon}
              </div>
              <div className="min-w-0">
                <h3 className={`font-semibold text-sm ${badge.unlocked ? 'text-white' : 'text-text-muted'}`}>
                  {badge.name}
                </h3>
                <p className="text-xs text-text-faint mt-1 leading-normal">
                  {badge.description}
                </p>
                <span
                  className={`inline-block text-[9px] uppercase tracking-wider font-bold mt-2.5 px-2 py-0.5 rounded ${
                    badge.unlocked
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                      : 'bg-surface-elevated text-text-faint border border-surface-border'
                  }`}
                >
                  {badge.unlocked ? 'Unlocked' : 'Locked'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
