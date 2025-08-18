'use client'

import { XCircle, ArrowLeft, CreditCard } from 'lucide-react'
import Link from 'next/link'

export default function PaymentCancel() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20 text-center">
        <XCircle className="h-16 w-16 text-red-400 mx-auto mb-6" />
        
        <h1 className="text-2xl font-bold text-white mb-4">Payment Cancelled</h1>
        
        <p className="text-gray-300 mb-8">
          Your payment was cancelled. No charges were made to your account.
        </p>

        <div className="space-y-3">
          <Link 
            href="/payment/buy-tokens"
            className="flex items-center justify-center w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Try Again
          </Link>
          
          <Link 
            href="/"
            className="flex items-center justify-center w-full bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-6 rounded-lg transition-colors border border-white/20"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back Home
          </Link>
        </div>

        <p className="text-sm text-gray-400 mt-6">
          Need help? Contact our support team for assistance.
        </p>
      </div>
    </div>
  )
}
