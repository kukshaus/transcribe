import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../[...nextauth]/route'
import { generateUserFingerprint } from '@/lib/fingerprint'
import { transferAnonymousUsageToUser } from '@/lib/usage'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Generate fingerprint from the request to identify anonymous usage
    const fingerprint = generateUserFingerprint(request)
    
    console.log('=== TOKEN TRANSFER DEBUG ===')
    console.log('User:', session.user.email)
    console.log('User ID:', session.user.id)
    console.log('Fingerprint:', fingerprint)
    
    let totalTokensGranted = 0
    let totalTranscriptionsTransferred = 0
    let messages: string[] = []
    
    // First, check user's current token status
    const { checkUserTokens } = await import('@/lib/usage')
    const { tokenCount: beforeGrant } = await checkUserTokens(session.user.id)
    
    // Try to grant initial free tokens if user hasn't received them
    const { initializeUserTokens } = await import('@/lib/usage')
    await initializeUserTokens(session.user.id)
    
    // Check if tokens were actually granted
    const { tokenCount: afterGrant } = await checkUserTokens(session.user.id)
    const initialTokensGranted = afterGrant - beforeGrant
    
    if (initialTokensGranted > 0) {
      totalTokensGranted += initialTokensGranted
      messages.push(`Welcome! ${initialTokensGranted} free tokens granted`)
    }
    
    // Then, try to transfer any remaining anonymous usage
    const transferResult = await transferAnonymousUsageToUser(
      fingerprint,
      session.user.id,
      session.user.email
    )
    
    if (transferResult.success && transferResult.tokensTransferred > 0) {
      totalTokensGranted += transferResult.tokensTransferred
      messages.push(`${transferResult.tokensTransferred} tokens transferred from anonymous usage`)
    }

    // Transfer any anonymous transcriptions to the user
    const { transferAnonymousTranscriptionsToUser } = await import('@/lib/usage')
    const transcriptionTransferResult = await transferAnonymousTranscriptionsToUser(
      fingerprint,
      session.user.id,
      session.user.email
    )
    
    if (transcriptionTransferResult.success && transcriptionTransferResult.transcriptionsTransferred > 0) {
      totalTranscriptionsTransferred = transcriptionTransferResult.transcriptionsTransferred
      messages.push(`${transcriptionTransferResult.transcriptionsTransferred} transcriptions transferred from anonymous usage`)
    }
    
    console.log('Total tokens granted:', totalTokensGranted)
    console.log('Total transcriptions transferred:', totalTranscriptionsTransferred)
    console.log('Messages:', messages)
    console.log('=== END TOKEN TRANSFER DEBUG ===')

    if (transferResult.success !== false && transcriptionTransferResult.success !== false) {
      const hasTokens = totalTokensGranted > 0
      const hasTranscriptions = totalTranscriptionsTransferred > 0
      
      let message = ''
      if (hasTokens && hasTranscriptions) {
        message = `🎉 ${messages.join(' + ')}! Total: ${totalTokensGranted} tokens and ${totalTranscriptionsTransferred} transcriptions added to your account!`
      } else if (hasTokens) {
        message = `🎉 ${messages.join(' + ')}! Total: ${totalTokensGranted} tokens added to your account!`
      } else if (hasTranscriptions) {
        message = `🎉 ${messages.join(' + ')}! ${totalTranscriptionsTransferred} transcriptions added to your account!`
      } else {
        message = 'No additional tokens or transcriptions to transfer'
      }
      
      return NextResponse.json({
        success: true,
        tokensTransferred: totalTokensGranted,
        transcriptionsTransferred: totalTranscriptionsTransferred,
        message
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to process tokens' }, 
        { status: 500 }
      )
    }
    
  } catch (error) {
    console.error('Error in token transfer process:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
