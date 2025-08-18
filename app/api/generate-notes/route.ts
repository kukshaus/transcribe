import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { getDatabase } from '@/lib/mongodb'
import { Transcription } from '@/lib/models/Transcription'
import { ObjectId } from 'mongodb'
import { consumeUserTokenWithHistory, checkUserTokens } from '@/lib/usage'
import { generateNotes } from '@/lib/transcription'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { transcriptionId } = await request.json()

    if (!transcriptionId) {
      return NextResponse.json({ 
        error: 'Transcription ID is required' 
      }, { status: 400 })
    }

    if (!ObjectId.isValid(transcriptionId)) {
      return NextResponse.json({ 
        error: 'Invalid transcription ID' 
      }, { status: 400 })
    }

    // Get transcription from database first
    const db = await getDatabase()
    const transcriptionsCollection = db.collection<Transcription>('transcriptions')

    const transcription = await transcriptionsCollection.findOne({ 
      _id: new ObjectId(transcriptionId),
      userId: session.user.id
    })

    if (!transcription) {
      return NextResponse.json({ 
        error: 'Transcription not found' 
      }, { status: 404 })
    }

    if (transcription.status !== 'completed') {
      return NextResponse.json({ 
        error: 'Transcription not completed yet' 
      }, { status: 400 })
    }

    if (!transcription.content) {
      return NextResponse.json({ 
        error: 'No transcription content available' 
      }, { status: 404 })
    }

    // Check if user has tokens (but don't consume yet)
    const { tokenCount } = await checkUserTokens(session.user.id)
    if (tokenCount < 1) {
      return NextResponse.json({ 
        error: 'Insufficient tokens. Please purchase more tokens to continue.',
        code: 'INSUFFICIENT_TOKENS'
      }, { status: 402 })
    }

    // Generate notes first
    const notes = await generateNotes(transcription.content)

    // Only consume tokens AFTER successful generation
    const { success, remainingTokens } = await consumeUserTokenWithHistory(
      session.user.id,
      'notes_generation',
      transcriptionId,
      transcription.title
    )
    
    if (!success) {
      return NextResponse.json({ 
        error: 'Failed to consume tokens. Please try again.',
        code: 'TOKEN_CONSUMPTION_FAILED'
      }, { status: 500 })
    }

    // Save notes to database
    await transcriptionsCollection.updateOne(
      { _id: new ObjectId(transcriptionId) },
      { 
        $set: { 
          notes,
          updatedAt: new Date()
        }
      }
    )

    return NextResponse.json({ 
      success: true, 
      notes,
      remainingTokens
    })

  } catch (error: any) {
    console.error('Error generating notes:', error)
    
    if (error.message?.includes('OPENAI_API_KEY')) {
      return NextResponse.json({ 
        error: 'OpenAI API key not configured. Please contact support.' 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      error: 'Failed to generate notes. Please try again.' 
    }, { status: 500 })
  }
}
