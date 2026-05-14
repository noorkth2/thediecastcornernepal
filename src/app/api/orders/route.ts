import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkoutSchema } from '@/lib/validations/checkout'

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

  return NextResponse.json({ order }, { status: 201 })
}
