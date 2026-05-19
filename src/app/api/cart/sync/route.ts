import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

import { cookies } from 'next/headers'

const syncSchema = z.array(
  z.object({
    product_id: z.number(),
    variant_id: z.number().nullable().optional(),
    quantity: z.number().min(1),
  })
)

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  try {
    const body = await req.json()
    const parsed = syncSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    // 1. Sync to cart_items if logged in
    if (user) {
      const upserts = parsed.data.map((i) => ({
        user_id: user.id,
        product_id: i.product_id,
        variant_id: i.variant_id,
        quantity: i.quantity,
      }))

      const { error } = await supabase
        .from('cart_items')
        .upsert(upserts, { onConflict: 'user_id,product_id,variant_id' })

      if (error) console.error('Cart sync error:', error)
    }

    // 2. Track cart session for abandoned cart recovery
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

    const { error: sessionError } = await supabase
      .from('cart_sessions')
      .upsert({
        session_token: sessionId,
        user_id: user?.id || null,
        cart_snapshot: { items: parsed.data },
        last_active: new Date().toISOString()
      }, { onConflict: 'session_token' })

    if (sessionError) console.error('Cart session sync error:', sessionError)

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
