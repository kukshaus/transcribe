'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { CheckCircle, Loader2, ArrowLeft, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export default function PaymentSuccess() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [userTokens, setUserTokens] = useState<number | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    if (session && sessionId) {
      // Fetch updated token balance with retries
      const fetchTokens = async (retryCount = 0) => {
        try {
          console.log(`Fetching tokens (attempt ${retryCount + 1})...`)
          console.log('Current session user ID:', session.user?.id)
          console.log('Current session user email:', session.user?.email)
          const response = await fetch('/api/user/tokens', {
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache',
            }
          })
          
          if (response.ok) {
            const data = await response.json()
            console.log('Token data received:', data)
            setUserTokens(data.tokens)
            setIsLoading(false)
          } else {
            console.error('Token fetch failed:', response.status, response.statusText)
            // Retry up to 3 times with increasing delays
            if (retryCount < 3) {
              setTimeout(() => fetchTokens(retryCount + 1), (retryCount + 1) * 2000)
            } else {
              setIsLoading(false)
            }
          }
        } catch (error) {
          console.error('Error fetching tokens:', error)
          // Retry up to 3 times with increasing delays
          if (retryCount < 3) {
            setTimeout(() => fetchTokens(retryCount + 1), (retryCount + 1) * 2000)
          } else {
            setIsLoading(false)
          }
        }
      }

      // Wait longer for webhook to process, then start fetching
      setTimeout(() => fetchTokens(), 3000)
    } else {
      setIsLoading(false)
    }
  }, [session, sessionId])

  const handleRefreshTokens = async () => {
    setIsRefreshing(true)
    try {
      console.log('Manually refreshing tokens...')
      console.log('Current session for manual refresh:', session?.user?.id, session?.user?.email)
      const response = await fetch('/api/user/tokens', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('Manual token refresh result:', data)
        setUserTokens(data.tokens)
      } else {
        console.error('Manual token refresh failed:', response.status)
      }
    } catch (error) {
      console.error('Error manually refreshing tokens:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Authentication Required</h1>
          <p className="text-gray-300 mb-6">Please sign in to view your payment status.</p>
          <Link 
            href="/"
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20 text-center">
        {isLoading ? (
          <>
            <Loader2 className="h-16 w-16 text-purple-400 mx-auto mb-6 animate-spin" />
            <h1 className="text-2xl font-bold text-white mb-4">Processing Payment...</h1>
            <p className="text-gray-300">
              Please wait while we update your token balance.
            </p>
          </>
        ) : (
          <>
            <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-white mb-4">Payment Successful!</h1>
            <p className="text-gray-300 mb-6">
              Thank you for your purchase. Your Bison Bucks have been added to your account.
            </p>
            
            <div className="bg-white/10 rounded-lg p-4 mb-6 border border-white/20">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-300">Current Bison Bucks Balance</p>
                <button
                  onClick={handleRefreshTokens}
                  disabled={isRefreshing}
                  className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                  title="Refresh Bison Bucks balance"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>
              {userTokens !== null ? (
                <p className="text-3xl font-bold text-white">{userTokens}</p>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
                  <p className="text-xl text-gray-300">Loading...</p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Link 
                href="/"
                className="block w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Start Using Bison Bucks
              </Link>
              
              <Link 
                href="/profile?scroll=history"
                className="flex items-center justify-center w-full bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-6 rounded-lg transition-colors border border-white/20"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                View Spending History
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
