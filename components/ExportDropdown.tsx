'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  Download, 
  FileText, 
  Database, 
  ChevronDown, 
  RefreshCw,
  Sparkles,
  Music
} from 'lucide-react'

interface ExportAction {
  id: string
  label: string
  icon: React.ReactNode
  description: string
  action: () => void
  disabled?: boolean
  loading?: boolean
  available?: boolean
}

interface ExportDropdownProps {
  transcriptionId: string
  hasTranscription: boolean
  hasNotes: boolean
  hasPRD: boolean
  hasAudio?: boolean
  onDownload: (id: string, type: 'transcription' | 'notes' | 'notion' | 'prd' | 'audio') => void
  onGeneratePRD: (id: string) => void
  onGenerateNotes?: (id: string) => void
  isGeneratingPRD: boolean
  isGeneratingNotes?: boolean
  isAuthenticated?: boolean
  userTokens?: {tokens: number, hasTokens: boolean} | null
}

export default function ExportDropdown({
  transcriptionId,
  hasTranscription,
  hasNotes,
  hasPRD,
  hasAudio = false,
  onDownload,
  onGeneratePRD,
  onGenerateNotes,
  isGeneratingPRD,
  isGeneratingNotes = false,
  isAuthenticated = false,
  userTokens
}: ExportDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const actions: ExportAction[] = [
    {
      id: 'transcription',
      label: 'Download Transcription (.txt)',
      icon: <FileText className="h-4 w-4" />,
      description: 'Raw transcribed text',
      action: () => onDownload(transcriptionId, 'transcription'),
      available: hasTranscription
    },
    {
      id: 'audio',
      label: 'Download Audio (.mp3)',
      icon: <Music className="h-4 w-4" />,
      description: 'Original audio file',
      action: () => onDownload(transcriptionId, 'audio'),
      available: hasAudio
    },
    {
      id: 'notes',
      label: 'Download Notes (.md)',
      icon: <Download className="h-4 w-4" />,
      description: isAuthenticated ? 'AI-generated structured notes' : 'Sign in required for AI notes',
      action: isAuthenticated ? () => onDownload(transcriptionId, 'notes') : () => window.location.href = '/auth/signin',
      available: isAuthenticated && hasNotes,
      disabled: !isAuthenticated
    },
    {
      id: 'notion',
      label: 'Download for Notion (.md)',
      icon: <Database className="h-4 w-4" />,
      description: isAuthenticated ? 'Formatted for Notion import' : 'Sign in required for Notion export',
      action: isAuthenticated ? () => onDownload(transcriptionId, 'notion') : () => window.location.href = '/auth/signin',
      available: isAuthenticated && hasNotes,
      disabled: !isAuthenticated
    },
    {
      id: 'generate-notes',
      label: isGeneratingNotes ? 'Generating Notes...' : 'Generate Notes',
      icon: isGeneratingNotes ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />,
      description: !isAuthenticated ? 'Sign in required for AI features' : 
                  !userTokens?.hasTokens ? 'No tokens remaining' : 
                  isGeneratingNotes ? 'AI is analyzing your transcription and creating structured notes...' :
                  'Generate AI notes from transcription',
      action: !isAuthenticated ? () => window.location.href = '/auth/signin' : 
              !userTokens?.hasTokens ? () => {} : 
              () => onGenerateNotes?.(transcriptionId),
      available: !hasNotes,
      disabled: isGeneratingNotes || !isAuthenticated || !userTokens?.hasTokens,
      loading: isGeneratingNotes
    },
    {
      id: 'generate-prd',
      label: isGeneratingPRD ? 'Generating PRD...' : 'Generate PRD',
      icon: isGeneratingPRD ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />,
      description: !isAuthenticated ? 'Sign in required for AI features' :
                  !userTokens?.hasTokens ? 'No tokens remaining' :
                  isGeneratingPRD ? 'AI is analyzing your notes and creating a comprehensive PRD...' : 'Create Product Requirements Document from your notes',
      action: !isAuthenticated ? () => window.location.href = '/auth/signin' : 
              !userTokens?.hasTokens ? () => {} : 
              () => onGeneratePRD(transcriptionId),
      disabled: isGeneratingPRD || !isAuthenticated || !userTokens?.hasTokens,
      loading: isGeneratingPRD,
      available: hasNotes && !hasPRD
    },
    {
      id: 'prd',
      label: 'Download PRD (.md)',
      icon: <FileText className="h-4 w-4" />,
      description: 'Product Requirements Document',
      action: () => onDownload(transcriptionId, 'prd'),
      available: hasPRD
    }
  ]

  const availableActions = actions.filter(action => action.available)
  
  if (availableActions.length === 0) {
    return null
  }

  const handleActionClick = (action: ExportAction) => {
    if (!action.disabled) {
      action.action()
      setIsOpen(false)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors min-h-[44px] ${
          isGeneratingPRD 
            ? 'text-purple-700 bg-purple-50 border border-purple-200 hover:bg-purple-100'
            : isGeneratingNotes
            ? 'text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100' 
            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
        }`}
      >
        {isGeneratingPRD ? (
          <RefreshCw className="h-4 w-4 animate-spin" />
        ) : isGeneratingNotes ? (
          <RefreshCw className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        <span className="hidden sm:inline">{isGeneratingPRD ? 'Generating PRD...' : isGeneratingNotes ? 'Generating Notes...' : 'Export'}</span>
        <span className="sm:hidden">{isGeneratingPRD ? 'PRD...' : isGeneratingNotes ? 'Notes...' : 'Export'}</span>
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 sm:w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-[200] py-1 max-h-[80vh] overflow-y-auto">
          <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-100">
            Export Options
          </div>
          
          {availableActions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleActionClick(action)}
              disabled={action.disabled}
              className={`w-full px-3 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors group min-h-[44px] ${
                action.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 p-1.5 rounded-md ${
                  action.id === 'generate-prd' 
                    ? action.loading 
                      ? 'bg-purple-100 text-purple-600 animate-pulse' 
                      : 'bg-purple-100 text-purple-600'
                    : action.id === 'generate-notes'
                    ? action.loading
                      ? 'bg-blue-100 text-blue-600 animate-pulse'
                      : 'bg-blue-100 text-blue-600'
                    : action.id === 'prd'
                    ? 'bg-green-100 text-green-600'
                    : action.id === 'notion'
                    ? 'bg-blue-100 text-blue-600'
                    : action.id === 'audio'
                    ? 'bg-orange-100 text-orange-600'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {action.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs sm:text-sm font-medium text-gray-900 group-hover:text-gray-700">
                    {action.label}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {action.description}
                  </div>
                  {action.loading && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div className="bg-purple-600 h-1 rounded-full animate-pulse" style={{width: '100%'}}></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
          
          {availableActions.length === 0 && (
            <div className="px-3 py-4 text-xs sm:text-sm text-gray-500 text-center">
              No export options available yet
            </div>
          )}
        </div>
      )}
    </div>
  )
}
