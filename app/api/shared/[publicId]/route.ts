import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { Transcription } from '@/lib/models/Transcription'

export async function GET(
  request: NextRequest,
  { params }: { params: { publicId: string } }
) {
  try {
    const { publicId } = params
    const { searchParams } = new URL(request.url)
    const includeAudioData = searchParams.get('includeAudioData') === 'true'

    if (!publicId || publicId.length !== 32) {
      return NextResponse.json({ error: 'Invalid public ID' }, { status: 400 })
    }

    const db = await getDatabase()
    const transcriptionsCollection = db.collection<Transcription>('transcriptions')

    // Build projection to exclude audio data by default
    const projection: any = {
      audioFile: {
        data: 0 // Exclude large audio data by default
      }
    }

    // Only include audio data if explicitly requested
    if (includeAudioData) {
      delete projection.audioFile
    }

    // Find transcription by public ID and ensure it's public
    const transcription = await transcriptionsCollection.findOne(
      { 
        publicId,
        isPublic: true
      },
      { projection }
    )

    if (!transcription) {
      return NextResponse.json({ error: 'Shared transcription not found' }, { status: 404 })
    }

    // Convert ObjectId to string
    const serializedTranscription = {
      ...transcription,
      _id: transcription._id?.toString(),
    }

    return NextResponse.json(serializedTranscription)
  } catch (error) {
    console.error('Error fetching shared transcription:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
