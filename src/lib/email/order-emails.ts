import { sendEmail } from '@/lib/resend'
import { formatPrice } from '@/lib/utils'

interface OrderEmailData {
  orderCode: string
  customerName: string
  customerEmail: string
  items: Array<{
    title: string
    quantity: number
    price: number
  }>
  subtotal: number
  shippingCharge: number
  total: number
  paymentMethod: string
  shippingAddress: {
    name: string
    address: string
    city: string
    phone: string
  }
}

const ADMIN_EMAILS = ['kayastha.noor1100@gmail.com', 'thediecastcornernepal@gmail.com']

export async function sendOrderPendingEmail(data: OrderEmailData) {
  const itemsHtml = data.items.map(i => `
    <tr>
      <td style="padding: 12px 8px; border-bottom: 1px solid #eee;">${i.title}</td>
      <td style="padding: 12px 8px; border-bottom: 1px solid #eee; text-align: center;">${i.quantity}</td>
      <td style="padding: 12px 8px; border-bottom: 1px solid #eee; text-align: right;">${formatPrice(i.price * i.quantity)}</td>
    </tr>
  `).join('')

  const emailHtml = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #000; padding: 20px; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 24px; letter-spacing: 2px;">THE DIECAST CORNER</h1>
      </div>
      
      <div style="padding: 30px;">
        <h2 style="color: #e53e3e; margin-top: 0;">Order Received: #${data.orderCode}</h2>
        <p>Hi ${data.customerName},</p>
        <p>Thank you for shopping with us! We've received your order and it's now being processed. ${data.paymentMethod === 'cod' ? 'Please keep the exact change ready for delivery.' : 'We will notify you once your payment is confirmed.'}</p>
        
        <div style="margin: 30px 0; background: #fafafa; padding: 20px; border-radius: 8px;">
          <h3 style="margin-top: 0; font-size: 16px; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Order Summary</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="text-align: left; font-size: 12px; color: #666; text-transform: uppercase;">
                <th style="padding-bottom: 10px;">Item</th>
                <th style="padding-bottom: 10px; text-align: center;">Qty</th>
                <th style="padding-bottom: 10px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding-top: 20px; text-align: right; color: #666;">Subtotal:</td>
                <td style="padding-top: 20px; text-align: right;">${formatPrice(data.subtotal)}</td>
              </tr>
              <tr>
                <td colspan="2" style="padding-top: 5px; text-align: right; color: #666;">Shipping:</td>
                <td style="padding-top: 5px; text-align: right;">${data.shippingCharge === 0 ? 'FREE' : formatPrice(data.shippingCharge)}</td>
              </tr>
              <tr style="font-size: 18px; font-weight: bold;">
                <td colspan="2" style="padding-top: 15px; text-align: right;">Grand Total:</td>
                <td style="padding-top: 15px; text-align: right; color: #d69e2e;">${formatPrice(data.total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div style="display: grid; grid-template-cols: 1fr 1fr; gap: 20px;">
          <div>
            <h4 style="margin-bottom: 5px; color: #666; font-size: 12px; text-transform: uppercase;">Shipping To:</h4>
            <p style="margin: 0; font-size: 14px; line-height: 1.5;">
              <strong>${data.shippingAddress.name}</strong><br>
              ${data.shippingAddress.address}<br>
              ${data.shippingAddress.city}<br>
              Phone: ${data.shippingAddress.phone}
            </p>
          </div>
          <div>
            <h4 style="margin-bottom: 5px; color: #666; font-size: 12px; text-transform: uppercase;">Payment Method:</h4>
            <p style="margin: 0; font-size: 14px;">${data.paymentMethod.toUpperCase()}</p>
          </div>
        </div>
      </div>
      
      <div style="background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999;">
        <p>© 2026 The Diecast Corner Nepal. All rights reserved.</p>
        <p>Baneshwor, Kathmandu, Nepal | +977-98XXXXXXXX</p>
      </div>
    </div>
  `

  // Send to Buyer
  await sendEmail({
    to: data.customerEmail,
    subject: `Order Received: #${data.orderCode} 🏎️`,
    html: emailHtml
  })

  // Send to Admin
  await sendEmail({
    to: ADMIN_EMAILS,
    subject: `New Order Alert: #${data.orderCode} 🔔`,
    html: `<p>A new order has been placed by ${data.customerName}.</p>` + emailHtml
  })
}

export async function sendOrderPaidEmail(data: OrderEmailData) {
  const itemsHtml = data.items.map(i => `
    <tr>
      <td style="padding: 12px 8px; border-bottom: 1px solid #eee;">${i.title}</td>
      <td style="padding: 12px 8px; border-bottom: 1px solid #eee; text-align: center;">${i.quantity}</td>
      <td style="padding: 12px 8px; border-bottom: 1px solid #eee; text-align: right;">${formatPrice(i.price * i.quantity)}</td>
    </tr>
  `).join('')

  const emailHtml = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #1a1a1a; padding: 20px; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 24px; letter-spacing: 2px;">THE DIECAST CORNER</h1>
      </div>
      
      <div style="padding: 30px;">
        <div style="background-color: #e6fffa; border: 1px solid #38a169; color: #276749; padding: 15px; border-radius: 8px; text-align: center; margin-bottom: 25px;">
          <h2 style="margin: 0; font-size: 20px;">Payment Confirmed!</h2>
          <p style="margin: 5px 0 0;">Your order #${data.orderCode} is now being prepared for shipping.</p>
        </div>

        <p>Hi ${data.customerName},</p>
        <p>Good news! Your payment via <strong>${data.paymentMethod.toUpperCase()}</strong> has been successfully verified. We are now packing your collectibles with extra care.</p>
        
        <div style="margin: 30px 0; background: #fafafa; padding: 20px; border-radius: 8px;">
          <h3 style="margin-top: 0; font-size: 16px; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Tax Invoice / Receipt</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="text-align: left; font-size: 12px; color: #666; text-transform: uppercase;">
                <th style="padding-bottom: 10px;">Item</th>
                <th style="padding-bottom: 10px; text-align: center;">Qty</th>
                <th style="padding-bottom: 10px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding-top: 20px; text-align: right; color: #666;">Subtotal:</td>
                <td style="padding-top: 20px; text-align: right;">${formatPrice(data.subtotal)}</td>
              </tr>
              <tr>
                <td colspan="2" style="padding-top: 5px; text-align: right; color: #666;">Shipping:</td>
                <td style="padding-top: 5px; text-align: right;">${data.shippingCharge === 0 ? 'FREE' : formatPrice(data.shippingCharge)}</td>
              </tr>
              <tr style="font-size: 18px; font-weight: bold;">
                <td colspan="2" style="padding-top: 15px; text-align: right;">Paid Amount:</td>
                <td style="padding-top: 15px; text-align: right; color: #38a169;">${formatPrice(data.total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div style="background-color: #ebf8ff; padding: 15px; border-radius: 8px; font-size: 14px; color: #2c5282;">
          <strong>What's Next?</strong><br>
          You will receive another email with a tracking number once your package is picked up by our delivery partner.
        </div>
      </div>
      
      <div style="background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999;">
        <p>© 2026 The Diecast Corner Nepal. All rights reserved.</p>
        <p>Questions? Reply to this email or call us at +977-98XXXXXXXX</p>
      </div>
    </div>
  `

  await sendEmail({
    to: data.customerEmail,
    subject: `Payment Confirmed: #${data.orderCode} ✅`,
    html: emailHtml
  })

  await sendEmail({
    to: ADMIN_EMAILS,
    subject: `Payment Success Alert: #${data.orderCode} 💰`,
    html: `<p>Payment has been confirmed for order #${data.orderCode} from ${data.customerName}.</p>` + emailHtml
  })
}
