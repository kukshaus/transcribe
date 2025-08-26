import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Transcription Blog - Tips, Guides & Resources | TranscribeAI',
  description: 'Learn about audio transcription, speech-to-text technology, and best practices. Expert guides for YouTube transcripts, podcast transcription, meeting notes, and more.',
  keywords: [
    'transcription blog', 'audio transcription tips', 'speech to text guide', 'transcription best practices',
    'youtube transcript guide', 'podcast transcription tips', 'meeting transcription guide', 'transcription tutorials'
  ],
  openGraph: {
    title: 'Transcription Blog - Tips, Guides & Resources',
    description: 'Learn about audio transcription, speech-to-text technology, and best practices. Expert guides for YouTube transcripts, podcast transcription, meeting notes, and more.',
    type: 'website',
    url: '/blog',
  },
  alternates: {
    canonical: '/blog',
  },
}

const blogPosts = [
  {
    id: 'youtube-transcript-generator',
    title: 'YouTube Transcript Generator - Get Video Transcripts Instantly',
    description: 'Extract transcripts from any YouTube video instantly. No downloads required. Convert YouTube videos to text with 99% accuracy.',
    slug: 'youtube-transcript-generator',
    date: '2024-12-19',
    category: 'YouTube',
    readTime: '5 min read'
  },
  {
    id: 'podcast-transcription-service',
    title: 'Podcast Transcription Service - Convert Podcasts to Text',
    description: 'Professional podcast transcription service. Convert podcast audio to text with 99% accuracy. Transcribe podcasts instantly with AI.',
    slug: 'podcast-transcription-service',
    date: '2024-12-19',
    category: 'Podcasts',
    readTime: '6 min read'
  },
  {
    id: 'audio-to-text-converter',
    title: 'Audio to Text Converter - AI Speech Recognition',
    description: 'Convert audio to text with 99% accuracy. AI-powered speech recognition for meetings, interviews, lectures, and more.',
    slug: 'audio-to-text-converter',
    date: '2024-12-19',
    category: 'Audio',
    readTime: '5 min read'
  },
  {
    id: 'meeting-transcription-service',
    title: 'Meeting Transcription Service - AI Meeting Notes',
    description: 'Professional meeting transcription service. Convert meeting recordings to text with 99% accuracy. AI-powered meeting notes and transcription.',
    slug: 'meeting-transcription-service',
    date: '2024-12-19',
    category: 'Meetings',
    readTime: '6 min read'
  },
  {
    id: 'lecture-transcription-service',
    title: 'Lecture Transcription Service - Convert Lectures to Text',
    description: 'Professional lecture transcription service. Convert lecture recordings to text with 99% accuracy. AI-powered lecture notes and transcription.',
    slug: 'lecture-transcription-service',
    date: '2024-12-19',
    category: 'Education',
    readTime: '5 min read'
  },
  {
    id: 'soundcloud-transcript-generator',
    title: 'SoundCloud Transcript Generator - Get SoundCloud Transcripts',
    description: 'Extract transcripts from SoundCloud audio instantly. Convert SoundCloud tracks to text with 99% accuracy.',
    slug: 'soundcloud-transcript-generator',
    date: '2024-12-19',
    category: 'SoundCloud',
    readTime: '4 min read'
  },
  {
    id: 'ai-transcription-service',
    title: 'AI Transcription Service - Advanced Speech Recognition',
    description: 'Advanced AI transcription service with 99% accuracy. AI-powered speech recognition for meetings, interviews, lectures, and more.',
    slug: 'ai-transcription-service',
    date: '2024-12-19',
    category: 'AI',
    readTime: '6 min read'
  },
  {
    id: 'speech-to-text-converter',
    title: 'Speech to Text Converter - AI Voice Recognition',
    description: 'Convert speech to text with 99% accuracy. AI-powered voice recognition for real-time transcription.',
    slug: 'speech-to-text-converter',
    date: '2024-12-19',
    category: 'Speech',
    readTime: '5 min read'
  },
  {
    id: 'professional-transcription-service',
    title: 'Professional Transcription Service - AI-Powered Transcription',
    description: 'Professional transcription service with 99% accuracy. AI-powered transcription for meetings, interviews, lectures, and more.',
    slug: 'professional-transcription-service',
    date: '2024-12-19',
    category: 'Professional',
    readTime: '6 min read'
  },
  {
    id: 'automatic-transcription-service',
    title: 'Automatic Transcription Service - AI-Powered Auto Transcription',
    description: 'Automatic transcription service with 99% accuracy. AI-powered automatic transcription for meetings, interviews, lectures, and more.',
    slug: 'automatic-transcription-service',
    date: '2024-12-19',
    category: 'Automation',
    readTime: '5 min read'
  }
]

const categories = ['All', 'YouTube', 'Podcasts', 'Audio', 'Meetings', 'Education', 'SoundCloud', 'AI', 'Speech', 'Professional', 'Automation']

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-16">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Transcription Blog
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Learn about audio transcription, speech-to-text technology, and best practices. 
            Expert guides for YouTube transcripts, podcast transcription, meeting notes, and more.
          </p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-all duration-200 border border-white/20"
            >
              {category}
            </button>
          ))}
        </div>

        {/* Blog Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:border-white/40 transition-all duration-200"
            >
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-purple-500/20 text-purple-300 text-sm font-medium rounded-full">
                  {post.category}
                </span>
              </div>
              
              <h2 className="text-xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors">
                {post.title}
              </h2>
              
              <p className="text-gray-300 mb-4 line-clamp-3">
                {post.description}
              </p>
              
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>{post.date}</span>
                <span>{post.readTime}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Start Transcribing?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Try TranscribeAI for free and experience the power of AI transcription
            </p>
            <Link 
              href="/"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
            >
              Start Transcribing Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
