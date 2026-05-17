'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { User, Package, Settings, LogOut, LayoutDashboard, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface UserDropdownProps {
  user: { email?: string; id: string }
  profile: { full_name?: string; role?: string }
}

export function UserDropdown({ user, profile }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-lg text-text-muted hover:text-white hover:bg-surface-elevated transition-colors"
        aria-label="User menu"
      >
        <User className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-surface-card border border-surface-border rounded-xl shadow-xl z-50 animate-fade-up overflow-hidden">
          <div className="p-4 border-b border-surface-border">
            <p className="font-semibold text-text-primary text-sm truncate">
              {profile.full_name || 'Collector'}
            </p>
            <p className="text-text-faint text-xs truncate">{user.email}</p>
          </div>
          
          <nav className="p-2 space-y-1">
            {profile.role === 'admin' && (
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-brand-gold hover:bg-surface-elevated transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                Admin Dashboard
              </Link>
            )}
            <Link
              href="/account"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-text-muted hover:text-white hover:bg-surface-elevated transition-colors"
            >
              <User className="w-4 h-4" />
              My Profile
            </Link>
            <Link
              href="/account/orders"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-text-muted hover:text-white hover:bg-surface-elevated transition-colors"
            >
              <Package className="w-4 h-4" />
              My Orders
            </Link>
            <Link
              href="/account/wishlist"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-text-muted hover:text-white hover:bg-surface-elevated transition-colors"
            >
              <Heart className="w-4 h-4" />
              Wishlist
            </Link>
          </nav>

          <div className="p-2 border-t border-surface-border">
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-text-muted hover:text-brand-red-light hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
