import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { productId, variantId, quantity } = await request.json()

    if (!productId || !quantity) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get or create session ID (for anonymous users)
    let sessionId = (await cookies()).get('cart_session')?.value
    if (!sessionId) {
      sessionId = crypto.randomUUID()
      ;(await cookies()).set('cart_session', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 1 week
      })
    }

    // Call the atomic reserve function using the admin client because public execute is revoked
    const adminSupabase = createAdminClient()
    const { data, error } = await adminSupabase.rpc('reserve_stock', {
      p_product_id: productId,
      p_variant_id: variantId || null,
      p_session: sessionId,
      p_qty: quantity
    })

    if (error) {
      console.error('Reservation error:', error)
      return NextResponse.json({ error: 'Failed to reserve stock' }, { status: 500 })
    }

    if (!data.success) {
      return NextResponse.json(
        { error: 'Insufficient stock', available: data.available }, 
        { status: 409 }
      )
    }

    return NextResponse.json({
      success: true,
      reservation_id: data.reservation_id,
      expires_at: data.expires_at
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const reservationId = searchParams.get('id')

    if (!reservationId) {
      return NextResponse.json({ error: 'Missing reservation ID' }, { status: 400 })
    }

    const sessionId = (await cookies()).get('cart_session')?.value
    if (!sessionId) {
      return NextResponse.json({ error: 'No active session' }, { status: 401 })
    }

    // Call the release stock function using the admin client
    const adminSupabase = createAdminClient()
    const { data, error } = await adminSupabase.rpc('release_stock', {
      p_reservation_id: reservationId,
      p_session: sessionId
    })

    if (error) {
      console.error('Release error:', error)
      return NextResponse.json({ error: 'Failed to release stock' }, { status: 500 })
    }

    return NextResponse.json({ success: data })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

