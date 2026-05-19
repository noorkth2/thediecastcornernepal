'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Users,
  Zap,
  ShoppingBag,
  Flame,
  Award,
  Loader2,
  TrendingUp,
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'

export function EngagementTab() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)

  // Stats states
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [drops, setDrops] = useState<any[]>([])
  const [funnel, setFunnel] = useState({
    total: 0,
    purchased: 0,
    released: 0,
    pending: 0,
  })

  useEffect(() => {
    async function fetchEngagementData() {
      try {
        setLoading(true)

        // 1. Fetch Reservation Funnel
        const { data: reservations } = await supabase
          .from('stock_reservations')
          .select('id, status')

        if (reservations) {
          const total = reservations.length
          const purchased = reservations.filter((r) => r.status === 'purchased').length
          const released = reservations.filter((r) => r.status === 'released').length
          const pending = reservations.filter((r) => r.status === 'reserved').length
          setFunnel({ total, purchased, released, pending })
        }

        // 2. Fetch Drop Performance conversion rates
        const { data: dropsData } = await supabase
          .from('product_drops')
          .select(`
            *,
            product:products(id, title, price, stock_qty)
          `)
          .order('drops_at', { ascending: false })

        if (dropsData) {
          setDrops(dropsData)
        }

        // 3. Fetch Top Collectors Leaderboard
        // We select profiles and join their garage lists to see who has the largest collection
        const { data: profilesData } = await supabase
          .from('profiles')
          .select(`
            id,
            username,
            full_name,
            collector_garage (id)
          `)
          .limit(10)

        if (profilesData) {
          // Map to calculate sizes
          const mapped = profilesData
            .map((p: any) => ({
              id: p.id,
              username: p.username || 'anonymous',
              fullName: p.full_name || 'Collector',
              count: p.collector_garage?.length || 0,
            }))
            .sort((a, b) => b.count - a.count)
          setLeaderboard(mapped)
        }
      } catch (err) {
        console.error('Error loading engagement stats:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchEngagementData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-brand-red animate-spin" />
      </div>
    )
  }

  const purchaseRate = funnel.total > 0 ? Math.round((funnel.purchased / funnel.total) * 100) : 0
  const abandonRate = funnel.total > 0 ? Math.round((funnel.released / funnel.total) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Funnel & Drops Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reservation Funnel */}
        <div className="bg-surface-card border border-surface-border rounded-xl p-6 lg:col-span-1 flex flex-col justify-between">
          <div>
            <h2 className="font-semibold text-text-primary mb-1 flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4 text-brand-gold" />
              Reservation Checkout Funnel
            </h2>
            <p className="text-[10px] text-text-muted mb-4">
              Conversion rate of inventory items reserved in shopping carts.
            </p>
          </div>

          <div className="space-y-4 my-auto">
            {/* Step 1: Reserved */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-text-muted">1. Added & Reserved</span>
                <span className="font-bold text-white">{funnel.total} items</span>
              </div>
              <div className="h-2 bg-surface-elevated rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '100%' }} />
              </div>
            </div>

            {/* Step 2: Checked Out */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-text-muted flex items-center gap-1">
                  2. Purchased <span className="text-[10px] text-green-400">({purchaseRate}%)</span>
                </span>
                <span className="font-bold text-green-400">{funnel.purchased} items</span>
              </div>
              <div className="h-2 bg-surface-elevated rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${purchaseRate}%` }} />
              </div>
            </div>

            {/* Step 3: Abandoned */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-text-muted flex items-center gap-1">
                  3. Abandoned / Released <span className="text-[10px] text-brand-red">({abandonRate}%)</span>
                </span>
                <span className="font-bold text-brand-red">{funnel.released} items</span>
              </div>
              <div className="h-2 bg-surface-elevated rounded-full overflow-hidden">
                <div className="h-full bg-brand-red rounded-full" style={{ width: `${abandonRate}%` }} />
              </div>
            </div>
          </div>

          <div className="border-t border-surface-border pt-4 mt-6 flex justify-between text-xs text-text-muted">
            <span>Active Holds:</span>
            <span className="font-mono font-bold text-brand-gold animate-pulse">{funnel.pending} in progress</span>
          </div>
        </div>

        {/* Live Drops Conversion */}
        <div className="bg-surface-card border border-surface-border rounded-xl p-6 lg:col-span-2">
          <h2 className="font-semibold text-text-primary mb-1 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-brand-red animate-pulse" />
            Live Drop Campaigns
          </h2>
          <p className="text-[10px] text-text-muted mb-4">
            Recent campaigns and live inventory depletion tracking.
          </p>

          {drops.length === 0 ? (
            <div className="text-center py-8 text-text-faint text-xs">No drop campaigns scheduled.</div>
          ) : (
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
              {drops.map((drop) => {
                const isEnded = drop.status === 'ended'
                const isLive = drop.status === 'live'
                const product = drop.product
                const statusColor = isLive
                  ? 'text-green-400 border-green-500/20 bg-green-500/10'
                  : isEnded
                  ? 'text-text-faint border-surface-border bg-surface-elevated'
                  : 'text-blue-400 border-blue-500/20 bg-blue-500/10'

                return (
                  <div key={drop.id} className="border border-surface-border bg-surface-elevated/20 p-3 rounded-lg flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-white block">{drop.drop_name}</span>
                      <span className="text-[10px] text-text-muted block mt-0.5">
                        {product?.title} · Rs. {product?.price?.toLocaleString()}
                      </span>
                    </div>

                    <div className="text-right space-y-1">
                      <span className={`inline-block text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded border ${statusColor}`}>
                        {drop.status}
                      </span>
                      {product && (
                        <p className="text-[10px] text-text-muted block">
                          Stock Left: <span className="font-bold text-white">{product.stock_qty} units</span>
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Collector Leaderboard */}
      <div className="bg-surface-card border border-surface-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-text-primary mb-1 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-brand-gold" />
              Collector Community Leaderboard
            </h2>
            <p className="text-[10px] text-text-muted">
              Ranking of local collectors by the total count of models in their custom garages.
            </p>
          </div>
          <TrendingUp className="w-5 h-5 text-brand-gold" />
        </div>

        {leaderboard.length === 0 ? (
          <div className="text-center py-6 text-text-faint text-xs">No collectors have listed garage models yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {leaderboard.map((collector, idx) => {
              const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : null
              return (
                <div key={collector.id} className="flex items-center justify-between bg-surface-elevated/30 p-3 rounded-lg border border-surface-border text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-text-muted w-6 block">
                      {medal || `#${idx + 1}`}
                    </span>
                    <div>
                      <span className="font-semibold text-white block">
                        {collector.fullName}
                      </span>
                      <span className="text-[10px] text-text-faint block font-mono">
                        @{collector.username}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-brand-gold font-bold block">{collector.count} Models</span>
                    <span className="text-[9px] text-text-faint block uppercase tracking-wider font-semibold">Garage Garage</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
