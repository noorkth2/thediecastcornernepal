// ─── Date Range ───────────────────────────────────────────────────────
export type PresetRange = 'today' | 'yesterday' | 'week' | 'month' | 'quarter' | 'year' | 'custom'

export interface DateRange {
  start: string   // ISO date string "YYYY-MM-DD"
  end: string     // ISO date string "YYYY-MM-DD"
  preset: PresetRange
  label: string
}

// ─── KPI Summary ─────────────────────────────────────────────────────
export interface KPISummary {
  // Revenue
  totalRevenue: number
  prevRevenue: number
  revenueGrowthPct: number
  // Orders
  totalOrders: number
  prevOrders: number
  ordersGrowthPct: number
  // Value
  avgOrderValue: number
  // Margin (computed from COGS)
  totalCOGS: number
  grossProfit: number
  grossMarginPct: number
  // Logistics
  shippingRevenue: number
  totalDiscounts: number
  // Order status breakdown
  pendingCount: number
  confirmedCount: number
  processingCount: number
  shippedCount: number
  deliveredCount: number
  cancelledCount: number
  refundedCount: number
  // Payment methods
  codCount: number
  khaltiCount: number
  esewaCount: number
  codRevenue: number
  khaltiRevenue: number
  esewaRevenue: number
}

// ─── Revenue by Day (Chart Data) ─────────────────────────────────────
export interface RevenueByDay {
  date: string           // "MMM dd" formatted for chart
  rawDate: string        // "YYYY-MM-DD" for sorting
  revenue: number
  orderCount: number
  avgOrderValue: number
  discountTotal: number
  taxTotal: number
}

// ─── Product Revenue Summary ──────────────────────────────────────────
export interface ProductRevenueSummary {
  productId: number
  title: string
  brand: string | null
  categoryName: string | null
  unitsSold: number
  grossRevenue: number
  cogs: number
  grossProfit: number
  grossMarginPct: number
  stockQty: number
  reorderThreshold: number
}

// ─── Order Status Breakdown ───────────────────────────────────────────
export interface OrderStatusBreakdown {
  status: string
  count: number
  pct: number
}

// ─── Payment Method Stats ────────────────────────────────────────────
export interface PaymentMethodStat {
  method: string
  label: string
  count: number
  revenue: number
  pct: number
}

// ─── Customer Analytics ───────────────────────────────────────────────
export interface CustomerStats {
  totalUniqueCustomers: number
  repeatCustomers: number
  repeatRate: number
  guestOrders: number
  topCity: string | null
}

// ─── Hourly Heatmap ───────────────────────────────────────────────────
export interface HourlyOrderPattern {
  hourOfDay: number      // 0–23
  dayOfWeek: number      // 0=Sun … 6=Sat
  orderCount: number
}

// ─── Inventory Snapshot ───────────────────────────────────────────────
export interface InventorySnapshot {
  totalProducts: number
  totalStockUnits: number
  totalStockValue: number   // sum(stock_qty * cost_price)
  lowStockCount: number     // below reorder_threshold
  outOfStockCount: number
  avgInventoryValue: number
}

export interface LowStockProduct {
  id: number
  title: string
  brand: string | null
  stock_qty: number
  reorder_threshold: number
  cost_price: number | null
  category_name: string | null
}

// ─── P&L Statement ───────────────────────────────────────────────────
export interface PnLStatement {
  period: string
  // Revenue
  grossRevenue: number
  shippingRevenue: number
  discounts: number
  netRevenue: number
  // Cost
  cogs: number
  grossProfit: number
  grossMarginPct: number
  // Operating expenses
  totalExpenses: number
  expenseBreakdown: ExpenseBreakdown[]
  // Net
  operatingProfit: number
  taxAmount: number
  netProfit: number
  netMarginPct: number
}

// ─── Expense Breakdown ────────────────────────────────────────────────
export interface ExpenseBreakdown {
  category: string
  label: string
  amount: number
  pct: number
  count: number
}

// ─── Forecast ─────────────────────────────────────────────────────────
export interface ForecastPoint {
  date: string              // "YYYY-MM-DD"
  label: string             // "Jun 5"
  predictedRevenue: number
  actualRevenue?: number    // present for historical points
  isForecasted: boolean
  confidenceLow: number
  confidenceHigh: number
}

export interface StockExhaustionForecast {
  productId: number
  title: string
  brand: string | null
  stockQty: number
  avgDailySales: number
  daysUntilStockOut: number | null   // null = no recent sales
  urgency: 'critical' | 'warning' | 'ok'
}

// ─── Full Analytics Summary (returned by server action) ───────────────
export interface AnalyticsSummary {
  kpi: KPISummary
  revenueByDay: RevenueByDay[]
  topProducts: ProductRevenueSummary[]
  inventorySnapshot: InventorySnapshot
  lowStockProducts: LowStockProduct[]
  pnlStatement: PnLStatement
  forecastPoints: ForecastPoint[]
  stockExhaustionForecasts: StockExhaustionForecast[]
  hourlyPattern: HourlyOrderPattern[]
  customerStats: CustomerStats
  dateRange: DateRange
}

// ─── Report types ─────────────────────────────────────────────────────
export type ReportType =
  | 'sales-daily'
  | 'sales-monthly'
  | 'product-sales'
  | 'inventory-valuation'
  | 'low-stock'
  | 'pnl'
  | 'expenses'
  | 'tax-summary'
  | 'customer-purchase'
  | 'refunds'
  | 'payment-gateway'
  | 'supplier-purchase'
  | 'dead-inventory'
  | 'fast-movers'
  | 'audit-log'
  | 'order-timeline'

export interface ReportColumn {
  key: string
  label: string
  align?: 'left' | 'right' | 'center'
  format?: 'currency' | 'number' | 'percent' | 'date' | 'text' | 'badge'
}

export interface ReportDefinition {
  type: ReportType
  title: string
  description: string
  icon: string
  columns: ReportColumn[]
  defaultDateRange: PresetRange
  supportsExport: boolean
}

export interface ReportFilters {
  startDate: string
  endDate: string
  categoryId?: number
  paymentMethod?: string
  productId?: number
  search?: string
  page: number
  pageSize: number
}
