import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { Transcription } from '@/lib/models/Transcription'
import { ObjectId } from 'mongodb'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/route'
import { generateUserFingerprint } from '@/lib/fingerprint'
import { GridFSBucket } from 'mongodb'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = params

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid transcription ID' }, { status: 400 })
    }

    const db = await getDatabase()
    const transcriptionsCollection = db.collection<Transcription>('transcriptions')

    let transcription: Transcription | null = null

    if (session?.user?.id) {
      // For authenticated users, find by userId
      transcription = await transcriptionsCollection.findOne({ 
        _id: new ObjectId(id),
        userId: session.user.id
      })
    } else {
      // For anonymous users, find by fingerprint
      const userFingerprint = generateUserFingerprint(request)
      transcription = await transcriptionsCollection.findOne({ 
        _id: new ObjectId(id),
        userFingerprint: userFingerprint
      })
    }

    if (!transcription) {
      return NextResponse.json({ error: 'Transcription not found or access denied' }, { status: 404 })
    }

    if (!transcription.audioFile) {
      return NextResponse.json({ error: 'Audio file not available for this transcription' }, { status: 404 })
    }

    // Handle different storage types
    if (transcription.audioFile.storageType === 'gridfs' && transcription.audioFile.gridfsId) {
      // GridFS storage - stream the file
      try {
        const bucket = new GridFSBucket(db, { bucketName: 'audioFiles' })
        const downloadStream = bucket.openDownloadStream(new ObjectId(transcription.audioFile.gridfsId))
        
        // Get file metadata
        const filesCollection = db.collection('audioFiles.files')
        const fileDoc = await filesCollection.findOne({ _id: new ObjectId(transcription.audioFile.gridfsId) })
        
        if (!fileDoc) {
          return NextResponse.json({ error: 'Audio file not found in GridFS' }, { status: 404 })
        }

        // Return file metadata and GridFS ID for streaming
        return NextResponse.json({
          audioFile: {
            filename: transcription.audioFile.filename,
            mimeType: transcription.audioFile.mimeType,
            size: transcription.audioFile.size || fileDoc.length,
            storageType: 'gridfs',
            gridfsId: transcription.audioFile.gridfsId,
            // Note: For GridFS, the actual audio data should be streamed via a separate endpoint
            // This endpoint returns metadata for client-side streaming
          }
        })
      } catch (error) {
        console.error('Error accessing GridFS file:', error)
        return NextResponse.json({ error: 'Error accessing audio file' }, { status: 500 })
      }
    } else if (transcription.audioFile.storageType === 'document' && transcription.audioFile.data) {
      // Document storage - return embedded data (legacy support)
      return NextResponse.json({
        audioFile: {
          filename: transcription.audioFile.filename,
          mimeType: transcription.audioFile.mimeType,
          size: transcription.audioFile.size,
          storageType: 'document',
          data: transcription.audioFile.data ? transcription.audioFile.data.toString('base64') : null
        }
      })
    } else {
      return NextResponse.json({ error: 'Audio file not available or corrupted' }, { status: 404 })
    }
  } catch (error) {
    console.error('Error fetching audio data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
