import { NextResponse } from 'next/server'
import { getVersionInfo } from '@/lib/version'

export async function GET() {
  try {
    const versionInfo = getVersionInfo()
    
    return NextResponse.json({
      ...versionInfo,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    })
  } catch (error) {
    console.error('Error getting version info:', error)
    return NextResponse.json(
      { error: 'Failed to get version information' },
      { status: 500 }
    )
  }
}
