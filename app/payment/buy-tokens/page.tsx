'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { TOKEN_PACKAGES } from '@/lib/stripe'
import { CheckCircle, Loader2, Star, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import Header from '@/components/Header'

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null

export default function BuyTokens() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const handlePurchase = async (packageId: string) => {
    if (!session) {
      router.push('/auth/signin')
      return
    }

    if (!stripePromise) {
      alert('Payment system is not configured. Please contact support.')
      return
    }

    setLoading(packageId)

    try {
      // Create checkout session
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ packageId }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { sessionId } = await response.json()
      
      // Redirect to Stripe Checkout
      const stripe = await stripePromise
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({ sessionId })
        if (error) {
          console.error('Stripe redirect error:', error)
        }
      }
    } catch (error) {
      console.error('Purchase error:', error)
      alert('Failed to start checkout. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <Header />
        <div className="pt-24 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20 text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Sign In Required</h1>
            <p className="text-gray-300 mb-6">
              You need to be signed in to purchase tokens.
            </p>
            <Link 
              href="/auth/signin"
              className="block w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Header />
      
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Link 
              href="/"
              className="inline-flex items-center text-purple-300 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Purchase Tokens
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Choose a token package to unlock AI-powered features like notes generation and PRD creation.
            </p>
          </div>

          {/* Token Packages */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {TOKEN_PACKAGES.map((pkg) => (
              <div
                key={pkg.id}
                className={`relative bg-white/10 backdrop-blur-md rounded-xl p-6 border transition-all duration-300 hover:bg-white/15 hover:scale-105 ${
                  pkg.popular 
                    ? 'border-purple-400 ring-2 ring-purple-400/50' 
                    : 'border-white/20'
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center">
                      <Star className="h-3 w-3 mr-1" />
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="text-center">
                  <h3 className="text-xl font-bold text-white mb-2">{pkg.name}</h3>
                  <p className="text-gray-300 text-sm mb-4">{pkg.description}</p>
                  
                  <div className="mb-6">
                    <div className="text-3xl font-bold text-white">{pkg.priceDisplay}</div>
                    <div className="text-sm text-gray-400">
                      ${(pkg.price / 100 / pkg.tokens).toFixed(2)} per token
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="bg-white/10 rounded-lg p-3 border border-white/20">
                      <div className="text-2xl font-bold text-purple-300">{pkg.tokens}</div>
                      <div className="text-sm text-gray-300">Tokens</div>
                    </div>
                  </div>

                  <button
                    onClick={() => handlePurchase(pkg.id)}
                    disabled={loading === pkg.id}
                    className={`w-full font-medium py-3 px-6 rounded-lg transition-all duration-200 ${
                      pkg.popular
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                        : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                    } ${loading === pkg.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {loading === pkg.id ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Processing...
                      </div>
                    ) : (
                      'Purchase Now'
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Features Info */}
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                What You Can Do With Tokens
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-400 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-white">AI Notes Generation</h3>
                    <p className="text-gray-300 text-sm">
                      Generate structured, comprehensive notes from your transcriptions using advanced AI.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-400 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-white">PRD Creation</h3>
                    <p className="text-gray-300 text-sm">
                      Convert transcriptions into detailed Product Requirements Documents for your projects.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center">
                <p className="text-gray-400 text-sm">
                  Each AI feature consumes 1 token per use. Transcription remains free for all users.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
