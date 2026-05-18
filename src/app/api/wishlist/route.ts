import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ items: [] })

  const { data } = await supabase
    .from('wishlist_items')
    .select('product_id')
    .eq('user_id', user.id)

  return NextResponse.json({ items: data?.map((i) => i.product_id) ?? [] })
}

const toggleSchema = z.object({
  product_id: z.number(),
})

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { product_id } = toggleSchema.parse(body)

    const { data: existing } = await supabase
      .from('wishlist_items')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', product_id)
      .single()

    if (existing) {
      await supabase.from('wishlist_items').delete().eq('id', existing.id)
      return NextResponse.json({ isWishlisted: false })
    } else {
      await supabase.from('wishlist_items').insert({
        user_id: user.id,
        product_id,
      })
      return NextResponse.json({ isWishlisted: true })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
