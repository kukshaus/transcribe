'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  Download, 
  FileText, 
  Database, 
  ChevronDown, 
  RefreshCw,
  Sparkles
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
  onDownload: (id: string, type: 'transcription' | 'notes' | 'notion' | 'prd') => void
  onGeneratePRD: (id: string) => void
  isGeneratingPRD: boolean
}

export default function ExportDropdown({
  transcriptionId,
  hasTranscription,
  hasNotes,
  hasPRD,
  onDownload,
  onGeneratePRD,
  isGeneratingPRD
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
      label: 'Download Transcription',
      icon: <FileText className="h-4 w-4" />,
      description: 'Raw transcribed text',
      action: () => onDownload(transcriptionId, 'transcription'),
      available: hasTranscription
    },
    {
      id: 'notes',
      label: 'Download Notes',
      icon: <Download className="h-4 w-4" />,
      description: 'AI-generated structured notes',
      action: () => onDownload(transcriptionId, 'notes'),
      available: hasNotes
    },
    {
      id: 'notion',
      label: 'Download for Notion',
      icon: <Database className="h-4 w-4" />,
      description: 'Formatted for Notion import',
      action: () => onDownload(transcriptionId, 'notion'),
      available: hasNotes
    },
    {
      id: 'generate-prd',
      label: isGeneratingPRD ? 'Generating PRD...' : 'Generate PRD',
      icon: isGeneratingPRD ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />,
      description: isGeneratingPRD ? 'AI is analyzing your notes and creating a comprehensive PRD...' : 'Create Product Requirements Document from your notes',
      action: () => onGeneratePRD(transcriptionId),
      disabled: isGeneratingPRD,
      loading: isGeneratingPRD,
      available: hasNotes && !hasPRD
    },
    {
      id: 'prd',
      label: 'Download PRD',
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
        className={`inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${
          isGeneratingPRD 
            ? 'text-purple-700 bg-purple-50 border border-purple-200 hover:bg-purple-100' 
            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
        }`}
      >
        {isGeneratingPRD ? (
          <RefreshCw className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        <span>{isGeneratingPRD ? 'Generating...' : 'Export'}</span>
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
          <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-100">
            Export Options
          </div>
          
          {availableActions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleActionClick(action)}
              disabled={action.disabled}
              className={`w-full px-3 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors group ${
                action.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 p-1.5 rounded-md ${
                  action.id === 'generate-prd' 
                    ? action.loading 
                      ? 'bg-purple-100 text-purple-600 animate-pulse' 
                      : 'bg-purple-100 text-purple-600'
                    : action.id === 'prd'
                    ? 'bg-green-100 text-green-600'
                    : action.id === 'notion'
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {action.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 group-hover:text-gray-700">
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
            <div className="px-3 py-4 text-sm text-gray-500 text-center">
              No export options available yet
            </div>
          )}
        </div>
      )}
    </div>
  )
}
