'use client'

import { signOut } from 'next-auth/react'
import { LogOut } from 'lucide-react'

interface SignOutButtonProps {
  className?: string
  showText?: boolean
}

export default function SignOutButton({ className, showText = true }: SignOutButtonProps) {
  const handleSignOut = async () => {
    try {
      // Clear any local storage items that might cache user data
      if (typeof window !== 'undefined') {
        // Clear any app-specific localStorage
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('transcribe-') || key.includes('auth') || key.includes('session')) {
            localStorage.removeItem(key)
          }
        })
        
        // Clear any app-specific sessionStorage
        Object.keys(sessionStorage).forEach(key => {
          if (key.startsWith('transcribe-') || key.includes('auth') || key.includes('session')) {
            sessionStorage.removeItem(key)
          }
        })
      }
      
      // Sign out with NextAuth and redirect to home
      await signOut({ 
        callbackUrl: '/', 
        redirect: true 
      })
      
    } catch (error) {
      console.error('Error during sign out:', error)
      // Force redirect even if signOut fails
      window.location.href = '/'
    }
  }

  return (
    <button
      onClick={handleSignOut}
      className={className || "flex items-center space-x-1 text-white/60 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"}
      title="Sign Out"
    >
      <LogOut className="h-4 w-4" />
      {showText && <span className="hidden sm:inline text-sm">Sign Out</span>}
    </button>
  )
}
