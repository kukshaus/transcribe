'use client'

import { useState, useEffect } from 'react'
import UrlInput from '@/components/UrlInput'
import TranscriptionCard from '@/components/TranscriptionCard'
import SetupGuide from '@/components/SetupGuide'
import { ToastContainer, useToast } from '@/components/Toast'
import { Transcription } from '@/lib/models/Transcription'
import { RefreshCw, AlertTriangle, HelpCircle } from 'lucide-react'

export default function Home() {
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showSetupGuide, setShowSetupGuide] = useState(false)
  const [hasFFmpegError, setHasFFmpegError] = useState(false)
  const { toasts, removeToast, success, error, warning } = useToast()

  // Fetch transcriptions on component mount
  useEffect(() => {
    fetchTranscriptions()
  }, [])

  // Poll for updates every 2 seconds if there are pending/processing transcriptions
  useEffect(() => {
    const hasActiveTranscriptions = transcriptions.some(
      t => t.status === 'pending' || t.status === 'processing'
    )

    if (hasActiveTranscriptions) {
      const interval = setInterval(fetchTranscriptions, 2000) // Faster polling for better UX
      return () => clearInterval(interval)
    }
  }, [transcriptions])

  const fetchTranscriptions = async () => {
    try {
      setIsRefreshing(true)
      const response = await fetch('/api/transcriptions')
      if (response.ok) {
        const data = await response.json()
        setTranscriptions(data)
        
        // Check for FFmpeg errors
        const hasFFmpegIssue = data.some((t: Transcription) => 
          t.error && t.error.includes('FFmpeg')
        )
        setHasFFmpegError(hasFFmpegIssue)
      }
    } catch (error) {
      console.error('Error fetching transcriptions:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleUrlSubmit = async (url: string) => {
    try {
      setIsLoading(true)
      
      const response = await fetch('/api/transcriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })

      if (response.ok) {
        // Refresh the list to show the new transcription
        await fetchTranscriptions()
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error submitting URL:', error)
      alert('Error submitting URL. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = async (id: string, type: 'transcription' | 'notes' | 'notion' | 'prd') => {
    try {
      const transcription = transcriptions.find(t => t._id?.toString() === id)
      const title = transcription?.title || 'content'
      
      const response = await fetch(`/api/download?id=${id}&type=${type}`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        
        // Get filename from Content-Disposition header
        const contentDisposition = response.headers.get('Content-Disposition')
        const filename = contentDisposition
          ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
          : `${type}.txt`
        
        a.download = filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        // Show success feedback
        const typeNames = {
          transcription: 'Transcription',
          notes: 'Notes',
          notion: 'Notion File',
          prd: 'PRD'
        }
        
        success(
          'Downloaded!',
          `${typeNames[type]} saved successfully.`
        )
      } else {
        const errorData = await response.json()
        error('Download Failed', errorData.error || 'Could not download file.')
      }
    } catch (downloadError) {
      console.error('Error downloading file:', downloadError)
      error(
        'Download Error',
        'Check your connection and try again.'
      )
    }
  }

  const handleGeneratePRD = async (transcriptionId: string) => {
    try {
      const transcription = transcriptions.find(t => t._id?.toString() === transcriptionId)
      const title = transcription?.title || 'transcription'
      
      // Show immediate feedback that generation started
      warning('Generating PRD...', `Creating requirements document for "${title}"`)
      
      const startTime = Date.now()
      
      const response = await fetch('/api/generate-prd', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcriptionId }),
      })

      const result = await response.json()

      if (response.ok) {
        const duration = ((Date.now() - startTime) / 1000).toFixed(1)
        
        // Success feedback with toast
        success(
          'PRD Ready!',
          `Requirements document created in ${duration}s. Check the Export menu to download.`
        )
        
        // Refresh the transcriptions to show the new PRD
        await fetchTranscriptions()
      } else {
        // More detailed error messages
        let errorTitle = 'PRD Generation Failed'
        let errorMessage = result.error || 'Unknown error occurred'
        
        if (errorMessage.includes('quota')) {
          errorTitle = 'Quota Exceeded'
          errorMessage = 'OpenAI API quota limit reached. Try again later.'
        } else if (errorMessage.includes('API key')) {
          errorTitle = 'API Key Error'
          errorMessage = 'Check your OpenAI API key configuration.'
        } else if (errorMessage.includes('notes')) {
          errorTitle = 'Notes Required'
          errorMessage = 'Generate notes first before creating a PRD.'
        }
        
        error(errorTitle, errorMessage)
      }
    } catch (networkError) {
      console.error('Error generating PRD:', networkError)
      error(
        'Connection Error',
        'Please check your internet connection and try again.'
      )
    }
  }

  return (
    <main className="space-y-8">
      {/* FFmpeg Setup Warning */}
      {hasFFmpegError && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-amber-900">Setup Required</h3>
              <p className="text-sm text-amber-700 mt-1">
                FFmpeg is required for some audio formats. Click the setup guide to learn how to install it.
              </p>
              <button
                onClick={() => setShowSetupGuide(true)}
                className="mt-2 text-sm font-medium text-amber-700 hover:text-amber-800 underline"
              >
                View Setup Guide
              </button>
            </div>
          </div>
        </div>
      )}

      <UrlInput onSubmit={handleUrlSubmit} isLoading={isLoading} />
      
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">
          Recent Transcriptions
        </h2>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowSetupGuide(true)}
            className="btn-secondary flex items-center space-x-2"
          >
            <HelpCircle className="h-4 w-4" />
            <span>Setup Guide</span>
          </button>
          <button
            onClick={fetchTranscriptions}
            disabled={isRefreshing}
            className="btn-secondary flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {transcriptions.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-gray-500 mb-4">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No transcriptions yet
          </h3>
          <p className="text-gray-500">
            Paste an audio URL above to get started with your first transcription.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {transcriptions.map((transcription) => (
            <TranscriptionCard
              key={transcription._id?.toString()}
              transcription={transcription}
              onDownload={handleDownload}
              onGeneratePRD={handleGeneratePRD}
            />
          ))}
        </div>
      )}

      {/* Setup Guide Modal */}
      {showSetupGuide && (
        <SetupGuide onClose={() => setShowSetupGuide(false)} />
      )}

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </main>
  )
}
