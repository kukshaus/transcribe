import { NextRequest, NextResponse } from 'next/server'
import { checkAdminPermission } from '@/lib/admin'
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function POST(request: NextRequest) {
  try {
    const adminCheck = await checkAdminPermission()
    
    if (!adminCheck.isAdmin) {
      return NextResponse.json({ error: adminCheck.error }, { status: 403 })
    }

    const body = await request.json()
    const { userId, tokensToGrant, reason, stripeSessionId } = body

    if (!userId || !ObjectId.isValid(userId)) {
      return NextResponse.json({ error: 'Valid user ID required' }, { status: 400 })
    }

    if (!tokensToGrant || typeof tokensToGrant !== 'number' || tokensToGrant <= 0) {
      return NextResponse.json({ error: 'Valid token amount required' }, { status: 400 })
    }

    const db = await getDatabase()
    const usersCollection = db.collection('users')
    const spendingHistoryCollection = db.collection('spendingHistory')
    
    // Get current user
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const currentTokens = user.tokens || 0
    const newTokenBalance = currentTokens + tokensToGrant

    // Update user tokens
    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          tokens: newTokenBalance,
          updatedAt: new Date()
        }
      }
    )

    // Add to spending history
    await spendingHistoryCollection.insertOne({
      userId,
      action: 'payment_failure_compensation',
      tokensChanged: tokensToGrant,
      description: `Payment failure compensation: ${reason || 'Payment processing failed'}${stripeSessionId ? ` (Session: ${stripeSessionId})` : ''}`,
      createdAt: new Date(),
      balanceAfter: newTokenBalance
    })

    return NextResponse.json({
      success: true,
      message: `Successfully granted ${tokensToGrant} tokens to ${user.email}`,
      user: {
        _id: user._id.toString(),
        email: user.email,
        name: user.name,
        previousTokens: currentTokens,
        newTokens: newTokenBalance
      }
    })
  } catch (error) {
    console.error('Error handling payment failure:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
