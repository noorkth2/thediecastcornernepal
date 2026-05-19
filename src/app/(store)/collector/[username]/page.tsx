import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { computeBadges, type CollectorStats } from '@/lib/badges/compute'
import { formatPrice } from '@/lib/utils'
import { Car, Award, Calendar, BadgeCheck, ShieldAlert } from 'lucide-react'
import Image from 'next/image'

interface CollectorProfilePageProps {
  params: Promise<{ username: string }>
}

export const revalidate = 60 // Cache for 60 seconds

export default async function CollectorProfilePage(props: CollectorProfilePageProps) {
  const params = await props.params
  const supabase = await createClient()

  // 1. Fetch public profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, bio, avatar_url, is_public, created_at')
    .eq('username', params.username.toLowerCase().trim())
    .eq('is_public', true)
    .single()

  if (profileError || !profile) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <ShieldAlert className="w-16 h-16 text-brand-red mx-auto mb-4" />
        <h1 className="font-display text-2xl text-white tracking-wide">
          PROFILE NOT FOUND
        </h1>
        <p className="text-text-muted text-sm mt-2">
          This collector's profile is either private or does not exist.
        </p>
      </div>
    )
  }

  // 2. Fetch stats securely
  // Get count of orders
  const { count: ordersCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', profile.id)

  // Get total spent on completed/paid orders
  const { data: ordersData } = await supabase
    .from('orders')
    .select('total_amount')
    .eq('user_id', profile.id)
    .or("payment_status.eq.paid,status.eq.delivered")

  const totalSpent = (ordersData || []).reduce((sum, o) => sum + o.total_amount, 0)

  // Fetch unified collector items
  const { data: items } = await supabase
    .from('collector_items')
    .select('*')
    .eq('user_id', profile.id)
    .order('acquired_at', { ascending: false })

  const collectorItems = items || []

  // Compute collector stats
  const uniqueBrands = new Set(
    collectorItems.map((i) => i.brand?.toLowerCase()).filter(Boolean)
  ).size

  const uniqueScales = new Set(
    collectorItems.map((i) => i.scale?.toLowerCase()).filter(Boolean)
  )

  const hasTreasureHunt = collectorItems.some((i) => i.is_treasure_hunt)

  const stats: CollectorStats = {
    totalSpent,
    totalModels: collectorItems.length,
    uniqueBrands,
    ordersCount: ordersCount || 0,
    hasTreasureHunt,
    uniqueScalesCount: uniqueScales.size,
  }

  const badges = computeBadges(stats)
  const unlockedBadges = badges.filter((b) => b.unlocked)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Collector Intro card */}
      <div className="bg-surface-card border border-surface-border rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden product-card-top-bar">
        <div className="w-24 h-24 rounded-full bg-brand-red/10 border-2 border-brand-red/30 flex items-center justify-center text-4xl text-brand-red flex-shrink-0">
          🏎️
        </div>

        <div className="flex-1 text-center md:text-left min-w-0">
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <h1 className="text-2xl font-bold text-white truncate">
              {profile.full_name || 'Collector'}
            </h1>
            <span className="inline-flex items-center justify-center gap-1 text-xs bg-brand-gold/10 text-brand-gold border border-brand-gold/20 px-2 py-0.5 rounded-full font-semibold max-w-max mx-auto md:mx-0">
              <BadgeCheck className="w-3.5 h-3.5" /> Verified Collector
            </span>
          </div>

          <p className="text-text-muted font-mono text-sm mt-1">@{params.username}</p>

          {profile.bio && (
            <p className="text-text-primary text-sm mt-4 bg-surface-elevated/40 border border-surface-border p-3 rounded-xl italic">
              "{profile.bio}"
            </p>
          )}

          <div className="flex items-center justify-center md:justify-start gap-2 text-text-faint text-xs mt-4">
            <Calendar className="w-3.5 h-3.5" /> Member since {new Date(profile.created_at).getFullYear()}
          </div>
        </div>

        {/* Quick Stats overview */}
        <div className="grid grid-cols-2 gap-4 w-full md:w-auto md:min-w-[240px]">
          {[
            { label: 'Collection Size', value: stats.totalModels },
            { label: 'Badges Earned', value: unlockedBadges.length },
          ].map(({ label, value }) => (
            <div key={label} className="bg-surface-elevated border border-surface-border p-4 rounded-xl text-center">
              <span className="text-[10px] text-text-faint uppercase tracking-wider block">{label}</span>
              <span className="text-xl font-bold text-brand-gold block mt-1">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Grid: Badges + Collection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Badges List */}
        <div className="space-y-4 lg:col-span-1">
          <h2 className="font-display text-lg text-white tracking-wide uppercase flex items-center gap-2">
            <Award className="w-5 h-5 text-brand-gold" /> Achievements ({unlockedBadges.length})
          </h2>

          <div className="space-y-3">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className={`border rounded-xl p-4 flex items-center gap-3.5 transition-all ${
                  badge.unlocked
                    ? 'bg-surface-card border-brand-gold/25'
                    : 'bg-surface-card/30 border-surface-border opacity-40'
                }`}
              >
                <span className="text-2xl">{badge.icon}</span>
                <div className="min-w-0">
                  <h4 className="font-semibold text-xs text-white truncate">
                    {badge.name}
                  </h4>
                  <p className="text-[10px] text-text-muted mt-0.5 leading-snug">
                    {badge.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Showcase Garage */}
        <div className="space-y-4 lg:col-span-2">
          <h2 className="font-display text-lg text-white tracking-wide uppercase flex items-center gap-2">
            <Car className="w-5 h-5 text-brand-red" /> Showcase Gallery ({collectorItems.length})
          </h2>

          {collectorItems.length === 0 ? (
            <div className="text-center py-20 bg-surface-card border border-surface-border rounded-2xl">
              <Car className="w-12 h-12 text-surface-border mx-auto mb-3" />
              <p className="text-text-muted">No models showcased in this garage yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {collectorItems.map((item, index) => (
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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
