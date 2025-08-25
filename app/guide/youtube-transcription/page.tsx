import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import { ArrowLeft, CheckCircle, Clock, Star, Play, Download, Copy, Share2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'How to Transcribe YouTube Videos: Complete Guide 2024 | TranscribeAI',
  description: 'Learn how to transcribe YouTube videos instantly with our AI transcription software. Step-by-step guide for students, researchers, and professionals. Free trial available.',
  keywords: 'how to transcribe YouTube videos, YouTube transcript generator, YouTube to text, video transcription, AI transcription software, YouTube lecture notes',
  openGraph: {
    title: 'How to Transcribe YouTube Videos: Complete Guide 2024',
    description: 'Learn how to transcribe YouTube videos instantly with our AI transcription software. Step-by-step guide for students, researchers, and professionals.',
    type: 'article',
    url: '/guide/youtube-transcription',
  },
}

export default function YouTubeTranscriptionGuidePage() {
  const steps = [
    {
      number: 1,
      title: "Copy the YouTube Video URL",
      description: "Navigate to the YouTube video you want to transcribe. Click the share button and copy the URL from your browser's address bar.",
      tip: "You can transcribe any YouTube video - public, unlisted, or private (if you have access)"
    },
    {
      number: 2,
      title: "Paste the URL in Our Tool",
      description: "Go to TranscribeAI and paste the YouTube URL in the input field. No need to download or upload the video file.",
      tip: "Our system works with videos of any length, from short clips to hour-long lectures"
    },
    {
      number: 3,
      title: "Click 'Get Transcript'",
      description: "Click the transcription button and our AI will start processing the audio. Most transcriptions complete in 30 seconds to 2 minutes.",
      tip: "The processing time depends on video length and audio quality"
    },
    {
      number: 4,
      title: "Review and Download",
      description: "Review the generated transcript for accuracy. Download in multiple formats: plain text, markdown, or import directly to Notion.",
      tip: "You can edit the transcript before downloading if needed"
    }
  ]

  const benefits = [
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Save Hours of Time",
      description: "What would take 4-6 hours to transcribe manually is completed in just minutes with our AI."
    },
    {
      icon: <Star className="h-6 w-6" />,
      title: "95%+ Accuracy",
      description: "Industry-leading transcription accuracy that rivals professional human transcription services."
    },
    {
      icon: <Play className="h-6 w-6" />,
      title: "No Downloads Required",
      description: "Process YouTube videos directly from URLs without downloading large video files to your device."
    },
    {
      icon: <Download className="h-6 w-6" />,
      title: "Multiple Export Formats",
      description: "Export transcripts in text, markdown, or import directly to Notion for seamless workflow integration."
    }
  ]

  const useCases = [
    {
      title: "Students & Researchers",
      description: "Transform long lectures into searchable study notes. Extract key points from educational videos and research materials.",
      examples: ["Academic lectures", "Research interviews", "Educational content", "Study materials"]
    },
    {
      title: "Content Creators",
      description: "Generate accurate captions and transcripts for your YouTube content. Improve accessibility and SEO for your videos.",
      examples: ["Video captions", "Content repurposing", "SEO optimization", "Accessibility compliance"]
    },
    {
      title: "Product Managers",
      description: "Convert product demos and user feedback videos into actionable documentation. Create PRDs from video content.",
      examples: ["Product demos", "User feedback", "Meeting recordings", "PRD generation"]
    },
    {
      title: "Journalists & Media",
      description: "Transcribe interviews, press conferences, and media content quickly for accurate reporting and analysis.",
      examples: ["Interviews", "Press conferences", "Media content", "News analysis"]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <Link 
              href="/"
              className="inline-flex items-center text-purple-300 hover:text-white mb-8 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              How to Transcribe YouTube Videos
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Complete guide to transcribing YouTube videos with AI. Transform any video into searchable text 
              in minutes, not hours. Perfect for students, researchers, and professionals.
            </p>
          </div>

          {/* Quick Start CTA */}
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl p-8 border border-purple-500/30 mb-16 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Ready to Start Transcribing?
            </h2>
            <p className="text-gray-300 mb-6">
              Try our AI transcription software with a free trial. No credit card required.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
            >
              Start Free Transcription
            </Link>
          </div>

          {/* Step-by-Step Guide */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              Step-by-Step YouTube Transcription Guide
            </h2>
            <div className="space-y-8">
              {steps.map((step, index) => (
                <div key={index} className="bg-white/5 rounded-xl p-6 border border-white/10 backdrop-blur-sm">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {step.number}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {step.title}
                      </h3>
                      <p className="text-gray-300 mb-3 leading-relaxed">
                        {step.description}
                      </p>
                      <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-3">
                        <p className="text-purple-200 text-sm">
                          <strong>Pro Tip:</strong> {step.tip}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              Why Choose AI Transcription?
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="bg-white/5 rounded-xl p-6 border border-white/10 backdrop-blur-sm">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center text-white">
                      {benefit.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {benefit.title}
                      </h3>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Use Cases */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              Perfect For These Use Cases
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {useCases.map((useCase, index) => (
                <div key={index} className="bg-white/5 rounded-xl p-6 border border-white/10 backdrop-blur-sm">
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {useCase.title}
                  </h3>
                  <p className="text-gray-300 mb-4 leading-relaxed">
                    {useCase.description}
                  </p>
                  <div className="space-y-2">
                    {useCase.examples.map((example, exampleIndex) => (
                      <div key={exampleIndex} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                        <span className="text-gray-300 text-sm">{example}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              <div className="bg-white/5 rounded-xl p-6 border border-white/10 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Can I transcribe private YouTube videos?
                </h3>
                <p className="text-gray-300">
                  Yes, as long as you have access to the video URL, our tool can transcribe it. This includes private, unlisted, and public videos.
                </p>
              </div>
              
              <div className="bg-white/5 rounded-xl p-6 border border-white/10 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-white mb-3">
                  How accurate are the transcriptions?
                </h3>
                <p className="text-gray-300">
                  Our AI transcription software typically achieves 95%+ accuracy for clear audio. Quality depends on audio clarity, speaker accent, and background noise.
                </p>
              </div>
              
              <div className="bg-white/5 rounded-xl p-6 border border-white/10 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-white mb-3">
                  What video lengths can I transcribe?
                </h3>
                <p className="text-gray-300">
                  We support videos of any length, from short clips to hour-long lectures. Processing time scales with video length, but most complete within 2-3 minutes.
                </p>
              </div>
              
              <div className="bg-white/5 rounded-xl p-6 border border-white/10 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Do I need to download the video?
                </h3>
                <p className="text-gray-300">
                  No! Our system processes YouTube videos directly from URLs without requiring any downloads. This saves storage space and time.
                </p>
              </div>
            </div>
          </div>

          {/* Final CTA */}
          <div className="text-center bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl p-8 border border-purple-500/30">
            <h2 className="text-2xl font-bold text-white mb-4">
              Start Transcribing YouTube Videos Today
            </h2>
            <p className="text-gray-300 mb-6">
              Join thousands of users who are already saving time with our AI transcription software.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
              >
                <Play className="h-5 w-5 mr-2" />
                Start Free Trial
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center px-8 py-3 bg-white/10 text-white font-medium rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-200"
              >
                <Star className="h-5 w-5 mr-2" />
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
