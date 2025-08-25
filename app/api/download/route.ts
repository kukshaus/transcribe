import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { Transcription } from '@/lib/models/Transcription'
import { ObjectId } from 'mongodb'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { generateUserFingerprint } from '@/lib/fingerprint'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')
    const type = searchParams.get('type') as 'transcription' | 'notes' | 'notion' | 'prd' | 'audio'
    const publicId = searchParams.get('publicId') // For public access

    if (!id || !type) {
      return NextResponse.json({ error: 'ID and type are required' }, { status: 400 })
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid transcription ID' }, { status: 400 })
    }

    if (!['transcription', 'notes', 'notion', 'prd', 'audio'].includes(type)) {
      return NextResponse.json({ error: 'Type must be transcription, notes, notion, prd, or audio' }, { status: 400 })
    }

    const db = await getDatabase()
    const transcriptionsCollection = db.collection<Transcription>('transcriptions')

    let transcription: Transcription | null = null

    if (publicId) {
      // Public access - find by public ID and ensure it's shared
      transcription = await transcriptionsCollection.findOne({ 
        publicId,
        isPublic: true
      })
      
      if (!transcription) {
        return NextResponse.json({ error: 'Shared transcription not found' }, { status: 404 })
      }
      
      // Check if downloads are allowed for this shared transcription
      if (transcription.shareSettings?.allowDownload === false) {
        return NextResponse.json({ error: 'Downloads are disabled for this shared transcription' }, { status: 403 })
      }
    } else if (session?.user?.id) {
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

    if (transcription.status !== 'completed') {
      return NextResponse.json({ error: 'Transcription not completed yet' }, { status: 400 })
    }

    let content: string = ''
    let fileExtension = 'txt'
    
    if (type === 'transcription') {
      content = transcription.content || ''
    } else if (type === 'notes') {
      content = transcription.notes || ''
    } else if (type === 'notion') {
      // Format notes for Notion import
      if (!transcription.notes) {
        return NextResponse.json({ error: 'Notes not available' }, { status: 404 })
      }
      
      // Create Notion-optimized markdown
      const title = transcription.title || 'Transcription Notes'
      const sourceUrl = transcription.url
      const createdDate = new Date(transcription.createdAt).toLocaleDateString()
      
      content = `# ${title}

**Source:** [${sourceUrl}](${sourceUrl})
**Created:** ${createdDate}

---

${transcription.notes}

---

*Exported from Audio Transcriber on ${new Date().toLocaleDateString()}*`
      
      fileExtension = 'md'
    } else if (type === 'prd') {
      // Download PRD if it exists
      if (!transcription.prd) {
        return NextResponse.json({ error: 'PRD not available. Please generate a PRD first.' }, { status: 404 })
      }
      
      content = transcription.prd
      fileExtension = 'md'
    } else if (type === 'audio') {
      // Download original audio file
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
          
          // Safely encode audio filename
          const safeAudioFilename = transcription.audioFile.filename
            .replace(/[^\x00-\x7F]/g, '') // Remove non-ASCII characters
            .replace(/[<>:"/\\|?*]/g, '') // Remove invalid filename characters
          const encodedAudioFilename = encodeURIComponent(safeAudioFilename)
          response.headers.set('Content-Disposition', `attachment; filename="${transcription.audioFile.filename}"; filename*=UTF-8''${encodedAudioFilename}`)
          
          console.log(`Downloaded audio file from GridFS: ${transcription.audioFile.filename} (${Math.round(transcription.audioFile.size / (1024 * 1024))} MB)`)
          
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
        
        // Safely encode audio filename
        const safeAudioFilename = transcription.audioFile.filename
          .replace(/[^\x00-\x7F]/g, '') // Remove non-ASCII characters
          .replace(/[<>:"/\\|?*]/g, '') // Remove invalid filename characters
        const encodedAudioFilename = encodeURIComponent(safeAudioFilename)
        response.headers.set('Content-Disposition', `attachment; filename="${transcription.audioFile.filename}"; filename*=UTF-8''${encodedAudioFilename}`)
        
        console.log(`Downloaded audio file from document: ${transcription.audioFile.filename} (${Math.round(transcription.audioFile.size / 1024)} KB)`)
        
        return response
      }
    }

    if (!content) {
      return NextResponse.json({ error: `${type} not available` }, { status: 404 })
    }

    // Create filename based on title or URL and type
    let baseFilename = 'transcription'
    
    if (transcription.title) {
      // Clean title for filename (remove invalid characters and Unicode)
      let cleanedTitle = transcription.title
        .replace(/[\uD83C-\uDBFF\uDC00-\uDFFF]+/g, '') // Remove emojis using surrogate pairs
        .replace(/[<>:"/\\|?*]/g, '') // Remove invalid filename characters  
        .replace(/[^\x00-\x7F]/g, '') // Remove remaining non-ASCII characters
        .replace(/[\s\-()[\]{}]+/g, '_') // Replace spaces, hyphens, and brackets with underscores
        .replace(/_+/g, '_') // Replace multiple underscores with single underscore
        .replace(/^_|_$/g, '') // Remove leading/trailing underscores
        .trim() // Remove leading/trailing whitespace
      
      // If the cleaned title is not empty, use it
      if (cleanedTitle && cleanedTitle.length > 0) {
        baseFilename = cleanedTitle.substring(0, 50) // Limit length
      } else {
        // If title becomes empty after cleaning, create a meaningful fallback
        baseFilename = `transcription_${transcription._id?.toString().slice(-8) || 'unknown'}`
      }
    } else {
      // Fallback to hostname
      try {
        const urlObj = new URL(transcription.url)
        baseFilename = urlObj.hostname.replace('www.', '').replace('.com', '')
      } catch {
        baseFilename = `transcription_${transcription._id?.toString().slice(-8) || 'unknown'}`
      }
    }
    
    // Ensure baseFilename is never empty or undefined
    if (!baseFilename || baseFilename.trim().length === 0) {
      // Use a more descriptive fallback based on type
      const typeNames: Record<string, string> = {
        'transcription': 'transcript',
        'notes': 'notes',
        'notion': 'notion_export',
        'prd': 'product_requirements_doc',
        'audio': 'audio_file'
      }
      baseFilename = `${typeNames[type] || 'document'}_${transcription._id?.toString().slice(-8) || 'unknown'}`
    }
    
    const timestamp = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
    const filename = `${baseFilename}_${type}_${timestamp}.${fileExtension}`
    
    console.log(`Download filename debug for transcription ${id}:`)
    console.log(`  Raw transcription object:`, JSON.stringify({
      _id: transcription._id,
      title: transcription.title,
      url: transcription.url,
      status: transcription.status
    }, null, 2))
    console.log(`  Original title: "${transcription.title}" (type: ${typeof transcription.title})`)
    console.log(`  Title is undefined: ${transcription.title === undefined}`)
    console.log(`  Title is null: ${transcription.title === null}`)
    console.log(`  Title is empty string: ${transcription.title === ''}`)
    console.log(`  Cleaned baseFilename: "${baseFilename}"`)
    console.log(`  Final filename: "${filename}"`)

    // Create response with file download
    const response = new NextResponse(content)
    response.headers.set('Content-Type', fileExtension === 'md' ? 'text/markdown; charset=utf-8' : 'text/plain; charset=utf-8')
    
    // Set both formats for maximum compatibility
    const encodedFilename = encodeURIComponent(filename)
    response.headers.set('Content-Disposition', `attachment; filename="${filename}"; filename*=UTF-8''${encodedFilename}`)
    
    return response

  } catch (error) {
    console.error('Error downloading file:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
