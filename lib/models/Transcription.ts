export interface Transcription {
  _id?: string
  url: string
  title?: string
  status: 'pending' | 'processing' | 'completed' | 'error'
  content?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
  duration?: number
  error?: string
  progress?: {
    currentStep: string
    stepNumber: number
    totalSteps: number
    percentage: number
    details?: string
  }
}

export const TranscriptionStatus = {
  PENDING: 'pending' as const,
  PROCESSING: 'processing' as const,
  COMPLETED: 'completed' as const,
  ERROR: 'error' as const,
}
