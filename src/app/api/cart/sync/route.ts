import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const syncSchema = z.array(
  z.object({
    product_id: z.number(),
    quantity: z.number().min(1),
  })
)

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const parsed = syncSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const upserts = parsed.data.map((i) => ({
      user_id: user.id,
      product_id: i.product_id,
      quantity: i.quantity,
    }))

    const { error } = await supabase
      .from('cart_items')
      .upsert(upserts, { onConflict: 'user_id,product_id' })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
