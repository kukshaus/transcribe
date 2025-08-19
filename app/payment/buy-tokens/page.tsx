'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function BuyTokensRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the unified pricing page
    router.replace('/pricing')
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-white mx-auto mb-4" />
        <p className="text-white">Redirecting to pricing...</p>
      </div>
    </div>
  )
}