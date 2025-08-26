import { NextRequest, NextResponse } from 'next/server'
import { checkAdminPermission, getUserTranscriptions, getUserSpendingHistory } from '@/lib/admin'
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminCheck = await checkAdminPermission()
    
    if (!adminCheck.isAdmin) {
      return NextResponse.json({ error: adminCheck.error }, { status: 403 })
    }

    const userId = params.id
    
    if (!ObjectId.isValid(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
    }

    const db = await getDatabase()
    const usersCollection = db.collection('users')
    
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get user's transcriptions and spending history
    const [transcriptions, spendingHistory] = await Promise.all([
      getUserTranscriptions(userId),
      getUserSpendingHistory(userId)
    ])

    return NextResponse.json({
      user: {
        _id: user._id.toString(),
        email: user.email,
        name: user.name,
        tokens: user.tokens,
        isAdmin: user.isAdmin ?? false,
        isActive: user.isActive ?? true,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      transcriptions: transcriptions.map(t => ({
        _id: t._id.toString(),
        title: t.title,
        status: t.status,
        createdAt: t.createdAt,
        duration: t.duration
      })),
      spendingHistory: spendingHistory.map(s => ({
        _id: s._id.toString(),
        action: s.action,
        tokensChanged: s.tokensChanged,
        description: s.description,
        createdAt: s.createdAt,
        balanceAfter: s.balanceAfter
      })),
      stats: {
        totalTranscriptions: transcriptions.length,
        completedTranscriptions: transcriptions.filter(t => t.status === 'completed').length,
        totalSpent: spendingHistory
          .filter(s => s.tokensChanged < 0)
          .reduce((sum, s) => sum + Math.abs(s.tokensChanged), 0),
        totalEarned: spendingHistory
          .filter(s => s.tokensChanged > 0)
          .reduce((sum, s) => sum + s.tokensChanged, 0)
      }
    })
  } catch (error) {
    console.error('Error fetching user details for admin:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminCheck = await checkAdminPermission()
    
    if (!adminCheck.isAdmin) {
      return NextResponse.json({ error: adminCheck.error }, { status: 403 })
    }

    const userId = params.id
    
    if (!ObjectId.isValid(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
    }

    const body = await request.json()
    const { tokens, isActive, isAdmin } = body

    const db = await getDatabase()
    const usersCollection = db.collection('users')
    
    const updateData: any = { updatedAt: new Date() }
    
    if (typeof tokens === 'number') {
      updateData.tokens = tokens
    }
    
    if (typeof isActive === 'boolean') {
      updateData.isActive = isActive
    }
    
    if (typeof isAdmin === 'boolean') {
      updateData.isAdmin = isAdmin
    }

    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateData }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // If tokens were updated, add to spending history
    if (typeof tokens === 'number') {
      const user = await usersCollection.findOne({ _id: new ObjectId(userId) })
      const tokenDifference = tokens - (user?.tokens || 0)
      
      if (tokenDifference !== 0) {
        const spendingHistoryCollection = db.collection('spendingHistory')
        await spendingHistoryCollection.insertOne({
          userId,
          action: tokenDifference > 0 ? 'admin_token_grant' : 'admin_token_deduction',
          tokensChanged: tokenDifference,
          description: `Admin ${tokenDifference > 0 ? 'granted' : 'deducted'} ${Math.abs(tokenDifference)} tokens`,
          createdAt: new Date(),
          balanceAfter: tokens
        })
      }
    }

    return NextResponse.json({ 
      success: true,
      message: 'User updated successfully',
      updatedFields: Object.keys(updateData).filter(key => key !== 'updatedAt')
    })
  } catch (error) {
    console.error('Error updating user for admin:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
