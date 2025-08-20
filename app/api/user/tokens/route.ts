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

export async function GET(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7)
  
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
      return NextResponse.json({ 
        error: 'Authentication required',
        timestamp: new Date().toISOString(),
        requestId
      }, { 
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': requestId
        }
      })
    }

    // Validate that userId is a valid ObjectId format
    const userId = session.user.id
    if (!userId || typeof userId !== 'string' || userId.length !== 24) {
      debugLog(`Request ${requestId} - Invalid user ID format:`, userId)
      return NextResponse.json({ 
        error: 'Invalid user session',
        timestamp: new Date().toISOString(),
        requestId,
        ...(DEBUG_MODE && { debug: { userId, userIdType: typeof userId, userIdLength: userId?.length } })
      }, { 
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': requestId
        }
      })
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

    return NextResponse.json(response, {
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId
      }
    })
  } catch (error) {
    debugLog(`Request ${requestId} - Error occurred:`, {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error
    })
    
    console.error(`[TOKENS_API_ERROR] Request ${requestId}:`, error)
    
    return NextResponse.json({ 
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
      requestId,
      ...(DEBUG_MODE && { 
        debug: {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        }
      })
    }, { 
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId
      }
    })
  }
}
