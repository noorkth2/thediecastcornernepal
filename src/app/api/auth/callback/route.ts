import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/account'
  const isLocalhost = request.headers.get('host')?.includes('localhost')
  const baseUrl = isLocalhost ? 'http://localhost:3000' : process.env.NEXT_PUBLIC_URL

  if (code) {
    const supabase = await createClient()
    const { error, data: { user } } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && user) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      
      console.log('[Auth Callback] User:', user.email, 'Profile:', profile, 'Error:', profileError)
      
      if (profile?.role === 'admin') {
        return NextResponse.redirect(`${baseUrl}/admin`)
      } else {
        console.log('[Auth Callback] Not admin, role:', profile?.role)
        const finalRedirect = next === '/account' ? '/' : next
        return NextResponse.redirect(`${baseUrl}${finalRedirect}`)
      }
    }
  }

  return NextResponse.redirect(`${baseUrl}/login?error=auth_callback_failed`)
}
