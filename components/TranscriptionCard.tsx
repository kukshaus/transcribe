'use client'

import { useState } from 'react'
import { Download, Clock, CheckCircle, XCircle, RefreshCw, FileText, StickyNote } from 'lucide-react'
import { Transcription } from '@/lib/models/Transcription'

interface TranscriptionCardProps {
  transcription: Transcription
  onDownload: (id: string, type: 'transcription' | 'notes') => void
}

export default function TranscriptionCard({ transcription, onDownload }: TranscriptionCardProps) {
  const [activeTab, setActiveTab] = useState<'transcription' | 'notes'>('transcription')

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

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {transcription.title || 'Untitled Audio'}
          </h3>
          <p className="text-sm text-gray-500 break-all mb-3">
            {transcription.url}
          </p>
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
      </div>

      {transcription.error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{transcription.error}</p>
        </div>
      )}

      {transcription.status === 'completed' && (transcription.content || transcription.notes) && (
        <div className="space-y-4">
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('transcription')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'transcription'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>Transcription</span>
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'notes'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <StickyNote className="h-4 w-4" />
              <span>Notes</span>
            </button>
          </div>

          {/* Content Display */}
          <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
            {activeTab === 'transcription' && transcription.content && (
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {transcription.content}
                </p>
              </div>
            )}
            {activeTab === 'notes' && transcription.notes && (
              <div className="prose prose-sm max-w-none">
                <div 
                  className="text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ 
                    __html: transcription.notes.replace(/\n/g, '<br/>') 
                  }}
                />
              </div>
            )}
          </div>

          {/* Download Buttons */}
          <div className="flex space-x-3">
            {transcription.content && (
              <button
                onClick={() => onDownload(transcription._id!, 'transcription')}
                className="btn-secondary flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Download Transcription</span>
              </button>
            )}
            {transcription.notes && (
              <button
                onClick={() => onDownload(transcription._id!, 'notes')}
                className="btn-secondary flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Download Notes</span>
              </button>
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
