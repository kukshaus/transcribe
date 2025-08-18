import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { Transcription, TranscriptionStatus } from '@/lib/models/Transcription'
import { downloadAudio, transcribeAudio, generateNotes, cleanupTempFile, getVideoMetadata } from '@/lib/transcription'
import { ObjectId } from 'mongodb'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    const db = await getDatabase()
    const transcriptionsCollection = db.collection<Transcription>('transcriptions')

    // Create initial transcription record
    const transcription: Omit<Transcription, '_id'> = {
      url,
      status: TranscriptionStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await transcriptionsCollection.insertOne(transcription)
    const transcriptionId = result.insertedId.toString()

    // Start background processing
    processTranscription(transcriptionId, url).catch(console.error)

    return NextResponse.json({ 
      id: transcriptionId,
      message: 'Transcription started' 
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating transcription:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const db = await getDatabase()
    const transcriptionsCollection = db.collection<Transcription>('transcriptions')

    const transcriptions = await transcriptionsCollection
      .find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray()

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
  details?: string
) {
  const totalSteps = 5 // Updated to include compression step
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

async function processTranscription(transcriptionId: string, url: string) {
  const db = await getDatabase()
  const transcriptionsCollection = db.collection<Transcription>('transcriptions')

  try {
    // Step 1: Initialize processing and get metadata
    console.log(`Starting transcription process for: ${transcriptionId}`)
    await updateProgress(transcriptionsCollection, transcriptionId, 1, 'Initializing', 'Getting video information...')
    
    // Get video metadata (title, duration)
    const metadata = await getVideoMetadata(url)
    console.log(`Video metadata:`, metadata)
    
    // Update with title and duration if available
    if (metadata.title || metadata.duration) {
      await transcriptionsCollection.updateOne(
        { _id: new ObjectId(transcriptionId) },
        {
          $set: {
            title: metadata.title,
            duration: metadata.duration,
            updatedAt: new Date()
          }
        }
      )
    }

    // Step 2: Download audio
    await updateProgress(transcriptionsCollection, transcriptionId, 2, 'Downloading Audio', 'Extracting audio from URL...')
    console.log(`Downloading audio from: ${url}`)
    const audioPath = await downloadAudio(url)
    console.log(`Audio downloaded to: ${audioPath}`)

    // Step 3: Check and compress if needed
    await updateProgress(transcriptionsCollection, transcriptionId, 3, 'Processing Audio', 'Checking file size and optimizing for AI...')
    
    // Step 4: Transcribe audio
    await updateProgress(transcriptionsCollection, transcriptionId, 4, 'Transcribing Audio', 'Converting speech to text using AI...')
    console.log(`Transcribing audio: ${audioPath}`)
    
    // Progress callback for chunked transcription
    const progressCallback = async (current: number, total: number) => {
      const chunkProgress = Math.round((current / total) * 100)
      await updateProgress(
        transcriptionsCollection, 
        transcriptionId, 
        4, 
        'Transcribing Audio', 
        `Processing chunk ${current + 1} of ${total} (${chunkProgress}% of transcription)`
      )
    }
    
    const transcriptionText = await transcribeAudio(audioPath, progressCallback)

    // Step 5: Generate notes
    await updateProgress(transcriptionsCollection, transcriptionId, 5, 'Generating Notes', 'Creating structured notes from transcription...')
    console.log('Generating notes from transcription')
    const notes = await generateNotes(transcriptionText)

    // Complete: Update with results
    await transcriptionsCollection.updateOne(
      { _id: new ObjectId(transcriptionId) },
      {
        $set: {
          status: TranscriptionStatus.COMPLETED,
          content: transcriptionText,
          notes: notes,
          progress: {
            currentStep: 'Completed',
            stepNumber: 5,
            totalSteps: 5,
            percentage: 100,
            details: 'Transcription and notes ready for download'
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
    } else if (errorMessage.includes('yt-dlp')) {
      userFriendlyError = 'Failed to download audio. Please check the URL and try again.'
    } else if (errorMessage.includes('OpenAI')) {
      userFriendlyError = 'AI transcription failed. Please check your OpenAI API key and try again.'
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
            totalSteps: 5,
            percentage: 0,
            details: userFriendlyError
          },
          updatedAt: new Date(),
        }
      }
    )
  }
}
