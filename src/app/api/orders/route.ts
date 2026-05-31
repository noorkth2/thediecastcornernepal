import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
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

  // Fetch current product data from DB to prevent price tampering
  const productIds = items.map((i) => i.product_id)
  const { data: dbProducts, error: productsError } = await supabase
    .from('products')
    .select('id, title, price, image_url, brand, is_active')
    .in('id', productIds)

  if (productsError || !dbProducts) {
    return NextResponse.json({ error: 'Failed to verify products' }, { status: 500 })
  }

  // Map items to DB prices and validate
  let verifiedItems
  try {
    verifiedItems = items.map((item) => {
      const dbProduct = dbProducts.find((p) => p.id === item.product_id)
      if (!dbProduct || !dbProduct.is_active) {
        throw new Error(`Product ${item.product_title || item.product_id} is no longer available`)
      }
      return {
        ...item,
        unit_price: dbProduct.price,
        product_title: dbProduct.title,
        product_image: dbProduct.image_url,
        product_brand: dbProduct.brand,
      }
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }

  // Calculate totals using DB prices
  const subtotal = verifiedItems.reduce((sum, i) => sum + i.unit_price * i.quantity, 0)
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
  const orderItems = verifiedItems.map((i) => ({
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
  const adminSupabase = createAdminClient()
  for (const item of verifiedItems) {
    await adminSupabase.rpc('decrement_stock', {
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
