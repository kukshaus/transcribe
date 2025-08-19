import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { generateUserFingerprint } from '@/lib/fingerprint'
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const fingerprint = generateUserFingerprint(request)
    const db = await getDatabase()
    const transcriptionsCollection = db.collection('transcriptions')
    const usersCollection = db.collection('users')
    
    console.log('=== DEBUG TRANSCRIPTION CHECK ===')
    console.log('User:', session.user.email)
    console.log('User ID:', session.user.id)
    console.log('Fingerprint:', fingerprint)
    
    // Check user's current state
    const user = await usersCollection.findOne({ _id: new ObjectId(session.user.id) })
    console.log('User data:', JSON.stringify(user, null, 2))
    
    // Check anonymous transcriptions with this fingerprint
    const anonymousTranscriptions = await transcriptionsCollection.find({ 
      userFingerprint: fingerprint,
      userId: { $exists: false }
    }).toArray()
    
    console.log(`Found ${anonymousTranscriptions.length} anonymous transcriptions:`)
    anonymousTranscriptions.forEach((t, i) => {
      console.log(`${i + 1}. ${t.title || 'Untitled'} - Status: ${t.status} - Created: ${t.createdAt}`)
    })
    
    // Check user's current transcriptions
    const userTranscriptions = await transcriptionsCollection.find({ 
      userId: session.user.id
    }).toArray()
    
    console.log(`Found ${userTranscriptions.length} user transcriptions:`)
    userTranscriptions.forEach((t, i) => {
      console.log(`${i + 1}. ${t.title || 'Untitled'} - Status: ${t.status} - Created: ${t.createdAt}`)
    })
    
    // Check if there are transcriptions with this fingerprint that already have a userId
    const transferredTranscriptions = await transcriptionsCollection.find({ 
      userFingerprint: { $exists: false },
      userId: session.user.id
    }).toArray()
    
    console.log(`Found ${transferredTranscriptions.length} transferred transcriptions for this user`)
    
    console.log('=== END DEBUG TRANSCRIPTION CHECK ===')
    
    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user?._id,
          email: user?.email,
          hasReceivedAnonymousTransfer: user?.hasReceivedAnonymousTransfer,
          anonymousTransferFingerprint: user?.anonymousTransferFingerprint,
          tokens: user?.tokens
        },
        fingerprint,
        anonymousTranscriptions: anonymousTranscriptions.length,
        userTranscriptions: userTranscriptions.length,
        transferredTranscriptions: transferredTranscriptions.length,
        anonymousTranscriptionsList: anonymousTranscriptions.map(t => ({
          id: t._id,
          title: t.title,
          status: t.status,
          createdAt: t.createdAt
        })),
        userTranscriptionsList: userTranscriptions.map(t => ({
          id: t._id,
          title: t.title,
          status: t.status,
          createdAt: t.createdAt
        }))
      }
    })
    
  } catch (error) {
    console.error('Error in transcription debug check:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
