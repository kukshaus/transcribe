import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import { ArrowLeft, Calendar, Clock, Play, Download, CheckCircle, Star, Zap } from 'lucide-react'

export const metadata: Metadata = {
  title: 'How to Transcribe YouTube Videos: Complete Guide for 2024 | TranscribeAI',
  description: 'Learn the fastest and most accurate way to transcribe YouTube videos. Our step-by-step guide shows you how to extract transcripts from any YouTube video without downloading files.',
  keywords: 'how to transcribe YouTube videos, YouTube transcript generator, extract YouTube transcripts, YouTube to text, video transcription guide',
  openGraph: {
    title: 'How to Transcribe YouTube Videos: Complete Guide for 2024',
    description: 'Learn the fastest and most accurate way to transcribe YouTube videos. Our step-by-step guide shows you how to extract transcripts from any YouTube video without downloading files.',
    type: 'article',
    url: '/blog/how-to-transcribe-youtube-videos',
    publishedTime: '2024-01-15T00:00:00.000Z',
    authors: ['TranscribeAI'],
    tags: ['YouTube Transcription', 'Video to Text', 'AI Transcription', 'Tutorial'],
  },
}

export default function YouTubeTranscriptionGuide() {
  const steps = [
    {
      number: 1,
      title: "Copy the YouTube URL",
      description: "Open the YouTube video you want to transcribe and copy the URL from your browser's address bar. You can transcribe any public YouTube video, including live streams and private videos (if you have access).",
      tip: "Pro tip: Make sure the video has audio - silent videos won't generate transcripts."
    },
    {
      number: 2,
      title: "Paste into TranscribeAI",
      description: "Go to TranscribeAI and paste the YouTube URL into our transcription tool. No need to download the video or install any software. Our AI will process the video directly from YouTube's servers.",
      tip: "You can transcribe multiple videos at once by adding several URLs."
    },
    {
      number: 3,
      title: "Choose Your Settings",
      description: "Select your preferred language (we support 50+ languages), transcription quality, and output format. For most users, our default settings provide excellent accuracy while maintaining fast processing times.",
      tip: "Higher quality settings are recommended for videos with background noise or multiple speakers."
    },
    {
      number: 4,
      title: "Generate Transcript",
      description: "Click 'Transcribe' and watch the magic happen! Our AI processes the video in real-time, analyzing the audio to create accurate, timestamped transcripts. Most videos are processed in under 2 minutes.",
      tip: "Longer videos take proportionally longer, but our AI is optimized for speed without sacrificing accuracy."
    },
    {
      number: 5,
      title: "Review and Edit",
      description: "Once complete, review your transcript for any errors. Our AI achieves 95%+ accuracy, but you can easily edit any mistakes using our intuitive interface. Add speaker labels, correct names, or adjust timestamps.",
      tip: "Use our search function to quickly find specific parts of the transcript."
    },
    {
      number: 6,
      title: "Export and Share",
      description: "Download your transcript in multiple formats: plain text, Word document, PDF, or SRT for video editing. Share directly with team members or integrate with your existing workflow tools.",
      tip: "SRT files are perfect for adding subtitles to your own videos or presentations."
    }
  ]

  const benefits = [
    {
      icon: <Zap className="h-6 w-6 text-yellow-400" />,
      title: "Lightning Fast",
      description: "Get transcripts in minutes, not hours. Our AI processes videos up to 10x faster than manual transcription."
    },
    {
      icon: <Star className="h-6 w-6 text-purple-400" />,
      title: "95%+ Accuracy",
      description: "Industry-leading accuracy that rivals human transcriptionists, with the ability to understand context and industry-specific terminology."
    },
    {
      icon: <CheckCircle className="h-6 w-6 text-green-400" />,
      title: "No Downloads Required",
      description: "Process videos directly from YouTube without downloading files or using up your device's storage space."
    },
    {
      icon: <Play className="h-6 w-6 text-blue-400" />,
      title: "Multiple Formats",
      description: "Export in various formats including plain text, Word, PDF, and SRT subtitle files for maximum compatibility."
    }
  ]

  const useCases = [
    "Content creators creating subtitles for their videos",
    "Students transcribing educational lectures",
    "Researchers analyzing interview content",
    "Journalists documenting press conferences",
    "Business professionals creating meeting notes",
    "Podcasters generating show transcripts"
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <Link
              href="/blog"
              className="inline-flex items-center text-purple-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Link>
          </nav>

          {/* Article Header */}
          <header className="mb-12">
            <div className="flex items-center gap-4 mb-4">
              <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                Featured
              </span>
              <span className="text-purple-300 text-sm">YouTube Transcription</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              How to Transcribe YouTube Videos: Complete Guide for 2024
            </h1>
            
            <p className="text-xl text-gray-300 mb-6 leading-relaxed">
              Learn the fastest and most accurate way to transcribe YouTube videos. Our step-by-step guide shows you how to extract transcripts from any YouTube video without downloading files.
            </p>
            
            <div className="flex items-center gap-6 text-gray-400">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span>January 15, 2024</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span>8 min read</span>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <article className="prose prose-invert prose-lg max-w-none">
            <div className="bg-white/5 rounded-xl p-8 border border-white/10 backdrop-blur-sm mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">Why Transcribe YouTube Videos?</h2>
              <p className="text-gray-300 mb-6">
                YouTube transcription has become essential for content creators, educators, researchers, and businesses. Whether you're creating subtitles, analyzing content, or extracting key information, having accurate transcripts saves hours of manual work and improves accessibility.
              </p>
              <p className="text-gray-300">
                With over 500 hours of video uploaded to YouTube every minute, the ability to quickly extract and search through video content is more valuable than ever. Our AI-powered transcription tool makes this process simple, fast, and incredibly accurate.
              </p>
            </div>

            {/* Step-by-Step Guide */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-white mb-8">Step-by-Step YouTube Transcription Guide</h2>
              <div className="space-y-8">
                {steps.map((step) => (
                  <div key={step.number} className="bg-white/5 rounded-xl p-6 border border-white/10 backdrop-blur-sm">
                    <div className="flex items-start gap-4">
                      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
                        {step.number}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                        <p className="text-gray-300 mb-3 leading-relaxed">{step.description}</p>
                        <div className="bg-purple-600/20 border border-purple-500/30 rounded-lg p-3">
                          <p className="text-purple-200 text-sm font-medium">💡 {step.tip}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Benefits */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-white mb-8">Why Choose TranscribeAI for YouTube Transcription?</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="bg-white/5 rounded-xl p-6 border border-white/10 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-3">
                      {benefit.icon}
                      <h3 className="text-lg font-semibold text-white">{benefit.title}</h3>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">{benefit.description}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Use Cases */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-white mb-6">Perfect For These Use Cases</h2>
              <div className="bg-white/5 rounded-xl p-6 border border-white/10 backdrop-blur-sm">
                <ul className="grid md:grid-cols-2 gap-3">
                  {useCases.map((useCase, index) => (
                    <li key={index} className="flex items-center gap-3 text-gray-300">
                      <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                      {useCase}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* CTA */}
            <section className="text-center bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl p-8 border border-purple-500/30">
              <h2 className="text-2xl font-bold text-white mb-4">Ready to Start Transcribing?</h2>
              <p className="text-gray-300 mb-6">
                Join thousands of users who are already saving hours with our AI-powered YouTube transcription tool.
              </p>
              <Link
                href="/"
                className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
              >
                <Play className="h-5 w-5 mr-2" />
                Start Transcribing Now
              </Link>
            </section>
          </article>

          {/* Related Articles */}
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-white mb-6">Related Articles</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Link
                href="/blog/soundcloud-transcription-guide"
                className="bg-white/5 rounded-xl p-6 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
              >
                <h3 className="text-lg font-semibold text-white mb-2">How to Get Transcripts from SoundCloud</h3>
                <p className="text-gray-300 text-sm">Transform SoundCloud audio tracks into searchable text with our comprehensive guide.</p>
              </Link>
              <Link
                href="/blog/ai-meeting-notes"
                className="bg-white/5 rounded-xl p-6 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
              >
                <h3 className="text-lg font-semibold text-white mb-2">AI-Powered Meeting Notes</h3>
                <p className="text-gray-300 text-sm">Stop taking manual notes during meetings. Learn how AI can automatically generate comprehensive meeting notes.</p>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
