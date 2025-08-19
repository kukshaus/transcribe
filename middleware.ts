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
        if (req.nextUrl.pathname === '/' || req.nextUrl.pathname === '/pricing') {
          return true
        }
        
        // Protect transcription detail pages - require authentication
        if (req.nextUrl.pathname.startsWith('/transcriptions/')) {
          return !!token
        }
        
        // Protect API routes that need authentication
        if (req.nextUrl.pathname.startsWith('/api/generate-prd') ||
            req.nextUrl.pathname.startsWith('/api/generate-notes') ||
            req.nextUrl.pathname.startsWith('/api/user/') ||
            req.nextUrl.pathname.startsWith('/api/transcriptions/')) {
          return !!token
        }
        
        // Allow anonymous access to download API (it handles auth internally)
        if (req.nextUrl.pathname.startsWith('/api/download')) {
          return true
        }
        
        // Protect payment pages
        if (req.nextUrl.pathname.startsWith('/payment/')) {
          return !!token
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
