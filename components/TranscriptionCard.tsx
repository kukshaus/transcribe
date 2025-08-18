'use client'

import { useState } from 'react'
import { Clock, CheckCircle, XCircle, RefreshCw, FileText, StickyNote, ExternalLink, Trash2 } from 'lucide-react'
import { Transcription } from '@/lib/models/Transcription'
import { marked } from 'marked'
import ExportDropdown from './ExportDropdown'

interface TranscriptionCardProps {
  transcription: Transcription
  onDownload: (id: string, type: 'transcription' | 'notes' | 'notion' | 'prd') => void
  onGeneratePRD?: (id: string) => void
  onGenerateNotes?: (id: string) => void
  onDelete?: (id: string) => void
  isAuthenticated?: boolean
  userTokens?: {tokens: number, hasTokens: boolean} | null
}

export default function TranscriptionCard({ transcription, onDownload, onGeneratePRD, onGenerateNotes, onDelete, isAuthenticated = false, userTokens }: TranscriptionCardProps) {
  const [activeTab, setActiveTab] = useState<'transcription' | 'notes'>('transcription')
  const [isGeneratingPRD, setIsGeneratingPRD] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const getStatusIcon = () => {
    switch (transcription.status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'processing':
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
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

  const handleGeneratePRD = async () => {
    if (!onGeneratePRD) return
    
    setIsGeneratingPRD(true)
    try {
      await onGeneratePRD(transcription._id!.toString())
    } finally {
      setIsGeneratingPRD(false)
    }
  }

  const handleDelete = async () => {
    if (!onDelete) return
    
    setIsDeleting(true)
    try {
      await onDelete(transcription._id!.toString())
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  return (
    <div 
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer group"
      onClick={() => window.location.href = `/transcriptions/${transcription._id}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 pr-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            <a 
              href={`/transcriptions/${transcription._id}`}
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              {transcription.title || 'Untitled Audio'}
            </a>
          </h3>
          <p className="text-sm text-gray-500 break-all mb-3">
            <a 
              href={transcription.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-blue-600 transition-colors inline-flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              {transcription.url}
              <ExternalLink className="h-3 w-3" />
            </a>
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {getStatusIcon()}
                <span className={getStatusClass()}>
                  {transcription.status.charAt(0).toUpperCase() + transcription.status.slice(1)}
                </span>
              </div>
              {transcription.duration && (
                <span className="text-sm text-gray-500">
                  Duration: {formatDuration(transcription.duration)}
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
              <div className="flex items-center justify-between text-sm">
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
                <div className="text-sm text-gray-600 italic">
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

          {/* Completed Progress */}
          {transcription.progress && transcription.status === 'completed' && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-green-700">
                  ✓ {transcription.progress.currentStep}
                </span>
                <span className="text-green-600">100%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full w-full"></div>
              </div>
            </div>
          )}

          {/* Error Progress */}
          {transcription.progress && transcription.status === 'error' && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
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
        <div className="flex items-start space-x-3">
          {/* Delete Button */}
          <div className="flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowDeleteConfirm(true)
              }}
              disabled={isDeleting}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete transcription"
            >
              <Trash2 className={`h-4 w-4 ${isDeleting ? 'animate-pulse' : ''}`} />
            </button>
          </div>

          {/* Video Thumbnail */}
          {transcription.thumbnail && (
            <div className="flex-shrink-0">
              <a 
                href={transcription.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative w-32 h-20 rounded-lg overflow-hidden shadow-sm border border-gray-200 group-hover:shadow-md transition-shadow">
                  <img 
                    src={transcription.thumbnail} 
                    alt={transcription.title || 'Video thumbnail'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    onError={(e) => {
                      // Hide thumbnail if image fails to load
                      e.currentTarget.parentElement?.parentElement?.parentElement?.style.setProperty('display', 'none')
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
                    <ExternalLink className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </div>
                </div>
              </a>
            </div>
          )}
        </div>
      </div>

      {transcription.error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{transcription.error}</p>
        </div>
      )}

      {transcription.status === 'completed' && (transcription.content || transcription.notes) && (
        <div className="space-y-4">
          {/* Tab Navigation */}
          <div className="flex justify-between items-center">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setActiveTab('transcription')
                }}
                className={`flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === 'transcription'
                    ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <FileText className="h-4 w-4" />
                <span>Transcription</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setActiveTab('notes')
                }}
                className={`flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === 'notes'
                    ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <StickyNote className="h-4 w-4" />
                <span>Notes</span>
                {transcription.notes && (
                  <span className="ml-1 inline-flex items-center justify-center w-2 h-2 bg-green-400 rounded-full"></span>
                )}
              </button>
            </div>
            
            {/* Export dropdown moved to tab area for better UX */}
            <div onClick={(e) => e.stopPropagation()}>
              <ExportDropdown
                transcriptionId={transcription._id!.toString()}
                hasTranscription={!!transcription.content}
                hasNotes={!!transcription.notes}
                hasPRD={!!transcription.prd}
                onDownload={onDownload}
                onGeneratePRD={onGeneratePRD || (() => {})}
                onGenerateNotes={onGenerateNotes || (() => {})}
                isGeneratingPRD={isGeneratingPRD}
                isAuthenticated={isAuthenticated}
                userTokens={userTokens}
              />
            </div>
          </div>

          {/* Content Display */}
          <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto border border-gray-100">
            {activeTab === 'transcription' && transcription.content && (
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {transcription.content}
                </p>
              </div>
            )}
            {activeTab === 'notes' && (
              <div>
                {transcription.notes ? (
                  <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-strong:text-gray-900">
                    <div 
                      className="text-gray-700 leading-relaxed"
                      dangerouslySetInnerHTML={{ 
                        __html: marked(transcription.notes, { 
                          breaks: true,
                          gfm: true
                        })
                      }}
                    />
                  </div>
                ) : !isAuthenticated ? (
                  <div className="text-center py-8">
                    <StickyNote className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-700 mb-2">AI Notes Available with Sign In</h4>
                    <p className="text-gray-500 mb-4">
                      Get AI-generated structured notes and summaries. Sign in to unlock this feature.
                    </p>
                    <button
                      onClick={() => window.location.href = '/auth/signin'}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
                    >
                      Sign In for AI Features
                    </button>
                  </div>
                ) : userTokens && !userTokens.hasTokens ? (
                  <div className="text-center py-8">
                    <StickyNote className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-700 mb-2">No Tokens Remaining</h4>
                    <p className="text-gray-500 mb-4">
                      You need tokens to generate AI notes. Purchase more tokens to continue.
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <StickyNote className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-700 mb-2">No Notes Generated</h4>
                    <p className="text-gray-500 mb-4">
                      AI notes are not available for this transcription yet. Use the export menu to generate them.
                    </p>
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
              Are you sure you want to delete "<strong>{transcription.title || 'Untitled Audio'}</strong>"? 
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
                onClick={handleDelete}
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
    </div>
  )
}
