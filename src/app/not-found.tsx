import Link from 'next/link'
import { Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      {/* Grid bg */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(192,57,43,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(192,57,43,0.5) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      <div className="relative text-center">
        <div className="font-display text-[10rem] sm:text-[14rem] text-white/5 leading-none select-none">
          404
        </div>
        <div className="-mt-16 sm:-mt-20 relative z-10">
          <p className="text-brand-red font-semibold text-sm tracking-widest uppercase mb-2">
            Page Not Found
          </p>
          <h1 className="font-display text-4xl sm:text-5xl text-white tracking-wide mb-3">
            WRONG TRACK
          </h1>
          <p className="text-text-muted text-sm max-w-sm mx-auto mb-8">
            This page doesn&apos;t exist or has been moved. Head back to the pit lane and find what you&apos;re looking for.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/"
              className="flex items-center gap-2 bg-brand-red hover:bg-brand-red-light text-white font-semibold px-6 py-3 rounded-xl transition-colors"
              id="not-found-home-btn"
            >
              <Home className="w-4 h-4" /> Go Home
            </Link>
            <Link
              href="/shop"
              className="flex items-center gap-2 bg-surface-elevated hover:bg-surface-border text-text-primary font-semibold px-6 py-3 rounded-xl border border-surface-border transition-colors"
              id="not-found-shop-btn"
            >
              <Search className="w-4 h-4" /> Browse Shop
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
