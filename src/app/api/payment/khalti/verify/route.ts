import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const { pidx, orderId } = await req.json()

  if (!pidx || !orderId) {
    return NextResponse.json({ error: 'Missing pidx or orderId' }, { status: 400 })
  }

  // Verify with Khalti
  const response = await fetch(
    'https://a.khalti.com/api/v2/epayment/lookup/',
    {
      method: 'POST',
      headers: {
        Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pidx }),
    }
  )

  const data = await response.json()

  if (!response.ok || data.status !== 'Completed') {
    return NextResponse.json(
      { error: 'Payment verification failed', detail: data },
      { status: 400 }
    )
  }

  // Security Check: Verify that the purchase_order_id in Khalti matches the order's code
  const adminSupabase = createAdminClient()
  const { data: order, error: orderError } = await adminSupabase
    .from('orders')
    .select('id, order_code, total_amount')
    .eq('id', orderId)
    .single()

  if (orderError || !order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  if (data.purchase_order_id !== order.order_code) {
    return NextResponse.json({ error: 'Invalid payment: Order code mismatch' }, { status: 400 })
  }

  // Also verify amount (Khalti amount is in paisa)
  if (Math.round(order.total_amount * 100) !== Number(data.total_amount)) {
     return NextResponse.json({ error: 'Invalid payment: Amount mismatch' }, { status: 400 })
  }

  // Update order status using admin client to bypass RLS restrictions
  await adminSupabase
    .from('orders')
    .update({ payment_status: 'paid', status: 'confirmed' })
    .eq('id', orderId)

  return NextResponse.json({ success: true, data })
}
