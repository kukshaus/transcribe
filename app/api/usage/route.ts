import { NextRequest, NextResponse } from 'next/server'
import { generateUserFingerprint, getClientIP } from '@/lib/fingerprint'
import { checkAnonymousUserLimit } from '@/lib/usage'

export async function GET(request: NextRequest) {
  try {
    const fingerprint = generateUserFingerprint(request)
    const ip = getClientIP(request)
    const userAgent = request.headers.get('user-agent') || 'unknown'
    
    const { canUse, remainingUses } = await checkAnonymousUserLimit(fingerprint, ip, userAgent)

    return NextResponse.json({
      canUse,
      remainingUses,
      limit: 3
    })
  } catch (error) {
    console.error('Error fetching usage info:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
