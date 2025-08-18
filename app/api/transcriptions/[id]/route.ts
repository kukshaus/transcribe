import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { Transcription } from '@/lib/models/Transcription'
import { ObjectId } from 'mongodb'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid transcription ID' }, { status: 400 })
    }

    const db = await getDatabase()
    const transcriptionsCollection = db.collection<Transcription>('transcriptions')

    const transcription = await transcriptionsCollection.findOne({ 
      _id: new ObjectId(id) 
    })

    if (!transcription) {
      return NextResponse.json({ error: 'Transcription not found' }, { status: 404 })
    }

    // Convert ObjectId to string
    const serializedTranscription = {
      ...transcription,
      _id: transcription._id?.toString(),
    }

    return NextResponse.json(serializedTranscription)
  } catch (error) {
    console.error('Error fetching transcription:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
