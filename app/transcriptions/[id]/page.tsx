'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Copy, 
  Download, 
  Share2, 
  ExternalLink,
  ArrowLeft,
  FileText,
  StickyNote,
  Calendar,
  Globe,
  Play,
  Pause,
  Trash2
} from 'lucide-react'
import { Transcription } from '@/lib/models/Transcription'
import { marked } from 'marked'
import { ToastContainer, useToast } from '@/components/Toast'
import ExportDropdown from '@/components/ExportDropdown'

export default function TranscriptionDetailPage() {
  const { data: session, status } = useSession()
  const params = useParams()
  const router = useRouter()
  const { toasts, removeToast, success, error } = useToast()
  const [transcription, setTranscription] = useState<Transcription | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'transcription' | 'notes'>('transcription')
  const [isGeneratingPRD, setIsGeneratingPRD] = useState(false)
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [userTokens, setUserTokens] = useState<{tokens: number, hasTokens: boolean} | null>(null)

  useEffect(() => {
    if (params.id && session) {
      fetchTranscription(params.id as string)
      fetchUserTokens()
    } else if (status === 'unauthenticated') {
      router.push('/')
    }
  }, [params.id, session, status])

  // Auto-refresh for pending/processing transcriptions
  useEffect(() => {
    if (!transcription || !params.id) return

    const shouldPoll = transcription.status === 'pending' || transcription.status === 'processing'
    
    if (shouldPoll) {
      const interval = setInterval(() => {
        fetchTranscription(params.id as string, true) // Silent refresh during polling
      }, 2000) // Poll every 2 seconds for real-time updates
      
      return () => clearInterval(interval)
    }
  }, [transcription?.status, params.id])

  const fetchTranscription = async (id: string, silent: boolean = false) => {
    try {
      if (!silent) setLoading(true)
      const response = await fetch(`/api/transcriptions/${id}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          router.push('/')
          return
        }
        if (response.status === 401) {
          router.push('/')
          return
        }
        throw new Error('Failed to fetch transcription')
      }
      
      const data = await response.json()
      setTranscription(data)
    } catch (err) {
      console.error('Error fetching transcription:', err)
      if (!silent) {
        error('Error', 'Failed to load transcription')
        router.push('/')
      }
    } finally {
      if (!silent) setLoading(false)
    }
  }

  const fetchUserTokens = async () => {
    try {
      const response = await fetch('/api/user/tokens')
      if (response.ok) {
        const data = await response.json()
        setUserTokens(data)
      }
    } catch (err) {
      console.error('Error fetching user tokens:', err)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-6 w-6 text-yellow-500" />
      case 'processing':
        return <RefreshCw className="h-6 w-6 text-blue-500 animate-spin" />
      case 'completed':
        return <CheckCircle className="h-6 w-6 text-green-500" />
      case 'error':
        return <XCircle className="h-6 w-6 text-red-500" />
      default:
        return null
    }
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'Unknown'
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const formatTimestamp = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const handleCopyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      success('Copied!', `${type} copied to clipboard`)
    } catch (err) {
      error('Error', 'Failed to copy to clipboard')
    }
  }

  const handleDownload = async (id: string, type: 'transcription' | 'notes' | 'notion' | 'prd' | 'audio') => {
    try {
      const response = await fetch(`/api/download?id=${id}&type=${type}`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        
        const contentDisposition = response.headers.get('Content-Disposition')
        let filename = `${type}.txt`
        
        if (contentDisposition) {
          // Try to extract filename from Content-Disposition header
          // Handle both 'filename="..."' and 'filename*=UTF-8''...' formats
          const filenameMatch = contentDisposition.match(/filename="([^"]+)"/) ||
                               contentDisposition.match(/filename\*=UTF-8''([^;]+)/)
          if (filenameMatch) {
            filename = filenameMatch[1]
            // Decode if it's URL encoded (from filename* format)
            if (contentDisposition.includes('filename*=UTF-8')) {
              filename = decodeURIComponent(filename)
            }
          }
        }
        
        a.download = filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        const typeNames = {
          transcription: 'Transcription',
          notes: 'Notes',
          notion: 'Notion File',
          prd: 'PRD',
          audio: 'Audio File'
        }
        
        success('Downloaded!', `${typeNames[type]} saved successfully.`)
      } else {
        const errorData = await response.json()
        error('Download Failed', errorData.error || 'Could not download file.')
      }
    } catch (downloadError) {
      console.error('Error downloading file:', downloadError)
      error('Download Error', 'Check your connection and try again.')
    }
  }

  const handleGenerateNotes = async (transcriptionId: string) => {
    try {
      setIsGeneratingNotes(true)
      
      const response = await fetch('/api/generate-notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcriptionId }),
      })

      const result = await response.json()

      if (response.ok) {
        success('Notes Ready!', 'AI-generated notes created successfully.')
        await fetchTranscription(transcriptionId, true)
        await fetchUserTokens() // Refresh token count
      } else {
        error('Notes Generation Failed', result.error || 'Unknown error occurred')
      }
    } catch (networkError) {
      console.error('Error generating notes:', networkError)
      error('Connection Error', 'Please check your internet connection and try again.')
    } finally {
      setIsGeneratingNotes(false)
    }
  }

  const handleGeneratePRD = async (transcriptionId: string) => {
    try {
      setIsGeneratingPRD(true)
      
      const response = await fetch('/api/generate-prd', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcriptionId }),
      })

      const result = await response.json()

      if (response.ok) {
        success('PRD Ready!', 'Requirements document created successfully.')
        await fetchTranscription(transcriptionId, true)
        await fetchUserTokens() // Refresh token count
      } else {
        error('PRD Generation Failed', result.error || 'Unknown error occurred')
      }
    } catch (networkError) {
      console.error('Error generating PRD:', networkError)
      error('Connection Error', 'Please check your internet connection and try again.')
    } finally {
      setIsGeneratingPRD(false)
    }
  }

  const handleShare = async () => {
    const url = window.location.href
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: transcription?.title || 'Transcription',
          url: url
        })
      } catch (err) {
        // User cancelled sharing
      }
    } else {
      try {
        await navigator.clipboard.writeText(url)
        success('Link Copied!', 'Share link copied to clipboard')
      } catch (err) {
        error('Error', 'Failed to copy link')
      }
    }
  }

  const handleDeleteTranscription = async () => {
    if (!transcription) return
    
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/transcriptions/${transcription._id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        success(
          'Deleted Successfully',
          `"${transcription.title || 'Transcription'}" has been permanently removed.`
        )
        // Redirect to home page after successful deletion
        setTimeout(() => {
          router.push('/')
        }, 1500)
      } else {
        const result = await response.json()
        error(
          'Delete Failed',
          result.error || 'Could not delete the transcription. Please try again.'
        )
      }
    } catch (networkError) {
      console.error('Error deleting transcription:', networkError)
      error(
        'Connection Error',
        'Please check your internet connection and try again.'
      )
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  // Generate timestamped sections for navigation
  const generateTimestampedSections = (content: string) => {
    if (!content) return []
    
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const sections = []
    const wordsPerMinute = 150 // Average speaking rate
    let currentTime = 0
    
    for (let i = 0; i < sentences.length; i += 3) {
      const section = sentences.slice(i, i + 3).join('. ').trim() + '.'
      const wordCount = section.split(' ').length
      const duration = (wordCount / wordsPerMinute) * 60
      
      sections.push({
        startTime: currentTime,
        content: section,
        timestamp: formatTimestamp(currentTime)
      })
      
      currentTime += duration
    }
    
    return sections
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">
            {status === 'loading' ? 'Authenticating...' : 'Loading transcription...'}
          </p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null // Will redirect to home
  }

  if (!transcription) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Transcription Not Found</h1>
          <p className="text-gray-600 mb-6">The transcription you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </button>
        </div>
      </div>
    )
  }

  const timestampedSections = generateTimestampedSections(transcription.content || '')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-700 pt-4 relative z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Transcriptions</span>
            </button>
            
            <div className="flex items-center space-x-3 relative z-50">
              <button
                onClick={handleShare}
                className="inline-flex items-center space-x-2 px-4 py-2 text-gray-300 bg-gray-800 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors relative z-50"
              >
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </button>
              
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isDeleting}
                className="inline-flex items-center space-x-2 px-4 py-2 text-red-400 bg-gray-800 border border-red-600 rounded-lg hover:bg-red-900 hover:bg-opacity-20 transition-colors disabled:opacity-50 relative z-50"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </button>
              
              {transcription.status === 'completed' && (transcription.content || transcription.notes) && (
                <div className="bg-gray-800 rounded-lg relative z-50">
                  <ExportDropdown
                    transcriptionId={transcription._id!.toString()}
                    hasTranscription={!!transcription.content}
                    hasNotes={!!transcription.notes}
                    hasPRD={!!transcription.prd}
                    hasAudio={!!transcription.audioFile}
                    onDownload={handleDownload}
                    onGeneratePRD={handleGeneratePRD}
                    onGenerateNotes={handleGenerateNotes}
                    isGeneratingPRD={isGeneratingPRD}
                    isGeneratingNotes={isGeneratingNotes}
                    isAuthenticated={!!session?.user}
                    userTokens={userTokens}
                  />
                </div>
              )}
            </div>
          </div>
          
          <div>
            {/* Title and Metadata */}
            <div>
              <h1 className="text-2xl font-bold text-white mb-3">
                {transcription.title || 'Untitled Audio'}
              </h1>
              
              <div className="flex items-center space-x-6 text-sm text-gray-300 mb-3">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(transcription.status)}
                  <span className="capitalize font-medium">
                    {transcription.status}
                  </span>
                </div>
                
                {transcription.duration && (
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>Duration: {formatDuration(transcription.duration)}</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Created: {new Date(transcription.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              
              <a 
                href={transcription.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors text-sm"
              >
                <Globe className="h-4 w-4" />
                <span className="break-all">{transcription.url}</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Section for Processing */}
      {transcription.progress && transcription.status === 'processing' && (
        <div className="bg-blue-50 border-b border-blue-200">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-blue-900">
                  Step {transcription.progress.stepNumber} of {transcription.progress.totalSteps}: {transcription.progress.currentStep}
                </span>
                <span className="text-blue-700">{transcription.progress.percentage}%</span>
              </div>
              
              <div className="w-full bg-blue-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${transcription.progress.percentage}%` }}
                ></div>
              </div>
              
              {transcription.progress.details && (
                <div className="text-sm text-blue-800 italic">
                  {transcription.progress.details}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error State with Video Display */}
      {transcription.status === 'error' && transcription.error && (
        <div className="bg-gray-900 min-h-screen">
          <div className="max-w-6xl mx-auto px-4 py-16">
            <div className="text-center">
              {/* Video Thumbnail Section - Even on Error */}
              {transcription.thumbnail && (
                <div className="max-w-2xl mx-auto mb-8">
                  <a 
                    href={transcription.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block bg-black rounded-lg overflow-hidden aspect-video relative group cursor-pointer"
                  >
                    <img 
                      src={transcription.thumbnail} 
                      alt={transcription.title || 'Video thumbnail'}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-20 flex items-center justify-center transition-all">
                      <div className="w-20 h-20 bg-white bg-opacity-90 group-hover:bg-opacity-100 rounded-full flex items-center justify-center transition-all">
                        <Play className="h-8 w-8 text-gray-900 ml-1" />
                      </div>
                    </div>
                    <div className="absolute top-4 right-4 bg-red-600 bg-opacity-90 group-hover:bg-opacity-100 text-white px-3 py-1 rounded text-sm transition-all">
                      Failed to process
                    </div>
                    <div className="absolute bottom-4 right-4 bg-blue-600 bg-opacity-90 group-hover:bg-opacity-100 text-white px-3 py-1 rounded text-sm transition-all">
                      Click to watch
                    </div>
                  </a>
                  <div className="mt-4">
                    <a 
                      href={transcription.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors text-sm"
                    >
                      <Globe className="h-4 w-4" />
                      <span>View original video</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              )}
              
              {/* Fallback when no thumbnail is available */}
              {!transcription.thumbnail && (
                <div className="max-w-2xl mx-auto mb-8">
                  <a 
                    href={transcription.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block bg-red-900 rounded-lg overflow-hidden aspect-video relative group cursor-pointer hover:bg-red-800 transition-colors"
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-20 h-20 bg-white bg-opacity-90 group-hover:bg-opacity-100 rounded-full flex items-center justify-center transition-all mx-auto mb-4">
                          <Play className="h-8 w-8 text-gray-900 ml-1" />
                        </div>
                        <p className="text-white text-lg font-medium">Click to watch video</p>
                        <p className="text-red-200 text-sm mt-1">Transcription failed</p>
                      </div>
                    </div>
                    <div className="absolute top-4 right-4 bg-red-600 bg-opacity-90 group-hover:bg-opacity-100 text-white px-3 py-1 rounded text-sm transition-all">
                      Failed to process
                    </div>
                  </a>
                  <div className="mt-4">
                    <a 
                      href={transcription.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors text-sm"
                    >
                      <Globe className="h-4 w-4" />
                      <span>View original video</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              )}
              
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white mb-4">Transcription Failed</h2>
              <div className="bg-red-900 bg-opacity-50 rounded-lg p-6 max-w-2xl mx-auto">
                <h3 className="font-medium text-red-200 mb-2">Error Details</h3>
                <p className="text-red-100 text-sm">{transcription.error}</p>
              </div>
              <div className="mt-6 space-y-3">
                <p className="text-gray-300">You can still watch the original video above.</p>
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Try Again</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {transcription.status === 'completed' && (transcription.content || transcription.notes) && (
        <div className="bg-gray-900 min-h-screen">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-screen">
              
              {/* Left Side - Video Player */}
              <div className="flex flex-col">
                {/* Video Player Area */}
                <div className="bg-black rounded-lg overflow-hidden mb-6 aspect-video flex items-center justify-center">
                  {transcription.thumbnail ? (
                    <a 
                      href={transcription.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="relative w-full h-full group cursor-pointer"
                    >
                      <img 
                        src={transcription.thumbnail} 
                        alt={transcription.title || 'Video thumbnail'}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-20 flex items-center justify-center transition-all">
                        <div className="w-20 h-20 bg-white bg-opacity-90 group-hover:bg-opacity-100 rounded-full flex items-center justify-center transition-all">
                          <Play className="h-8 w-8 text-gray-900 ml-1" />
                        </div>
                      </div>
                      <div className="absolute top-4 right-4 bg-black bg-opacity-50 group-hover:bg-opacity-70 text-white px-3 py-1 rounded text-sm transition-all">
                        Watch on YouTube
                      </div>
                    </a>
                  ) : (
                    <a 
                      href={transcription.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full h-full flex items-center justify-center text-center text-gray-400 hover:text-gray-300 transition-colors cursor-pointer"
                    >
                      <div>
                        <Play className="h-16 w-16 mx-auto mb-4" />
                        <p>Click to watch video</p>
                      </div>
                    </a>
                  )}
                </div>

                {/* Get the transcript section */}
                <div className="text-center text-white">
                  <h3 className="text-xl font-semibold mb-2">Get the transcript:</h3>
                  <div className="flex items-center justify-center space-x-4">
                    <button
                      onClick={() => handleCopyToClipboard(transcription.content || '', 'Transcription')}
                      className="flex items-center space-x-2 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors border border-gray-600"
                    >
                      <Copy className="h-4 w-4" />
                      <span>Copy</span>
                    </button>
                    
                    <button
                      onClick={() => handleDownload(transcription._id!.toString(), 'transcription')}
                      className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Side - Timestamped Transcript */}
              <div className="bg-white rounded-lg overflow-hidden">
                <div className="h-full flex flex-col">
                  
                  {/* Header */}
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Transcript</h3>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setActiveTab('transcription')}
                          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                            activeTab === 'transcription'
                              ? 'bg-blue-100 text-blue-700'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          Transcript
                        </button>
                        <button
                          onClick={() => setActiveTab('notes')}
                          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                            activeTab === 'notes'
                              ? 'bg-blue-100 text-blue-700'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          Notes
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Timestamped Content */}
                  <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'transcription' && transcription.content && (
                      <div className="space-y-4">
                        {timestampedSections.map((section, index) => (
                          <div
                            key={index}
                            className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                            onClick={() => setCurrentTime(section.startTime)}
                          >
                            <div className="flex-shrink-0">
                              <span className="text-sm font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                {section.timestamp}
                              </span>
                            </div>
                            <div className="flex-1">
                              <p className="text-gray-800 leading-relaxed">
                                {section.content}
                              </p>
                            </div>
                          </div>
                        ))}
                        
                        {timestampedSections.length === 0 && (
                          <div className="space-y-4">
                            {transcription.content.split(/[.!?]+/).filter(s => s.trim().length > 0).map((sentence, index) => (
                              <div key={index} className="flex items-start space-x-4 p-3">
                                <div className="flex-shrink-0">
                                  <span className="text-sm font-mono text-gray-400">
                                    {formatTimestamp(index * 10)}
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <p className="text-gray-800 leading-relaxed">
                                    {sentence.trim()}.
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {activeTab === 'notes' && transcription.notes && (
                      <div className="prose prose-sm max-w-none">
                        <div 
                          className="text-gray-800 leading-relaxed"
                          dangerouslySetInnerHTML={{ 
                            __html: marked(transcription.notes, { 
                              breaks: true,
                              gfm: true
                            })
                          }}
                        />
                      </div>
                    )}
                    
                    {activeTab === 'transcription' && !transcription.content && (
                      <div className="text-center py-12">
                        <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Transcription Available</h3>
                        <p className="text-gray-600">The transcription is still being processed or failed to generate.</p>
                      </div>
                    )}
                    
                    {activeTab === 'notes' && !transcription.notes && (
                      <div className="text-center py-12">
                        <StickyNote className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Notes Available</h3>
                        <p className="text-gray-600 mb-6">AI-generated notes are not available for this transcription yet.</p>
                        
                        {userTokens && userTokens.hasTokens ? (
                          <button
                            onClick={() => handleGenerateNotes(transcription._id!.toString())}
                            disabled={isGeneratingNotes}
                            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isGeneratingNotes ? (
                              <>
                                <RefreshCw className="h-5 w-5 animate-spin" />
                                <span>Generating Notes...</span>
                              </>
                            ) : (
                              <>
                                <StickyNote className="h-5 w-5" />
                                <span>Generate AI Notes (1 token)</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
                            <div className="flex items-center space-x-2 text-yellow-800 mb-2">
                              <StickyNote className="h-5 w-5" />
                              <span className="font-medium">Need Tokens</span>
                            </div>
                            <p className="text-yellow-700 text-sm mb-3">
                              You need at least 1 token to generate AI notes for this transcription.
                            </p>
                            <button
                              onClick={() => router.push('/pricing')}
                              className="inline-flex items-center space-x-2 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                            >
                              <span>View Pricing</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Incomplete Transcription Message with Thumbnail */}
      {(transcription.status === 'pending' || transcription.status === 'processing') && (
        <div className="bg-gray-900 min-h-screen">
          <div className="max-w-6xl mx-auto px-4 py-16">
            <div className="text-center">
              {/* Video Thumbnail Section */}
              {transcription.thumbnail && (
                <div className="max-w-2xl mx-auto mb-8">
                  <a 
                    href={transcription.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block bg-black rounded-lg overflow-hidden aspect-video relative group cursor-pointer"
                  >
                    <img 
                      src={transcription.thumbnail} 
                      alt={transcription.title || 'Video thumbnail'}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-20 flex items-center justify-center transition-all">
                      <div className="w-20 h-20 bg-white bg-opacity-90 group-hover:bg-opacity-100 rounded-full flex items-center justify-center transition-all">
                        <Play className="h-8 w-8 text-gray-900 ml-1" />
                      </div>
                    </div>
                    <div className="absolute top-4 right-4 bg-black bg-opacity-70 group-hover:bg-opacity-80 text-white px-3 py-1 rounded text-sm transition-all">
                      Processing...
                    </div>
                    <div className="absolute bottom-4 right-4 bg-blue-600 bg-opacity-90 group-hover:bg-opacity-100 text-white px-3 py-1 rounded text-sm transition-all">
                      Click to watch
                    </div>
                  </a>
                  <div className="mt-4">
                    <a 
                      href={transcription.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors text-sm"
                    >
                      <Globe className="h-4 w-4" />
                      <span>View original video</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              )}
              
              {/* Fallback when no thumbnail is available */}
              {!transcription.thumbnail && (
                <div className="max-w-2xl mx-auto mb-8">
                  <a 
                    href={transcription.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block bg-gray-800 rounded-lg overflow-hidden aspect-video relative group cursor-pointer hover:bg-gray-700 transition-colors"
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-20 h-20 bg-white bg-opacity-90 group-hover:bg-opacity-100 rounded-full flex items-center justify-center transition-all mx-auto mb-4">
                          <Play className="h-8 w-8 text-gray-900 ml-1" />
                        </div>
                        <p className="text-white text-lg font-medium">Click to watch video</p>
                        <p className="text-gray-300 text-sm mt-1">Processing transcription...</p>
                      </div>
                    </div>
                    <div className="absolute top-4 right-4 bg-black bg-opacity-70 group-hover:bg-opacity-80 text-white px-3 py-1 rounded text-sm transition-all">
                      Processing...
                    </div>
                  </a>
                  <div className="mt-4">
                    <a 
                      href={transcription.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors text-sm"
                    >
                      <Globe className="h-4 w-4" />
                      <span>View original video</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              )}
              
              <RefreshCw className="h-16 w-16 text-blue-500 mx-auto mb-6 animate-spin" />
              <h2 className="text-2xl font-bold text-white mb-4">Processing Your Transcription</h2>
              <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                We're working on transcribing your audio. This page will automatically update when the transcription is complete.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Transcription</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete "<strong>{transcription?.title || 'Untitled Audio'}</strong>"? 
              This will permanently remove the transcription, notes, and any generated content.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTranscription}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {isDeleting && <RefreshCw className="h-4 w-4 animate-spin" />}
                <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  )
}
