import { createClient } from '../server'
import type { ReportFilters, ReportType } from '@/lib/types/analytics'

// ─── Daily Sales Report ────────────────────────────────────────────────
export async function getDailySalesReport(filters: ReportFilters) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('orders')
    .select(`
      id, order_code, status, payment_method, payment_status,
      total_amount, shipping_charge, discount_amount, tax_amount,
      created_at, shipping_address
    `)
    .gte('created_at', filters.startDate + 'T00:00:00+05:45')
    .lte('created_at', filters.endDate + 'T23:59:59+05:45')
    .ilike(filters.search ? 'order_code' : 'status', filters.search ? `%${filters.search}%` : '%')
    .order('created_at', { ascending: false })
    .range((filters.page - 1) * filters.pageSize, filters.page * filters.pageSize - 1)

  if (error) throw new Error(error.message)
  return data ?? []
}

// ─── Product Sales Report ─────────────────────────────────────────────
export async function getProductSalesReport(filters: ReportFilters) {
  const supabase = await createClient()

  let query = supabase
    .from('order_items')
    .select(`
      product_id, product_title, product_brand, quantity, unit_price, unit_cost,
      orders!inner(payment_status, created_at, payment_method)
    `)
    .gte('orders.created_at', filters.startDate + 'T00:00:00+05:45')
    .lte('orders.created_at', filters.endDate + 'T23:59:59+05:45')
    .eq('orders.payment_status', 'paid')

  if (filters.search) {
    query = query.ilike('product_title', `%${filters.search}%`)
  }
  if (filters.paymentMethod) {
    query = query.eq('orders.payment_method', filters.paymentMethod)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)

  // Aggregate by product
  const map: Record<string, {
    product_title: string; product_brand: string | null;
    units_sold: number; gross_revenue: number; cogs: number;
  }> = {}
  for (const row of data ?? []) {
    const key = row.product_title
    if (!map[key]) {
      map[key] = { product_title: row.product_title, product_brand: row.product_brand, units_sold: 0, gross_revenue: 0, cogs: 0 }
    }
    map[key].units_sold   += row.quantity
    map[key].gross_revenue += row.quantity * row.unit_price
    map[key].cogs          += row.quantity * (row.unit_cost ?? 0)
  }

  return Object.values(map)
    .sort((a, b) => b.gross_revenue - a.gross_revenue)
    .slice((filters.page - 1) * filters.pageSize, filters.page * filters.pageSize)
}

// ─── Inventory Valuation Report ───────────────────────────────────────
export async function getInventoryValuationReport(filters: ReportFilters) {
  const supabase = await createClient()
  let query = supabase
    .from('products')
    .select('id, title, brand, stock_qty, cost_price, price, reorder_threshold, categories(name)')
    .eq('is_active', true)
    .order('title')

  if (filters.categoryId) {
    query = query.eq('category_id', filters.categoryId)
  }
  if (filters.search) {
    query = query.ilike('title', `%${filters.search}%`)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return (data ?? []).map((p: Record<string, unknown>) => {
    const cat = p.categories as { name: string } | null
    return {
      ...p,
      category_name: cat?.name ?? 'Uncategorized',
      stock_value: Number(p.stock_qty ?? 0) * Number(p.cost_price ?? 0),
    }
  })
}

// ─── Low Stock Report ─────────────────────────────────────────────────
export async function getLowStockReport() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('id, title, brand, stock_qty, cost_price, price, reorder_threshold, categories(name)')
    .eq('is_active', true)
    .or('stock_qty.lte.reorder_threshold,stock_qty.eq.0')
    .order('stock_qty', { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

// ─── Dead Inventory Report ────────────────────────────────────────────
// Products with zero sales in the last 90 days
export async function getDeadInventoryReport() {
  const supabase = await createClient()
  const cutoff = new Date(Date.now() - 90 * 86400_000).toISOString()

  // Get product IDs that had sales in last 90 days
  const { data: activeSales } = await supabase
    .from('order_items')
    .select('product_id')
    .gte('created_at', cutoff)

  const activePids = new Set((activeSales ?? []).map((s: Record<string, unknown>) => s.product_id))

  const { data: products, error } = await supabase
    .from('products')
    .select('id, title, brand, stock_qty, cost_price, created_at, categories(name)')
    .eq('is_active', true)
    .gt('stock_qty', 0)

  if (error) throw new Error(error.message)
  return (products ?? [])
    .filter((p: Record<string, unknown>) => !activePids.has(p.id))
    .map((p: Record<string, unknown>) => {
      const cat = p.categories as { name: string } | null
      return {
        ...p,
        category_name: cat?.name ?? 'Uncategorized',
        stock_value: Number(p.stock_qty ?? 0) * Number(p.cost_price ?? 0),
      }
    })
}

// ─── Tax Summary Report ───────────────────────────────────────────────
export async function getTaxSummaryReport(startDate: string, endDate: string) {
  const supabase = await createClient()

  // Check if tax is enabled
  const { data: settings } = await supabase
    .from('site_settings')
    .select('tax_enabled, tax_rate')
    .limit(1)
    .maybeSingle()

  const taxEnabled = settings?.tax_enabled ?? true
  const taxRate = Number(settings?.tax_rate ?? 13)

  const { data, error } = await supabase
    .from('orders')
    .select('total_amount, tax_amount, payment_method, created_at')
    .eq('payment_status', 'paid')
    .gte('created_at', startDate + 'T00:00:00+05:45')
    .lte('created_at', endDate + 'T23:59:59+05:45')

  if (error) throw new Error(error.message)

  const rows = data ?? []
  const totalRevenue = rows.reduce((s: number, o: Record<string, unknown>) => s + Number(o.total_amount ?? 0), 0)
  const collectedTax = rows.reduce((s: number, o: Record<string, unknown>) => s + Number(o.tax_amount ?? 0), 0)
  const estimatedTax = taxEnabled ? totalRevenue * (taxRate / 100) : 0

  return {
    taxEnabled,
    taxRate,
    totalRevenue,
    collectedTax,
    estimatedTax,
    orderCount: rows.length,
    rows: rows.map((o: Record<string, unknown>) => ({
      ...o,
      estimated_tax: taxEnabled ? Number(o.total_amount ?? 0) * (taxRate / 100) : 0,
    })),
  }
}

// ─── Refund Report ────────────────────────────────────────────────────
export async function getRefundReport(filters: ReportFilters) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('orders')
    .select('id, order_code, total_amount, payment_method, payment_status, created_at, updated_at, shipping_address')
    .eq('payment_status', 'refunded')
    .gte('created_at', filters.startDate + 'T00:00:00+05:45')
    .lte('created_at', filters.endDate + 'T23:59:59+05:45')
    .order('updated_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data ?? []
}

// ─── Customer Purchase Report ─────────────────────────────────────────
export async function getCustomerPurchaseReport(filters: ReportFilters) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('orders')
    .select('user_id, total_amount, payment_method, payment_status, created_at, shipping_address, profiles(full_name, phone)')
    .eq('payment_status', 'paid')
    .gte('created_at', filters.startDate + 'T00:00:00+05:45')
    .lte('created_at', filters.endDate + 'T23:59:59+05:45')
    .order('total_amount', { ascending: false })
    .limit(filters.pageSize * 5)

  if (error) throw new Error(error.message)

  // Aggregate by customer
  const map: Record<string, {
    user_id: string; full_name: string; phone: string;
    order_count: number; total_spent: number; avg_order_value: number;
  }> = {}
  for (const o of data ?? []) {
    const r = o as Record<string, unknown>
    const prof = r.profiles as { full_name: string; phone: string } | null
    const uid = String(r.user_id ?? 'guest')
    if (!map[uid]) {
      map[uid] = {
        user_id: uid,
        full_name: prof?.full_name ?? 'Guest',
        phone: prof?.phone ?? '—',
        order_count: 0, total_spent: 0, avg_order_value: 0,
      }
    }
    map[uid].order_count++
    map[uid].total_spent += Number(r.total_amount ?? 0)
  }
  return Object.values(map)
    .map((c) => ({ ...c, avg_order_value: c.order_count > 0 ? c.total_spent / c.order_count : 0 }))
    .sort((a, b) => b.total_spent - a.total_spent)
}

// ─── Payment Gateway Report ───────────────────────────────────────────
export async function getPaymentGatewayReport(startDate: string, endDate: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('orders')
    .select('payment_method, payment_status, total_amount, created_at')
    .gte('created_at', startDate + 'T00:00:00+05:45')
    .lte('created_at', endDate + 'T23:59:59+05:45')
  if (error) throw new Error(error.message)

  const methods = ['cod', 'khalti', 'esewa']
  return methods.map((method) => {
    const methodOrders = (data ?? []).filter((o: Record<string, unknown>) => o.payment_method === method)
    const paid    = methodOrders.filter((o: Record<string, unknown>) => o.payment_status === 'paid')
    const revenue = paid.reduce((s: number, o: Record<string, unknown>) => s + Number(o.total_amount ?? 0), 0)
    return {
      method,
      label: method === 'cod' ? 'Cash on Delivery' : method.charAt(0).toUpperCase() + method.slice(1),
      order_count: methodOrders.length,
      paid_count: paid.length,
      revenue,
      conversion_rate: methodOrders.length > 0 ? Math.round((paid.length / methodOrders.length) * 100) : 0,
    }
  })
}

// ─── Audit Log Report ─────────────────────────────────────────────────
export async function getAuditLogReport(filters: ReportFilters) {
  const supabase = await createClient()
  const { data, count, error } = await supabase
    .from('activity_logs')
    .select('*, profiles(full_name, role)', { count: 'exact' })
    .gte('created_at', filters.startDate + 'T00:00:00+05:45')
    .lte('created_at', filters.endDate + 'T23:59:59+05:45')
    .order('created_at', { ascending: false })
    .range((filters.page - 1) * filters.pageSize, filters.page * filters.pageSize - 1)
  if (error) throw new Error(error.message)
  return { data: data ?? [], count: count ?? 0 }
}

// ─── Report metadata ──────────────────────────────────────────────────
export const REPORT_DEFINITIONS: Record<ReportType, { title: string; description: string; icon: string }> = {
  'sales-daily':          { title: 'Daily Sales Report',         description: 'Order-by-order breakdown for the selected period',        icon: 'ShoppingBag' },
  'sales-monthly':        { title: 'Monthly Revenue Report',     description: 'Aggregated monthly revenue and order statistics',         icon: 'TrendingUp' },
  'product-sales':        { title: 'Product Sales Report',       description: 'Units sold, revenue and profit per product',              icon: 'Package' },
  'inventory-valuation':  { title: 'Inventory Valuation',        description: 'Current stock value at cost and selling price',           icon: 'Boxes' },
  'low-stock':            { title: 'Low Stock Report',           description: 'Products at or below reorder threshold',                  icon: 'AlertTriangle' },
  'pnl':                  { title: 'Profit & Loss Statement',    description: 'Revenue, COGS, expenses, and net profit summary',         icon: 'BarChart3' },
  'expenses':             { title: 'Expense Report',             description: 'All operational expenses by category',                    icon: 'Receipt' },
  'tax-summary':          { title: 'Tax Summary (13% VAT)',      description: 'Collected and estimated VAT for the period',              icon: 'Percent' },
  'customer-purchase':    { title: 'Customer Purchase Report',   description: 'Customer spending, order frequency, and lifetime value',  icon: 'Users' },
  'refunds':              { title: 'Refund Report',              description: 'All refunded orders with amounts',                        icon: 'RotateCcw' },
  'payment-gateway':      { title: 'Payment Gateway Report',     description: 'Revenue and conversion rates per payment method',         icon: 'CreditCard' },
  'supplier-purchase':    { title: 'Supplier / Payout Report',   description: 'All payouts to suppliers and vendors',                    icon: 'Truck' },
  'dead-inventory':       { title: 'Dead Inventory Report',      description: 'Products with no sales in the last 90 days',             icon: 'Archive' },
  'fast-movers':          { title: 'Fast Moving Products',       description: 'Top selling products by units sold',                      icon: 'Zap' },
  'audit-log':            { title: 'Audit Activity Log',         description: 'All admin actions with timestamps and actor',             icon: 'Shield' },
  'order-timeline':       { title: 'Order Timeline Report',      description: 'Order fulfilment time and status progression',            icon: 'Clock' },
}
