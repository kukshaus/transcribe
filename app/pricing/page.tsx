'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { TOKEN_PACKAGES } from '@/lib/stripe'
import { CheckCircle, Star, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import Header from '@/components/Header'

export default function PricingPage() {
  const { data: session } = useSession()
  const router = useRouter()

  const handleGetStarted = (packageId: string) => {
    if (!session) {
      // Redirect to sign in with a callback to the purchase page
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent('/payment/buy-tokens')}`)
      return
    }
    
    // If already signed in, go directly to purchase page
    router.push('/payment/buy-tokens')
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
              Choose the token package that fits your transcription needs. 
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
                  <div className="text-4xl font-bold text-white mb-1">
                    ${(pkg.price / 100).toFixed(0)}
                  </div>
                  <p className="text-gray-300 mb-6">{pkg.tokens.toLocaleString()} tokens</p>
                  
                  <div className="text-sm text-gray-400 mb-6">
                    <div>${(pkg.price / 100 / pkg.tokens * 1000).toFixed(2)} per 1,000 tokens</div>
                    {pkg.tokens >= 10000 && (
                      <div className="text-green-400 font-medium mt-1">
                        Save {Math.round((1 - (pkg.price / 100 / pkg.tokens) / (TOKEN_PACKAGES[0].price / 100 / TOKEN_PACKAGES[0].tokens)) * 100)}%
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
                </div>

                <button
                  onClick={() => handleGetStarted(pkg.id)}
                  className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                    pkg.popular
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:from-yellow-500 hover:to-orange-600'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  {session ? 'Purchase Now' : 'Get Started'}
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
                  How does token usage work?
                </h3>
                <p className="text-gray-300">
                  Each minute of audio/video content typically uses 100-150 tokens for transcription. 
                  Additional features like AI notes generation use extra tokens based on content length.
                </p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-semibold text-white mb-3">
                  Do tokens expire?
                </h3>
                <p className="text-gray-300">
                  No! Your tokens never expire. Purchase once and use them whenever you need transcription services.
                </p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-semibold text-white mb-3">
                  What file formats are supported?
                </h3>
                <p className="text-gray-300">
                  We support most audio and video formats including MP3, WAV, MP4, MOV, and many others. 
                  You can also provide YouTube URLs for direct transcription.
                </p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-semibold text-white mb-3">
                  Can I get a refund?
                </h3>
                <p className="text-gray-300">
                  We offer refunds within 30 days of purchase if you haven't used any tokens. 
                  Contact support for assistance with your refund request.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
