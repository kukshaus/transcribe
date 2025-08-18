import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { Transcription } from '@/lib/models/Transcription'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')
    const type = searchParams.get('type') as 'transcription' | 'notes'

    if (!id || !type) {
      return NextResponse.json({ error: 'ID and type are required' }, { status: 400 })
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid transcription ID' }, { status: 400 })
    }

    if (!['transcription', 'notes'].includes(type)) {
      return NextResponse.json({ error: 'Type must be transcription or notes' }, { status: 400 })
    }

    const db = await getDatabase()
    const transcriptionsCollection = db.collection<Transcription>('transcriptions')

    const transcription = await transcriptionsCollection.findOne({ 
      _id: new ObjectId(id) 
    })

    if (!transcription) {
      return NextResponse.json({ error: 'Transcription not found' }, { status: 404 })
    }

    if (transcription.status !== 'completed') {
      return NextResponse.json({ error: 'Transcription not completed yet' }, { status: 400 })
    }

    const content = type === 'transcription' ? transcription.content : transcription.notes

    if (!content) {
      return NextResponse.json({ error: `${type} not available` }, { status: 404 })
    }

    // Create filename based on title or URL and type
    let baseFilename = 'transcription'
    
    if (transcription.title) {
      // Clean title for filename (remove invalid characters)
      baseFilename = transcription.title
        .replace(/[<>:"/\\|?*]/g, '') // Remove invalid filename characters
        .replace(/\s+/g, '_') // Replace spaces with underscores
        .substring(0, 50) // Limit length
    } else {
      // Fallback to hostname
      const urlObj = new URL(transcription.url)
      baseFilename = urlObj.hostname.replace('www.', '').replace('.com', '')
    }
    
    const timestamp = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
    const filename = `${baseFilename}_${type}_${timestamp}.txt`

    // Create response with file download
    const response = new NextResponse(content)
    response.headers.set('Content-Type', 'text/plain')
    response.headers.set('Content-Disposition', `attachment; filename="${filename}"`)
    
    return response

  } catch (error) {
    console.error('Error downloading file:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
