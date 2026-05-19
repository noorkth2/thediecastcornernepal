import { createClient } from '../server'
import { format, parseISO, subDays, startOfDay, endOfDay } from 'date-fns'
import { forecastRevenue, predictStockExhaustion, calcGrowthPct } from '@/lib/analytics/forecasting'
import type {
  AnalyticsSummary, KPISummary, RevenueByDay, ProductRevenueSummary,
  PnLStatement, ExpenseBreakdown, ForecastPoint, StockExhaustionForecast,
  HourlyOrderPattern, CustomerStats, DateRange, InventorySnapshot, LowStockProduct
} from '@/lib/types/analytics'

// ─── Build full analytics summary for a date range ───────────────────
export async function getAnalyticsSummary(range: DateRange): Promise<AnalyticsSummary> {
  const supabase = await createClient()

  const startTs = new Date(range.start + 'T00:00:00+05:45').toISOString()
  const endTs   = new Date(range.end   + 'T23:59:59+05:45').toISOString()

  // Previous period (same duration)
  const durationMs = new Date(endTs).getTime() - new Date(startTs).getTime()
  const prevEndTs   = new Date(new Date(startTs).getTime() - 1).toISOString()
  const prevStartTs = new Date(new Date(startTs).getTime() - durationMs).toISOString()

  const [
    kpiRaw,
    revenueByDayRaw,
    topProductsRaw,
    hourlyRaw,
    customerRaw,
    inventoryRaw,
    lowStockRaw,
    expensesRaw,
    productSales30Raw,
  ] = await Promise.all([
    // KPI summary RPC
    supabase.rpc('get_kpi_summary', {
      p_start: startTs, p_end: endTs,
      p_prev_start: prevStartTs, p_prev_end: prevEndTs,
    }),
    // Revenue by day RPC
    supabase.rpc('get_revenue_by_period', { p_start: startTs, p_end: endTs }),
    // Top products RPC
    supabase.rpc('get_top_products', { p_start: startTs, p_end: endTs, p_limit: 20 }),
    // Hourly pattern RPC
    supabase.rpc('get_hourly_order_pattern', { p_start: startTs, p_end: endTs }),
    // Customer stats RPC
    supabase.rpc('get_customer_stats', { p_start: startTs, p_end: endTs }),
    // Inventory snapshot (all active products)
    supabase.from('products')
      .select('id, title, brand, stock_qty, cost_price, reorder_threshold, is_active')
      .eq('is_active', true),
    // Low stock products
    supabase.from('products')
      .select('id, title, brand, stock_qty, cost_price, reorder_threshold, categories(name)')
      .eq('is_active', true)
      .or('stock_qty.lte.reorder_threshold,stock_qty.eq.0')
      .order('stock_qty', { ascending: true })
      .limit(20),
    // Expenses for this period
    supabase.from('expenses')
      .select('category, amount')
      .gte('expense_date', range.start)
      .lte('expense_date', range.end),
    // Product sales last 30 days for exhaustion forecast
    supabase.rpc('get_top_products', {
      p_start: new Date(Date.now() - 30 * 86400_000).toISOString(),
      p_end: new Date().toISOString(),
      p_limit: 100,
    }),
  ])

  // ── KPI ──────────────────────────────────────────────────────────────
  const k = kpiRaw.data as Record<string, number> ?? {}
  const kpi: KPISummary = {
    totalRevenue:    k.total_revenue    ?? 0,
    prevRevenue:     k.prev_revenue     ?? 0,
    revenueGrowthPct: calcGrowthPct(k.total_revenue ?? 0, k.prev_revenue ?? 0),
    totalOrders:     k.total_orders     ?? 0,
    prevOrders:      k.prev_orders      ?? 0,
    ordersGrowthPct: calcGrowthPct(k.total_orders ?? 0, k.prev_orders ?? 0),
    avgOrderValue:   k.avg_order_value  ?? 0,
    totalCOGS:       0, // computed below from products
    grossProfit:     0,
    grossMarginPct:  0,
    shippingRevenue: k.shipping_revenue ?? 0,
    totalDiscounts:  k.total_discounts  ?? 0,
    pendingCount:    k.pending_count    ?? 0,
    confirmedCount:  k.confirmed_count  ?? 0,
    processingCount: k.processing_count ?? 0,
    shippedCount:    k.shipped_count    ?? 0,
    deliveredCount:  k.delivered_count  ?? 0,
    cancelledCount:  k.cancelled_count  ?? 0,
    refundedCount:   k.refunded_count   ?? 0,
    codCount:        k.cod_count        ?? 0,
    khaltiCount:     k.khalti_count     ?? 0,
    esewaCount:      k.esewa_count      ?? 0,
    codRevenue:      k.cod_revenue      ?? 0,
    khaltiRevenue:   k.khalti_revenue   ?? 0,
    esewaRevenue:    k.esewa_revenue    ?? 0,
  }

  // ── Revenue by Day ────────────────────────────────────────────────────
  const revenueByDay: RevenueByDay[] = (revenueByDayRaw.data ?? []).map((r: Record<string, unknown>) => ({
    date: format(parseISO(r.order_date as string), 'MMM d'),
    rawDate: r.order_date as string,
    revenue: Number(r.revenue ?? 0),
    orderCount: Number(r.order_count ?? 0),
    avgOrderValue: Number(r.avg_order_value ?? 0),
    discountTotal: Number(r.discount_total ?? 0),
    taxTotal: Number(r.tax_total ?? 0),
  }))

  // ── Top Products ──────────────────────────────────────────────────────
  const topProducts: ProductRevenueSummary[] = (topProductsRaw.data ?? []).map((p: Record<string, unknown>) => {
    const grossRevenue = Number(p.gross_revenue ?? 0)
    const cogs = Number(p.cogs ?? 0)
    const grossProfit = grossRevenue - cogs
    return {
      productId: p.product_id as number,
      title: p.title as string,
      brand: p.brand as string | null,
      categoryName: p.category_name as string | null,
      unitsSold: Number(p.units_sold ?? 0),
      grossRevenue,
      cogs,
      grossProfit,
      grossMarginPct: grossRevenue > 0 ? Math.round((grossProfit / grossRevenue) * 100) : 0,
      stockQty: 0,
      reorderThreshold: 5,
    }
  })

  // ── COGS + Margin from top products ──────────────────────────────────
  const totalCOGS = topProducts.reduce((s, p) => s + p.cogs, 0)
  const grossProfit = kpi.totalRevenue - totalCOGS
  kpi.totalCOGS = totalCOGS
  kpi.grossProfit = grossProfit
  kpi.grossMarginPct = kpi.totalRevenue > 0
    ? Math.round((grossProfit / kpi.totalRevenue) * 100 * 10) / 10
    : 0

  // ── Hourly Pattern ────────────────────────────────────────────────────
  const hourlyPattern: HourlyOrderPattern[] = (hourlyRaw.data ?? []).map((h: Record<string, unknown>) => ({
    hourOfDay: Number(h.hour_of_day),
    dayOfWeek: Number(h.day_of_week),
    orderCount: Number(h.order_count),
  }))

  // ── Customer Stats ────────────────────────────────────────────────────
  const cs = customerRaw.data as Record<string, unknown> ?? {}
  const totalUniq = Number(cs.total_unique_customers ?? 0)
  const repeatC   = Number(cs.repeat_customers ?? 0)
  const customerStats: CustomerStats = {
    totalUniqueCustomers: totalUniq,
    repeatCustomers: repeatC,
    repeatRate: totalUniq > 0 ? Math.round((repeatC / totalUniq) * 100) : 0,
    guestOrders: Number(cs.guest_orders ?? 0),
    topCity: cs.top_city as string | null,
  }

  // ── Inventory Snapshot ────────────────────────────────────────────────
  const invProducts = inventoryRaw.data ?? []
  const inventorySnapshot: InventorySnapshot = {
    totalProducts: invProducts.length,
    totalStockUnits: invProducts.reduce((s: number, p: Record<string, unknown>) => s + Number(p.stock_qty ?? 0), 0),
    totalStockValue: invProducts.reduce((s: number, p: Record<string, unknown>) =>
      s + Number(p.stock_qty ?? 0) * Number(p.cost_price ?? 0), 0),
    lowStockCount: invProducts.filter((p: Record<string, unknown>) =>
      Number(p.stock_qty) <= Number(p.reorder_threshold) && Number(p.stock_qty) > 0).length,
    outOfStockCount: invProducts.filter((p: Record<string, unknown>) => Number(p.stock_qty) === 0).length,
    avgInventoryValue: 0,
  }
  inventorySnapshot.avgInventoryValue = inventorySnapshot.totalProducts > 0
    ? inventorySnapshot.totalStockValue / inventorySnapshot.totalProducts
    : 0

  // ── Low Stock Products ────────────────────────────────────────────────
  const lowStockProducts: LowStockProduct[] = (lowStockRaw.data ?? []).map((p: Record<string, unknown>) => {
    const cat = p.categories as { name: string } | null
    return {
      id: p.id as number,
      title: p.title as string,
      brand: p.brand as string | null,
      stock_qty: Number(p.stock_qty ?? 0),
      reorder_threshold: Number(p.reorder_threshold ?? 5),
      cost_price: p.cost_price ? Number(p.cost_price) : null,
      category_name: cat?.name ?? null,
    }
  })

  // ── Expenses for P&L ──────────────────────────────────────────────────
  const expenseRows = expensesRaw.data ?? []
  const totalExpenses = expenseRows.reduce((s: number, e: Record<string, unknown>) => s + Number(e.amount ?? 0), 0)
  const expByCat: Record<string, number> = {}
  for (const e of expenseRows as Record<string, unknown>[]) {
    const cat = e.category as string
    expByCat[cat] = (expByCat[cat] ?? 0) + Number(e.amount ?? 0)
  }
  const expenseBreakdown: ExpenseBreakdown[] = Object.entries(expByCat)
    .map(([category, amount]) => ({
      category,
      label: category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      amount,
      pct: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0,
      count: expenseRows.filter((e: Record<string, unknown>) => e.category === category).length,
    }))
    .sort((a, b) => b.amount - a.amount)

  // ── P&L Statement ────────────────────────────────────────────────────
  const netRevenue = kpi.totalRevenue + kpi.shippingRevenue - kpi.totalDiscounts
  const operatingProfit = grossProfit - totalExpenses
  const taxAmount = operatingProfit > 0 ? Math.round(operatingProfit * 0.13) : 0 // 13% VAT
  const pnlStatement: PnLStatement = {
    period: `${range.start} to ${range.end}`,
    grossRevenue: kpi.totalRevenue,
    shippingRevenue: kpi.shippingRevenue,
    discounts: kpi.totalDiscounts,
    netRevenue,
    cogs: totalCOGS,
    grossProfit,
    grossMarginPct: kpi.grossMarginPct,
    totalExpenses,
    expenseBreakdown,
    operatingProfit,
    taxAmount,
    netProfit: operatingProfit - taxAmount,
    netMarginPct: netRevenue > 0
      ? Math.round(((operatingProfit - taxAmount) / netRevenue) * 100 * 10) / 10
      : 0,
  }

  // ── Forecasting ────────────────────────────────────────────────────────
  const forecastPoints: ForecastPoint[] = forecastRevenue(revenueByDay, 30)

  // Stock exhaustion forecast
  const sales30 = (productSales30Raw.data ?? []) as Record<string, unknown>[]
  const stockExhaustionForecasts: StockExhaustionForecast[] = predictStockExhaustion(
    invProducts.map((p: Record<string, unknown>) => {
      const sold = sales30.find((s) => s.product_id === p.id)
      return {
        productId: p.id as number,
        title: (p.title as string) ?? '',
        brand: p.brand as string | null,
        stockQty: Number(p.stock_qty ?? 0),
        unitsSoldLast30Days: Number(sold?.units_sold ?? 0),
      }
    })
  ).slice(0, 15)

  return {
    kpi,
    revenueByDay,
    topProducts,
    inventorySnapshot,
    lowStockProducts,
    pnlStatement,
    forecastPoints,
    stockExhaustionForecasts,
    hourlyPattern,
    customerStats,
    dateRange: range,
  }
}

// ─── Date range presets ────────────────────────────────────────────────
export function buildDateRange(preset: string, customStart?: string, customEnd?: string): DateRange {
  const today = new Date()
  const fmt = (d: Date) => format(d, 'yyyy-MM-dd')

  const presets: Record<string, { start: Date; end: Date; label: string }> = {
    today:     { start: today, end: today, label: 'Today' },
    yesterday: { start: subDays(today, 1), end: subDays(today, 1), label: 'Yesterday' },
    week:      { start: subDays(today, 6), end: today, label: 'Last 7 Days' },
    month:     { start: subDays(today, 29), end: today, label: 'Last 30 Days' },
    quarter:   { start: subDays(today, 89), end: today, label: 'Last 90 Days' },
    year:      { start: subDays(today, 364), end: today, label: 'Last 365 Days' },
  }

  if (preset === 'custom' && customStart && customEnd) {
    return {
      start: customStart, end: customEnd,
      preset: 'custom', label: `${customStart} – ${customEnd}`,
    }
  }

  const p = presets[preset] ?? presets.month
  return { start: fmt(p.start), end: fmt(p.end), preset: preset as DateRange['preset'], label: p.label }
}
