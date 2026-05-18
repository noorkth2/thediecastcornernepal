'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { KPISummary } from '@/lib/types/analytics'

interface Props { kpi: KPISummary }

const METHODS = [
  { key: 'codCount',    revenueKey: 'codRevenue',    label: 'Cash on Delivery', color: '#F5C518' },
  { key: 'khaltiCount', revenueKey: 'khaltiRevenue', label: 'Khalti',           color: '#7C3AED' },
  { key: 'esewaCount',  revenueKey: 'esewaRevenue',  label: 'eSewa',            color: '#16A34A' },
]

export function PaymentMethodChart({ kpi }: Props) {
  const data = METHODS
    .map((m) => ({
      name: m.label,
      count: kpi[m.key as keyof KPISummary] as number,
      revenue: kpi[m.revenueKey as keyof KPISummary] as number,
      color: m.color,
    }))
    .filter((d) => d.count > 0)

  const total = data.reduce((s, d) => s + d.count, 0)

  if (total === 0) {
    return (
      <div className="bg-surface-card border border-surface-border rounded-xl p-6">
        <h2 className="font-semibold text-text-primary mb-4">Payment Methods</h2>
        <div className="flex items-center justify-center h-40 text-text-faint text-sm">No order data</div>
      </div>
    )
  }

  return (
    <div className="bg-surface-card border border-surface-border rounded-xl p-6">
      <h2 className="font-semibold text-text-primary mb-2">Payment Methods</h2>
      <div className="flex items-center gap-6">
        <ResponsiveContainer width={160} height={160}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={48}
              outerRadius={72}
              dataKey="count"
              strokeWidth={0}
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: '#1E1E1E', border: '1px solid #333', borderRadius: '10px', fontSize: 12 }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any, name: any) => [
                `${value} orders (${Math.round((value / total) * 100)}%)`,
                name,
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex-1 space-y-3">
          {data.map((d) => (
            <div key={d.name}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-xs text-text-muted">{d.name}</span>
                </div>
                <span className="text-xs font-semibold text-text-primary">{d.count}</span>
              </div>
              <div className="h-1.5 bg-surface-elevated rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.round((d.count / total) * 100)}%`, backgroundColor: d.color }}
                />
              </div>
              <p className="text-[10px] text-text-faint mt-0.5">
                Rs. {d.revenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })} revenue
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
