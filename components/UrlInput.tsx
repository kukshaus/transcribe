'use client'

import { useState } from 'react'
import { Link, Upload } from 'lucide-react'

interface UrlInputProps {
  onSubmit: (url: string) => void
  isLoading: boolean
}

export default function UrlInput({ onSubmit, isLoading }: UrlInputProps) {
  const [url, setUrl] = useState('')
  const [isValidUrl, setIsValidUrl] = useState(false)

  const validateUrl = (inputUrl: string) => {
    try {
      const urlObj = new URL(inputUrl)
      const validDomains = ['youtube.com', 'youtu.be', 'spotify.com', 'soundcloud.com', 'vimeo.com']
      const isValid = validDomains.some(domain => 
        urlObj.hostname.includes(domain) || urlObj.hostname.includes('www.' + domain)
      )
      setIsValidUrl(isValid)
      return isValid
    } catch {
      setIsValidUrl(false)
      return false
    }
  }

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

  return (
    <div className="card mb-8">
      <div className="flex items-center mb-4">
        <Link className="h-6 w-6 text-indigo-500 mr-3" />
        <h2 className="text-xl font-semibold text-gray-900">
          Add Audio URL
        </h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
            Paste URL from YouTube, Spotify, SoundCloud, or other platforms
          </label>
          <input
            type="url"
            id="url"
            value={url}
            onChange={handleUrlChange}
            placeholder="https://www.youtube.com/watch?v=..."
            className={`input-field ${
              url && !isValidUrl ? 'border-red-300 focus:ring-red-500' : ''
            }`}
            disabled={isLoading}
          />
          {url && !isValidUrl && (
            <p className="mt-2 text-sm text-red-600">
              Please enter a valid URL from a supported platform
            </p>
          )}
        </div>
        
        <button
          type="submit"
          disabled={!isValidUrl || isLoading}
          className={`w-full flex items-center justify-center space-x-2 ${
            isValidUrl && !isLoading
              ? 'btn-primary'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed py-3 px-6 rounded-lg'
          }`}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Upload className="h-5 w-5" />
              <span>Start Transcription</span>
            </>
          )}
        </button>
      </form>
      
      <div className="mt-6 space-y-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Supported Platforms:</h3>
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
            <div>• YouTube</div>
            <div>• Spotify</div>
            <div>• SoundCloud</div>
            <div>• Vimeo</div>
          </div>
        </div>
        
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Large File Support:</h3>
          <div className="space-y-1 text-sm text-blue-700">
            <div>• ✅ Supports files of any size (no limit!)</div>
            <div>• ✅ Automatic compression for moderately large files</div>
            <div>• ✅ Smart chunking for very large files (&gt;75MB)</div>
            <div>• ✅ Works with full-length podcasts, lectures, and meetings</div>
          </div>
        </div>
      </div>
    </div>
  )
}
