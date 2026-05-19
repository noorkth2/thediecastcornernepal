import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SOCIAL_LINKS, NAV_LINKS } from '@/lib/constants'

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
  )
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  )
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.79 1.53V6.74a4.85 4.85 0 01-1.02-.05z"/>
    </svg>
  )
}

export async function Footer() {
  const supabase = await createClient()
  const { data: settings } = await supabase
    .from('site_settings')
    .select('key, value')
    .in('key', ['instagram_url', 'facebook_url', 'tiktok_url'])

  const urls = {
    instagram: SOCIAL_LINKS.instagram,
    facebook: SOCIAL_LINKS.facebook,
    tiktok: SOCIAL_LINKS.tiktok,
  }

  if (settings) {
    settings.forEach((row) => {
      if (row.key === 'instagram_url' && row.value) urls.instagram = row.value
      if (row.key === 'facebook_url' && row.value) urls.facebook = row.value
      if (row.key === 'tiktok_url' && row.value) urls.tiktok = row.value
    })
  }

  return (
    <footer className="bg-surface-card border-t border-surface-border mt-20">
      <div className="h-1 bg-gradient-to-r from-brand-red via-brand-orange to-brand-gold" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-brand-red flex items-center justify-center font-display text-white text-xl">
                DC
              </div>
              <div>
                <span className="font-display text-2xl text-white tracking-wider block leading-none">
                  DIECAST CORNER
                </span>
                <span className="text-[11px] text-text-muted tracking-[0.25em] uppercase">Nepal</span>
              </div>
            </Link>
            <p className="text-text-muted text-sm leading-relaxed max-w-xs">
              Nepal&apos;s premier destination for MiniGT, Tomica, Matchbox,
              Greenlight, and premium diecast collectibles. Bringing the world of
              scale models to collectors across Nepal.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <a href={urls.instagram} target="_blank" rel="noopener noreferrer"
                className="p-2 rounded-lg bg-surface-elevated text-text-muted hover:text-white hover:bg-surface-border transition-colors"
                aria-label="Instagram">
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a href={urls.facebook} target="_blank" rel="noopener noreferrer"
                className="p-2 rounded-lg bg-surface-elevated text-text-muted hover:text-white hover:bg-surface-border transition-colors"
                aria-label="Facebook">
                <FacebookIcon className="w-4 h-4" />
              </a>
              <a href={urls.tiktok} target="_blank" rel="noopener noreferrer"
                className="p-2 rounded-lg bg-surface-elevated text-text-muted hover:text-white hover:bg-surface-border transition-colors"
                aria-label="TikTok">
                <TikTokIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-text-primary text-sm uppercase tracking-widest mb-4">Quick Links</h3>
            <ul className="space-y-2.5">
              {NAV_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-text-muted hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
              <li>
                <Link href="/account" className="text-sm text-text-muted hover:text-white transition-colors">My Account</Link>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="font-semibold text-text-primary text-sm uppercase tracking-widest mb-4">Info</h3>
            <ul className="space-y-2.5">
              {[
                { label: 'About Us', href: '#' },
                { label: 'Contact', href: '#' },
                { label: 'Shipping Policy', href: '#' },
                { label: 'Return Policy', href: '#' },
                { label: 'Privacy Policy', href: '#' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-text-muted hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-surface-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-text-faint text-xs">
            © {new Date().getFullYear()} The Diecast Corner Nepal. All rights reserved.
          </p>
          <div className="flex items-center gap-3 text-text-faint text-xs">
            <span>🇳🇵 Made with love for Nepal&apos;s collectors</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
