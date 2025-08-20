import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { checkUserTokens } from '@/lib/usage'

// Enable debug mode via environment variable
const DEBUG_MODE = process.env.DEBUG_TOKENS === 'true' || process.env.NODE_ENV === 'development'

function debugLog(...args: any[]) {
  if (DEBUG_MODE) {
    console.log('[TOKENS_API_DEBUG]', new Date().toISOString(), ...args)
  }
}

// Wrap the entire handler in a try-catch to prevent ANY HTML error pages
export async function GET(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7)
  
  try {
    // Global error boundary - ensure we ALWAYS return JSON
    const safeJsonResponse = (data: any, status: number = 200) => {
      return NextResponse.json(data, {
        status,
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': requestId,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
    }
    
    return await handleTokensRequest(request, requestId, safeJsonResponse)
  } catch (globalError) {
    console.error(`[TOKENS_API_GLOBAL_ERROR] Request ${requestId}:`, globalError)
    
    // Last resort error handler - ensure we NEVER return HTML
    return NextResponse.json({ 
      error: 'Critical server error',
      timestamp: new Date().toISOString(),
      requestId,
      message: 'An unexpected error occurred'
    }, { 
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId
      }
    })
  }
}

async function handleTokensRequest(request: NextRequest, requestId: string, safeJsonResponse: Function) {
  try {
    debugLog(`Request ${requestId} - Starting token fetch`)
    debugLog(`Request ${requestId} - Request URL:`, request.url)
    debugLog(`Request ${requestId} - Request headers:`, Object.fromEntries(request.headers.entries()))
    
    const session = await getServerSession(authOptions)
    
    debugLog(`Request ${requestId} - Session data:`, {
      hasSession: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      userName: session?.user?.name,
      sessionExpires: session?.expires
    })
    
    if (!session?.user?.id) {
      debugLog(`Request ${requestId} - No authentication, returning 401`)
      return safeJsonResponse({ 
        error: 'Authentication required',
        timestamp: new Date().toISOString(),
        requestId
      }, 401)
    }

    // Validate that userId is a valid ObjectId format
    const userId = session.user.id
    if (!userId || typeof userId !== 'string' || userId.length !== 24) {
      debugLog(`Request ${requestId} - Invalid user ID format:`, userId)
      return safeJsonResponse({ 
        error: 'Invalid user session',
        timestamp: new Date().toISOString(),
        requestId,
        ...(DEBUG_MODE && { debug: { userId, userIdType: typeof userId, userIdLength: userId?.length } })
      }, 400)
    }

    debugLog(`Request ${requestId} - Checking tokens for user:`, userId)
    
    const tokenResult = await checkUserTokens(userId)
    
    debugLog(`Request ${requestId} - Token check result:`, tokenResult)
    
    const response = {
      tokens: tokenResult.tokenCount,
      hasTokens: tokenResult.hasTokens,
      timestamp: new Date().toISOString(),
      requestId
    }
    
    debugLog(`Request ${requestId} - Returning success response:`, response)

    return safeJsonResponse(response)
  } catch (error) {
    debugLog(`Request ${requestId} - Error occurred:`, {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error
    })
    
    console.error(`[TOKENS_API_ERROR] Request ${requestId}:`, error)
    
    return safeJsonResponse({ 
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
      requestId,
      ...(DEBUG_MODE && { 
        debug: {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        }
      })
    }, 500)
  }
}
