import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { Transcription } from '@/lib/models/Transcription'
import { ObjectId } from 'mongodb'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../auth/[...nextauth]/route'
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

    // Only allow streaming for GridFS files
    if (transcription.audioFile.storageType !== 'gridfs' || !transcription.audioFile.gridfsId) {
      return NextResponse.json({ error: 'Audio file is not available for streaming' }, { status: 400 })
    }

    try {
      const bucket = new GridFSBucket(db, { bucketName: 'audioFiles' })
      
      // Get file metadata first
      const filesCollection = db.collection('audioFiles.files')
      const fileDoc = await filesCollection.findOne({ _id: new ObjectId(transcription.audioFile.gridfsId) })
      
      if (!fileDoc) {
        return NextResponse.json({ error: 'Audio file not found in GridFS' }, { status: 404 })
      }

      // Check if range header is present for partial content support
      const range = request.headers.get('range')
      
      if (range) {
        // Handle range requests for audio streaming
        const parts = range.replace(/bytes=/, "").split("-")
        const start = parseInt(parts[0], 10)
        const end = parts[1] ? parseInt(parts[1], 10) : fileDoc.length - 1
        const chunksize = (end - start) + 1

        // Create download stream with range
        const downloadStream = bucket.openDownloadStream(new ObjectId(transcription.audioFile.gridfsId), {
          start,
          end
        })

        // Set headers for partial content
        const headers = {
          'Content-Range': `bytes ${start}-${end}/${fileDoc.length}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize.toString(),
          'Content-Type': transcription.audioFile.mimeType || 'audio/mpeg',
          'Content-Disposition': `inline; filename="${transcription.audioFile.filename}"`
        }

        // Return streaming response
        return new Response(downloadStream as any, {
          status: 206,
          headers
        })
      } else {
        // Full file download
        const downloadStream = bucket.openDownloadStream(new ObjectId(transcription.audioFile.gridfsId))
        
        const headers = {
          'Content-Type': transcription.audioFile.mimeType || 'audio/mpeg',
          'Content-Length': fileDoc.length.toString(),
          'Content-Disposition': `inline; filename="${transcription.audioFile.filename}"`,
          'Accept-Ranges': 'bytes'
        }

        return new Response(downloadStream as any, {
          status: 200,
          headers
        })
      }
    } catch (error) {
      console.error('Error streaming GridFS file:', error)
      return NextResponse.json({ error: 'Error streaming audio file' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error in audio stream endpoint:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
