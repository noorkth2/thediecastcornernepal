import { NextRequest, NextResponse } from 'next/server'
import { searchProducts } from '@/lib/supabase/queries/search'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.trim() === '') {
      return NextResponse.json([])
    }

    const products = await searchProducts(query.trim())
    return NextResponse.json(products)
  } catch (error: any) {
    console.error('Search API error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
