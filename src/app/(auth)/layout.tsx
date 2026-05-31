import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Account — The Diecast Corner Nepal',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-surface-base flex items-center justify-center px-4 py-16">
      {/* Background grid */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(192,57,43,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(192,57,43,0.5) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />
      {/* Glow */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-red/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-lg bg-brand-red flex items-center justify-center font-display text-white text-xl">
              DC
            </div>
            <div className="text-left">
              <span className="font-display text-xl text-white tracking-wider block leading-none">
                DIECAST CORNER
              </span>
              <span className="text-[10px] text-text-muted tracking-[0.2em] uppercase">
                Nepal
              </span>
            </div>
          </Link>
        </div>

        {children}
      </div>
    </div>
  )
}
