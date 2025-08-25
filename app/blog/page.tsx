import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import { ArrowLeft, Calendar, Clock, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Blog - AI Transcription Tips, Tutorials & Best Practices | TranscribeAI',
  description: 'Learn how to transcribe YouTube videos, SoundCloud audio, and create meeting notes with our comprehensive guides. Expert tips for students, product managers, and professionals.',
  keywords: 'transcription blog, YouTube transcript guide, SoundCloud to text tutorial, meeting notes tips, PRD generation guide, AI transcription best practices',
  openGraph: {
    title: 'Blog - AI Transcription Tips, Tutorials & Best Practices',
    description: 'Learn how to transcribe YouTube videos, SoundCloud audio, and create meeting notes with our comprehensive guides.',
    type: 'website',
    url: '/blog',
  },
}

export default function BlogPage() {
  const blogPosts = [
    {
      id: 'how-to-transcribe-youtube-videos',
      title: 'How to Transcribe YouTube Videos: Complete Guide for 2024',
      excerpt: 'Learn the fastest and most accurate way to transcribe YouTube videos. Our step-by-step guide shows you how to extract transcripts from any YouTube video without downloading files.',
      category: 'YouTube Transcription',
      readTime: '8 min read',
      date: '2024-01-15',
      featured: true
    },
    {
      id: 'soundcloud-transcription-guide',
      title: 'How to Get Transcripts from SoundCloud: Audio to Text Conversion',
      excerpt: 'Transform SoundCloud audio tracks into searchable text with our comprehensive guide. Discover how to extract transcripts from podcasts, music, and audio content.',
      category: 'Audio Transcription',
      readTime: '6 min read',
      date: '2024-01-12'
    },
    {
      id: 'meeting-notes-ai-generation',
      title: 'AI Meeting Notes Generation: Transform Conversations into Actionable Insights',
      excerpt: 'Discover how AI-powered meeting notes generation can revolutionize your workflow. Learn tools, best practices, and real-world applications for creating comprehensive meeting summaries.',
      category: 'Productivity',
      readTime: '15 min read',
      date: '2024-01-10'
    },
    {
      id: 'prd-generation-from-meetings',
      title: 'PRD Generation from Meetings: Turn Conversations into Product Requirements',
      excerpt: 'Learn how to automatically generate comprehensive Product Requirements Documents (PRDs) from meeting transcripts using AI. Streamline your product development process.',
      category: 'Product Management',
      readTime: '18 min read',
      date: '2024-01-08'
    },
    {
      id: 'transcription-accuracy-tips',
      title: 'Transcription Accuracy Tips: Boost Your AI Transcription Quality',
      excerpt: 'Unlock the secrets to achieving 99%+ transcription accuracy. From audio quality optimization to post-processing techniques, discover proven strategies for perfect transcripts.',
      category: 'Tips & Tricks',
      readTime: '20 min read',
      date: '2024-01-05'
    },
    {
      id: 'student-transcription-guide',
      title: 'Student Guide: Transform Lectures into Study Notes with AI',
      excerpt: 'Students, discover how AI transcription can revolutionize your study routine. Convert long lectures into searchable notes and focus on learning instead of note-taking.',
      category: 'Education',
      readTime: '9 min read',
      date: '2024-01-03'
    }
  ]

  const categories = ['All', 'YouTube Transcription', 'Audio Transcription', 'Productivity', 'Product Management', 'Tips & Tricks', 'Education']

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
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
              AI Transcription Blog
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Expert guides, tutorials, and tips for transcribing YouTube videos, SoundCloud audio, 
              and creating AI-powered meeting notes and PRDs.
            </p>
          </div>

          {/* Featured Post */}
          {blogPosts.filter(post => post.featured).map(post => (
            <div key={post.id} className="mb-16">
              <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl p-8 border border-purple-500/30">
                <div className="flex items-center space-x-4 mb-4">
                  <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Featured
                  </span>
                  <span className="text-purple-300 text-sm">{post.category}</span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  {post.title}
                </h2>
                <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-gray-400 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(post.date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                  <Link
                    href={`/blog/${post.id}`}
                    className="inline-flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
                  >
                    <span>Read Full Article</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {/* All Posts Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.filter(post => !post.featured).map(post => (
              <article key={post.id} className="bg-white/5 rounded-xl p-6 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
                <div className="mb-4">
                  <span className="text-purple-300 text-sm font-medium">{post.category}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3 line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-gray-300 mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-gray-400 text-xs">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(post.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                  <Link
                    href={`/blog/${post.id}`}
                    className="text-purple-400 hover:text-purple-300 text-sm font-medium"
                  >
                    Read More →
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {/* CTA Section */}
          <div className="mt-20 text-center bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl p-8 border border-purple-500/30">
            <h2 className="text-2xl font-bold text-white mb-4">
              Ready to Start Transcribing?
            </h2>
            <p className="text-gray-300 mb-6">
              Put these tips into practice with our AI transcription software.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
            >
              Start Free Transcription
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
