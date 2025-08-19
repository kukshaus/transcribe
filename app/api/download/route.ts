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
    const type = searchParams.get('type') as 'transcription' | 'notes' | 'notion' | 'prd'

    if (!id || !type) {
      return NextResponse.json({ error: 'ID and type are required' }, { status: 400 })
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid transcription ID' }, { status: 400 })
    }

    if (!['transcription', 'notes', 'notion', 'prd'].includes(type)) {
      return NextResponse.json({ error: 'Type must be transcription, notes, notion, or prd' }, { status: 400 })
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
    }

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
    const filename = `${baseFilename}_${type}_${timestamp}.${fileExtension}`

    // Create response with file download
    const response = new NextResponse(content)
    response.headers.set('Content-Type', fileExtension === 'md' ? 'text/markdown' : 'text/plain')
    response.headers.set('Content-Disposition', `attachment; filename="${filename}"`)
    
    return response

  } catch (error) {
    console.error('Error downloading file:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
