import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { JsonLd, buildOrganizationSchema, buildWebSiteSchema } from '@/components/seo/JsonLd'
import { getNonce } from '@/lib/csp'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: {
    default: 'The Diecast Corner Nepal — MiniGT, Tomica & Collectibles',
    template: '%s | The Diecast Corner Nepal',
  },
  description:
    'Nepal\'s premier destination for MiniGT, Tomica, Matchbox, Greenlight, and premium diecast collectibles. Shop exclusive models, rare limited editions, and collectible scale models.',
  keywords: [
    'MiniGT Nepal',
    'Tomica Nepal',
    'diecast Nepal',
    'Matchbox Nepal',
    'Greenlight Nepal',
    'toy cars Nepal',
    'scale models Nepal',
    'rare diecast collectibles',
    'limited edition diecast',
    'miniature cars Nepal',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_URL,
    siteName: 'The Diecast Corner Nepal',
    title: 'The Diecast Corner Nepal — MiniGT, Tomica & Collectibles',
    description:
      'Nepal\'s premier destination for diecast collectibles. MiniGT, Tomica, Matchbox, Greenlight and more.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Diecast Corner Nepal',
    description: 'Nepal\'s premier diecast collectibles store.',
  },
  robots: { index: true, follow: true },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const nonce = await getNonce()

  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Bebas+Neue&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-surface-base text-text-primary antialiased">
        <JsonLd data={buildOrganizationSchema()} nonce={nonce} />
        <JsonLd data={buildWebSiteSchema()} nonce={nonce} />
        {children}
      </body>
    </html>
  )
}
