'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { ShoppingCart, Menu, X, Search, User, ChevronDown } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useUIStore } from '@/store/uiStore'
import { cn } from '@/lib/utils'
import { NAV_LINKS } from '@/lib/constants'

export function Navbar() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const { totalItems, toggleCart } = useCartStore()
  const { isMobileNavOpen, toggleMobileNav, closeMobileNav } = useUIStore()
  const cartCount = totalItems()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile nav on route change
  useEffect(() => {
    closeMobileNav()
  }, [pathname, closeMobileNav])

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-surface-base/95 backdrop-blur-md border-b border-surface-border shadow-xl shadow-black/40'
          : 'bg-transparent'
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 group flex-shrink-0"
            aria-label="The Diecast Corner Nepal Home"
          >
            <div className="w-9 h-9 rounded-lg bg-brand-red flex items-center justify-center font-display text-white text-lg group-hover:bg-brand-red-light transition-colors">
              DC
            </div>
            <div className="hidden sm:block">
              <span className="font-display text-xl text-white tracking-wider leading-none">
                DIECAST
              </span>
              <span className="block text-[10px] text-text-muted tracking-[0.2em] uppercase -mt-0.5">
                Corner Nepal
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <ul className="hidden md:flex items-center gap-1" role="navigation">
            {NAV_LINKS.map(({ label, href }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200',
                    pathname === href || pathname.startsWith(href + '/')
                      ? 'text-white bg-surface-elevated'
                      : 'text-text-muted hover:text-white hover:bg-surface-elevated/50'
                  )}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            {/* Search */}
            <Link
              href="/shop"
              className="p-2 rounded-lg text-text-muted hover:text-white hover:bg-surface-elevated transition-colors"
              aria-label="Search products"
            >
              <Search className="w-5 h-5" />
            </Link>

            {/* Account */}
            <Link
              href="/account"
              className="p-2 rounded-lg text-text-muted hover:text-white hover:bg-surface-elevated transition-colors"
              aria-label="My account"
            >
              <User className="w-5 h-5" />
            </Link>

            {/* Cart */}
            <button
              onClick={toggleCart}
              className="relative p-2 rounded-lg text-text-muted hover:text-white hover:bg-surface-elevated transition-colors"
              aria-label={`Shopping cart, ${cartCount} items`}
              id="cart-button"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 min-w-[18px] min-h-[18px] bg-brand-red text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-cart-bounce leading-none px-1">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={toggleMobileNav}
              className="md:hidden p-2 rounded-lg text-text-muted hover:text-white hover:bg-surface-elevated transition-colors"
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileNavOpen}
            >
              {isMobileNavOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile nav drawer */}
        {isMobileNavOpen && (
          <div className="md:hidden pb-4 border-t border-surface-border mt-1 pt-3 animate-fade-up">
            <ul className="space-y-1">
              {NAV_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className={cn(
                      'block px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                      pathname === href
                        ? 'text-white bg-surface-elevated'
                        : 'text-text-muted hover:text-white hover:bg-surface-elevated/50'
                    )}
                  >
                    {label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/account"
                  className="block px-4 py-3 rounded-lg text-sm font-medium text-text-muted hover:text-white hover:bg-surface-elevated/50 transition-colors"
                >
                  My Account
                </Link>
              </li>
            </ul>
          </div>
        )}
      </nav>
    </header>
  )
}
