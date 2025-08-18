import { NextRequest, NextResponse } from 'next/server'
import { getVideoMetadata } from '@/lib/transcription'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    // Get video metadata quickly
    const metadata = await getVideoMetadata(url)
    
    return NextResponse.json({
      success: true,
      metadata: {
        title: metadata.title || 'Unknown Title',
        duration: metadata.duration || null,
        thumbnail: metadata.thumbnail || null,
        url: url
      }
    })

  } catch (error: any) {
    console.error('Metadata fetch error:', error)
    
    // Return error but don't block the process
    return NextResponse.json(
      { 
        error: 'Failed to fetch metadata', 
        details: error.message,
        url: request.url
      },
      { status: 500 }
    )
  }
}
