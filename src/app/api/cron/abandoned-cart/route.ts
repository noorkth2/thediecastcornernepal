import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// You would typically use the Resend SDK here
// import { Resend } from 'resend'
// const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(request: Request) {
  // Verify authorization for cron endpoint (e.g., Vercel Cron secret)
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Find sessions inactive for more than 2 hours, less than 24 hours, with an email, and not yet recovered
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    const { data: sessions, error } = await supabase
      .from('cart_sessions')
      .select('*')
      .not('email', 'is', null)
      .is('recovered_at', null)
      .lt('last_active', twoHoursAgo)
      .gt('last_active', twentyFourHoursAgo)
      // Note: In a real system, you'd want to track 'email_sent_at' to avoid spamming them every hour
      .is('recovery_discount_code', null) // We use this as a proxy for "email not sent yet" for now

    if (error) {
      console.error('Error fetching abandoned carts:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    let emailsSent = 0

    for (const session of sessions) {
      if (!session.cart_snapshot?.items || session.cart_snapshot.items.length === 0) continue

      // Generate a unique discount code
      const discountCode = `COMEBACK-${session.id.split('-')[0].toUpperCase()}`
      
      // Update session to indicate email was sent (by setting the discount code)
      await supabase
        .from('cart_sessions')
        .update({ recovery_discount_code: discountCode })
        .eq('id', session.id)

      // Send email via Resend
      /* 
      await resend.emails.send({
        from: 'The Diecast Corner Nepal <sales@thediecastcornernepal.com>',
        to: session.email,
        subject: 'You left something behind! 🏎️',
        html: `
          <h1>Still thinking about it?</h1>
          <p>We noticed you left some items in your cart. Use code <strong>${discountCode}</strong> for 5% off if you complete your order today.</p>
          <a href="https://thediecastcornernepal.com/cart?recover=${session.session_token}">Return to Cart</a>
        `
      })
      */
      
      console.log(`Mock sent recovery email to ${session.email} with code ${discountCode}`)
      emailsSent++
    }

    return NextResponse.json({ success: true, processed: sessions.length, emailsSent })
  } catch (err: any) {
    console.error('Cron error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
