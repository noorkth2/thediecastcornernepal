import { createClient } from '@/lib/supabase/server'
import type { Order } from '@/lib/types'

export async function getOrdersByUser(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  return { orders: (data as Order[]) ?? [], error }
}

export async function getOrderById(orderId: number) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', orderId)
    .single()

  return { order: data as Order | null, error }
}

export async function getOrderByCode(orderCode: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('order_code', orderCode)
    .single()

  return { order: data as Order | null, error }
}

export async function getAllOrdersAdmin(limit = 50) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*), profile:profiles(full_name, phone)')
    .order('created_at', { ascending: false })
    .limit(limit)

  return { orders: (data as Order[]) ?? [], error }
}

export async function getAdminStats() {
  const supabase = await createClient()

  const [ordersResult, pendingResult, deliveredResult, revenueResult, productsResult, customersResult, recentResult] =
    await Promise.all([
      supabase.from('orders').select('id', { count: 'exact', head: true }),
      supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'delivered'),
      supabase.from('orders').select('total_amount').eq('payment_status', 'paid'),
      supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'customer'),
      supabase.from('orders')
        .select('id, order_code, status, total_amount, created_at, shipping_address')
        .order('created_at', { ascending: false })
        .limit(5),
    ])

  const totalRevenue = (revenueResult.data ?? []).reduce(
    (sum: number, o: { total_amount: number }) => sum + (o.total_amount ?? 0),
    0
  )

  return {
    stats: {
      totalOrders: ordersResult.count ?? 0,
      pendingOrders: pendingResult.count ?? 0,
      deliveredOrders: deliveredResult.count ?? 0,
      totalRevenue,
      totalProducts: productsResult.count ?? 0,
      totalCustomers: customersResult.count ?? 0,
      recentOrders: recentResult.data ?? [],
    },
  }
}
