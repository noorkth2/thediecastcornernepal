import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

/**
 * eSewa EPAY v2 Integration (Initiation)
 */
export async function POST(req: NextRequest) {
  try {
    const { orderId, amount, orderCode } = await req.json()

    if (!orderId || !amount || !orderCode) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const secretKey = process.env.ESEWA_SECRET_KEY
    const productCode = process.env.ESEWA_PRODUCT_CODE || 'EPAYTEST' // EPAYTEST for UAT
    const isProduction = process.env.NODE_ENV === 'production' && !process.env.ESEWA_TEST_MODE
    const baseUrl = isProduction 
      ? 'https://epay.esewa.com.np/api/epay/main/v2/form'
      : 'https://rc-epay.esewa.com.np/api/epay/main/v2/form'

    if (!secretKey) {
      return NextResponse.json({ error: 'eSewa Secret Key not configured' }, { status: 500 })
    }

    // eSewa v2 requires specific fields for signature
    // Field names: total_amount, transaction_uuid, product_code
    const transactionUuid = orderCode // Use our unique order code
    const totalAmount = amount.toString() // Must be string for signature

    const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`
    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(message)
      .digest('base64')

    // Parameters for eSewa form submission
    const formData = {
      amount: amount.toString(),
      tax_amount: '0',
      total_amount: totalAmount,
      transaction_uuid: transactionUuid,
      product_code: productCode,
      product_service_charge: '0',
      product_delivery_charge: '0',
      success_url: `${process.env.NEXT_PUBLIC_URL}/api/payment/esewa/verify?orderId=${orderId}`,
      failure_url: `${process.env.NEXT_PUBLIC_URL}/order/failure?orderId=${orderId}`,
      signed_field_names: 'total_amount,transaction_uuid,product_code',
      signature: signature,
    }

    // Since eSewa uses a FORM POST redirect, we return the data to the client 
    // which will then programmatically submit a form.
    return NextResponse.json({ 
      url: baseUrl,
      formData 
    })

  } catch (err: any) {
    console.error('eSewa Initiation Error:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
