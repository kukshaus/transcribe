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
        
        // For protected pages, check if we have a valid user ID in the token
        // This is more robust than just checking if token exists
        const hasValidAuth = !!(token && token.uid)
        
        // Protect transcription detail pages - require authentication
        if (req.nextUrl.pathname.startsWith('/transcriptions/')) {
          console.log('Checking transcription auth:', { hasValidAuth, uid: token?.uid })
          return hasValidAuth
        }
        
        // Protect payment pages
        if (req.nextUrl.pathname.startsWith('/payment/')) {
          console.log('Checking payment auth:', { hasValidAuth, uid: token?.uid })
          return hasValidAuth
        }
        
        // Protect profile pages
        if (req.nextUrl.pathname.startsWith('/profile')) {
          console.log('Checking profile auth:', { hasValidAuth, uid: token?.uid })
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
