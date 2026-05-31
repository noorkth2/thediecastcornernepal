'use server'

import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { sendEmail } from '@/lib/resend'
import { verifyAdmin } from '@/lib/supabase/auth-utils'

// Standalone service role admin client that bypasses RLS
function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

export async function updateOrderStatus(orderId: number, status: string, paymentStatus: string) {
  await verifyAdmin()

  // 2. Fetch the current order to check its previous status
  const adminSupabase = createAdminClient()
  const { data: currentOrder, error: fetchError } = await adminSupabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', orderId)
    .single()

  if (fetchError || !currentOrder) {
    throw new Error(fetchError?.message || 'Order not found')
  }

  const wasConfirmed = currentOrder.status === 'confirmed'

  // 3. Update the order status
  const { error: updateError } = await adminSupabase
    .from('orders')
    .update({ status, payment_status: paymentStatus })
    .eq('id', orderId)

  if (updateError) {
    throw new Error(updateError.message)
  }

  // 4. Send Confirmation Email if changing to 'confirmed' (and was not already confirmed)
  if (status === 'confirmed' && !wasConfirmed && currentOrder.user_id) {
    // Fetch the buyer's email from auth
    const { data: userData, error: userError } = await adminSupabase.auth.admin.getUserById(
      currentOrder.user_id
    )

    const buyerEmail = userData?.user?.email

    if (buyerEmail) {
      const items = currentOrder.order_items || []
      const subtotal = items.reduce((sum: number, i: any) => sum + i.unit_price * i.quantity, 0)
      const shippingCharge = currentOrder.shipping_charge ?? (subtotal >= 2000 ? 0 : 150)
      const total = subtotal + shippingCharge

      const itemsListHtml = items
        .map(
          (item: any) => `
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
        to: buyerEmail,
        subject: `Order Confirmed: ${currentOrder.order_code} 🏎️`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 30px 20px; background-color: #f7fafc; color: #2d3748;">
            <div style="background-color: #1a202c; padding: 25px; text-align: center; border-radius: 12px 12px 0 0; border-bottom: 4px solid #e53e3e;">
              <span style="font-size: 24px; font-weight: 800; color: white; letter-spacing: 2px;">DIECAST CORNER</span>
              <span style="font-size: 11px; color: #e2e8f0; display: block; letter-spacing: 4px; margin-top: 5px; text-transform: uppercase;">Nepal</span>
            </div>
            
            <div style="background-color: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border-left: 1px solid #edf2f7; border-right: 1px solid #edf2f7; border-bottom: 1px solid #edf2f7;">
              <h2 style="margin-top: 0; color: #1a202c; font-size: 20px;">Your order has been confirmed!</h2>
              <p style="font-size: 14px; color: #4a5568; line-height: 1.6;">
                Great news! Our admin team has reviewed and confirmed your order. We are now preparing your scale models for dispatch. Here are the confirmed details:
              </p>
              
              <div style="background-color: #f7fafc; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #edf2f7; font-size: 13px;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="color: #718096; padding-bottom: 5px; text-align: left;">Order Code:</td>
                    <td style="font-weight: bold; text-align: right; color: #1a202c; padding-bottom: 5px;">${currentOrder.order_code}</td>
                  </tr>
                  <tr>
                    <td style="color: #718096; padding-bottom: 5px; text-align: left;">Payment Method:</td>
                    <td style="font-weight: bold; text-align: right; color: #1a202c; padding-bottom: 5px; text-transform: uppercase;">${currentOrder.payment_method}</td>
                  </tr>
                  <tr>
                    <td style="color: #718096; text-align: left;">Status:</td>
                    <td style="font-weight: bold; text-align: right; color: #3182ce;">Confirmed & Processing</td>
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
                <strong>${currentOrder.shipping_address.name}</strong><br/>
                Phone: ${currentOrder.shipping_address.phone}<br/>
                Address: ${currentOrder.shipping_address.address}<br/>
                City: ${currentOrder.shipping_address.city}
                ${currentOrder.shipping_address.landmark ? `<br/>Landmark: ${currentOrder.shipping_address.landmark}` : ''}
              </p>

              ${currentOrder.notes ? `
                <h3 style="color: #1a202c; border-bottom: 2px solid #edf2f7; padding-bottom: 8px; margin-top: 30px; font-size: 15px; text-align: left;">Order Notes</h3>
                <p style="font-size: 13px; color: #4a5568; font-style: italic; background-color: #f7fafc; padding: 12px; border-radius: 6px; border-left: 3px solid #cbd5e0; margin: 10px 0; text-align: left;">
                  "${currentOrder.notes}"
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
  }

  return { success: true }
}
