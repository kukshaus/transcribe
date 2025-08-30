'use client'

import { useState, useEffect } from 'react'
import { Upload, Play, Clock, Eye } from 'lucide-react'

interface VideoMetadata {
  title: string
  duration: number | null
  thumbnail: string | null
  url: string
}

interface UrlInputProps {
  onSubmit: (url: string) => void
  isLoading: boolean
}

export default function UrlInput({ onSubmit, isLoading }: UrlInputProps) {
  const [url, setUrl] = useState('')
  const [isValidUrl, setIsValidUrl] = useState(false)
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null)
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false)
  const [metadataError, setMetadataError] = useState<string | null>(null)

  const validateUrl = (inputUrl: string) => {
    try {
      const urlObj = new URL(inputUrl)
      // Currently supported: YouTube, SoundCloud
      const supportedDomains = ['youtube.com', 'youtu.be', 'soundcloud.com']
      const isValid = supportedDomains.some(domain => 
        urlObj.hostname.includes(domain) || urlObj.hostname.includes('www.' + domain)
      )
      setIsValidUrl(isValid)
      return isValid
    } catch {
      setIsValidUrl(false)
      return false
    }
  }

  const fetchMetadata = async (inputUrl: string) => {
    if (!validateUrl(inputUrl)) return

    setIsLoadingMetadata(true)
    setMetadataError(null)

    try {
      const response = await fetch('/api/metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: inputUrl }),
      })

      if (response.ok) {
        const data = await response.json()
        setMetadata(data.metadata)
      } else {
        setMetadataError('Could not load video information')
      }
    } catch (error) {
      console.error('Error fetching metadata:', error)
      setMetadataError('Could not load video information')
    } finally {
      setIsLoadingMetadata(false)
    }
  }

  // Debounced metadata fetching
  useEffect(() => {
    if (!url || !isValidUrl) {
      setMetadata(null)
      setMetadataError(null)
      return
    }

    const timeoutId = setTimeout(() => {
      fetchMetadata(url)
    }, 1000) // Wait 1 second after user stops typing

    return () => clearTimeout(timeoutId)
  }, [url, isValidUrl])

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value
    setUrl(newUrl)
    validateUrl(newUrl)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isValidUrl && !isLoading) {
      onSubmit(url)
    }
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col gap-3 sm:gap-4 items-stretch">
        <div className="flex-1 relative">
          <input
            type="url"
            id="url"
            value={url}
            onChange={handleUrlChange}
            placeholder="Enter video URL (YouTube, SoundCloud)..."
            className={`w-full px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg rounded-xl border-2 bg-white/10 backdrop-blur-sm text-white placeholder-gray-300 focus:outline-none focus:ring-4 transition-all duration-200 ${
              url && !isValidUrl 
                ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' 
                : 'border-white/20 focus:border-purple-400 focus:ring-purple-400/20'
            }`}
            disabled={isLoading}
          />
          {url && (
            <button
              type="button"
              onClick={() => {
                setUrl('')
                setMetadata(null)
                setMetadataError(null)
                setIsValidUrl(false)
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/20 rounded-full transition-all duration-200"
              title="Clear URL"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          {url && !isValidUrl && (
            <p className="mt-2 text-sm text-red-300">
              Please enter a valid URL from YouTube or SoundCloud.
            </p>
          )}
        </div>
        
        <button
          type="submit"
          disabled={!isValidUrl || isLoading}
          className={`w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 sm:space-x-3 min-h-[48px] sm:min-w-[200px] ${
            isValidUrl && !isLoading
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-white"></div>
              <span className="text-sm sm:text-base">Processing...</span>
            </>
          ) : (
            <>
              <Upload className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="text-sm sm:text-base">Get Video Transcript</span>
            </>
          )}
        </button>
      </div>

      {/* Metadata Preview */}
      {(isLoadingMetadata || metadata || metadataError) && isValidUrl && (
        <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden">
          {isLoadingMetadata ? (
            <div className="p-3 sm:p-4 flex items-center space-x-3">
              <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
              <span className="text-white text-sm sm:text-base">Loading video information...</span>
            </div>
          ) : metadataError ? (
            <div className="p-3 sm:p-4 flex items-center space-x-3 text-yellow-300">
              <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base">{metadataError}</span>
            </div>
          ) : metadata ? (
            <div className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-4">
                {metadata.thumbnail && (
                  <div className="flex-shrink-0">
                    <img
                      src={metadata.thumbnail}
                      alt="Video thumbnail"
                      className="w-20 h-15 sm:w-24 sm:h-18 object-cover rounded-lg border border-white/20"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-base sm:text-lg leading-tight mb-2 line-clamp-2">
                    {metadata.title}
                  </h3>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-sm text-gray-300">
                    {metadata.duration && (
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="text-xs sm:text-sm">{formatDuration(metadata.duration)}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1">
                      <Play className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="text-xs sm:text-sm">Ready to transcribe</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </form>
  )
}
