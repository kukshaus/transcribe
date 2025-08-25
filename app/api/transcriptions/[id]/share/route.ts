import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { Transcription } from '@/lib/models/Transcription'
import { ObjectId } from 'mongodb'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/route'
import crypto from 'crypto'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { id } = params
    const { action, settings } = await request.json()

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid transcription ID' }, { status: 400 })
    }

    const db = await getDatabase()
    const transcriptionsCollection = db.collection<Transcription>('transcriptions')

    // Verify ownership
    const transcription = await transcriptionsCollection.findOne({ 
      _id: new ObjectId(id),
      userId: session.user.id
    })

    if (!transcription) {
      return NextResponse.json({ error: 'Transcription not found' }, { status: 404 })
    }

    if (action === 'share') {
      // Generate a unique public ID if not already shared
      let publicId = transcription.publicId
      if (!publicId) {
        publicId = crypto.randomBytes(16).toString('hex')
      }

      // Update transcription to be public
      const updateData: any = {
        isPublic: true,
        publicId,
        sharedAt: new Date(),
        updatedAt: new Date()
      }

      // Add share settings if provided
      if (settings) {
        updateData.shareSettings = {
          allowComments: settings.allowComments ?? false,
          allowDownload: settings.allowDownload ?? true,
          allowAudio: settings.allowAudio ?? false
        }
      }

      await transcriptionsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      )

      const publicUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/shared/${publicId}`

      return NextResponse.json({ 
        message: 'Transcription shared successfully',
        publicUrl,
        publicId
      })
    } else if (action === 'unshare') {
      // Make transcription private again
      await transcriptionsCollection.updateOne(
        { _id: new ObjectId(id) },
        { 
          $set: { 
            isPublic: false, 
            updatedAt: new Date() 
          },
          $unset: { 
            publicId: 1, 
            sharedAt: 1, 
            shareSettings: 1 
          }
        }
      )

      return NextResponse.json({ 
        message: 'Transcription unshared successfully'
      })
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error sharing transcription:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(
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

    // Get transcription sharing status
    const transcription = await transcriptionsCollection.findOne(
      { 
        _id: new ObjectId(id),
        userId: session.user.id
      },
      { 
        projection: { 
          isPublic: 1, 
          publicId: 1, 
          sharedAt: 1, 
          shareSettings: 1,
          title: 1 
        } 
      }
    )

    if (!transcription) {
      return NextResponse.json({ error: 'Transcription not found' }, { status: 404 })
    }

    const publicUrl = transcription.isPublic && transcription.publicId 
      ? `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/shared/${transcription.publicId}`
      : null

    return NextResponse.json({
      isPublic: transcription.isPublic || false,
      publicUrl,
      publicId: transcription.publicId,
      sharedAt: transcription.sharedAt,
      shareSettings: transcription.shareSettings || {
        allowComments: false,
        allowDownload: true,
        allowAudio: false
      }
    })
  } catch (error) {
    console.error('Error getting transcription share status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
