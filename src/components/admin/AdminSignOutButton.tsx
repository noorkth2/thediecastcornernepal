'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export function AdminSignOutButton() {
  const [isSigningOut, setIsSigningOut] = useState(false)
  const router = useRouter()

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await fetch('/api/auth/signout', { method: 'POST' })
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Error signing out:', error)
      setIsSigningOut(false)
    }
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={isSigningOut}
      className="flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-brand-red hover:bg-brand-red/10 transition-colors mt-2 font-medium disabled:opacity-50"
    >
      <LogOut className="w-3.5 h-3.5" />
      {isSigningOut ? 'Signing out...' : 'Sign Out'}
    </button>
  )
}
