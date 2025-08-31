'use client'

import { useState } from 'react'
import { Clock, CheckCircle, XCircle, RefreshCw, FileText, StickyNote, ExternalLink, ScrollText, User, Fingerprint } from 'lucide-react'
import { Transcription } from '@/lib/models/Transcription'
import { marked } from 'marked'
import ExportDropdown from './ExportDropdown'

interface AdminTranscriptionCardProps {
  transcription: Transcription & {
    userInfo: {
      type: 'registered' | 'anonymous' | 'unknown'
      name?: string
      email?: string
      userId?: string
      fingerprint?: string
      ip?: string
    }
  }
  onDownload: (id: string, type: 'transcription' | 'notes' | 'notion' | 'prd' | 'audio') => void
  onGeneratePRD?: (id: string) => void
  onGenerateNotes?: (id: string) => void
}

export default function AdminTranscriptionCard({ transcription, onDownload, onGeneratePRD, onGenerateNotes }: AdminTranscriptionCardProps) {
  const [activeTab, setActiveTab] = useState<'transcription' | 'notes' | 'prd'>('transcription')
  const [isGeneratingPRD, setIsGeneratingPRD] = useState(false)
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false)

  const getStatusIcon = () => {
    switch (transcription.status) {
      case 'pending':
        return <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
      case 'processing':
        return <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 animate-spin" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
      case 'error':
        return <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
    }
  }

  const getStatusClass = () => {
    switch (transcription.status) {
      case 'pending':
        return 'status-pending'
      case 'processing':
        return 'status-processing'
      case 'completed':
        return 'status-completed'
      case 'error':
        return 'status-error'
    }
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'Unknown'
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const formatProcessingDuration = (milliseconds?: number) => {
    if (!milliseconds) return null
    const seconds = Math.round(milliseconds / 1000)
    if (seconds < 60) {
      return `${seconds}s`
    } else {
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      return `${minutes}m ${remainingSeconds}s`
    }
  }

  const detectPlatform = (url: string): { name: string; icon: JSX.Element; bgColor: string; textColor: string } => {
    try {
      const urlObj = new URL(url)
      const hostname = urlObj.hostname.toLowerCase().replace('www.', '')
      
      if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
        return { 
          name: 'YouTube', 
          icon: <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>,
          bgColor: 'bg-red-50', 
          textColor: 'text-red-700' 
        }
      } else if (hostname.includes('soundcloud.com')) {
        return { 
          name: 'SoundCloud', 
          icon: <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M1.175 0C.526 0 0 .526 0 1.175v21.65C0 23.474.526 24 1.175 24h21.65c.649 0 1.175-.526 1.175-1.175V1.175C24 .526 23.474 0 22.825 0H1.175zm19.95 13.462c-1.577 4.99-5.431 8.674-10.287 9.546-.711.128-1.428.2-2.163.2-.735 0-1.452-.072-2.163-.2-4.856-.872-8.71-4.556-10.287-9.546-.128-.407-.128-.844 0-1.251C2.802 7.22 6.656 3.536 11.512 2.664c.711-.128 1.428-.2 2.163-.2.735 0 1.452.072 2.163.2 4.856.872 8.71 4.556 10.287 9.546.128.407.128.844 0 1.251z"/></svg>,
          bgColor: 'bg-orange-50', 
          textColor: 'text-orange-700' 
        }
      } else {
        return { 
          name: 'Audio', 
          icon: <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>,
          bgColor: 'bg-blue-50', 
          textColor: 'text-blue-700' 
        }
      }
    } catch {
      return { 
        name: 'Audio', 
        icon: <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>,
        bgColor: 'bg-blue-50', 
        textColor: 'text-blue-700' 
      }
    }
  }

  const handleGeneratePRD = async () => {
    if (!onGeneratePRD) return
    
    setIsGeneratingPRD(true)
    try {
      await onGeneratePRD(transcription._id!.toString())
    } finally {
      setIsGeneratingPRD(false)
    }
  }

  const handleGenerateNotes = async () => {
    if (!onGenerateNotes) return
    
    setIsGeneratingNotes(true)
    try {
      await onGenerateNotes(transcription._id!.toString())
    } finally {
      setIsGeneratingNotes(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex flex-col sm:flex-row items-start justify-between mb-4 space-y-4 sm:space-y-0">
        <div className="flex-1 pr-0 sm:pr-4 w-full sm:w-auto">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
            <a 
              href={`/transcriptions/${transcription._id}`}
              target="_blank"
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              {transcription.title || 'Untitled Audio'}
            </a>
          </h3>
          
          {/* Source URL */}
          <p className="text-xs sm:text-sm text-gray-500 break-all mb-3">
            <a 
              href={transcription.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-blue-600 transition-colors inline-flex items-center gap-1"
            >
              {transcription.url}
              <ExternalLink className="h-3 w-3" />
            </a>
          </p>

          {/* User Information */}
          <div className="flex items-center space-x-2 mb-3">
            {transcription.userInfo.type === 'registered' ? (
              <div className="flex items-center space-x-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                <User className="h-3 w-3" />
                <span>{transcription.userInfo.name || 'Unknown'} ({transcription.userInfo.email})</span>
              </div>
            ) : transcription.userInfo.type === 'anonymous' ? (
              <div className="flex items-center space-x-1 text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                <Fingerprint className="h-3 w-3" />
                <span>Anonymous ({transcription.userInfo.fingerprint?.substring(0, 8)}...)</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                <span>Unknown User</span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-2">
                {getStatusIcon()}
                <span className={`text-xs sm:text-sm ${getStatusClass()}`}>
                  {transcription.status.charAt(0).toUpperCase() + transcription.status.slice(1)}
                </span>
              </div>
              
              {/* Platform Badge */}
              <div className={`inline-flex items-center space-x-1.5 px-2 py-1 rounded-md text-xs font-medium border ${detectPlatform(transcription.url).bgColor} ${detectPlatform(transcription.url).textColor} border-current border-opacity-20`}>
                {detectPlatform(transcription.url).icon}
                <span>{detectPlatform(transcription.url).name}</span>
              </div>
              
              {transcription.duration && (
                <span className="text-xs sm:text-sm text-gray-500">
                  Duration: {formatDuration(transcription.duration)}
                </span>
              )}
              {(transcription.status === 'completed' || transcription.status === 'error') && 
               transcription.processingDuration && (
                <span className="text-xs sm:text-sm text-gray-500">
                  Processed in: {formatProcessingDuration(transcription.processingDuration)}
                </span>
              )}
            </div>
            
            {/* Quick export indicator */}
            {transcription.status === 'completed' && (transcription.content || transcription.notes) && (
              <div className="flex items-center space-x-1 text-xs text-gray-400">
                <span>{transcription.content ? '📄' : ''}</span>
                <span>{transcription.notes ? '📝' : ''}</span>
                <span>{transcription.prd ? '📋' : ''}</span>
              </div>
            )}
          </div>

          {/* Progress Bar and Details */}
          {transcription.progress && transcription.status === 'processing' && (
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-medium text-gray-700">
                  Step {transcription.progress.stepNumber} of {transcription.progress.totalSteps}: {transcription.progress.currentStep}
                </span>
                <span className="text-gray-500">{transcription.progress.percentage}%</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${transcription.progress.percentage}%` }}
                ></div>
              </div>
              
              {transcription.progress.details && (
                <div className="text-xs sm:text-sm text-gray-600 italic">
                  {transcription.progress.details.includes('chunk') ? (
                    <div className="flex items-center space-x-2">
                      <div className="flex-shrink-0">
                        <div className="animate-pulse-slow w-2 h-2 bg-indigo-400 rounded-full"></div>
                      </div>
                      <span>{transcription.progress.details}</span>
                    </div>
                  ) : (
                    <span>{transcription.progress.details}</span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Error Progress */}
          {transcription.progress && transcription.status === 'error' && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-medium text-red-700">
                  ✗ {transcription.progress.currentStep}
                </span>
                <span className="text-red-600">Failed</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full w-1/4"></div>
              </div>
            </div>
          )}
        </div>
        
        {/* Actions and Thumbnail */}
        <div className="flex items-start space-x-3 w-full sm:w-auto">
          {/* Video Thumbnail */}
          {transcription.thumbnail && (
            <div className="flex-shrink-0">
              <a 
                href={transcription.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block"
              >
                <div className="relative w-24 h-16 sm:w-32 sm:h-20 rounded-lg overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <img 
                    src={transcription.thumbnail} 
                    alt={transcription.title || 'Video thumbnail'}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                    onError={(e) => {
                      // Hide thumbnail if image fails to load
                      e.currentTarget.parentElement?.parentElement?.parentElement?.style.setProperty('display', 'none')
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
                    <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 text-white opacity-0 hover:opacity-100 transition-opacity duration-200" />
                  </div>
                </div>
              </a>
            </div>
          )}
        </div>
      </div>

      {transcription.error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-xs sm:text-sm">{transcription.error}</p>
        </div>
      )}

      {transcription.status === 'completed' && (transcription.content || transcription.notes) && (
        <div className="space-y-4">
          {/* Tab Navigation */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-full sm:w-auto">
              <button
                onClick={() => setActiveTab('transcription')}
                className={`flex items-center justify-center py-2 px-3 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 flex-1 sm:flex-none ${
                  activeTab === 'transcription'
                    ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span>Transcription</span>
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`flex items-center justify-center py-2 px-3 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 flex-1 sm:flex-none ${
                  activeTab === 'notes'
                    ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span>Notes</span>
                {transcription.notes && (
                  <span className="ml-1 inline-flex items-center justify-center w-2 h-2 bg-green-400 rounded-full"></span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('prd')}
                className={`flex items-center justify-center py-2 px-3 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 flex-1 sm:flex-none ${
                  activeTab === 'prd'
                    ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                title="Product Requirements Document (PRD)"
              >
                <span>PRD</span>
                {transcription.prd && (
                  <span className="ml-1 inline-flex items-center justify-center w-2 h-2 bg-green-400 rounded-full"></span>
                )}
              </button>
            </div>
            
            {/* Export dropdown */}
            <div className="w-full sm:w-auto">
              <ExportDropdown
                transcriptionId={transcription._id!.toString()}
                hasTranscription={!!transcription.content}
                hasNotes={!!transcription.notes}
                hasPRD={!!transcription.prd}
                hasAudio={!!transcription.audioFile}
                onDownload={onDownload}
                onGeneratePRD={handleGeneratePRD}
                onGenerateNotes={handleGenerateNotes}
                isGeneratingPRD={isGeneratingPRD}
                isGeneratingNotes={isGeneratingNotes}
                isAuthenticated={true}
                userTokens={{ tokens: 999999, hasTokens: true }}
              />
            </div>
          </div>

          {/* Content Display */}
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4 max-h-48 sm:max-h-64 overflow-y-auto border border-gray-100">
            {activeTab === 'transcription' && transcription.content && (
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
                  {transcription.content}
                </p>
              </div>
            )}
            {activeTab === 'notes' && (
              <div>
                {transcription.notes ? (
                  <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-strong:text-gray-900">
                    <div 
                      className="text-gray-700 leading-relaxed text-sm sm:text-base"
                      dangerouslySetInnerHTML={{ 
                        __html: marked(transcription.notes, { 
                          breaks: true,
                          gfm: true
                        })
                      }}
                    />
                  </div>
                ) : (
                  <div className="text-center py-3 sm:py-4">
                    <StickyNote className="h-8 w-8 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-2 sm:mb-4" />
                    <h4 className="text-base sm:text-lg font-medium text-gray-700 mb-2">No Notes Generated</h4>
                    <p className="text-gray-500 mb-3 sm:mb-4 text-sm sm:text-base">
                      AI notes are not available for this transcription yet.
                    </p>
                    <button
                      onClick={handleGenerateNotes}
                      disabled={isGeneratingNotes}
                      className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {isGeneratingNotes ? (
                        <>
                          <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                          <span>Generating Notes...</span>
                        </>
                      ) : (
                        <>
                          <StickyNote className="h-4 w-4 sm:h-5 sm:w-5" />
                          <span>Generate AI Notes</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'prd' && (
              <div>
                {transcription.prd ? (
                  <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-strong:text-gray-900">
                    <div 
                      className="text-gray-700 leading-relaxed text-sm sm:text-base"
                      dangerouslySetInnerHTML={{ 
                        __html: marked(transcription.prd, { 
                          breaks: true,
                          gfm: true
                        })
                      }}
                    />
                  </div>
                ) : !transcription.notes ? (
                  <div className="text-center py-3 sm:py-4">
                    <ScrollText className="h-8 w-8 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-2 sm:mb-4" />
                    <h4 className="text-base sm:text-lg font-medium text-gray-700 mb-2">Notes Required First</h4>
                    <p className="text-gray-500 mb-3 sm:mb-4 text-sm sm:text-base">
                      You need to generate AI notes before creating a PRD. Generate notes first, then return here to create a comprehensive Product Requirements Document.
                    </p>
                    <button
                      onClick={() => setActiveTab('notes')}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-2 px-3 sm:px-4 rounded-lg transition-all duration-200 text-sm"
                    >
                      Go to Notes Tab
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-3 sm:py-4">
                    <ScrollText className="h-8 w-8 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-2 sm:mb-4" />
                    <h4 className="text-base sm:text-lg font-medium text-gray-700 mb-2">No PRD Generated</h4>
                    <p className="text-gray-500 mb-3 sm:mb-4 text-sm sm:text-base">
                      AI-generated Product Requirements Document is not available for this transcription yet.
                    </p>
                    <button
                      onClick={handleGeneratePRD}
                      disabled={isGeneratingPRD}
                      className="inline-flex items-center space-x-2 bg-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      title="Generate a comprehensive Product Requirements Document (PRD) from your AI-generated notes."
                    >
                      {isGeneratingPRD ? (
                        <>
                          <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                          <span>Generating PRD...</span>
                        </>
                      ) : (
                        <>
                          <ScrollText className="h-4 w-4 sm:h-5 sm:w-5" />
                          <span>Generate PRD</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-400">
        Created: {new Date(transcription.createdAt).toLocaleString()}
      </div>
    </div>
  )
}
