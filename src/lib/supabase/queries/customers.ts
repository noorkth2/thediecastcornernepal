import { createClient } from '../server'

export interface CustomerStats {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
  role: string
  total_orders: number
  total_spent: number
  last_order_date: string | null
  created_at: string
}

export async function getCustomersWithStats() {
  const supabase = await createClient()

  // We'll use a complex join or a RPC if possible, 
  // but for simplicity we can fetch profiles and then aggregate orders in JS if the volume is low, 
  // or use a query that joins them.
  
  // Best approach: A custom RPC or a view in Supabase.
  // Let's assume we want to do it via query for now.
  
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      phone,
      role,
      created_at,
      orders:orders(total_amount, created_at)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching customer stats:', error)
    return { customers: [] as CustomerStats[], error }
  }

  const customers: CustomerStats[] = data.map((profile: any) => {
    const orders = profile.orders || []
    const total_spent = orders.reduce((acc: number, o: any) => acc + Number(o.total_amount), 0)
    const last_order_date = orders.length > 0 
      ? orders.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at 
      : null

    return {
      id: profile.id,
      full_name: profile.full_name,
      email: null, // We'd need to fetch from auth.users which requires service_role
      phone: profile.phone,
      role: profile.role,
      total_orders: orders.length,
      total_spent,
      last_order_date,
      created_at: profile.created_at
    }
  })

  return { customers, error: null }
}
