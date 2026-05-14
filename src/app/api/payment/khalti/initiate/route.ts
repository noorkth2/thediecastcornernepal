import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { orderId, amount, orderCode } = await req.json()

  if (!orderId || !amount || !orderCode) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const response = await fetch(
    'https://a.khalti.com/api/v2/epayment/initiate/',
    {
      method: 'POST',
      headers: {
        Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        return_url: `${process.env.NEXT_PUBLIC_URL}/order/success/${orderId}`,
        website_url: process.env.NEXT_PUBLIC_URL,
        amount: Math.round(amount * 100), // Convert to paisa
        purchase_order_id: orderCode,
        purchase_order_name: `DCN Order ${orderCode}`,
        customer_info: {
          name: 'Diecast Corner Nepal Customer',
        },
      }),
    }
  )

  const data = await response.json()

  if (!response.ok) {
    return NextResponse.json(
      { error: data.detail ?? 'Khalti initiation failed' },
      { status: response.status }
    )
  }

  return NextResponse.json(data)
}
