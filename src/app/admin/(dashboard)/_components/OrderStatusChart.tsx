'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { KPISummary } from '@/lib/types/analytics'

interface Props { kpi: KPISummary }

const STATUS_COLORS: Record<string, string> = {
  Pending:    '#FACC15',
  Confirmed:  '#60A5FA',
  Processing: '#C084FC',
  Shipped:    '#FB923C',
  Delivered:  '#4ADE80',
  Cancelled:  '#F87171',
  Refunded:   '#F472B6',
}

export function OrderStatusChart({ kpi }: Props) {
  const data = [
    { name: 'Pending',    count: kpi.pendingCount },
    { name: 'Confirmed',  count: kpi.confirmedCount },
    { name: 'Processing', count: kpi.processingCount },
    { name: 'Shipped',    count: kpi.shippedCount },
    { name: 'Delivered',  count: kpi.deliveredCount },
    { name: 'Cancelled',  count: kpi.cancelledCount },
    { name: 'Refunded',   count: kpi.refundedCount },
  ].filter((d) => d.count > 0)

  return (
    <div className="bg-surface-card border border-surface-border rounded-xl p-6">
      <h2 className="font-semibold text-text-primary mb-5">Order Status</h2>
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-text-faint text-sm">No orders</div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 0 }}>
            <XAxis type="number" hide />
            <YAxis
              dataKey="name"
              type="category"
              width={72}
              tick={{ fill: '#888', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#1E1E1E', border: '1px solid #333', borderRadius: '10px', fontSize: 12 }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(val: any) => [val, 'Orders']}
              cursor={{ fill: 'rgba(255,255,255,0.03)' }}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={18}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={STATUS_COLORS[entry.name] ?? '#888'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
