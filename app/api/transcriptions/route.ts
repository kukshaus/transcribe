import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { Transcription, TranscriptionStatus } from '@/lib/models/Transcription'
import { downloadAudio, transcribeAudio, generateNotes, cleanupTempFile, getVideoMetadata } from '@/lib/transcription'
import { ObjectId } from 'mongodb'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { generateUserFingerprint, getClientIP } from '@/lib/fingerprint'
import { checkAnonymousUserLimit, incrementAnonymousUserUsage, initializeUserTokens, checkUserTokens, consumeUserTokenWithHistory, updateTranscriptionInSpendingHistory } from '@/lib/usage'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    const db = await getDatabase()
    const transcriptionsCollection = db.collection<Transcription>('transcriptions')

    let transcription: Omit<Transcription, '_id'>

    if (session?.user?.id) {
      // Authenticated user - initialize tokens if needed
      await initializeUserTokens(session.user.id)
      
      // Check if user has tokens (need 2 tokens: 1 for transcription + 1 for notes)
      const { hasTokens, tokenCount } = await checkUserTokens(session.user.id)
      
      if (tokenCount < 2) {
        return NextResponse.json({ 
          error: 'Insufficient tokens. You need 2 tokens (1 for transcription + 1 for notes). Please purchase more tokens to continue.',
          code: 'INSUFFICIENT_TOKENS',
          upgradeRequired: true
        }, { status: 402 })
      }
      
      // Consume 1 token for transcription creation
      const { success, remainingTokens } = await consumeUserTokenWithHistory(
        session.user.id,
        'transcription_creation',
        undefined, // We'll add the transcriptionId after creation
        undefined  // We'll add the title after getting metadata
      )
      
      if (!success) {
        return NextResponse.json({ 
          error: 'Failed to consume token. Please try again.',
          code: 'TOKEN_CONSUMPTION_FAILED'
        }, { status: 500 })
      }
      
      transcription = {
        url,
        userId: session.user.id,
        status: TranscriptionStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    } else {
      // Anonymous user - check limits
      const fingerprint = generateUserFingerprint(request)
      const ip = getClientIP(request)
      const userAgent = request.headers.get('user-agent') || 'unknown'
      
      const { canUse, remainingUses } = await checkAnonymousUserLimit(fingerprint, ip, userAgent)
      
      if (!canUse) {
        return NextResponse.json({ 
          error: 'Free usage limit reached. Please sign in to continue.',
          code: 'LIMIT_REACHED',
          upgradeRequired: true
        }, { status: 429 })
      }

      // Increment usage for anonymous user
      await incrementAnonymousUserUsage(fingerprint)
      
      transcription = {
        url,
        userFingerprint: fingerprint,
        status: TranscriptionStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    }

    const result = await transcriptionsCollection.insertOne(transcription)
    const transcriptionId = result.insertedId.toString()

    // Start background processing (notes generation only for authenticated users)
    processTranscription(transcriptionId, url, !!session?.user?.id, session?.user?.id).catch(console.error)

    return NextResponse.json({ 
      id: transcriptionId,
      message: 'Transcription started',
      isAuthenticated: !!session?.user?.id
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating transcription:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const db = await getDatabase()
    const transcriptionsCollection = db.collection<Transcription>('transcriptions')

    let transcriptions: Transcription[]

    if (session?.user?.id) {
      // Authenticated user - get their transcriptions
      transcriptions = await transcriptionsCollection
        .find({ userId: session.user.id })
        .sort({ createdAt: -1 })
        .limit(50)
        .toArray()
    } else {
      // Anonymous user - get their transcriptions by fingerprint
      const fingerprint = generateUserFingerprint(request)
      transcriptions = await transcriptionsCollection
        .find({ userFingerprint: fingerprint })
        .sort({ createdAt: -1 })
        .limit(10)
        .toArray()
    }

    // Convert ObjectId to string for each transcription
    const serializedTranscriptions = transcriptions.map(t => ({
      ...t,
      _id: t._id?.toString(),
    }))

    return NextResponse.json(serializedTranscriptions)
  } catch (error) {
    console.error('Error fetching transcriptions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function updateProgress(
  transcriptionsCollection: any,
  transcriptionId: string,
  stepNumber: number,
  currentStep: string,
  details?: string,
  totalSteps: number = 5
) {
  const percentage = Math.round((stepNumber / totalSteps) * 100)
  
  await transcriptionsCollection.updateOne(
    { _id: new ObjectId(transcriptionId) },
    {
      $set: {
        status: TranscriptionStatus.PROCESSING,
        progress: {
          currentStep,
          stepNumber,
          totalSteps,
          percentage,
          details
        },
        updatedAt: new Date()
      }
    }
  )
}

async function processTranscription(transcriptionId: string, url: string, generateNotes: boolean = true, userId?: string) {
  const db = await getDatabase()
  const transcriptionsCollection = db.collection<Transcription>('transcriptions')
  const totalSteps = generateNotes ? 5 : 4

  try {
    
    // Step 1: Initialize processing and get metadata
    console.log(`Starting transcription process for: ${transcriptionId}`)
    await updateProgress(transcriptionsCollection, transcriptionId, 1, 'Initializing', 'Getting video information...', totalSteps)
    
    // Get video metadata (title, duration)
    const metadata = await getVideoMetadata(url)
    console.log(`Video metadata:`, metadata)
    
    // Update with title, duration, and thumbnail if available
    if (metadata.title || metadata.duration || metadata.thumbnail) {
      await transcriptionsCollection.updateOne(
        { _id: new ObjectId(transcriptionId) },
        {
          $set: {
            title: metadata.title,
            duration: metadata.duration,
            thumbnail: metadata.thumbnail,
            updatedAt: new Date()
          }
        }
      )
      
      // Update spending history with transcription details for authenticated users
      if (userId && metadata.title) {
        await updateTranscriptionInSpendingHistory(userId, transcriptionId, metadata.title)
      }
    }

    // Step 2: Download audio
    await updateProgress(transcriptionsCollection, transcriptionId, 2, 'Downloading Audio', 'Extracting audio from URL...', totalSteps)
    console.log(`Downloading audio from: ${url}`)
    const audioPath = await downloadAudio(url)
    console.log(`Audio downloaded to: ${audioPath}`)

    // Step 3: Check and compress if needed
    await updateProgress(transcriptionsCollection, transcriptionId, 3, 'Processing Audio', 'Checking file size and optimizing for AI...', totalSteps)
    
    // Step 4: Transcribe audio
    await updateProgress(transcriptionsCollection, transcriptionId, 4, 'Transcribing Audio', 'Converting speech to text using AI...', totalSteps)
    console.log(`Transcribing audio: ${audioPath}`)
    
    // Progress callback for chunked transcription
    const progressCallback = async (current: number, total: number) => {
      const chunkProgress = Math.round((current / total) * 100)
      await updateProgress(
        transcriptionsCollection, 
        transcriptionId, 
        4, 
        'Transcribing Audio', 
        `Processing chunk ${current + 1} of ${total} (${chunkProgress}% of transcription)`,
        totalSteps
      )
    }
    
    const transcriptionText = await transcribeAudio(audioPath, progressCallback)

    let notes = undefined
    let stepNumber = 4

    if (generateNotes && userId) {
      // Step 5: Generate notes (only for authenticated users)
      stepNumber = 5
      await updateProgress(transcriptionsCollection, transcriptionId, 5, 'Generating Notes', 'Creating structured notes from transcription...', totalSteps)
      console.log('Generating notes from transcription')
      
      // Check if user still has tokens for notes generation
      const { hasTokens } = await checkUserTokens(userId)
      
      if (hasTokens) {
        const { generateNotes: generateNotesFunc } = await import('@/lib/transcription')
        notes = await generateNotesFunc(transcriptionText)
        
        // Consume token for notes generation and record in history
        const transcriptionDoc = await transcriptionsCollection.findOne({ _id: new ObjectId(transcriptionId) })
        await consumeUserTokenWithHistory(
          userId,
          'notes_generation',
          transcriptionId,
          transcriptionDoc?.title || 'Transcription'
        )
        
        console.log('Notes generated and token consumed for user:', userId)
      } else {
        console.log('User has insufficient tokens for notes generation, skipping notes')
        // Update progress to indicate notes were skipped
        await updateProgress(
          transcriptionsCollection, 
          transcriptionId, 
          5, 
          'Notes Skipped', 
          'Insufficient tokens for notes generation',
          totalSteps
        )
      }
    }

    // Complete: Update with results
    await transcriptionsCollection.updateOne(
      { _id: new ObjectId(transcriptionId) },
      {
        $set: {
          status: TranscriptionStatus.COMPLETED,
          content: transcriptionText,
          ...(notes && { notes }),
          progress: {
            currentStep: 'Completed',
            stepNumber,
            totalSteps: totalSteps,
            percentage: 100,
            details: generateNotes ? 'Transcription and notes ready for download' : 'Transcription ready for download'
          },
          updatedAt: new Date(),
        }
      }
    )

    // Clean up temporary file
    await cleanupTempFile(audioPath)

    console.log(`Transcription completed for: ${transcriptionId}`)

  } catch (error) {
    console.error(`Error processing transcription ${transcriptionId}:`, error)
    
    // Update status to error with helpful message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    let userFriendlyError = errorMessage
    
    if (errorMessage.includes('FFmpeg')) {
      userFriendlyError = 'FFmpeg is required for audio processing. Please install FFmpeg and try again.'
    } else if (errorMessage.includes('truncated_id') || errorMessage.includes('Incomplete YouTube ID')) {
      userFriendlyError = 'Invalid YouTube URL. The video ID appears to be incomplete or truncated. Please check the URL and try again.'
    } else if (errorMessage.includes('Video unavailable') || errorMessage.includes('Private video')) {
      userFriendlyError = 'This video is unavailable, private, or restricted. Please try a different video.'
    } else if (errorMessage.includes('yt-dlp') || errorMessage.includes('download')) {
      userFriendlyError = 'Failed to download audio from this URL. Please check that the URL is valid and accessible.'
    } else if (errorMessage.includes('OpenAI') || errorMessage.includes('quota')) {
      userFriendlyError = 'AI transcription service is currently unavailable. Please try again later.'
    } else if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
      userFriendlyError = 'Network error occurred. Please check your connection and try again.'
    } else if (errorMessage.includes('file size') || errorMessage.includes('too large')) {
      userFriendlyError = 'The audio file is too large to process. Please try a shorter video or audio file.'
    }
    
    await transcriptionsCollection.updateOne(
      { _id: new ObjectId(transcriptionId) },
      {
        $set: {
          status: TranscriptionStatus.ERROR,
          error: userFriendlyError,
          progress: {
            currentStep: 'Error',
            stepNumber: 0,
            totalSteps: totalSteps,
            percentage: 0,
            details: userFriendlyError
          },
          updatedAt: new Date(),
        }
      }
    )
  }
}
