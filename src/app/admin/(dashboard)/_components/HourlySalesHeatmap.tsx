'use client'

import type { HourlyOrderPattern } from '@/lib/types/analytics'
import { cn } from '@/lib/utils'

interface Props {
  data: HourlyOrderPattern[]
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const HOURS = Array.from({ length: 24 }, (_, i) => i)

export function HourlySalesHeatmap({ data }: Props) {
  // Build lookup: [day][hour] = count
  const map: Record<number, Record<number, number>> = {}
  let maxCount = 0
  for (const d of data) {
    if (!map[d.dayOfWeek]) map[d.dayOfWeek] = {}
    map[d.dayOfWeek][d.hourOfDay] = d.orderCount
    if (d.orderCount > maxCount) maxCount = d.orderCount
  }

  function intensity(count: number): string {
    if (count === 0 || maxCount === 0) return 'bg-surface-elevated opacity-30'
    const pct = count / maxCount
    if (pct >= 0.75) return 'bg-brand-red'
    if (pct >= 0.50) return 'bg-brand-red opacity-70'
    if (pct >= 0.25) return 'bg-brand-red opacity-40'
    return 'bg-brand-red opacity-20'
  }

  return (
    <div className="bg-surface-card border border-surface-border rounded-xl p-6">
      <h2 className="font-semibold text-text-primary mb-1">Order Heatmap</h2>
      <p className="text-text-faint text-xs mb-4">Activity by hour of day (Nepal time)</p>

      {data.length === 0 ? (
        <div className="flex items-center justify-center h-40 text-text-faint text-sm">
          Not enough data
        </div>
      ) : (
        <div className="overflow-x-auto">
          {/* Hour labels */}
          <div className="flex gap-0.5 mb-1 ml-8">
            {[0, 3, 6, 9, 12, 15, 18, 21].map((h) => (
              <div key={h} className="text-[9px] text-text-faint" style={{ width: `${(3 / 24) * 100}%` }}>
                {h === 0 ? '12a' : h < 12 ? `${h}a` : h === 12 ? '12p' : `${h - 12}p`}
              </div>
            ))}
          </div>
          {/* Grid */}
          {DAYS.map((day, dow) => (
            <div key={day} className="flex items-center gap-0.5 mb-0.5">
              <span className="text-[9px] text-text-faint w-7 shrink-0 text-right pr-1">{day}</span>
              {HOURS.map((hour) => {
                const count = map[dow]?.[hour] ?? 0
                return (
                  <div
                    key={hour}
                    title={`${day} ${hour}:00 — ${count} orders`}
                    className={cn(
                      'h-4 flex-1 rounded-[2px] transition-colors cursor-default',
                      intensity(count)
                    )}
                  />
                )
              })}
            </div>
          ))}
          {/* Legend */}
          <div className="flex items-center gap-1.5 mt-3 justify-end">
            <span className="text-[9px] text-text-faint">Less</span>
            {['opacity-20', 'opacity-40', 'opacity-70', 'opacity-100'].map((op) => (
              <div key={op} className={cn(`w-3 h-3 rounded-[2px] bg-brand-red ${op}`)} />
            ))}
            <span className="text-[9px] text-text-faint">More</span>
          </div>
        </div>
      )}
    </div>
  )
}
