import { createClient } from '../server'

export async function getAnalyticsData() {
  const supabase = await createClient()

  const [
    allOrders,
    topProducts,
    paymentMethods,
    stockLow,
    recentRevenue,
  ] = await Promise.all([
    supabase
      .from('orders')
      .select('id, total_amount, status, payment_method, payment_status, created_at')
      .order('created_at', { ascending: false })
      .limit(2000),

    supabase
      .from('order_items')
      .select('product_title, product_brand, quantity, unit_price')
      .order('quantity', { ascending: false })
      .limit(100),

    supabase
      .from('orders')
      .select('payment_method'),

    supabase
      .from('products')
      .select('id, title, brand, stock_qty')
      .eq('is_active', true)
      .lte('stock_qty', 5)
      .order('stock_qty', { ascending: true })
      .limit(10),

    supabase
      .from('orders')
      .select('total_amount, created_at, payment_status')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .eq('payment_status', 'paid'),
  ])

  return {
    orders: allOrders.data ?? [],
    topProductsData: topProducts.data ?? [],
    paymentMethodsData: paymentMethods.data ?? [],
    stockLowData: stockLow.data ?? [],
    recentRevenueData: recentRevenue.data ?? [],
  }
}
