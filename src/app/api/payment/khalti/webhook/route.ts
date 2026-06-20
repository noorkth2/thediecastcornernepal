import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendOrderPaidEmail } from '@/lib/email/order-emails'

export async function POST(req: NextRequest) {
  try {
    // 1. Verify Request Origin (Simple Secret check for V2)
    const authHeader = req.headers.get('Authorization')
    if (process.env.KHALTI_WEBHOOK_SECRET && authHeader !== `Key ${process.env.KHALTI_WEBHOOK_SECRET}`) {
      console.warn('Unauthorized Khalti Webhook attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { pidx, status, amount, transaction_id, purchase_order_id } = body

    if (!pidx || !purchase_order_id) {
      return NextResponse.json({ error: 'Missing required payload' }, { status: 400 })
    }

    if (status === 'Completed') {
      const adminSupabase = createAdminClient()
      
      // Fetch order with items to confirm stock and send email
      const { data: order, error: orderFetchError } = await adminSupabase
        .from('orders')
        .select('*, order_items(*), profiles(email)')
        .eq(purchase_order_id.toString().includes('DCN-') ? 'order_code' : 'id', purchase_order_id)
        .single()

      if (orderFetchError || !order) {
        throw new Error('Order not found for webhook')
      }

      if (order.payment_status === 'paid') {
        return NextResponse.json({ success: true, message: 'Already paid' })
      }

      // Update order status
      const { error: updateError } = await adminSupabase
        .from('orders')
        .update({ payment_status: 'paid', status: 'confirmed' })
        .eq('id', order.id)

      if (updateError) throw updateError

      // Atomic stock confirmation
      await adminSupabase.rpc('confirm_reservation_sale', {
        p_order_id: order.id
      })

      // Send Confirmation Email
      try {
        const customerEmail = (order.profiles as any)?.email || ''
        
        await sendOrderPaidEmail({
          orderCode: order.order_code,
          customerName: (order.shipping_address as any).name,
          customerEmail: customerEmail,
          items: order.order_items.map((i: any) => ({
            title: i.product_title,
            quantity: i.quantity,
            price: i.unit_price
          })),
          subtotal: order.total_amount - order.shipping_charge,
          shippingCharge: order.shipping_charge,
          total: order.total_amount,
          paymentMethod: 'khalti',
          shippingAddress: order.shipping_address as any
        })
      } catch (emailErr) {
        console.error('Webhook Email Error:', emailErr)
      }
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Khalti Webhook Error:', err)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
