import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to auth pages without token
        if (req.nextUrl.pathname.startsWith('/auth/')) {
          return true
        }
        
        // Allow access to public pages without token
        if (req.nextUrl.pathname === '/') {
          return true
        }
        
        // Protect API routes that need authentication
        if (req.nextUrl.pathname.startsWith('/api/download') ||
            req.nextUrl.pathname.startsWith('/api/generate-prd') ||
            req.nextUrl.pathname.startsWith('/api/generate-notes') ||
            req.nextUrl.pathname.startsWith('/api/user/')) {
          return !!token
        }
        
        // Allow anonymous POST to transcriptions (with rate limiting in the handler)
        // Allow anonymous GET to transcriptions (filtered by fingerprint)
        
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    '/api/download/:path*', 
    '/api/generate-prd/:path*',
    '/api/generate-notes/:path*',
    '/api/user/:path*',
    '/transcriptions/:path*',
    '/api/stripe/checkout/:path*',
    '/payment/buy-tokens/:path*',
    '/payment/success/:path*'
  ]
}
