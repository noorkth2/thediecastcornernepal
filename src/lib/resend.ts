import { Resend } from 'resend'

// Initialize Resend with the API Key
// If not present in environment, we print a developer warning instead of crashing
const apiKey = process.env.RESEND_API_KEY

if (!apiKey && process.env.NODE_ENV !== 'production') {
  console.warn(
    '⚠️ WARNING: RESEND_API_KEY is not defined in your environment variables. Emails will be logged to the console instead.'
  )
}

export const resend = apiKey ? new Resend(apiKey) : null

interface SendEmailPayload {
  to: string | string[]
  subject: string
  html: string
  from?: string
}

/**
 * Sends an email using Resend, or logs it in development if API key is not configured.
 */
export async function sendEmail({
  to,
  subject,
  html,
  from = 'The Diecast Corner Nepal <sales@thediecastcornernepal.com>',
}: SendEmailPayload) {
  const recipientList = Array.isArray(to) ? to : [to]

  if (!resend) {
    console.log('✉️ [MOCK EMAIL SENT]')
    console.log(`From:    ${from}`)
    console.log(`To:      ${recipientList.join(', ')}`)
    console.log(`Subject: ${subject}`)
    console.log(`HTML:\n${html}`)
    return { success: true, mock: true }
  }

  try {
    const { data, error } = await resend.emails.send({
      from,
      to: recipientList,
      subject,
      html,
    })

    if (error) {
      console.error('❌ Resend Email Error:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (err: any) {
    console.error('❌ Resend Exception:', err)
    return { success: false, error: err.message || err }
  }
}
