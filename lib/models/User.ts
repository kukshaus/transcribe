import { ObjectId } from 'mongodb'

export interface User {
  _id?: ObjectId | string
  name?: string | null
  email?: string | null
  image?: string | null
  emailVerified?: Date | null
  tokens: number
  freeTokensRemaining?: number // tracks remaining free tokens from initial grant or transfers
  hasReceivedInitialFreeTokens?: boolean // prevents duplicate initial free token grants
  hasReceivedAnonymousTransfer?: boolean // prevents duplicate anonymous token transfers
  anonymousTransferFingerprint?: string // tracks which fingerprint was used for token transfer
  hasReceivedAnonymousTranscriptions?: boolean // prevents duplicate anonymous transcription transfers
  anonymousTranscriptionFingerprint?: string // tracks which fingerprint was used for transcription transfer
  createdAt: Date
  updatedAt: Date
}

export interface AnonymousUser {
  _id?: ObjectId | string
  fingerprint: string
  ip: string
  userAgent: string
  transcriptionCount: number
  transferredToUserId?: string // tracks if tokens were transferred to a user account
  transferredAt?: Date // when the transfer happened
  isTransferUsed?: boolean // prevents multiple transfers from same fingerprint
  createdAt: Date
  updatedAt: Date
}