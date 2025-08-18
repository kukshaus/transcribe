import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'

export async function GET() {
  try {
    const db = await getDatabase()
    const transcriptionsCollection = db.collection('transcriptions')
    
    const recentTranscriptions = await transcriptionsCollection
      .find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray()
    
    console.log('Recent transcriptions:', JSON.stringify(recentTranscriptions, null, 2))
    
    return NextResponse.json({
      count: recentTranscriptions.length,
      transcriptions: recentTranscriptions.map(t => ({
        _id: t._id.toString(),
        url: t.url,
        status: t.status,
        progress: t.progress,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        error: t.error
      }))
    })
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json({ error: 'Debug failed' }, { status: 500 })
  }
}
