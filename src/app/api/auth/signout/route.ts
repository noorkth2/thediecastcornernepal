import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  await supabase.auth.signOut()
  // Derive the origin from the incoming request so this works correctly
  // in both dev (localhost) and production without relying on NEXT_PUBLIC_URL.
  const origin = new URL(request.url).origin
  return NextResponse.redirect(new URL('/', origin))
}
