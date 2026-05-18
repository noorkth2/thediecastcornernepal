import Link from 'next/link'
import {
  ShoppingBag, TrendingUp, Package, Boxes, AlertTriangle,
  BarChart3, Receipt, Percent, Users, RotateCcw,
  CreditCard, Truck, Archive, Zap, Shield, Clock,
  ArrowRight, FileBarChart2
} from 'lucide-react'

const ICON_MAP: Record<string, React.ElementType> = {
  ShoppingBag, TrendingUp, Package, Boxes, AlertTriangle,
  BarChart3, Receipt, Percent, Users, RotateCcw,
  CreditCard, Truck, Archive, Zap, Shield, Clock,
}

const REPORTS = [
  {
    group: 'Sales',
    items: [
      { type: 'sales-daily',   title: 'Daily Sales Report',    desc: 'Order-by-order breakdown', icon: 'ShoppingBag',  color: 'text-blue-400',   bg: 'bg-blue-400/10 border-blue-400/20' },
      { type: 'sales-monthly', title: 'Monthly Revenue',       desc: 'Aggregated monthly stats', icon: 'TrendingUp',   color: 'text-brand-gold', bg: 'bg-brand-gold/10 border-brand-gold/20' },
      { type: 'fast-movers',   title: 'Fast Moving Products',  desc: 'Top sellers by volume',    icon: 'Zap',          color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/20' },
    ],
  },
  {
    group: 'Products & Inventory',
    items: [
      { type: 'product-sales',         title: 'Product Sales Report',    desc: 'Revenue & profit per product',       icon: 'Package',       color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/20' },
      { type: 'inventory-valuation',   title: 'Inventory Valuation',     desc: 'Stock value at cost & sell price',  icon: 'Boxes',         color: 'text-cyan-400',   bg: 'bg-cyan-400/10 border-cyan-400/20' },
      { type: 'low-stock',             title: 'Low Stock Report',         desc: 'Products below threshold',          icon: 'AlertTriangle', color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/20' },
      { type: 'dead-inventory',        title: 'Dead Inventory',           desc: 'No sales in 90 days',               icon: 'Archive',       color: 'text-red-400',    bg: 'bg-red-400/10 border-red-400/20' },
    ],
  },
  {
    group: 'Finance & Accounting',
    items: [
      { type: 'pnl',          title: 'Profit & Loss Statement', desc: 'Revenue, COGS & net profit',     icon: 'BarChart3', color: 'text-green-400',  bg: 'bg-green-400/10 border-green-400/20' },
      { type: 'expenses',     title: 'Expense Report',          desc: 'All expenses by category',       icon: 'Receipt',   color: 'text-red-400',    bg: 'bg-red-400/10 border-red-400/20' },
      { type: 'tax-summary',  title: 'Tax Summary (13% VAT)',   desc: 'Collected & estimated VAT',      icon: 'Percent',   color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20' },
      { type: 'supplier-purchase', title: 'Supplier / Payouts', desc: 'Disbursements & vendor payments', icon: 'Truck',    color: 'text-slate-400',  bg: 'bg-slate-400/10 border-slate-400/20' },
    ],
  },
  {
    group: 'Customers & Payments',
    items: [
      { type: 'customer-purchase', title: 'Customer Purchase Report', desc: 'LTV, frequency & segments',     icon: 'Users',      color: 'text-indigo-400', bg: 'bg-indigo-400/10 border-indigo-400/20' },
      { type: 'refunds',           title: 'Refund Report',            desc: 'All refunded orders',           icon: 'RotateCcw',  color: 'text-pink-400',   bg: 'bg-pink-400/10 border-pink-400/20' },
      { type: 'payment-gateway',   title: 'Payment Gateway Report',   desc: 'Conversion per payment method', icon: 'CreditCard', color: 'text-violet-400', bg: 'bg-violet-400/10 border-violet-400/20' },
    ],
  },
  {
    group: 'Operations & Audit',
    items: [
      { type: 'order-timeline', title: 'Order Timeline Report', desc: 'Fulfilment time & status flow', icon: 'Clock',  color: 'text-sky-400',   bg: 'bg-sky-400/10 border-sky-400/20' },
      { type: 'audit-log',      title: 'Audit Activity Log',   desc: 'All admin actions logged',      icon: 'Shield', color: 'text-rose-400',  bg: 'bg-rose-400/10 border-rose-400/20' },
    ],
  },
]

export default function AdminReportsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <FileBarChart2 className="w-7 h-7 text-brand-red" />
        <div>
          <h1 className="font-display text-3xl text-white tracking-wide">REPORTS</h1>
          <p className="text-text-muted text-sm mt-0.5">16 exportable report types · PDF · CSV · Excel</p>
        </div>
      </div>

      {/* Report groups */}
      {REPORTS.map(({ group, items }) => (
        <div key={group}>
          <p className="text-[10px] font-bold text-text-faint uppercase tracking-widest mb-3 px-1">{group}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map(({ type, title, desc, icon, color, bg }) => {
              const Icon = ICON_MAP[icon] ?? FileBarChart2
              return (
                <Link
                  key={type}
                  href={`/admin/reports/${type}`}
                  className="group bg-surface-card border border-surface-border rounded-xl p-5
                             hover:border-brand-red/40 hover:bg-surface-elevated/50
                             transition-all duration-200 hover:scale-[1.02] flex flex-col gap-3"
                >
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${bg}`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-text-primary text-sm group-hover:text-white transition-colors">{title}</p>
                    <p className="text-text-faint text-xs mt-0.5">{desc}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-text-faint group-hover:text-brand-red transition-colors">
                    View report <ArrowRight className="w-3 h-3" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
