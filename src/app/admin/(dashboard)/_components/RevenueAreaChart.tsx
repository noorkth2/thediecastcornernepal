'use client'

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, type TooltipProps
} from 'recharts'
import type { RevenueByDay } from '@/lib/types/analytics'

interface Props {
  data: RevenueByDay[]
  title?: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload as RevenueByDay
  return (
    <div className="bg-surface-card border border-surface-border rounded-xl px-4 py-3 shadow-2xl min-w-[160px]">
      <p className="text-text-faint text-xs mb-2 font-medium">{label}</p>
      <p className="text-brand-gold font-bold text-base">
        Rs. {(d.revenue ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
      </p>
      <p className="text-text-muted text-xs mt-1">{d.orderCount} orders</p>
      {d.discountTotal > 0 && (
        <p className="text-red-400 text-xs mt-0.5">–Rs. {d.discountTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })} discount</p>
      )}
    </div>
  )
}

export function RevenueAreaChart({ data, title = 'Revenue Trend' }: Props) {
  return (
    <div className="bg-surface-card border border-surface-border rounded-xl p-6">
      <h2 className="font-semibold text-text-primary mb-5">{title}</h2>
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-text-faint text-sm">
          No revenue data for this period
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#C0392B" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#C0392B" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#333"
              tick={{ fill: '#555', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              stroke="#333"
              tick={{ fill: '#555', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
              width={48}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#C0392B', strokeWidth: 1, strokeDasharray: '4 4' }} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#C0392B"
              strokeWidth={2.5}
              fill="url(#revenueGrad)"
              dot={false}
              activeDot={{ r: 5, fill: '#C0392B', stroke: '#1E1E1E', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
