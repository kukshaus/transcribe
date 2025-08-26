'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Coins, User, ArrowLeft, CreditCard, Clock, FileText, ScrollText, Plus, Gift, UserCheck } from 'lucide-react'
import { optimizeGoogleImageUrl, getFallbackImageUrl } from '@/lib/image-utils'

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [userTokens, setUserTokens] = useState<{tokens: number, hasTokens: boolean} | null>(null)
  const [spendingHistory, setSpendingHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const tokenHistoryRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }
    
    if (session) {
      console.log('Profile page session data:', {
        user: session.user,
        image: session.user?.image,
        name: session.user?.name,
        email: session.user?.email
      })
      
      // Compare URLs between header and profile
      if (session.user?.image) {
        console.log('Profile image URLs:')
        console.log('  Original:', session.user.image)
        console.log('  Header (32px):', optimizeGoogleImageUrl(session.user.image, 32))
        console.log('  Profile (160px):', optimizeGoogleImageUrl(session.user.image, 160))
        console.log('  Fallback:', getFallbackImageUrl(session.user.image))
      }
      
      fetchUserTokens()
      fetchSpendingHistory()
    }
  }, [session, status, router])

  // Check if we should scroll to token history section
  useEffect(() => {
    const shouldScrollToHistory = searchParams.get('scroll') === 'history'
    if (shouldScrollToHistory && tokenHistoryRef.current && !loading) {
      // Small delay to ensure content is loaded
      setTimeout(() => {
        tokenHistoryRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        })
      }, 100)
    }
  }, [searchParams, loading])

  const fetchUserTokens = async () => {
    if (!session) return
    
    try {
      console.log('[PROFILE_DEBUG] Fetching user tokens...')
      const response = await fetch('/api/user/tokens')
      
      console.log('[PROFILE_DEBUG] Response status:', response.status)
      console.log('[PROFILE_DEBUG] Response headers:', Object.fromEntries(response.headers.entries()))
      console.log('[PROFILE_DEBUG] Response content-type:', response.headers.get('content-type'))
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('[PROFILE_DEBUG] Non-OK response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        })
        return
      }
      
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text()
        console.error('[PROFILE_DEBUG] Response is not JSON:', {
          contentType,
          responseText: responseText.substring(0, 500) + (responseText.length > 500 ? '...' : '')
        })
        return
      }
      
      const data = await response.json()
      console.log('[PROFILE_DEBUG] Successfully parsed JSON:', data)
      setUserTokens(data)
    } catch (error) {
      console.error('[PROFILE_DEBUG] Error fetching user tokens:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchSpendingHistory = async () => {
    if (!session) return
    
    try {
      const response = await fetch('/api/user/spending-history')
      if (response.ok) {
        const data = await response.json()
        setSpendingHistory(data.spendingHistory || [])
      }
    } catch (error) {
      console.error('Error fetching spending history:', error)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-16">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center space-x-2 text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Profile Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 mb-8">
          <div className="flex items-center space-x-6">
            {session.user?.image ? (
              <img
                src={optimizeGoogleImageUrl(session.user.image, 160)}
                alt={session.user.name || 'User'}
                className="h-20 w-20 rounded-full border-4 border-white/20 object-cover"
                onError={(e) => {
                  console.warn('Failed to load user avatar on profile page:', session.user.image)
                  console.warn('Current src:', e.currentTarget.src)
                  // Try a higher quality fallback for profile page
                  const fallbackUrl = session.user.image ? optimizeGoogleImageUrl(session.user.image, 320) : null
                  if (fallbackUrl && e.currentTarget.src !== fallbackUrl) {
                    console.log('Trying higher quality fallback on profile page:', fallbackUrl)
                    e.currentTarget.src = fallbackUrl
                  } else {
                    console.log('Hiding broken image and showing fallback')
                    e.currentTarget.style.display = 'none'
                    e.currentTarget.nextElementSibling?.classList.remove('hidden')
                  }
                }}
                onLoad={() => {
                  console.log('Profile avatar loaded successfully:', session.user.image)
                }}
              />
            ) : null}
            <div className={`h-20 w-20 rounded-full bg-purple-600 flex items-center justify-center border-4 border-white/20 ${session.user?.image ? 'hidden' : ''}`}>
              <User className="h-10 w-10 text-white" />
            </div>
            
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {session.user?.name || 'User Profile'}
              </h1>
              <p className="text-white/80 text-lg">
                {session.user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Token Information */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Bison Bucks</h2>
          
          {userTokens && (
            <div className="space-y-6">
              {/* Token Counter */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`flex items-center space-x-3 rounded-xl px-6 py-4 border-2 ${
                    userTokens.tokens <= 2 
                      ? 'bg-red-500/20 border-red-400/50' 
                      : userTokens.tokens <= 5
                      ? 'bg-yellow-500/20 border-yellow-400/50'
                      : 'bg-green-500/20 border-green-400/50'
                  }`}>
                    <Coins className={`h-8 w-8 ${
                      userTokens.tokens <= 2 
                        ? 'text-red-400' 
                        : userTokens.tokens <= 5
                        ? 'text-yellow-400'
                        : 'text-green-400'
                    }`} />
                    <div>
                      <div className="text-2xl font-bold text-white">
                        {userTokens.tokens}
                      </div>
                      <div className="text-white/80 text-sm">
                        Bison Bucks remaining
                      </div>
                    </div>
                  </div>
                </div>
                
                <Link
                  href="/pricing"
                  className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105"
                >
                  <CreditCard className="h-5 w-5" />
                  <span>Buy More Bison Bucks</span>
                </Link>
              </div>

              {/* Token Status */}
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h3 className="text-white font-medium mb-2">Bison Bucks Usage</h3>
                <div className="text-white/80 text-sm space-y-1">
                  <div>• AI notes generation: 1 Bison Buck per request</div>
                  <div>• PRD generation: 2 Bison Bucks per request</div>
                </div>
              </div>

              {userTokens.tokens <= 5 && (
                <div className="bg-amber-500/20 border border-amber-400/50 rounded-lg p-4">
                  <div className="text-amber-300">
                    <strong>Low Bison Bucks Warning:</strong> You're running low on Bison Bucks. 
                    Consider purchasing more to continue using AI features.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Token History */}
        <div ref={tokenHistoryRef} className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6">Bison Bucks History</h2>
          
          {spendingHistory.length > 0 ? (
            <div className="space-y-3">
              {spendingHistory.map((item, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      item.tokensChanged > 0 ? 'bg-green-500/20' : 'bg-red-500/20'
                    }`}>
                      {item.action === 'notes_generation' ? (
                        <FileText className="h-4 w-4 text-blue-400" />
                      ) : item.action === 'prd_generation' ? (
                        <ScrollText className="h-4 w-4 text-purple-400" />
                      ) : item.action === 'free_tokens_granted' ? (
                        <Gift className="h-4 w-4 text-yellow-400" />
                      ) : item.action === 'anonymous_tokens_transferred' ? (
                        <Gift className="h-4 w-4 text-cyan-400" />
                      ) : item.action === 'token_purchase' ? (
                        <Plus className="h-4 w-4 text-green-400" />
                      ) : (
                        <Coins className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                    
                    <div>
                      <div className="text-white font-medium flex items-center space-x-2">
                        <span>
                          {item.action === 'transcription_creation' && item.transcriptionTitle 
                            ? `Transcription creation for "${item.transcriptionTitle}"`
                            : item.description
                          }
                        </span>
                        {item.isFreeTier && (
                          <span className="bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full text-xs font-medium border border-yellow-400/30">
                            FREE
                          </span>
                        )}
                      </div>
                      <div className="text-white/60 text-sm flex items-center space-x-2">
                        <Clock className="h-3 w-3" />
                        <span>
                          {new Date(item.createdAt).toLocaleDateString()} at{' '}
                          {new Date(item.createdAt).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`font-medium ${
                      item.tokensChanged > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {item.tokensChanged > 0 ? '+' : ''}{item.tokensChanged} Bison Buck{Math.abs(item.tokensChanged) !== 1 ? 's' : ''}
                    </div>
                    {item.balanceAfter !== undefined && (
                      <div className="text-white/60 text-sm">
                        Balance: {item.balanceAfter}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-white/60" />
              </div>
              <div className="text-white/80 text-lg mb-2">No Bison Bucks history yet</div>
              <div className="text-white/60">
                Your Bison Bucks transactions will appear here when you use Bison Bucks or receive new ones
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
