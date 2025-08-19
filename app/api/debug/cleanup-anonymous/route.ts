import { NextRequest, NextResponse } from 'next/server'
import { cleanupTransferredAnonymousUsage } from '@/lib/usage'

export async function POST(request: NextRequest) {
  try {
    // Optional: Add authentication check here for security
    // For now, this is a debug endpoint
    
    console.log('Running cleanup of transferred anonymous usage...')
    
    const result = await cleanupTransferredAnonymousUsage()
    
    return NextResponse.json({
      success: result.success,
      cleaned: result.cleaned,
      message: `Cleaned up ${result.cleaned} transferred anonymous users`
    })
    
  } catch (error) {
    console.error('Error in cleanup endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
