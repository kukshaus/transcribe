import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here
    console.log('Middleware processing:', req.nextUrl.pathname, 'Token exists:', !!req.nextauth.token)
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        console.log('Middleware authorized callback:', {
          path: req.nextUrl.pathname,
          hasToken: !!token,
          tokenUid: token?.uid,
          isApiRoute: req.nextUrl.pathname.startsWith('/api/')
        })
        
        // Allow access to auth pages without token
        if (req.nextUrl.pathname.startsWith('/auth/')) {
          return true
        }
        
        // Allow access to public pages without token
        if (req.nextUrl.pathname === '/' || req.nextUrl.pathname === '/pricing') {
          return true
        }
        
        // For API routes, ALWAYS allow access and let the API route handle authentication
        // This prevents the middleware from returning HTML error pages for API calls
        if (req.nextUrl.pathname.startsWith('/api/')) {
          console.log('Allowing API route to handle its own authentication:', req.nextUrl.pathname)
          return true
        }
        
        // For protected pages, check if we have ANY valid token
        // The JWT callback might not have run yet to set uid, so we check multiple conditions
        const hasValidAuth = !!(token && (token.uid || token.sub || token.email))
        
        // Protect transcription detail pages - require authentication
        if (req.nextUrl.pathname.startsWith('/transcriptions/')) {
          console.log('Checking transcription auth:', { hasValidAuth, uid: token?.uid, sub: token?.sub, email: token?.email })
          return hasValidAuth
        }
        
        // Protect payment pages
        if (req.nextUrl.pathname.startsWith('/payment/')) {
          console.log('Checking payment auth:', { hasValidAuth, uid: token?.uid, sub: token?.sub, email: token?.email })
          return hasValidAuth
        }
        
        // Protect profile pages
        if (req.nextUrl.pathname.startsWith('/profile')) {
          console.log('Checking profile auth:', { hasValidAuth, uid: token?.uid, sub: token?.sub, email: token?.email })
          return hasValidAuth
        }
        
        // Allow access to other pages
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    '/api/generate-prd/:path*',
    '/api/generate-notes/:path*',
    '/api/user/:path*',
    '/api/transcriptions/:path*',
    '/transcriptions/:path*',
    '/api/stripe/checkout/:path*',
    '/payment/:path*',
    '/profile/:path*'
  ]
}
