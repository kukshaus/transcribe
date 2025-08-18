import { getDatabase } from './mongodb'
import { AnonymousUser, User } from './models/User'
import { SpendingHistory } from './models/SpendingHistory'
import { ObjectId } from 'mongodb'

export const ANONYMOUS_TRANSCRIPTION_LIMIT = 3
export const FREE_TOKENS_FOR_NEW_USERS = 3

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
  
  await anonymousUsersCollection.updateOne(
    { fingerprint },
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
  const db = await getDatabase()
  const usersCollection = db.collection<User>('users')
  
  console.log('=== CHECK USER TOKENS DEBUG ===')
  console.log('Looking for user with ID:', userId)
  console.log('ObjectId conversion:', new ObjectId(userId))
  
  const user = await usersCollection.findOne({ _id: new ObjectId(userId) })
  
  console.log('User found:', user)
  console.log('User tokens:', user?.tokens)
  console.log('=== END CHECK USER TOKENS DEBUG ===')
  
  if (!user) {
    return { hasTokens: false, tokenCount: 0 }
  }
  
  return {
    hasTokens: user.tokens > 0,
    tokenCount: user.tokens || 0
  }
}

export async function consumeUserToken(userId: string): Promise<{
  success: boolean
  remainingTokens: number
}> {
  console.log('=== CONSUME USER TOKEN DEBUG ===')
  console.log('Attempting to consume token for user:', userId)
  
  const db = await getDatabase()
  const usersCollection = db.collection<User>('users')
  
  // Check current tokens first
  const userBefore = await usersCollection.findOne({ _id: new ObjectId(userId) })
  console.log('User tokens before consumption:', userBefore?.tokens)
  
  const result = await usersCollection.findOneAndUpdate(
    { 
      _id: new ObjectId(userId),
      tokens: { $gt: 0 }
    },
    {
      $inc: { tokens: -1 },
      $set: { updatedAt: new Date() }
    },
    { returnDocument: 'after' }
  )
  
  if (!result) {
    console.log('Token consumption FAILED - user not found or no tokens available')
    return { success: false, remainingTokens: 0 }
  }
  
  console.log('Token consumption SUCCESS - remaining tokens:', result.tokens)
  console.log('=== END CONSUME USER TOKEN DEBUG ===')
  
  return {
    success: true,
    remainingTokens: result.tokens
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
  
  // Only add free tokens if user doesn't already have any
  const result = await usersCollection.updateOne(
    { 
      _id: new ObjectId(userId),
      tokens: { $exists: false }
    },
    {
      $set: { 
        tokens: FREE_TOKENS_FOR_NEW_USERS,
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
      FREE_TOKENS_FOR_NEW_USERS
    )
  }
}

export async function recordTokenTransaction(
  userId: string, 
  action: 'transcription_creation' | 'notes_generation' | 'prd_generation' | 'token_purchase' | 'free_tokens_granted',
  tokensChanged: number, // positive for additions, negative for spending
  description: string,
  balanceAfter: number,
  transcriptionId?: string,
  transcriptionTitle?: string
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
  
  // Consume the correct number of tokens
  let result
  if (tokensToConsume === 2) {
    // For PRD generation, consume 2 tokens
    const firstResult = await consumeUserToken(userId)
    if (firstResult.success) {
      const secondResult = await consumeUserToken(userId)
      result = secondResult
    } else {
      result = firstResult
    }
  } else {
    // For notes generation, consume 1 token
    result = await consumeUserToken(userId)
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
      transcriptionTitle
    )
  }
  
  return result
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
