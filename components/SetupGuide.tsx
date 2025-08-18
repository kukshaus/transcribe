'use client'

import { useState } from 'react'
import { AlertTriangle, Download, ExternalLink, CheckCircle, X } from 'lucide-react'

interface SetupGuideProps {
  onClose: () => void
}

export default function SetupGuide({ onClose }: SetupGuideProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    {
      title: "Install FFmpeg",
      description: "FFmpeg is required for audio processing",
      content: (
        <div className="space-y-4">
          <p className="text-gray-600">
            FFmpeg is needed to extract and convert audio files from various platforms.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h4 className="font-medium text-gray-900">Installation Options:</h4>
            
            <div className="space-y-3">
              <div className="border border-gray-200 rounded-lg p-3">
                <h5 className="font-medium text-gray-800 mb-2">📥 Windows (Recommended)</h5>
                <p className="text-sm text-gray-600 mb-2">Download pre-built executable:</p>
                <a 
                  href="https://github.com/BtbN/FFmpeg-Builds/releases"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 text-indigo-600 hover:text-indigo-700"
                >
                  <Download className="h-4 w-4" />
                  <span>Download FFmpeg for Windows</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
                <p className="text-xs text-gray-500 mt-1">Extract and add to your system PATH</p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-3">
                <h5 className="font-medium text-gray-800 mb-2">🍫 Windows (Chocolatey)</h5>
                <code className="bg-gray-100 px-2 py-1 rounded text-sm">choco install ffmpeg</code>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-3">
                <h5 className="font-medium text-gray-800 mb-2">🐧 Linux (Ubuntu/Debian)</h5>
                <code className="bg-gray-100 px-2 py-1 rounded text-sm">sudo apt update && sudo apt install ffmpeg</code>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-3">
                <h5 className="font-medium text-gray-800 mb-2">🍎 macOS (Homebrew)</h5>
                <code className="bg-gray-100 px-2 py-1 rounded text-sm">brew install ffmpeg</code>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Verify Installation",
      description: "Test if FFmpeg is properly installed",
      content: (
        <div className="space-y-4">
          <p className="text-gray-600">
            After installation, verify FFmpeg is working by opening a command prompt and running:
          </p>
          
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-gray-500">$</span>
              <span>ffmpeg -version</span>
            </div>
            <div className="text-gray-300 text-xs">
              You should see version information if installed correctly
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Alternative: Direct Audio Download</h4>
                <p className="text-sm text-blue-700 mt-1">
                  The app will first try to download audio without conversion (which doesn't require FFmpeg). 
                  FFmpeg is only needed as a fallback for certain audio formats.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Ready to Go!",
      description: "Your transcription app is ready",
      content: (
        <div className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="bg-green-100 rounded-full p-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Setup Complete!
            </h3>
            <p className="text-gray-600">
              You can now transcribe audio from YouTube, Spotify, and other platforms.
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Supported Platforms:</h4>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
              <div>• YouTube</div>
              <div>• Spotify</div>
              <div>• SoundCloud</div>
              <div>• Vimeo</div>
              <div>• And many more...</div>
            </div>
          </div>
        </div>
      )
    }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Setup Guide</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            {steps.map((_, index) => (
              <div key={index} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index <= currentStep
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      index < currentStep ? 'bg-indigo-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          
          {/* Current Step Content */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {steps[currentStep].title}
            </h3>
            <p className="text-gray-600 mb-4">
              {steps[currentStep].description}
            </p>
            {steps[currentStep].content}
          </div>
          
          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {currentStep < steps.length - 1 ? (
              <button
                onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                className="btn-primary"
              >
                Next
              </button>
            ) : (
              <button
                onClick={onClose}
                className="btn-primary"
              >
                Start Transcribing
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
