'use client'

import { useState, useEffect } from 'react'
import { useSession, signIn } from 'next-auth/react'
import UrlInput from '@/components/UrlInput'
import TranscriptionCard from '@/components/TranscriptionCard'
import SetupGuide from '@/components/SetupGuide'
import Header from '@/components/Header'
import Logo from '@/components/Logo'
import RotatingText from '@/components/RotatingText'
import { ToastContainer, useToast } from '@/components/Toast'
import { Transcription } from '@/lib/models/Transcription'
import { RefreshCw, AlertTriangle, HelpCircle, ChevronDown, ChevronUp, Lock } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  const { data: session, status } = useSession()
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showSetupGuide, setShowSetupGuide] = useState(false)
  const [showHowItWorks, setShowHowItWorks] = useState(false)
  const [hasFFmpegError, setHasFFmpegError] = useState(false)
  const [usageInfo, setUsageInfo] = useState<{canUse: boolean, remainingUses: number, limit: number} | null>(null)
  const [userTokens, setUserTokens] = useState<{tokens: number, hasTokens: boolean} | null>(null)
  const { toasts, removeToast, success, error, warning } = useToast()

  // Fetch transcriptions and usage info
  useEffect(() => {
    fetchTranscriptions()
    fetchUsageInfo()
    if (session) {
      fetchUserTokens()
      // Try to transfer any anonymous tokens to the authenticated user
      transferAnonymousTokens()
    }
  }, [session])

  const transferAnonymousTokens = async () => {
    try {
      const response = await fetch('/api/auth/transfer-tokens', {
        method: 'POST',
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.tokensTransferred > 0) {
          success(`🎉 ${data.message}`)
          // Refresh user tokens to show the updated count
          fetchUserTokens()
        }
      }
    } catch (error) {
      console.error('Error transferring anonymous tokens:', error)
      // Don't show error to user as this is a background operation
    }
  }

  const fetchUsageInfo = async () => {
    try {
      const response = await fetch('/api/usage')
      if (response.ok) {
        const data = await response.json()
        setUsageInfo(data)
      }
    } catch (error) {
      console.error('Error fetching usage info:', error)
    }
  }

  const fetchUserTokens = async () => {
    if (!session) return
    
    try {
      const response = await fetch('/api/user/tokens')
      if (response.ok) {
        const data = await response.json()
        setUserTokens(data)
      }
    } catch (error) {
      console.error('Error fetching user tokens:', error)
    }
  }

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
      } else if (response.status === 401) {
        // Handle authentication error for authenticated endpoints
        setTranscriptions([])
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
        await fetchUsageInfo() // Update usage info
        if (session) {
          await fetchUserTokens() // Update token count if authenticated
        }
      } else {
        const errorData = await response.json()
        if (errorData.code === 'LIMIT_REACHED') {
          error('Usage Limit Reached', 'You have reached your free transcription limit. Sign in to continue with more features!')
        } else {
          error('Error', errorData.error || 'Failed to process transcription')
        }
      }
    } catch (error) {
      console.error('Error submitting URL:', error)
      alert('Error submitting URL. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = async (id: string, type: 'transcription' | 'notes' | 'notion' | 'prd' | 'audio') => {
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
        
        // Show success feedback
        const typeNames = {
          transcription: 'Transcription',
          notes: 'Notes',
          notion: 'Notion File',
          prd: 'PRD',
          audio: 'Audio File'
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

  const handleGenerateNotes = async (transcriptionId: string) => {
    try {
      const transcription = transcriptions.find(t => t._id?.toString() === transcriptionId)
      const title = transcription?.title || 'transcription'
      
      warning('Generating Notes...', `Creating AI notes for "${title}"`)
      
      const startTime = Date.now()
      
      const response = await fetch('/api/generate-notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcriptionId }),
      })

      const result = await response.json()

      if (response.ok) {
        const duration = ((Date.now() - startTime) / 1000).toFixed(1)
        
        success(
          'Notes Ready!',
          `AI notes created in ${duration}s. Tokens remaining: ${result.remainingTokens}`
        )
        
        await fetchTranscriptions()
        await fetchUserTokens()
      } else {
        if (result.code === 'INSUFFICIENT_TOKENS') {
          error('No Tokens', 'You need tokens to generate notes. Purchase more tokens to continue.')
        } else {
          error('Generation Failed', result.error || 'Failed to generate notes')
        }
      }
    } catch (networkError) {
      console.error('Error generating notes:', networkError)
      error('Connection Error', 'Please check your internet connection and try again.')
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
          `Requirements document created in ${duration}s. Tokens remaining: ${result.remainingTokens}`
        )
        
        // Refresh the transcriptions to show the new PRD
        await fetchTranscriptions()
        await fetchUserTokens()
      } else {
        // More detailed error messages
        if (result.code === 'INSUFFICIENT_TOKENS') {
          error('No Tokens', 'You need tokens to generate PRD. Purchase more tokens to continue.')
        } else {
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
      }
    } catch (networkError) {
      console.error('Error generating PRD:', networkError)
      error(
        'Connection Error',
        'Please check your internet connection and try again.'
      )
    }
  }

  const handleDeleteTranscription = async (transcriptionId: string) => {
    try {
      const transcription = transcriptions.find(t => t._id?.toString() === transcriptionId)
      const title = transcription?.title || 'transcription'
      
      const response = await fetch(`/api/transcriptions/${transcriptionId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Remove the transcription from the local state immediately for better UX
        setTranscriptions(prev => prev.filter(t => t._id?.toString() !== transcriptionId))
        
        success(
          'Deleted Successfully',
          `"${title}" has been permanently removed.`
        )
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
    }
  }

  return (
    <>
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center px-4 pt-16">
        <div className="max-w-5xl mx-auto text-center">
          {/* FFmpeg Setup Warning */}
          {hasFFmpegError && (
            <div className="mb-12 max-w-3xl mx-auto bg-amber-900/20 border border-amber-400/30 rounded-lg p-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-6 w-6 text-amber-400 mt-0.5" />
                <div className="flex-1 text-left">
                  <h3 className="font-medium text-amber-200 text-lg">Setup Required</h3>
                  <p className="text-amber-300 mt-2">
                    FFmpeg is required for some audio formats. Click the setup guide to learn how to install it.
                  </p>
                  <button
                    onClick={() => setShowSetupGuide(true)}
                    className="mt-3 font-medium text-amber-200 hover:text-amber-100 underline"
                  >
                    View Setup Guide
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Hero Content */}
          <div className="mb-16"></div>
          
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-10 leading-tight">
            <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              <RotatingText />
            </span> Transcript Generator
          </h1>
          
          <p className="text-2xl md:text-3xl text-gray-300 mb-16 max-w-3xl mx-auto">
            No file uploads required. Get transcripts in seconds.
          </p>

          {/* URL Input Section */}
          <div id="url-input-section" className="max-w-3xl mx-auto mb-12">
            {status === 'loading' ? (
              <div className="flex justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
              </div>
            ) : (
              <div>
                <UrlInput onSubmit={handleUrlSubmit} isLoading={isLoading} />
                
                {/* Usage Information */}
                <div className="mt-6 text-center">
                  {!session ? (
                    // Anonymous user - show free usage
                    usageInfo && (
                      <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
                        <div className="flex items-center justify-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${usageInfo.canUse ? 'bg-green-400' : 'bg-red-400'}`}></div>
                            <span className="text-white font-medium">
                              {usageInfo.remainingUses} free transcriptions remaining
                            </span>
                          </div>
                          <button
                            onClick={() => signIn()}
                            className="text-purple-300 hover:text-purple-200 font-medium underline"
                          >
                            Sign in for AI features
                          </button>
                        </div>
                        {!usageInfo.canUse && (
                          <div className="mt-3 text-amber-300 text-sm">
                            Free limit reached. Sign in to continue with unlimited transcriptions and AI features!
                          </div>
                        )}
                      </div>
                    )
                  ) : null}
                </div>
              </div>
            )}
          </div>

          {/* Supported Sources */}
          <div className="max-w-2xl mx-auto mb-16">
            <p className="text-gray-400 text-center mb-6">Supported platforms</p>
            <div className="flex justify-center items-center space-x-8">
              <div className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors">
                <div className="w-6 h-6 bg-red-500 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </div>
                <span className="text-sm font-medium">YouTube</span>
              </div>



              <div className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors">
                <div className="w-6 h-6 bg-orange-500 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M1.175 0C.526 0 0 .526 0 1.175v21.65C0 23.474.526 24 1.175 24h21.65c.649 0 1.175-.526 1.175-1.175V1.175C24 .526 23.474 0 22.825 0H1.175zm19.95 13.462c-1.577 4.99-5.431 8.674-10.287 9.546-.711.128-1.428.2-2.163.2-.735 0-1.452-.072-2.163-.2-4.856-.872-8.71-4.556-10.287-9.546-.128-.407-.128-.844 0-1.251C2.802 7.22 6.656 3.536 11.512 2.664c.711-.128 1.428-.2 2.163-.2.735 0 1.452.072 2.163.2 4.856.872 8.71 4.556 10.287 9.546.128.407.128.844 0 1.251z"/>
                  </svg>
                </div>
                <span className="text-sm font-medium">SoundCloud</span>
              </div>

              <div className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors">
                <div className="w-6 h-6 bg-purple-500 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2.25c5.385 0 9.75 4.365 9.75 9.75s-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12 6.615 2.25 12 2.25zM9 7.5v9l6-4.5L9 7.5z"/>
                  </svg>
                </div>
                <span className="text-sm font-medium">Audio</span>
              </div>
            </div>
          </div>

          {/* How it Works Button */}
          <div className="max-w-2xl mx-auto mb-16">
            <button
              onClick={() => setShowHowItWorks(!showHowItWorks)}
              className="inline-flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white font-medium py-4 px-8 rounded-lg transition-all duration-200 border border-white/20"
            >
              <HelpCircle className="h-5 w-5" />
              <span>How to get the transcript of any audio</span>
              {showHowItWorks ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </button>

            {/* Collapsible How it Works Section */}
            {showHowItWorks && (
              <div className="mt-8 bg-white/5 rounded-xl p-8 border border-white/10 backdrop-blur-sm">
                <div className="grid gap-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      1
                    </div>
                    <div className="text-left">
                      <h4 className="text-white font-semibold mb-2 text-lg">Copy the Audio URL</h4>
                      <p className="text-gray-300">Copy the URL from YouTube, SoundCloud, Vimeo, or any supported platform</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      2
                    </div>
                    <div className="text-left">
                      <h4 className="text-white font-semibold mb-2 text-lg">Paste the URL above</h4>
                      <p className="text-gray-300">Simply paste the copied URL above and click "Get Video Transcript"</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      3
                    </div>
                    <div className="text-left">
                      <h4 className="text-white font-semibold mb-2 text-lg">View the Audio Transcript</h4>
                      <p className="text-gray-300">Instantly view, copy and download the audio transcript text without entering your email</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Transcriptions Section */}
      {transcriptions.length > 0 && (
        <section id="transcriptions" className="bg-gray-50 min-h-screen py-16">
          <div className="max-w-4xl mx-auto px-4">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                {session ? 'Your Transcriptions' : 'Recent Transcriptions'}
              </h2>
              <p className="text-gray-600 mt-2">
                {session 
                  ? 'Manage your audio transcriptions and generated content' 
                  : 'Your free transcriptions (stored locally for this session)'
                }
              </p>
            </div>

            <div className="space-y-6">
              {transcriptions.map((transcription) => (
                <TranscriptionCard
                  key={transcription._id?.toString()}
                  transcription={transcription}
                  onDownload={handleDownload}
                  onGeneratePRD={handleGeneratePRD}
                  onGenerateNotes={handleGenerateNotes}
                  isAuthenticated={!!session}
                  userTokens={userTokens}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Setup Guide Modal */}
      {showSetupGuide && (
        <SetupGuide onClose={() => setShowSetupGuide(false)} />
      )}

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  )
}
