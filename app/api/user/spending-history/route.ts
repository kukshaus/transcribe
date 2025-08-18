import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { getDatabase } from '@/lib/mongodb'
import { SpendingHistory } from '@/lib/models/SpendingHistory'
import { ObjectId } from 'mongodb'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const db = await getDatabase()
    const spendingCollection = db.collection<SpendingHistory>('spendingHistory')
    
    // Get spending history for the user, sorted by most recent first
    const spendingHistory = await spendingCollection
      .find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .limit(50) // Limit to last 50 transactions
      .toArray()

    return NextResponse.json({ spendingHistory })
  } catch (error) {
    console.error('Error fetching spending history:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
