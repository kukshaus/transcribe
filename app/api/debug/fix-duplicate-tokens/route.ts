import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const db = await getDatabase()
    const paymentsCollection = db.collection('payments')
    const usersCollection = db.collection('users')
    const spendingHistoryCollection = db.collection('spendingHistory')
    
    console.log('=== FIXING DUPLICATE TOKENS ===')
    console.log('User:', session.user.email)
    console.log('User ID:', session.user.id)
    
    // Check user's current token balance
    const user = await usersCollection.findOne({ _id: new ObjectId(session.user.id) })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    console.log('Current user tokens:', user.tokens)
    
    // Find all payments for this user
    const payments = await paymentsCollection.find({
      userId: new ObjectId(session.user.id)
    }).toArray()
    
    console.log(`Found ${payments.length} payments:`)
    payments.forEach((payment, i) => {
      console.log(`${i + 1}. Session: ${payment.stripeSessionId} - ${payment.tokensAdded} tokens - $${payment.amount/100}`)
    })
    
    // Find duplicate payments (same session ID processed multiple times)
    const sessionIds = payments.map(p => p.stripeSessionId)
    const duplicateSessions = sessionIds.filter((session, index) => sessionIds.indexOf(session) !== index)
    
    if (duplicateSessions.length > 0) {
      console.log('Found duplicate sessions:', duplicateSessions)
      
      // For each duplicate session, remove the duplicate payment records
      for (const sessionId of duplicateSessions) {
        const duplicatePayments = payments.filter(p => p.stripeSessionId === sessionId)
        console.log(`Session ${sessionId} has ${duplicatePayments.length} records`)
        
        if (duplicatePayments.length > 1) {
          // Keep the first one, remove the rest
          const toRemove = duplicatePayments.slice(1)
          const tokensToDeduct = toRemove.reduce((sum, p) => sum + p.tokensAdded, 0)
          
          console.log(`Removing ${toRemove.length} duplicate payment records, deducting ${tokensToDeduct} tokens`)
          
          // Remove duplicate payment records
          for (const payment of toRemove) {
            await paymentsCollection.deleteOne({ _id: payment._id })
            console.log(`Removed duplicate payment record: ${payment._id}`)
          }
          
          // Deduct the duplicate tokens from user account
          await usersCollection.updateOne(
            { _id: new ObjectId(session.user.id) },
            { 
              $inc: { tokens: -tokensToDeduct },
              $set: { updatedAt: new Date() }
            }
          )
          
          console.log(`Deducted ${tokensToDeduct} duplicate tokens from user account`)
          
          // Remove duplicate spending history entries
          const duplicateHistoryEntries = await spendingHistoryCollection.find({
            userId: session.user.id,
            action: 'token_purchase',
            description: { $regex: `\\$${(duplicatePayments[0].amount / 100).toFixed(2)}` }
          }).toArray()
          
          if (duplicateHistoryEntries.length > 1) {
            const historyToRemove = duplicateHistoryEntries.slice(1)
            for (const entry of historyToRemove) {
              await spendingHistoryCollection.deleteOne({ _id: entry._id })
              console.log(`Removed duplicate spending history entry: ${entry._id}`)
            }
          }
        }
      }
      
      // Get updated user balance
      const updatedUser = await usersCollection.findOne({ _id: new ObjectId(session.user.id) })
      console.log('Updated user tokens:', updatedUser?.tokens)
      
      console.log('=== DUPLICATE TOKEN FIX COMPLETED ===')
      
      return NextResponse.json({
        success: true,
        message: 'Duplicate tokens removed successfully',
        originalTokens: user.tokens,
        correctedTokens: updatedUser?.tokens,
        duplicatesRemoved: duplicateSessions.length
      })
    } else {
      console.log('No duplicate payments found')
      console.log('=== NO DUPLICATES FOUND ===')
      
      return NextResponse.json({
        success: true,
        message: 'No duplicate payments found',
        currentTokens: user.tokens
      })
    }
    
  } catch (error) {
    console.error('Error fixing duplicate tokens:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
