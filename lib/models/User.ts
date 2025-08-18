import { ObjectId } from 'mongodb'

export interface User {
  _id?: ObjectId | string
  name?: string | null
  email?: string | null
  image?: string | null
  emailVerified?: Date | null
  tokens: number
  createdAt: Date
  updatedAt: Date
}

export interface AnonymousUser {
  _id?: ObjectId | string
  fingerprint: string
  ip: string
  userAgent: string
  transcriptionCount: number
  createdAt: Date
  updatedAt: Date
}