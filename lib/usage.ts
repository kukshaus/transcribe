import { getDatabase } from './mongodb'
import { AnonymousUser, User } from './models/User'
import { SpendingHistory } from './models/SpendingHistory'
import { ObjectId } from 'mongodb'

export const ANONYMOUS_TRANSCRIPTION_LIMIT = 3
export const FREE_TOKENS_FOR_NEW_USERS = 1

export async function checkAnonymousUserLimit(fingerprint: string, ip: string, userAgent: string): Promise<{
  canUse: boolean
  remainingUses: number
  user: AnonymousUser | null
}> {
  const db = await getDatabase()
  const anonymousUsersCollection = db.collection<AnonymousUser>('anonymousUsers')
  
  let user = await anonymousUsersCollection.findOne({ fingerprint })
  
  if (!user) {
    // Create new anonymous user
    const newUser: Omit<AnonymousUser, '_id'> = {
      fingerprint,
      ip,
      userAgent,
      transcriptionCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const result = await anonymousUsersCollection.insertOne(newUser)
    user = { ...newUser, _id: result.insertedId }
  }
  
  // SECURITY: If tokens were already transferred from this fingerprint, mark as used up
  if (user.isTransferUsed || user.transferredToUserId) {
    console.log('Anonymous usage already transferred for fingerprint:', fingerprint)
    return {
      canUse: false,
      remainingUses: 0,
      user
    }
  }
  
  const remainingUses = Math.max(0, ANONYMOUS_TRANSCRIPTION_LIMIT - user.transcriptionCount)
  const canUse = remainingUses > 0
  
  return {
    canUse,
    remainingUses,
    user
  }
}

export async function incrementAnonymousUserUsage(fingerprint: string): Promise<void> {
  const db = await getDatabase()
  const anonymousUsersCollection = db.collection<AnonymousUser>('anonymousUsers')
  
  // SECURITY: Only increment if tokens haven't been transferred
  await anonymousUsersCollection.updateOne(
    { 
      fingerprint,
      isTransferUsed: { $ne: true }, // Don't increment if already transferred
      transferredToUserId: { $exists: false } // Don't increment if already transferred
    },
    {
      $inc: { transcriptionCount: 1 },
      $set: { updatedAt: new Date() }
    }
  )
}

export async function checkUserTokens(userId: string): Promise<{
  hasTokens: boolean
  tokenCount: number
}> {
  try {
    console.log('=== CHECK USER TOKENS DEBUG ===')
    console.log('Looking for user with ID:', userId)
    console.log('User ID type:', typeof userId)
    console.log('User ID length:', userId?.length)
    
    // Validate ObjectId format before attempting conversion
    if (!userId || typeof userId !== 'string' || userId.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(userId)) {
      console.log('Invalid ObjectId format:', userId)
      console.log('=== END CHECK USER TOKENS DEBUG (INVALID ID) ===')
      return { hasTokens: false, tokenCount: 0 }
    }
    
    const db = await getDatabase()
    const usersCollection = db.collection<User>('users')
    
    const objectId = new ObjectId(userId)
    console.log('ObjectId conversion successful:', objectId)
    
    const user = await usersCollection.findOne({ _id: objectId })
    
    console.log('User found:', !!user)
    console.log('User tokens:', user?.tokens)
    console.log('=== END CHECK USER TOKENS DEBUG ===')
    
    if (!user) {
      return { hasTokens: false, tokenCount: 0 }
    }
    
    return {
      hasTokens: (user.tokens || 0) > 0,
      tokenCount: user.tokens || 0
    }
  } catch (error) {
    console.error('=== CHECK USER TOKENS ERROR ===')
    console.error('Error checking user tokens:', error)
    console.error('User ID that caused error:', userId)
    console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error)
    console.error('Error message:', error instanceof Error ? error.message : String(error))
    console.error('=== END CHECK USER TOKENS ERROR ===')
    
    // Return safe defaults instead of throwing
    return { hasTokens: false, tokenCount: 0 }
  }
}

export async function consumeUserToken(userId: string): Promise<{
  success: boolean
  remainingTokens: number
  usedFreeToken: boolean
}> {
  console.log('=== CONSUME USER TOKEN DEBUG ===')
  console.log('Attempting to consume token for user:', userId)
  
  const db = await getDatabase()
  const usersCollection = db.collection<User>('users')
  
  // Check current tokens first
  const userBefore = await usersCollection.findOne({ _id: new ObjectId(userId) })
  console.log('User tokens before consumption:', userBefore?.tokens)
  console.log('Free tokens remaining before:', userBefore?.freeTokensRemaining)
  
  if (!userBefore || userBefore.tokens <= 0) {
    console.log('Token consumption FAILED - user not found or no tokens available')
    return { success: false, remainingTokens: 0, usedFreeToken: false }
  }
  
  // For paid operations (notes, PRD, transcription), we should prioritize using PAID tokens
  // Free tokens should only be consumed for free operations (welcome grants, transfers)
  // Since this function is called for paid operations, we never consume free tokens here
  const usedFreeToken = false
  
  // Prepare update operations - only consume from total tokens, not free tokens
  const updateOps: any = {
    $inc: { tokens: -1 },
    $set: { updatedAt: new Date() }
  }
  
  // Note: We intentionally do NOT decrement freeTokensRemaining here
  // Free tokens remain available for tracking purposes but aren't consumed for paid operations
  
  const result = await usersCollection.findOneAndUpdate(
    { 
      _id: new ObjectId(userId),
      tokens: { $gt: 0 }
    },
    updateOps,
    { returnDocument: 'after' }
  )
  
  if (!result) {
    console.log('Token consumption FAILED - user not found or no tokens available')
    return { success: false, remainingTokens: 0, usedFreeToken: false }
  }
  
  console.log('Token consumption SUCCESS - remaining tokens:', result.tokens)
  console.log('Free tokens remaining after:', result.freeTokensRemaining, '(unchanged for paid operations)')
  console.log('Used free token:', usedFreeToken, '(always false for paid operations)')
  console.log('=== END CONSUME USER TOKEN DEBUG ===')
  
  return {
    success: true,
    remainingTokens: result.tokens,
    usedFreeToken
  }
}

export async function addTokensToUser(userId: string, tokens: number): Promise<void> {
  const db = await getDatabase()
  const usersCollection = db.collection<User>('users')
  
  await usersCollection.updateOne(
    { _id: new ObjectId(userId) },
    {
      $inc: { tokens },
      $set: { updatedAt: new Date() }
    }
  )
}

export async function initializeUserTokens(userId: string): Promise<void> {
  const db = await getDatabase()
  const usersCollection = db.collection<User>('users')
  
  // SECURITY: Only add free tokens if user doesn't already have any AND hasn't received initial free tokens
  const result = await usersCollection.updateOne(
    { 
      _id: new ObjectId(userId),
      tokens: 0,
      hasReceivedInitialFreeTokens: { $ne: true } // SECURITY: Prevent duplicate initial grants
    },
    {
      $set: { 
        tokens: FREE_TOKENS_FOR_NEW_USERS,
        freeTokensRemaining: FREE_TOKENS_FOR_NEW_USERS,
        hasReceivedInitialFreeTokens: true, // SECURITY: Mark as received
        updatedAt: new Date()
      }
    }
  )
  
  // If we actually added tokens (matched and modified), record it in history
  if (result.matchedCount > 0) {
    await recordTokenTransaction(
      userId,
      'free_tokens_granted',
      FREE_TOKENS_FOR_NEW_USERS,
      `Welcome! ${FREE_TOKENS_FOR_NEW_USERS} free tokens granted`,
      FREE_TOKENS_FOR_NEW_USERS,
      undefined,
      undefined,
      true // mark as free tier tokens
    )
  }
}

export async function recordTokenTransaction(
  userId: string, 
  action: 'transcription_creation' | 'notes_generation' | 'prd_generation' | 'token_purchase' | 'free_tokens_granted' | 'anonymous_tokens_transferred',
  tokensChanged: number, // positive for additions, negative for spending
  description: string,
  balanceAfter: number,
  transcriptionId?: string,
  transcriptionTitle?: string,
  isFreeTier?: boolean
): Promise<void> {
  const db = await getDatabase()
  const spendingCollection = db.collection<SpendingHistory>('spendingHistory')
  
  const transactionRecord: Omit<SpendingHistory, '_id'> = {
    userId,
    action,
    tokensChanged,
    transcriptionId,
    transcriptionTitle,
    description,
    balanceAfter,
    isFreeTier,
    createdAt: new Date()
  }
  
  await spendingCollection.insertOne(transactionRecord)
}

export async function consumeUserTokenWithHistory(
  userId: string, 
  action: 'transcription_creation' | 'notes_generation' | 'prd_generation',
  transcriptionId?: string,
  transcriptionTitle?: string
): Promise<{
  success: boolean
  remainingTokens: number
}> {
  const tokensToConsume = action === 'prd_generation' ? 2 : 1
  const description = action === 'prd_generation' 
    ? `PRD generation for "${transcriptionTitle || 'transcription'}"`
    : action === 'transcription_creation'
    ? `Transcription creation for "${transcriptionTitle || 'video'}"`
    : `Notes generation for "${transcriptionTitle || 'transcription'}"`
  
  // Track if we used any free tokens
  let usedAnyFreeTokens = false
  
  // Consume the correct number of tokens
  let result
  if (tokensToConsume === 2) {
    // For PRD generation, consume 2 tokens
    const firstResult = await consumeUserToken(userId)
    if (firstResult.success) {
      usedAnyFreeTokens = firstResult.usedFreeToken
      const secondResult = await consumeUserToken(userId)
      if (secondResult.success) {
        usedAnyFreeTokens = usedAnyFreeTokens || secondResult.usedFreeToken
      }
      result = { 
        success: secondResult.success, 
        remainingTokens: secondResult.remainingTokens,
        usedFreeToken: usedAnyFreeTokens
      }
    } else {
      result = { 
        success: firstResult.success, 
        remainingTokens: firstResult.remainingTokens,
        usedFreeToken: firstResult.usedFreeToken
      }
    }
  } else {
    // For notes and transcription, consume 1 token
    result = await consumeUserToken(userId)
    usedAnyFreeTokens = result.usedFreeToken
  }
  
  if (result.success) {
    // Record the spending in history (negative number for spending)
    await recordTokenTransaction(
      userId, 
      action, 
      -tokensToConsume, 
      description, 
      result.remainingTokens,
      transcriptionId, 
      transcriptionTitle,
      usedAnyFreeTokens // mark if free tokens were used
    )
  }
  
  return {
    success: result.success,
    remainingTokens: result.remainingTokens
  }
}

export async function updateTranscriptionInSpendingHistory(
  userId: string,
  transcriptionId: string,
  transcriptionTitle: string
): Promise<void> {
  const db = await getDatabase()
  const spendingCollection = db.collection<SpendingHistory>('spendingHistory')
  
  // Find the most recent transcription_creation record for this user and update it
  // We need to use findOneAndUpdate instead of updateOne to use sort
  await spendingCollection.findOneAndUpdate(
    {
      userId,
      action: 'transcription_creation',
      transcriptionId: { $exists: false }
    },
    {
      $set: {
        transcriptionId,
        transcriptionTitle,
        description: `Transcription creation for "${transcriptionTitle}"`
      }
    },
    { sort: { createdAt: -1 } }
  )
}

export async function addTokensToUserWithHistory(
  userId: string, 
  tokens: number, 
  reason: 'token_purchase' | 'free_tokens_granted' = 'token_purchase',
  description?: string
): Promise<void> {
  // SECURITY: For free token grants, add extra validation
  if (reason === 'free_tokens_granted') {
    const user = await getUserById(userId)
    if (user?.hasReceivedInitialFreeTokens) {
      console.log('Attempted duplicate free token grant prevented for user:', userId)
      return // Silently prevent duplicate grants
    }
  }
  
  // Add tokens to user
  await addTokensToUser(userId, tokens)
  
  // Get updated balance
  const { tokenCount } = await checkUserTokens(userId)
  
  // Record the addition in history (positive number for additions)
  const finalDescription = description || (reason === 'free_tokens_granted' 
    ? `Free tokens granted to new user`
    : `Purchased ${tokens} token${tokens !== 1 ? 's' : ''}`)
  
  await recordTokenTransaction(
    userId,
    reason,
    tokens, // positive number for additions
    finalDescription,
    tokenCount
  )
}

/**
 * SECURITY: Helper function to safely get user by ID
 */
async function getUserById(userId: string): Promise<User | null> {
  try {
    const db = await getDatabase()
    const usersCollection = db.collection<User>('users')
    return await usersCollection.findOne({ _id: new ObjectId(userId) })
  } catch (error) {
    console.error('Error getting user by ID:', error)
    return null
  }
}

/**
 * SECURITY: Clean up anonymous usage that was transferred but not properly invalidated
 * This ensures that transferred fingerprints cannot be reused
 */
export async function cleanupTransferredAnonymousUsage(): Promise<{
  cleaned: number
  success: boolean
}> {
  try {
    const db = await getDatabase()
    const anonymousUsersCollection = db.collection<AnonymousUser>('anonymousUsers')
    
    // Find anonymous users that were transferred but not marked as used up
    const result = await anonymousUsersCollection.updateMany(
      {
        transferredToUserId: { $exists: true },
        $or: [
          { isTransferUsed: { $ne: true } },
          { transcriptionCount: { $lt: ANONYMOUS_TRANSCRIPTION_LIMIT } }
        ]
      },
      {
        $set: {
          isTransferUsed: true,
          transcriptionCount: ANONYMOUS_TRANSCRIPTION_LIMIT,
          updatedAt: new Date()
        }
      }
    )
    
    console.log(`Cleaned up ${result.modifiedCount} transferred anonymous users`)
    
    return {
      cleaned: result.modifiedCount,
      success: true
    }
  } catch (error) {
    console.error('Error cleaning up transferred anonymous usage:', error)
    return {
      cleaned: 0,
      success: false
    }
  }
}

/**
 * SECURITY: Audit function to check for potential token exploitation
 * This can be called periodically to detect and log suspicious activity
 */
export async function auditTokenSecurity(): Promise<{
  suspiciousUsers: string[]
  duplicateFingerprints: string[]
  issues: string[]
}> {
  const db = await getDatabase()
  const usersCollection = db.collection<User>('users')
  const spendingCollection = db.collection<SpendingHistory>('spendingHistory')
  
  const issues: string[] = []
  const suspiciousUsers: string[] = []
  const duplicateFingerprints: string[] = []
  
  try {
    // Check for users with multiple free token grants
    const duplicateFreeGrants = await spendingCollection.aggregate([
      { $match: { action: 'free_tokens_granted' } },
      { $group: { _id: '$userId', count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]).toArray()
    
    if (duplicateFreeGrants.length > 0) {
      issues.push(`Found ${duplicateFreeGrants.length} users with multiple free token grants`)
      suspiciousUsers.push(...duplicateFreeGrants.map(u => u._id))
    }
    
    // Check for users with multiple anonymous transfers
    const duplicateTransfers = await spendingCollection.aggregate([
      { $match: { action: 'anonymous_tokens_transferred' } },
      { $group: { _id: '$userId', count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]).toArray()
    
    if (duplicateTransfers.length > 0) {
      issues.push(`Found ${duplicateTransfers.length} users with multiple anonymous transfers`)
      suspiciousUsers.push(...duplicateTransfers.map(u => u._id))
    }
    
    // Check for duplicate fingerprint usage across different users
    const fingerprintUsage = await usersCollection.aggregate([
      { $match: { anonymousTransferFingerprint: { $exists: true } } },
      { $group: { _id: '$anonymousTransferFingerprint', users: { $push: '$_id' }, count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]).toArray()
    
    if (fingerprintUsage.length > 0) {
      issues.push(`Found ${fingerprintUsage.length} fingerprints used by multiple users`)
      duplicateFingerprints.push(...fingerprintUsage.map(f => f._id))
    }
    
    // Check for users with inconsistent flag states
    const inconsistentUsers = await usersCollection.find({
      $or: [
        { hasReceivedInitialFreeTokens: true, tokens: { $lt: FREE_TOKENS_FOR_NEW_USERS }, freeTokensRemaining: { $lte: 0 } },
        { hasReceivedAnonymousTransfer: true, anonymousTransferFingerprint: { $exists: false } }
      ]
    }).toArray()
    
    if (inconsistentUsers.length > 0) {
      issues.push(`Found ${inconsistentUsers.length} users with inconsistent security flags`)
      suspiciousUsers.push(...inconsistentUsers.map(u => u._id?.toString() || ''))
    }
    
    console.log('Token security audit completed:', { issues, suspiciousUsers: suspiciousUsers.length, duplicateFingerprints: duplicateFingerprints.length })
    
  } catch (error) {
    console.error('Error during token security audit:', error)
    issues.push('Audit failed due to internal error')
  }
  
  return {
    suspiciousUsers: Array.from(new Set(suspiciousUsers)), // Remove duplicates
    duplicateFingerprints,
    issues
  }
}

/**
 * Transfer remaining anonymous usage as free tokens to a new authenticated user
 * This is called when a user signs up and we want to convert their anonymous usage to tokens
 * SECURITY: Multiple safeguards prevent duplicate transfers and exploits
 */
/**
 * Transfer anonymous transcriptions to a user account after signup
 * This assigns transcriptions created with the same fingerprint to the authenticated user
 */
export async function transferAnonymousTranscriptionsToUser(
  fingerprint: string, 
  userId: string, 
  userEmail: string
): Promise<{
  transcriptionsTransferred: number
  success: boolean
  reason?: string
}> {
  const db = await getDatabase()
  const transcriptionsCollection = db.collection('transcriptions')
  const usersCollection = db.collection<User>('users')
  
  try {
    // SECURITY CHECK 1: Get current user and check if they already received transcription transfer
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) })
    if (!user) {
      console.error('User not found for transcription transfer:', userId)
      return { transcriptionsTransferred: 0, success: false, reason: 'User not found' }
    }
    
    // SECURITY CHECK 2: Prevent duplicate transcription transfers per user for same fingerprint
    if (user.anonymousTranscriptionFingerprint === fingerprint) {
      console.log('User has already received transcriptions from this fingerprint:', userEmail, fingerprint)
      return { transcriptionsTransferred: 0, success: true, reason: 'Already received transcriptions from this fingerprint' }
    }
    
    // Find all anonymous transcriptions with this fingerprint
    const anonymousTranscriptions = await transcriptionsCollection.find({ 
      userFingerprint: fingerprint,
      userId: { $exists: false } // Only transcriptions without a userId (anonymous)
    }).toArray()
    
    if (anonymousTranscriptions.length === 0) {
      console.log('No anonymous transcriptions found for fingerprint:', fingerprint)
      return { transcriptionsTransferred: 0, success: true, reason: 'No anonymous transcriptions found' }
    }
    
    console.log(`Found ${anonymousTranscriptions.length} anonymous transcriptions to transfer for user:`, userEmail)
    
    // Transfer transcriptions by setting userId and removing userFingerprint
    const transferResult = await transcriptionsCollection.updateMany(
      { 
        userFingerprint: fingerprint,
        userId: { $exists: false }
      },
      {
        $set: { 
          userId: userId,
          updatedAt: new Date()
        },
        $unset: { userFingerprint: 1 }
      }
    )
    
    // Update user to mark that transcriptions were transferred from this fingerprint
    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          hasReceivedAnonymousTranscriptions: true,
          anonymousTranscriptionFingerprint: fingerprint,
          updatedAt: new Date()
        }
      }
    )
    
    console.log(`Successfully transferred ${transferResult.modifiedCount} transcriptions to user:`, userEmail)
    
    return { 
      transcriptionsTransferred: transferResult.modifiedCount, 
      success: true,
      reason: `Transferred ${transferResult.modifiedCount} transcriptions from anonymous usage`
    }
    
  } catch (error) {
    console.error('Error transferring anonymous transcriptions:', error)
    return { transcriptionsTransferred: 0, success: false, reason: 'Transfer failed' }
  }
}

export async function transferAnonymousUsageToUser(
  fingerprint: string, 
  userId: string, 
  userEmail: string
): Promise<{
  tokensTransferred: number
  success: boolean
  reason?: string
}> {
  const db = await getDatabase()
  const anonymousUsersCollection = db.collection<AnonymousUser>('anonymousUsers')
  const usersCollection = db.collection<User>('users')
  
  try {
    // SECURITY CHECK 1: Get current user and check if they already received anonymous transfer
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) })
    if (!user) {
      console.error('User not found for token transfer:', userId)
      return { tokensTransferred: 0, success: false, reason: 'User not found' }
    }
    
    // SECURITY CHECK 2: Prevent duplicate anonymous transfers per user
    if (user.hasReceivedAnonymousTransfer) {
      console.log('User has already received anonymous token transfer:', userEmail)
      return { tokensTransferred: 0, success: true, reason: 'Already received anonymous transfer' }
    }
    
    // SECURITY CHECK 3: Find the anonymous user record
    const anonymousUser = await anonymousUsersCollection.findOne({ fingerprint })
    
    if (!anonymousUser) {
      console.log('No anonymous user found for fingerprint:', fingerprint)
      return { tokensTransferred: 0, success: true, reason: 'No anonymous usage found' }
    }
    
    // SECURITY CHECK 4: Check if this fingerprint was already used for transfer
    if (anonymousUser.isTransferUsed || anonymousUser.transferredToUserId) {
      console.log('Anonymous usage already transferred for fingerprint:', fingerprint)
      return { tokensTransferred: 0, success: true, reason: 'Anonymous usage already transferred' }
    }
    
    // SECURITY CHECK 5: Prevent transferring to different users from same fingerprint
    const existingTransferToOtherUser = await usersCollection.findOne({
      anonymousTransferFingerprint: fingerprint,
      _id: { $ne: new ObjectId(userId) }
    })
    
    if (existingTransferToOtherUser) {
      console.log('Fingerprint already used for transfer to different user:', fingerprint)
      return { tokensTransferred: 0, success: false, reason: 'Fingerprint already used' }
    }
    
    // Calculate how many free tokens to give based on remaining anonymous usage
    const usedTranscriptions = anonymousUser.transcriptionCount || 0
    const remainingTranscriptions = Math.max(0, ANONYMOUS_TRANSCRIPTION_LIMIT - usedTranscriptions)
    
    if (remainingTranscriptions === 0) {
      console.log('No remaining anonymous usage to transfer for:', userEmail)
      return { tokensTransferred: 0, success: true, reason: 'No remaining usage to transfer' }
    }
    
    const currentTokens = user.tokens || 0
    const newTokenBalance = currentTokens + remainingTranscriptions
    
    // ATOMIC TRANSACTION: Update user with all security flags
    const userUpdateResult = await usersCollection.updateOne(
      { 
        _id: new ObjectId(userId),
        hasReceivedAnonymousTransfer: { $ne: true } // Double-check in query to prevent race conditions
      },
      {
        $inc: { tokens: remainingTranscriptions },
        $set: { 
          freeTokensRemaining: (user.freeTokensRemaining || 0) + remainingTranscriptions,
          hasReceivedAnonymousTransfer: true, // SECURITY: Mark as received
          anonymousTransferFingerprint: fingerprint, // SECURITY: Track fingerprint used
          updatedAt: new Date()
        }
      }
    )
    
    // SECURITY CHECK 6: Ensure the update actually happened (race condition protection)
    if (userUpdateResult.matchedCount === 0) {
      console.log('Failed to update user - race condition detected for:', userEmail)
      return { tokensTransferred: 0, success: false, reason: 'Race condition detected' }
    }
    
    // Record the transfer in spending history
    await recordTokenTransaction(
      userId,
      'anonymous_tokens_transferred',
      remainingTranscriptions,
      `Free tokens transferred from anonymous usage (${remainingTranscriptions} remaining transcriptions converted to tokens)`,
      newTokenBalance,
      undefined,
      undefined,
      true // mark as free tier tokens
    )
    
    // ATOMIC TRANSACTION: Mark anonymous user as transferred and completely used up
    await anonymousUsersCollection.updateOne(
      { fingerprint },
      {
        $set: {
          transferredToUserId: userId,
          transferredAt: new Date(),
          isTransferUsed: true, // SECURITY: Prevent reuse
          transcriptionCount: ANONYMOUS_TRANSCRIPTION_LIMIT, // SECURITY: Mark as fully used
          updatedAt: new Date()
        }
      }
    )
    
    console.log(`Successfully transferred ${remainingTranscriptions} tokens to user ${userEmail} (${userId})`)
    
    return { tokensTransferred: remainingTranscriptions, success: true, reason: 'Transfer successful' }
    
  } catch (error) {
    console.error('Error transferring anonymous usage to user:', error)
    return { tokensTransferred: 0, success: false, reason: 'Internal error' }
  }
}
