'use client'

import Link from 'next/link'
import { useSession, signIn } from 'next-auth/react'
import { User, Shield, Menu } from 'lucide-react'
import SignOutButton from './SignOutButton'
import Logo from './Logo'
import { optimizeGoogleImageUrl, getFallbackImageUrl } from '@/lib/image-utils'
import { useState, useEffect } from 'react'

export default function Header() {
  const { data: session, status } = useSession()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (session?.user?.id) {
      // Check if user is admin
      fetch('/api/admin/users')
        .then(response => {
          if (response.status === 200) {
            setIsAdmin(true)
          }
        })
        .catch(() => {
          // User is not admin, which is fine
        })
    }
  }, [session])

  const stopImpersonating = async () => {
    try {
      const response = await fetch('/api/admin/impersonate', {
        method: 'DELETE'
      })
      
      if (response.ok) {
        // Refresh the page to update the session
        window.location.reload()
      }
    } catch (error) {
      console.error('Error stopping impersonation:', error)
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-30 bg-black/20 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/">
              <Logo size="sm" variant="light" showText={true} />
            </Link>
          </div>

          {/* Desktop Navigation and Authentication UI */}
          <div className="hidden sm:flex items-center space-x-4">
            <Link
              href="/pricing"
              className="flex items-center text-white/80 hover:text-white transition-colors font-medium text-sm py-2"
            >
              Pricing
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center space-x-1 text-white/80 hover:text-white transition-colors font-medium text-sm py-2"
              >
                <Shield className="h-4 w-4" />
                <span>Admin</span>
              </Link>
            )}
            {session?.user?.isImpersonating && (
              <div className="flex items-center space-x-2 bg-yellow-600/20 border border-yellow-500/30 rounded-lg px-3 py-1">
                <span className="text-yellow-300 text-xs font-medium">
                  Viewing as: {session.user.email}
                </span>
                <button
                  onClick={stopImpersonating}
                  className="text-yellow-300 hover:text-yellow-100 text-xs font-medium underline"
                >
                  Stop
                </button>
              </div>
            )}
            {status === 'loading' ? (
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : session ? (
              <div className="flex items-center space-x-3">
                <Link
                  href="/profile"
                  className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors"
                >
                  {session.user?.image ? (
                    <img
                      src={optimizeGoogleImageUrl(session.user.image, 32)}
                      alt={session.user.name || 'User'}
                      className="h-8 w-8 rounded-full border-2 border-white/20 object-cover"
                      onError={(e) => {
                        console.warn('Failed to load user avatar:', session.user.image)
                        const fallbackUrl = session.user.image ? getFallbackImageUrl(session.user.image) : null
                        if (fallbackUrl && e.currentTarget.src !== fallbackUrl) {
                          console.log('Trying fallback image URL')
                          e.currentTarget.src = fallbackUrl
                        } else {
                          e.currentTarget.style.display = 'none'
                          e.currentTarget.nextElementSibling?.classList.remove('hidden')
                        }
                      }}
                    />
                  ) : null}
                  <div className={`h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center border-2 border-white/20 ${session.user?.image ? 'hidden' : ''}`}>
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="hidden lg:inline text-sm font-medium">
                    {session.user?.name?.split(' ')[0] || 'Profile'}
                  </span>
                </Link>
                
                <SignOutButton showText={false} />
              </div>
            ) : (
              <button
                onClick={() => signIn('google', { 
                  callbackUrl: '/',
                  prompt: 'select_account' 
                })}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-2 px-4 sm:px-6 rounded-lg transition-all duration-200 transform hover:scale-105 text-sm"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="sm:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white/80 hover:text-white transition-colors p-2"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="sm:hidden border-t border-white/10 bg-black/30 backdrop-blur-md">
            <div className="px-4 py-3 space-y-3">
              <Link
                href="/pricing"
                className="block text-white/80 hover:text-white transition-colors font-medium text-sm py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors font-medium text-sm py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Shield className="h-4 w-4" />
                  <span>Admin</span>
                </Link>
              )}
              {session?.user?.isImpersonating && (
                <div className="bg-yellow-600/20 border border-yellow-500/30 rounded-lg p-3">
                  <div className="text-yellow-300 text-xs font-medium mb-2">
                    Viewing as: {session.user.email}
                  </div>
                  <button
                    onClick={() => {
                      stopImpersonating()
                      setIsMobileMenuOpen(false)
                    }}
                    className="text-yellow-300 hover:text-yellow-100 text-xs font-medium underline"
                  >
                    Stop Impersonating
                  </button>
                </div>
              )}
              {status === 'loading' ? (
                <div className="flex justify-center py-2">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                </div>
              ) : session ? (
                <div className="space-y-2">
                  <Link
                    href="/profile"
                    className="flex items-center space-x-3 text-white/80 hover:text-white transition-colors py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {session.user?.image ? (
                      <img
                        src={optimizeGoogleImageUrl(session.user.image, 32)}
                        alt={session.user.name || 'User'}
                        className="h-8 w-8 rounded-full border-2 border-white/20 object-cover"
                        onError={(e) => {
                          console.warn('Failed to load user avatar:', session.user.image)
                          const fallbackUrl = session.user.image ? getFallbackImageUrl(session.user.image) : null
                          if (fallbackUrl && e.currentTarget.src !== fallbackUrl) {
                            console.log('Trying fallback image URL')
                            e.currentTarget.src = fallbackUrl
                          } else {
                            e.currentTarget.style.display = 'none'
                            e.currentTarget.nextElementSibling?.classList.remove('hidden')
                          }
                        }}
                      />
                    ) : null}
                    <div className={`h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center border-2 border-white/20 ${session.user?.image ? 'hidden' : ''}`}>
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-medium">
                      {session.user?.name || 'Profile'}
                    </span>
                  </Link>
                  <div className="pt-2">
                    <SignOutButton showText={true} />
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    signIn('google', { 
                      callbackUrl: '/',
                      prompt: 'select_account' 
                    })
                    setIsMobileMenuOpen(false)
                  }}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 text-sm"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
