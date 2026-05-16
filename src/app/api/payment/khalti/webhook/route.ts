import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Note: In production, verify the request originates from Khalti (e.g. checking IPs or signatures)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { pidx, status, amount, transaction_id, purchase_order_id } = body

    if (!pidx || !purchase_order_id) {
      return NextResponse.json({ error: 'Missing required payload' }, { status: 400 })
    }

    if (status === 'Completed') {
      const supabase = await createClient()
      
      // The purchase_order_id is usually mapped to the internal order ID or code
      // We assume purchase_order_id = internal order.id or order.order_code based on implementation
      // Here, falling back to an update on the ID if numeric, else fallback logic
      const isNumericId = !isNaN(Number(purchase_order_id))

      const query = supabase
        .from('orders')
        .update({ payment_status: 'paid', status: 'confirmed' })
        
      if (isNumericId) {
        query.eq('id', Number(purchase_order_id))
      } else {
        query.eq('order_code', purchase_order_id)
      }

      const { error } = await query

      if (error) throw error
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Khalti Webhook Error:', err)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
