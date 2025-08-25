import { ObjectId } from 'mongodb'

export interface Transcription {
  _id?: ObjectId | string
  url: string
  title?: string
  status: 'pending' | 'processing' | 'completed' | 'error'
  content?: string
  notes?: string
  prd?: string
  userId?: string // Optional for anonymous users
  userFingerprint?: string // For anonymous users
  createdAt: Date
  updatedAt: Date
  duration?: number // Video duration in seconds
  processingDuration?: number // Processing time in milliseconds
  error?: string
  thumbnail?: string
  audioFile?: {
    data?: Buffer // Only for document storage
    gridfsId?: string // Only for GridFS storage
    filename: string
    mimeType: string
    size: number
    storageType: 'document' | 'gridfs'
  }
  progress?: {
    currentStep: string
    stepNumber: number
    totalSteps: number
    percentage: number
    details?: string
  }
  // Sharing fields
  isPublic?: boolean
  publicId?: string // Unique identifier for public access
  sharedAt?: Date
  shareSettings?: {
    allowComments?: boolean
    allowDownload?: boolean
    allowAudio?: boolean
  }
}

export const TranscriptionStatus = {
  PENDING: 'pending' as const,
  PROCESSING: 'processing' as const,
  COMPLETED: 'completed' as const,
  ERROR: 'error' as const,
}
