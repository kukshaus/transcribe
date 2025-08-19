import { NextRequest, NextResponse } from 'next/server'
import { generateUserFingerprint } from '@/lib/fingerprint'

export async function GET(request: NextRequest) {
  try {
    const fingerprint = generateUserFingerprint(request)
    
    const headers = {
      'user-agent': request.headers.get('user-agent') || 'unknown',
      'accept-language': request.headers.get('accept-language') || 'unknown',
      'accept-encoding': request.headers.get('accept-encoding') || 'unknown',
      'x-forwarded-for': request.headers.get('x-forwarded-for') || 'unknown',
      'x-real-ip': request.headers.get('x-real-ip') || 'unknown',
      'ip': request.ip || 'unknown'
    }
    
    return NextResponse.json({
      fingerprint,
      headers,
      message: 'Use this fingerprint to create test transcriptions'
    })
  } catch (error) {
    console.error('Error generating fingerprint:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
