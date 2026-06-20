import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendOrderPaidEmail } from '@/lib/email/order-emails'
import crypto from 'crypto'

/**
 * eSewa EPAY v2 Verification
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const data = searchParams.get('data')
  const orderId = searchParams.get('orderId')

  if (!data || !orderId) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL}/order/failure?error=Missing+Data`)
  }

  try {
    // 1. Decode Base64 Data from eSewa
    const decodedData = JSON.parse(Buffer.from(data, 'base64').toString('utf-8'))
    const { status, total_amount, transaction_uuid, signature } = decodedData

    if (status !== 'COMPLETE') {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL}/order/failure?orderId=${orderId}&status=${status}`)
    }

    // 2. Security Check: Re-verify Signature
    const secretKey = process.env.ESEWA_SECRET_KEY
    const productCode = process.env.ESEWA_PRODUCT_CODE || 'EPAYTEST'
    
    if (!secretKey) {
      throw new Error('Secret key not configured')
    }

    const message = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${productCode}`
    const expectedSignature = crypto
      .createHmac('sha256', secretKey)
      .update(message)
      .digest('base64')

    if (signature !== expectedSignature) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL}/order/failure?orderId=${orderId}&error=Signature+Mismatch`)
    }

    // 3. Security Check: Verify order details in DB
    const adminSupabase = createAdminClient()
    const { data: order, error: orderError } = await adminSupabase
      .from('orders')
      .select('*, order_items(*), profiles(email)')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL}/order/failure?error=Order+Not+Found`)
    }

    // Verify amount (eSewa sends string, handle carefully)
    if (Math.round(order.total_amount) !== Math.round(Number(total_amount.replace(/,/g, '')))) {
       return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL}/order/failure?orderId=${orderId}&error=Amount+Mismatch`)
    }

    // 4. Update Order Status and confirm stock
    await adminSupabase
      .from('orders')
      .update({ payment_status: 'paid', status: 'confirmed' })
      .eq('id', orderId)

    await adminSupabase.rpc('confirm_reservation_sale', {
      p_order_id: Number(orderId)
    })

    // 5. Send Confirmation Email
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
        paymentMethod: 'esewa',
        shippingAddress: order.shipping_address as any
      })
    } catch (emailErr) {
      console.error('Failed to send payment confirmation email:', emailErr)
    }

    // 6. Success Redirect
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL}/order/success/${orderId}`)

  } catch (err: any) {
    console.error('eSewa Verification Error:', err)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL}/order/failure?orderId=${orderId}&error=Verification+Failed`)
  }
}
