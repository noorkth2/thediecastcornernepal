'use client'

import { useState, useTransition, useCallback } from 'react'
import type { ReportType, ReportFilters } from '@/lib/types/analytics'
import { ExportBar } from './ExportBar'
import { ReportTable } from './ReportTable'
import { ReportFiltersBar } from './ReportFilters'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { fetchReportAction } from '../actions'

// Column definitions per report type
const COLUMNS: Record<ReportType, Array<{ key: string; label: string; align?: 'right'; format?: string }>> = {
  'sales-daily': [
    { key: 'order_code',    label: 'Order Code' },
    { key: 'created_at',   label: 'Date',    format: 'date' },
    { key: 'status',       label: 'Status',  format: 'badge' },
    { key: 'payment_method',  label: 'Payment' },
    { key: 'payment_status',  label: 'Pay Status', format: 'badge' },
    { key: 'total_amount', label: 'Amount',  align: 'right', format: 'currency' },
    { key: 'discount_amount', label: 'Discount', align: 'right', format: 'currency' },
    { key: 'tax_amount',   label: 'Tax',     align: 'right', format: 'currency' },
  ],
  'sales-monthly': [
    { key: 'order_date',   label: 'Date',   format: 'date' },
    { key: 'paid_orders',  label: 'Paid Orders',  align: 'right' },
    { key: 'revenue',      label: 'Revenue', align: 'right', format: 'currency' },
    { key: 'avg_order_value', label: 'Avg AOV', align: 'right', format: 'currency' },
    { key: 'total_discounts', label: 'Discounts', align: 'right', format: 'currency' },
  ],
  'product-sales': [
    { key: 'product_title',  label: 'Product' },
    { key: 'product_brand',  label: 'Brand' },
    { key: 'units_sold',     label: 'Units', align: 'right' },
    { key: 'gross_revenue',  label: 'Revenue', align: 'right', format: 'currency' },
    { key: 'cogs',           label: 'COGS',    align: 'right', format: 'currency' },
  ],
  'inventory-valuation': [
    { key: 'title',        label: 'Product' },
    { key: 'category_name', label: 'Category' },
    { key: 'brand',        label: 'Brand' },
    { key: 'stock_qty',    label: 'Stock',   align: 'right' },
    { key: 'cost_price',   label: 'Cost',    align: 'right', format: 'currency' },
    { key: 'price',        label: 'Sell',    align: 'right', format: 'currency' },
    { key: 'stock_value',  label: 'Total Value', align: 'right', format: 'currency' },
  ],
  'low-stock': [
    { key: 'title',              label: 'Product' },
    { key: 'brand',              label: 'Brand' },
    { key: 'stock_qty',          label: 'Stock',     align: 'right' },
    { key: 'reorder_threshold',  label: 'Threshold', align: 'right' },
    { key: 'cost_price',         label: 'Cost Price', align: 'right', format: 'currency' },
  ],
  'pnl': [
    { key: 'label',  label: 'Line Item' },
    { key: 'amount', label: 'Amount', align: 'right', format: 'currency' },
  ],
  'expenses': [
    { key: 'expense_date', label: 'Date',     format: 'date' },
    { key: 'category',     label: 'Category', format: 'badge' },
    { key: 'description',  label: 'Description' },
    { key: 'vendor',       label: 'Vendor' },
    { key: 'amount',       label: 'Amount', align: 'right', format: 'currency' },
  ],
  'tax-summary': [
    { key: 'created_at',     label: 'Date',     format: 'date' },
    { key: 'payment_method', label: 'Payment' },
    { key: 'total_amount',   label: 'Sale Amount', align: 'right', format: 'currency' },
    { key: 'estimated_tax',  label: 'Est. Tax (13%)', align: 'right', format: 'currency' },
    { key: 'tax_amount',     label: 'Collected Tax',  align: 'right', format: 'currency' },
  ],
  'customer-purchase': [
    { key: 'full_name',       label: 'Customer' },
    { key: 'phone',           label: 'Phone' },
    { key: 'order_count',     label: 'Orders',     align: 'right' },
    { key: 'total_spent',     label: 'Total Spent', align: 'right', format: 'currency' },
    { key: 'avg_order_value', label: 'Avg AOV',     align: 'right', format: 'currency' },
  ],
  'refunds': [
    { key: 'order_code',   label: 'Order Code' },
    { key: 'created_at',   label: 'Order Date',  format: 'date' },
    { key: 'updated_at',   label: 'Refund Date', format: 'date' },
    { key: 'payment_method', label: 'Payment' },
    { key: 'total_amount', label: 'Amount', align: 'right', format: 'currency' },
  ],
  'payment-gateway': [
    { key: 'label',            label: 'Method' },
    { key: 'order_count',      label: 'Total Orders', align: 'right' },
    { key: 'paid_count',       label: 'Paid Orders',  align: 'right' },
    { key: 'conversion_rate',  label: 'Conversion',   align: 'right', format: 'percent' },
    { key: 'revenue',          label: 'Revenue',      align: 'right', format: 'currency' },
  ],
  'supplier-purchase': [
    { key: 'payout_date',     label: 'Date',      format: 'date' },
    { key: 'recipient',       label: 'Recipient' },
    { key: 'recipient_type',  label: 'Type',      format: 'badge' },
    { key: 'payment_method',  label: 'Method' },
    { key: 'amount',          label: 'Amount',    align: 'right', format: 'currency' },
    { key: 'reference',       label: 'Reference' },
  ],
  'dead-inventory': [
    { key: 'title',        label: 'Product' },
    { key: 'category_name', label: 'Category' },
    { key: 'brand',        label: 'Brand' },
    { key: 'stock_qty',    label: 'Stock',  align: 'right' },
    { key: 'stock_value',  label: 'Value',  align: 'right', format: 'currency' },
    { key: 'created_at',   label: 'Added',  format: 'date' },
  ],
  'fast-movers': [
    { key: 'product_title', label: 'Product' },
    { key: 'product_brand', label: 'Brand' },
    { key: 'units_sold',    label: 'Units',   align: 'right' },
    { key: 'gross_revenue', label: 'Revenue', align: 'right', format: 'currency' },
    { key: 'cogs',          label: 'COGS',    align: 'right', format: 'currency' },
  ],
  'audit-log': [
    { key: 'created_at',  label: 'Time',   format: 'date' },
    { key: 'action',      label: 'Action', format: 'badge' },
    { key: 'entity_type', label: 'Entity' },
    { key: 'entity_id',   label: 'ID' },
    { key: 'actor_role',  label: 'Role',   format: 'badge' },
  ],
  'order-timeline': [
    { key: 'order_code',  label: 'Order Code' },
    { key: 'created_at',  label: 'Placed',    format: 'date' },
    { key: 'old_status',  label: 'From Status', format: 'badge' },
    { key: 'new_status',  label: 'To Status',   format: 'badge' },
    { key: 'updated_at',  label: 'Changed At',  format: 'date' },
  ],
}

interface Props {
  reportType: ReportType
  title: string
  description: string
  initialFilters: ReportFilters
}

export function ReportViewer({ reportType, title, description, initialFilters }: Props) {
  const [filters, setFilters]   = useState<ReportFilters>(initialFilters)
  const [data, setData]         = useState<unknown[]>([])
  const [loaded, setLoaded]     = useState(false)
  const [isPending, startTransition] = useTransition()

  const columns = COLUMNS[reportType] ?? []

  const runReport = useCallback((f: ReportFilters) => {
    setFilters(f)
    startTransition(async () => {
      const rows = await fetchReportAction(reportType, f)
      setData(rows)
      setLoaded(true)
    })
  }, [reportType])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href="/admin/reports" className="mt-1 text-text-faint hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="font-display text-2xl text-white tracking-wide">{title}</h1>
          <p className="text-text-muted text-sm mt-0.5">{description}</p>
        </div>
        {loaded && (
          <ExportBar
            data={data as Record<string, unknown>[]}
            columns={columns}
            filename={`DCN_${reportType.replace(/-/g, '_')}_${filters.startDate}_${filters.endDate}`}
            title={title}
          />
        )}
      </div>

      {/* Filters */}
      <ReportFiltersBar
        filters={filters}
        onApply={runReport}
        loading={isPending}
        reportType={reportType}
      />

      {/* Results */}
      {!loaded && !isPending && (
        <div className="bg-surface-card border border-surface-border rounded-xl p-12 text-center">
          <p className="text-text-muted text-sm mb-3">Configure filters above and run the report</p>
          <button
            onClick={() => runReport(filters)}
            className="px-5 py-2.5 bg-brand-red text-white text-sm font-semibold rounded-lg hover:bg-brand-red-light transition-colors"
          >
            Run Report
          </button>
        </div>
      )}

      {isPending && (
        <div className="bg-surface-card border border-surface-border rounded-xl p-8 animate-pulse space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-10 bg-surface-elevated rounded-lg" />
          ))}
        </div>
      )}

      {loaded && !isPending && (
        <ReportTable
          data={data as Record<string, unknown>[]}
          columns={columns}
          reportType={reportType}
        />
      )}
    </div>
  )
}
