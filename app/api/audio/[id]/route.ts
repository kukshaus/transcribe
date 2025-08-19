import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { Transcription } from '@/lib/models/Transcription'
import { ObjectId } from 'mongodb'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { generateUserFingerprint } from '@/lib/fingerprint'

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
    if (transcription.audioFile.storageType === 'gridfs') {
      // Retrieve from GridFS
      const { GridFSBucket } = await import('mongodb')
      const bucket = new GridFSBucket(db, { bucketName: 'audioFiles' })
      
      try {
        const downloadStream = bucket.openDownloadStream(new ObjectId(transcription.audioFile.gridfsId!))
        
        // Convert stream to buffer
        const chunks: Buffer[] = []
        for await (const chunk of downloadStream) {
          chunks.push(chunk)
        }
        const audioBuffer = Buffer.concat(chunks)
        
        const response = new NextResponse(audioBuffer)
        response.headers.set('Content-Type', transcription.audioFile.mimeType)
        response.headers.set('Content-Length', transcription.audioFile.size.toString())
        // Safely encode audio filename and set both formats for maximum compatibility
        const safeAudioFilename = transcription.audioFile.filename
          .replace(/[^\x00-\x7F]/g, '') // Remove non-ASCII characters
          .replace(/[<>:"/\\|?*]/g, '') // Remove invalid filename characters
        const encodedAudioFilename = encodeURIComponent(safeAudioFilename)
        response.headers.set('Content-Disposition', `attachment; filename="${transcription.audioFile.filename}"; filename*=UTF-8''${encodedAudioFilename}`)
        response.headers.set('Cache-Control', 'public, max-age=3600') // Cache for 1 hour
        
        console.log(`Served audio file from GridFS: ${transcription.audioFile.filename} (${Math.round(transcription.audioFile.size / (1024 * 1024))} MB)`)
        
        return response
      } catch (gridfsError) {
        console.error('Error retrieving file from GridFS:', gridfsError)
        return NextResponse.json({ error: 'Error retrieving audio file' }, { status: 500 })
      }
    } else {
      // Retrieve from document storage
      if (!transcription.audioFile.data) {
        return NextResponse.json({ error: 'Audio file data not available' }, { status: 404 })
      }
      
      const response = new NextResponse(new Uint8Array(transcription.audioFile.data))
      response.headers.set('Content-Type', transcription.audioFile.mimeType)
      response.headers.set('Content-Length', transcription.audioFile.size.toString())
      // Safely encode audio filename and set both formats for maximum compatibility
      const safeAudioFilename = transcription.audioFile.filename
        .replace(/[^\x00-\x7F]/g, '') // Remove non-ASCII characters
        .replace(/[<>:"/\\|?*]/g, '') // Remove invalid filename characters
      const encodedAudioFilename = encodeURIComponent(safeAudioFilename)
      response.headers.set('Content-Disposition', `attachment; filename="${transcription.audioFile.filename}"; filename*=UTF-8''${encodedAudioFilename}`)
      response.headers.set('Cache-Control', 'public, max-age=3600') // Cache for 1 hour
      
      console.log(`Served audio file from document: ${transcription.audioFile.filename} (${Math.round(transcription.audioFile.size / 1024)} KB)`)
      
      return response
    }

  } catch (error) {
    console.error('Error serving audio file:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
