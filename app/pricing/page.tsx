'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { TOKEN_PACKAGES } from '@/lib/stripe'
import { CheckCircle, Star, ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import Header from '@/components/Header'
import Image from 'next/image'

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null

export default function PricingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const handleGetStarted = async (packageId: string) => {
    if (!session) {
      // Redirect to sign in with a callback to the pricing page
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent('/pricing')}`)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Header />
      
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <Link 
              href="/"
              className="inline-flex items-center text-purple-300 hover:text-white mb-8 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
            

            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Choose the Bison Bucks package that fits your transcription needs. 
              Pay once, use anytime. No subscriptions, no hidden fees.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {TOKEN_PACKAGES.map((pkg, index) => (
              <div
                key={pkg.id}
                className={`relative bg-white/10 backdrop-blur-md rounded-2xl p-8 border transition-all duration-300 hover:scale-105 ${
                  pkg.popular
                    ? 'border-yellow-400 ring-2 ring-yellow-400/50'
                    : 'border-white/20 hover:border-white/40'
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-1 rounded-full text-sm font-bold flex items-center">
                      <Star className="h-4 w-4 mr-1" />
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-2">{pkg.name}</h3>
                  <p className="text-sm text-purple-300 mb-3 font-medium">
                    {pkg.id === 'tokens_10' && 'Starter Pack'}
                    {pkg.id === 'tokens_25' && 'Professional Pack'}
                    {pkg.id === 'tokens_50' && 'Enterprise Pack'}
                  </p>
                  <div className="text-4xl font-bold text-white mb-1">
                    ${(pkg.price / 100).toFixed(0)}
                  </div>
                  <p className="text-gray-300 mb-6">{pkg.tokens.toLocaleString()} Bison Bucks</p>
                  
                  <div className="text-sm text-gray-400 mb-6">
                    <div>${(pkg.price / 100 / pkg.tokens * 1000).toFixed(2)} per 1,000 Bison Bucks</div>
                    {pkg.id !== 'tokens_10' && (
                      <div className="text-green-400 font-medium mt-1">
                        Save {Math.round((1 - (pkg.price / 100 / pkg.tokens) / (TOKEN_PACKAGES[0].price / 100 / TOKEN_PACKAGES[0].tokens)) * 100)}% vs Starter
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-gray-300 text-center mb-8 min-h-[48px]">
                  {pkg.description}
                </p>

                <div className="space-y-3 mb-8">
                  <div className="flex items-center text-gray-300">
                    <CheckCircle className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                    <span>Audio & video transcription</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <CheckCircle className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                    <span>Multiple export formats</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <CheckCircle className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                    <span>AI-powered notes generation</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <CheckCircle className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                    <span>No expiration date</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <CheckCircle className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                    <span>High accuracy AI models</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <CheckCircle className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                    <span>24/7 processing</span>
                  </div>
                </div>

                <button
                  onClick={() => handleGetStarted(pkg.id)}
                  disabled={loading === pkg.id}
                  className={`w-full py-3 px-6 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    pkg.popular
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:from-yellow-500 hover:to-orange-600'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  {loading === pkg.id ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Processing...
                    </div>
                  ) : session ? (
                    'Purchase Now'
                  ) : (
                    'Get Started'
                  )}
                </button>
              </div>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="mt-20 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              Frequently Asked Questions
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-semibold text-white mb-3">
                  How does Bison Bucks usage work?
                </h3>
                <p className="text-gray-300">
                  Simple and transparent: 1 Bison Buck = 1 transcription, 1 Bison Buck = 1 AI notes generation, 
                  2 Bison Bucks = 1 PRD generation. Bison Bucks are only consumed after successful completion.
                </p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-semibold text-white mb-3">
                  Do Bison Bucks expire?
                </h3>
                <p className="text-gray-300">
                  No! Your Bison Bucks never expire. Purchase once and use them whenever you need transcription services.
                </p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-semibold text-white mb-3">
                  What file formats are supported?
                </h3>
                <p className="text-gray-300">
                  Upload audio/video files (MP3, WAV, MP4, MOV, etc.) or paste URLs from YouTube, SoundCloud, 
                  and other platforms supported by yt-dlp for direct transcription.
                </p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-semibold text-white mb-3">
                  What features do I get?
                </h3>
                <p className="text-gray-300">
                  Audio/video transcription, AI-generated notes and summaries, PRD generation, 
                  export to multiple formats (text, markdown, Notion), and download capabilities.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
