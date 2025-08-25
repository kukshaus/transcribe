import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { Transcription } from '@/lib/models/Transcription'
import { ObjectId } from 'mongodb'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import fs from 'fs'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { searchParams } = new URL(request.url)
    const includeAudioData = searchParams.get('includeAudioData') === 'true'
    const isPublicAccess = searchParams.get('public') === 'true'

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid transcription ID' }, { status: 400 })
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

    let transcription: Transcription | null = null

    if (isPublicAccess) {
      // Public access - check if transcription is shared publicly
      transcription = await transcriptionsCollection.findOne(
        { 
          _id: new ObjectId(id),
          isPublic: true
        },
        { projection }
      )
    } else {
      // Private access - require authentication and ownership
      const session = await getServerSession(authOptions)
      
      if (!session || !session.user?.id) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      }

      transcription = await transcriptionsCollection.findOne(
        { 
          _id: new ObjectId(id),
          userId: session.user.id
        },
        { projection }
      )
    }

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { id } = params

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid transcription ID' }, { status: 400 })
    }

    const db = await getDatabase()
    const transcriptionsCollection = db.collection<Transcription>('transcriptions')

    // First, get the transcription to check if it exists and belongs to the user
    const transcription = await transcriptionsCollection.findOne({ 
      _id: new ObjectId(id),
      userId: session.user.id
    })

    if (!transcription) {
      return NextResponse.json({ error: 'Transcription not found' }, { status: 404 })
    }

    // Clean up any temporary audio files associated with this transcription
    try {
      const tempDir = path.join(process.cwd(), 'temp')
      if (fs.existsSync(tempDir)) {
        const files = fs.readdirSync(tempDir)
        const transcriptionFiles = files.filter(file => file.includes(id))
        
        transcriptionFiles.forEach(file => {
          const filePath = path.join(tempDir, file)
          try {
            fs.unlinkSync(filePath)
            console.log(`Cleaned up temp file: ${file}`)
          } catch (err) {
            console.warn(`Could not delete temp file ${file}:`, err)
          }
        })
      }
    } catch (cleanupError) {
      console.warn('Error during file cleanup:', cleanupError)
      // Continue with deletion even if file cleanup fails
    }

    // Delete the transcription from database (only if it belongs to the user)
    const result = await transcriptionsCollection.deleteOne({ 
      _id: new ObjectId(id),
      userId: session.user.id
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Failed to delete transcription' }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Transcription deleted successfully',
      deletedId: id 
    })
  } catch (error) {
    console.error('Error deleting transcription:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
