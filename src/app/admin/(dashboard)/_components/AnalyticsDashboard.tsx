'use client'

import { useState, useTransition } from 'react'
import { getAnalyticsSummaryAction } from '../actions'
import type { AnalyticsSummary, PresetRange } from '@/lib/types/analytics'
import { DateRangePicker } from './DateRangePicker'
import { KPIGrid } from './KPIGrid'
import { RevenueAreaChart } from './RevenueAreaChart'
import { OrderStatusChart } from './OrderStatusChart'
import { PaymentMethodChart } from './PaymentMethodChart'
import { TopProductsTable } from './TopProductsTable'
import { HourlySalesHeatmap } from './HourlySalesHeatmap'
import { InventorySnapshot } from './InventorySnapshot'
import { PnLWidget } from './PnLWidget'
import { ForecastChart } from './ForecastChart'
import { AnalyticsSkeleton } from './AnalyticsSkeleton'
import { RefreshCw, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'

const TABS = [
  { id: 'overview',    label: 'Overview' },
  { id: 'orders',      label: 'Orders' },
  { id: 'products',    label: 'Products' },
  { id: 'inventory',   label: 'Inventory' },
  { id: 'finance',     label: 'Finance' },
  { id: 'forecasting', label: 'Forecasting' },
] as const

type Tab = typeof TABS[number]['id']

interface Props {
  initialData: AnalyticsSummary
}

export function AnalyticsDashboard({ initialData }: Props) {
  const [data, setData]         = useState<AnalyticsSummary>(initialData)
  const [activeTab, setTab]     = useState<Tab>('overview')
  const [preset, setPreset]     = useState<PresetRange>('month')
  const [isPending, startTransition] = useTransition()

  function handleRangeChange(newPreset: PresetRange, customStart?: string, customEnd?: string) {
    setPreset(newPreset)
    startTransition(async () => {
      const fresh = await getAnalyticsSummaryAction(newPreset, customStart, customEnd)
      setData(fresh)
    })
  }

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-brand-red" />
            <h1 className="font-display text-3xl text-white tracking-wide">DASHBOARD</h1>
            {isPending && (
              <RefreshCw className="w-4 h-4 text-brand-gold animate-spin ml-1" />
            )}
          </div>
          <p className="text-text-muted text-sm mt-1">
            {data.dateRange.label} ·{' '}
            <span className="text-text-faint">{data.kpi.totalOrders} orders</span>
          </p>
        </div>
        <DateRangePicker
          activePreset={preset}
          onChange={handleRangeChange}
          disabled={isPending}
        />
      </div>

      {/* ── Tabs ───────────────────────────────────────────────────── */}
      <div className="flex gap-1 bg-surface-card border border-surface-border p-1 rounded-xl w-fit">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200',
              activeTab === id
                ? 'bg-brand-red text-white shadow-sm'
                : 'text-text-muted hover:text-white hover:bg-surface-elevated'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Content ────────────────────────────────────────────────── */}
      {isPending ? (
        <AnalyticsSkeleton />
      ) : (
        <>
          {activeTab === 'overview' && (
            <OverviewTab data={data} />
          )}
          {activeTab === 'orders' && (
            <OrdersTab data={data} />
          )}
          {activeTab === 'products' && (
            <ProductsTab data={data} />
          )}
          {activeTab === 'inventory' && (
            <InventoryTab data={data} />
          )}
          {activeTab === 'finance' && (
            <FinanceTab data={data} />
          )}
          {activeTab === 'forecasting' && (
            <ForecastingTab data={data} />
          )}
        </>
      )}
    </div>
  )
}

// ─── Tab: Overview ────────────────────────────────────────────────────
function OverviewTab({ data }: { data: AnalyticsSummary }) {
  return (
    <div className="space-y-6">
      <KPIGrid kpi={data.kpi} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueAreaChart data={data.revenueByDay} />
        </div>
        <OrderStatusChart kpi={data.kpi} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PaymentMethodChart kpi={data.kpi} />
        <HourlySalesHeatmap data={data.hourlyPattern} />
      </div>
    </div>
  )
}

// ─── Tab: Orders ──────────────────────────────────────────────────────
function OrdersTab({ data }: { data: AnalyticsSummary }) {
  const { kpi } = data
  const statusRows = [
    { label: 'Pending',    count: kpi.pendingCount,    color: 'bg-yellow-400' },
    { label: 'Confirmed',  count: kpi.confirmedCount,  color: 'bg-blue-400' },
    { label: 'Processing', count: kpi.processingCount, color: 'bg-purple-400' },
    { label: 'Shipped',    count: kpi.shippedCount,    color: 'bg-orange-400' },
    { label: 'Delivered',  count: kpi.deliveredCount,  color: 'bg-green-400' },
    { label: 'Cancelled',  count: kpi.cancelledCount,  color: 'bg-red-500' },
    { label: 'Refunded',   count: kpi.refundedCount,   color: 'bg-pink-400' },
  ]
  const total = statusRows.reduce((s, r) => s + r.count, 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders',    value: kpi.totalOrders,    sub: `${kpi.ordersGrowthPct >= 0 ? '+' : ''}${kpi.ordersGrowthPct}% vs prev period`, color: 'text-brand-gold' },
          { label: 'Avg Order Value', value: `Rs. ${kpi.avgOrderValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, sub: 'per paid order', color: 'text-blue-400' },
          { label: 'Delivered',       value: kpi.deliveredCount, sub: 'fulfilled orders', color: 'text-green-400' },
          { label: 'Cancelled',       value: kpi.cancelledCount, sub: 'lost orders',      color: 'text-red-400' },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="bg-surface-card border border-surface-border rounded-xl p-5">
            <p className="text-text-faint text-xs uppercase tracking-widest">{label}</p>
            <p className={`font-bold text-2xl mt-1 ${color}`}>{value}</p>
            <p className="text-text-faint text-xs mt-1">{sub}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status breakdown table */}
        <div className="bg-surface-card border border-surface-border rounded-xl p-6">
          <h2 className="font-semibold text-text-primary mb-4">Order Status Breakdown</h2>
          <div className="space-y-3">
            {statusRows.map((row) => {
              const pct = total > 0 ? Math.round((row.count / total) * 100) : 0
              return (
                <div key={row.label}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-text-muted">{row.label}</span>
                    <span className="text-sm font-semibold text-text-primary">
                      {row.count} <span className="text-text-faint font-normal">({pct}%)</span>
                    </span>
                  </div>
                  <div className="h-2 bg-surface-elevated rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-700 ${row.color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        {/* Payment methods */}
        <PaymentMethodChart kpi={data.kpi} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueAreaChart data={data.revenueByDay} title="Daily Order Revenue" />
        <HourlySalesHeatmap data={data.hourlyPattern} />
      </div>
    </div>
  )
}

// ─── Tab: Products ────────────────────────────────────────────────────
function ProductsTab({ data }: { data: AnalyticsSummary }) {
  return (
    <div className="space-y-6">
      <TopProductsTable products={data.topProducts} />
      {data.inventorySnapshot.outOfStockCount > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-6 py-4 text-sm text-red-400">
          ⚠ {data.inventorySnapshot.outOfStockCount} products are currently out of stock
        </div>
      )}
    </div>
  )
}

// ─── Tab: Inventory ───────────────────────────────────────────────────
function InventoryTab({ data }: { data: AnalyticsSummary }) {
  return (
    <div className="space-y-6">
      <InventorySnapshot snapshot={data.inventorySnapshot} lowStock={data.lowStockProducts} />
    </div>
  )
}

// ─── Tab: Finance ─────────────────────────────────────────────────────
function FinanceTab({ data }: { data: AnalyticsSummary }) {
  return (
    <div className="space-y-6">
      <PnLWidget pnl={data.pnlStatement} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueAreaChart data={data.revenueByDay} title="Revenue Trend" />
        {/* Expense breakdown */}
        {data.pnlStatement.expenseBreakdown.length > 0 && (
          <div className="bg-surface-card border border-surface-border rounded-xl p-6">
            <h2 className="font-semibold text-text-primary mb-4">Expense Breakdown</h2>
            <div className="space-y-3">
              {data.pnlStatement.expenseBreakdown.map((exp) => (
                <div key={exp.category}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-text-muted">{exp.label}</span>
                    <span className="text-sm font-semibold text-text-primary">
                      Rs. {exp.amount.toLocaleString('en-IN')}
                      <span className="text-text-faint font-normal ml-1">({exp.pct}%)</span>
                    </span>
                  </div>
                  <div className="h-2 bg-surface-elevated rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-brand-red transition-all duration-700" style={{ width: `${exp.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Tab: Forecasting ─────────────────────────────────────────────────
function ForecastingTab({ data }: { data: AnalyticsSummary }) {
  const critical = data.stockExhaustionForecasts.filter((s) => s.urgency === 'critical')
  const warning  = data.stockExhaustionForecasts.filter((s) => s.urgency === 'warning')

  return (
    <div className="space-y-6">
      {/* Predicted next month */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Predicted Next 30 Days',
            value: `Rs. ${data.forecastPoints.filter(p => p.isForecasted).slice(0, 30).reduce((s, p) => s + p.predictedRevenue, 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
            color: 'text-brand-gold',
          },
          { label: 'Critical Stock Items',  value: critical.length, color: 'text-red-400' },
          { label: 'Warning Stock Items',   value: warning.length,  color: 'text-orange-400' },
          { label: 'Healthy Stock Items',   value: data.stockExhaustionForecasts.filter((s) => s.urgency === 'ok').length, color: 'text-green-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-surface-card border border-surface-border rounded-xl p-5">
            <p className="text-text-faint text-xs uppercase tracking-widest">{label}</p>
            <p className={`font-bold text-2xl mt-2 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <ForecastChart data={data.forecastPoints} />

      {/* Stock exhaustion table */}
      {data.stockExhaustionForecasts.length > 0 && (
        <div className="bg-surface-card border border-surface-border rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-border">
            <h2 className="font-semibold text-text-primary">Stock Exhaustion Forecast</h2>
            <p className="text-text-faint text-xs mt-0.5">Based on 30-day sales velocity</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border bg-surface-elevated/50">
                  {['Product', 'Brand', 'Stock', 'Avg Daily Sales', 'Days Left', 'Status'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-widest whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {data.stockExhaustionForecasts.map((item) => (
                  <tr key={item.productId} className="hover:bg-surface-elevated/30 transition-colors">
                    <td className="px-4 py-3 text-text-primary font-medium max-w-[200px] truncate">{item.title}</td>
                    <td className="px-4 py-3 text-text-muted">{item.brand ?? '—'}</td>
                    <td className="px-4 py-3 font-semibold text-text-primary">{item.stockQty}</td>
                    <td className="px-4 py-3 text-text-muted">{item.avgDailySales.toFixed(2)}</td>
                    <td className="px-4 py-3 font-semibold">
                      {item.daysUntilStockOut === null ? (
                        <span className="text-text-faint">No sales</span>
                      ) : (
                        <span className={item.urgency === 'critical' ? 'text-red-400' : item.urgency === 'warning' ? 'text-orange-400' : 'text-green-400'}>
                          {item.daysUntilStockOut}d
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        item.urgency === 'critical' ? 'bg-red-500/15 text-red-400' :
                        item.urgency === 'warning'  ? 'bg-orange-500/15 text-orange-400' :
                                                      'bg-green-500/15 text-green-400'
                      }`}>
                        {item.urgency.charAt(0).toUpperCase() + item.urgency.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
