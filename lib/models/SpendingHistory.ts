import { ObjectId } from 'mongodb'

export interface SpendingHistory {
  _id?: ObjectId | string
  userId: string
  action: 'transcription_creation' | 'notes_generation' | 'prd_generation' | 'token_purchase' | 'free_tokens_granted'
  tokensChanged: number // positive for additions, negative for spending
  transcriptionId?: string
  transcriptionTitle?: string
  createdAt: Date
  description: string
  balanceAfter?: number // token balance after this transaction
}
