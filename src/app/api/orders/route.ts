import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkoutSchema } from '@/lib/validations/checkout'
import { sendEmail } from '@/lib/resend'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const body = await req.json()
  const parsed = checkoutSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { shippingAddress, paymentMethod, items, notes } = parsed.data

  // Calculate totals
  const subtotal = items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0)
  const shippingCharge = subtotal >= 2000 ? 0 : 150
  const total = subtotal + shippingCharge

  // Generate order code
  const orderCode = `DCN-${Date.now().toString().slice(-6)}`

  // Insert order
  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      user_id: user?.id ?? null,
      order_code: orderCode,
      status: 'pending',
      payment_method: paymentMethod,
      payment_status: 'unpaid',
      total_amount: total,
      shipping_charge: shippingCharge,
      shipping_address: shippingAddress,
      notes: notes ?? null,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Insert order items
  const orderItems = items.map((i) => ({
    order_id: order.id,
    product_id: i.product_id,
    product_title: i.product_title,
    product_image: i.product_image,
    product_brand: i.product_brand,
    quantity: i.quantity,
    unit_price: i.unit_price,
  }))

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems)

  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 500 })
  }

  // Decrement stock for each item
  for (const item of items) {
    await supabase.rpc('decrement_stock', {
      product_id: item.product_id,
      qty: item.quantity,
    })
  }

  // Clear server-side cart for logged-in users
  if (user) {
    await supabase.from('cart_items').delete().eq('user_id', user.id)
  }

  // Send Order Confirmation Email via Resend
  if (user?.email) {
    const itemsListHtml = items
      .map(
        (item) => `
      <tr style="border-bottom: 1px solid #edf2f7;">
        <td style="padding: 12px 0; font-size: 14px; color: #2d3748; text-align: left;">
          <div style="font-weight: 600; color: #1a202c;">${item.product_title}</div>
          <div style="font-size: 12px; color: #718096;">${item.product_brand ?? '—'}</div>
        </td>
        <td style="padding: 12px 0; text-align: center; font-size: 14px; color: #4a5568;">x${item.quantity}</td>
        <td style="padding: 12px 0; text-align: right; font-weight: 600; font-size: 14px; color: #2d3748;">Rs. ${item.unit_price.toLocaleString()}</td>
        <td style="padding: 12px 0; text-align: right; font-weight: 600; font-size: 14px; color: #d69e2e;">Rs. ${(item.unit_price * item.quantity).toLocaleString()}</td>
      </tr>
    `
      )
      .join('')

    await sendEmail({
      to: user.email,
      subject: `Order Confirmed: ${orderCode} 🏎️`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 30px 20px; background-color: #f7fafc; color: #2d3748;">
          <div style="background-color: #1a202c; padding: 25px; text-align: center; border-radius: 12px 12px 0 0; border-bottom: 4px solid #e53e3e;">
            <span style="font-size: 24px; font-weight: 800; color: white; letter-spacing: 2px;">DIECAST CORNER</span>
            <span style="font-size: 11px; color: #e2e8f0; display: block; letter-spacing: 4px; margin-top: 5px; text-transform: uppercase;">Nepal</span>
          </div>
          
          <div style="background-color: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border-left: 1px solid #edf2f7; border-right: 1px solid #edf2f7; border-bottom: 1px solid #edf2f7;">
            <h2 style="margin-top: 0; color: #1a202c; font-size: 20px;">Thank you for your order!</h2>
            <p style="font-size: 14px; color: #4a5568; line-height: 1.6;">
              We have successfully received your order and are currently preparing it for shipment. Here are your order details:
            </p>
            
            <div style="background-color: #f7fafc; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #edf2f7; font-size: 13px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="color: #718096; padding-bottom: 5px; text-align: left;">Order Code:</td>
                  <td style="font-weight: bold; text-align: right; color: #1a202c; padding-bottom: 5px;">${orderCode}</td>
                </tr>
                <tr>
                  <td style="color: #718096; padding-bottom: 5px; text-align: left;">Payment Method:</td>
                  <td style="font-weight: bold; text-align: right; color: #1a202c; padding-bottom: 5px; text-transform: uppercase;">${paymentMethod}</td>
                </tr>
                <tr>
                  <td style="color: #718096; text-align: left;">Status:</td>
                  <td style="font-weight: bold; text-align: right; color: #48bb78;">Pending Review</td>
                </tr>
              </table>
            </div>

            <h3 style="color: #1a202c; border-bottom: 2px solid #edf2f7; padding-bottom: 8px; margin-top: 30px; font-size: 15px; text-align: left;">Order Summary</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <thead>
                <tr style="border-bottom: 2px solid #edf2f7; font-size: 12px; color: #718096; text-transform: uppercase;">
                  <th style="text-align: left; padding-bottom: 10px; font-weight: 600;">Item</th>
                  <th style="text-align: center; padding-bottom: 10px; font-weight: 600;">Qty</th>
                  <th style="text-align: right; padding-bottom: 10px; font-weight: 600;">Price</th>
                  <th style="text-align: right; padding-bottom: 10px; font-weight: 600;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsListHtml}
              </tbody>
            </table>

            <div style="margin-left: auto; width: 250px; margin-top: 20px; font-size: 14px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="color: #718096; padding: 6px 0; text-align: left;">Subtotal:</td>
                  <td style="font-weight: 600; text-align: right; color: #1a202c; padding: 6px 0;">Rs. ${subtotal.toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="color: #718096; padding: 6px 0; text-align: left;">Shipping:</td>
                  <td style="font-weight: 600; text-align: right; color: #1a202c; padding: 6px 0;">
                    ${shippingCharge === 0 ? '<span style="color: #48bb78;">FREE</span>' : `Rs. ${shippingCharge.toLocaleString()}`}
                  </td>
                </tr>
                <tr style="border-top: 1px solid #edf2f7;">
                  <td style="font-weight: bold; color: #1a202c; padding: 12px 0; font-size: 16px; text-align: left;">Total Amount:</td>
                  <td style="font-weight: bold; text-align: right; color: #d69e2e; padding: 12px 0; font-size: 18px;">Rs. ${total.toLocaleString()}</td>
                </tr>
              </table>
            </div>

            <h3 style="color: #1a202c; border-bottom: 2px solid #edf2f7; padding-bottom: 8px; margin-top: 30px; font-size: 15px; text-align: left;">Shipping Address</h3>
            <p style="font-size: 13px; color: #4a5568; line-height: 1.6; margin: 10px 0; text-align: left;">
              <strong>${shippingAddress.name}</strong><br/>
              Phone: ${shippingAddress.phone}<br/>
              Address: ${shippingAddress.address}<br/>
              City: ${shippingAddress.city}
              ${shippingAddress.landmark ? `<br/>Landmark: ${shippingAddress.landmark}` : ''}
            </p>

            ${notes ? `
              <h3 style="color: #1a202c; border-bottom: 2px solid #edf2f7; padding-bottom: 8px; margin-top: 30px; font-size: 15px; text-align: left;">Order Notes</h3>
              <p style="font-size: 13px; color: #4a5568; font-style: italic; background-color: #f7fafc; padding: 12px; border-radius: 6px; border-left: 3px solid #cbd5e0; margin: 10px 0; text-align: left;">
                "${notes}"
              </p>
            ` : ''}

            <hr style="border: 0; border-top: 1px solid #edf2f7; margin: 40px 0 20px 0;" />
            <div style="text-align: center; font-size: 12px; color: #a0aec0; line-height: 1.5;">
              <p style="margin: 0;">Diecast Corner Nepal</p>
              <p style="margin: 5px 0 0 0;">Bringing the world of scale models to collectors across Nepal.</p>
            </div>
          </div>
        </div>
      `
    })
  }

  return NextResponse.json({ order }, { status: 201 })
}
