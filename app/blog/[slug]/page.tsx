import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = getBlogPost(params.slug)
  
  if (!post) {
    return {
      title: 'Post Not Found | TranscribeAI Blog'
    }
  }

  return {
    title: `${post.title} | TranscribeAI Blog`,
    description: post.description,
    keywords: post.keywords,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      url: `/blog/${post.slug}`,
    },
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
  }
}

function getBlogPost(slug: string) {
  const posts = {
    'youtube-transcript-generator': {
      title: 'YouTube Transcript Generator - Get Video Transcripts Instantly',
      description: 'Extract transcripts from any YouTube video instantly. No downloads required. Convert YouTube videos to text with 99% accuracy. Free YouTube transcript generator with AI-powered transcription.',
      keywords: [
        'youtube transcript', 'youtube video transcript', 'youtube to text', 'youtube transcription',
        'get youtube transcript', 'youtube transcript generator', 'youtube audio transcript',
        'youtube video to text', 'youtube subtitle extractor', 'youtube transcript download',
        'youtube transcript online', 'youtube transcript free', 'youtube transcript ai'
      ],
      slug: 'youtube-transcript-generator',
      date: '2024-12-19',
      category: 'YouTube',
      readTime: '5 min read',
      content: {
        hero: {
          title: 'YouTube Transcript Generator',
          subtitle: 'Extract transcripts from any YouTube video instantly. No downloads required. Convert YouTube videos to text with 99% accuracy using our AI-powered transcription service.'
        },
        features: [
          '99% accuracy with AI-powered transcription',
          'No video downloads required',
          'Works with any YouTube video',
          'Multiple export formats (TXT, PDF, DOC)',
          'Free tier available'
        ],
        useCases: [
          {
            title: 'Content Creators',
            description: 'Create captions, subtitles, and content from your YouTube videos',
            icon: '🎥'
          },
          {
            title: 'Students',
            description: 'Convert educational YouTube videos into study notes and transcripts',
            icon: '🎓'
          },
          {
            title: 'Researchers',
            description: 'Extract text from research videos and interviews for analysis',
            icon: '🔬'
          }
        ]
      }
    },
    'podcast-transcription-service': {
      title: 'Podcast Transcription Service - Convert Podcasts to Text',
      description: 'Professional podcast transcription service. Convert podcast audio to text with 99% accuracy. Transcribe podcasts instantly with AI. Free podcast transcription available.',
      keywords: [
        'podcast transcription', 'podcast to text', 'podcast transcript', 'transcribe podcast',
        'podcast transcription service', 'podcast audio to text', 'podcast transcript generator',
        'podcast transcription software', 'podcast transcription ai', 'podcast transcription free',
        'podcast transcription online', 'podcast transcription tool', 'podcast transcription app'
      ],
      slug: 'podcast-transcription-service',
      date: '2024-12-19',
      category: 'Podcasts',
      readTime: '6 min read',
      content: {
        hero: {
          title: 'Podcast Transcription Service',
          subtitle: 'Professional podcast transcription service. Convert podcast audio to text with 99% accuracy. Transcribe podcasts instantly with our AI-powered transcription technology.'
        },
        features: [
          '99% accuracy with AI-powered transcription',
          'Speaker identification and labeling',
          'Support for all audio formats',
          'Timestamps for easy navigation',
          'Multiple export formats (TXT, PDF, DOC, SRT)'
        ],
        useCases: [
          {
            title: 'Podcasters',
            description: 'Create show notes, transcripts, and captions for your episodes',
            icon: '🎙️'
          },
          {
            title: 'Content Creators',
            description: 'Repurpose podcast content into blog posts and social media',
            icon: '📝'
          },
          {
            title: 'Media Professionals',
            description: 'Create accessible content and improve SEO with transcripts',
            icon: '📺'
          }
        ]
      }
    },
    'audio-to-text-converter': {
      title: 'Audio to Text Converter - AI Speech Recognition',
      description: 'Convert audio to text with 99% accuracy. AI-powered speech recognition for meetings, interviews, lectures, and more. Free audio to text converter online.',
      keywords: [
        'audio to text', 'speech to text', 'audio transcription', 'voice to text',
        'audio to text converter', 'speech recognition', 'audio transcription service',
        'voice recognition', 'audio to text online', 'audio to text free',
        'audio to text ai', 'audio to text software', 'audio to text app'
      ],
      slug: 'audio-to-text-converter',
      date: '2024-12-19',
      category: 'Audio',
      readTime: '5 min read',
      content: {
        hero: {
          title: 'Audio to Text Converter',
          subtitle: 'Convert audio to text with 99% accuracy. AI-powered speech recognition for meetings, interviews, lectures, and more. Free audio to text converter online.'
        },
        features: [
          '99% accuracy with AI-powered speech recognition',
          'Support for all audio formats (MP3, WAV, M4A, etc.)',
          'Real-time transcription capabilities',
          'Speaker identification and labeling',
          'Multiple export formats (TXT, PDF, DOC, SRT)'
        ],
        useCases: [
          {
            title: 'Business Professionals',
            description: 'Convert meeting recordings, interviews, and presentations to text',
            icon: '💼'
          },
          {
            title: 'Students',
            description: 'Convert lectures, interviews, and study materials to text',
            icon: '🎓'
          },
          {
            title: 'Content Creators',
            description: 'Convert audio content into blog posts and social media',
            icon: '📝'
          }
        ]
      }
    },
    'meeting-transcription-service': {
      title: 'Meeting Transcription Service - AI Meeting Notes',
      description: 'Professional meeting transcription service. Convert meeting recordings to text with 99% accuracy. AI-powered meeting notes and transcription. Free meeting transcription available.',
      keywords: [
        'meeting transcription', 'meeting notes', 'meeting transcript', 'transcribe meeting',
        'meeting transcription service', 'meeting audio to text', 'meeting transcript generator',
        'meeting transcription software', 'meeting transcription ai', 'meeting transcription free',
        'meeting transcription online', 'meeting transcription tool', 'meeting transcription app'
      ],
      slug: 'meeting-transcription-service',
      date: '2024-12-19',
      category: 'Meetings',
      readTime: '6 min read',
      content: {
        hero: {
          title: 'Meeting Transcription Service',
          subtitle: 'Professional meeting transcription service. Convert meeting recordings to text with 99% accuracy. AI-powered meeting notes and transcription for better productivity.'
        },
        features: [
          '99% accuracy with AI-powered transcription',
          'Speaker identification and labeling',
          'AI-generated meeting notes and summaries',
          'Action item extraction and tracking',
          'Multiple export formats (TXT, PDF, DOC, Notion)'
        ],
        useCases: [
          {
            title: 'Team Managers',
            description: 'Keep track of team meetings and action items',
            icon: '👥'
          },
          {
            title: 'Project Managers',
            description: 'Document project meetings and decisions',
            icon: '📋'
          },
          {
            title: 'Business Professionals',
            description: 'Convert client meetings and interviews to text',
            icon: '💼'
          }
        ]
      }
    },
    'lecture-transcription-service': {
      title: 'Lecture Transcription Service - Convert Lectures to Text',
      description: 'Professional lecture transcription service. Convert lecture recordings to text with 99% accuracy. AI-powered lecture notes and transcription for students and educators.',
      keywords: [
        'lecture transcription', 'lecture notes', 'lecture transcript', 'transcribe lecture',
        'lecture transcription service', 'lecture audio to text', 'lecture transcript generator',
        'lecture transcription software', 'lecture transcription ai', 'lecture transcription free',
        'lecture transcription online', 'lecture transcription tool', 'lecture transcription app'
      ],
      slug: 'lecture-transcription-service',
      date: '2024-12-19',
      category: 'Education',
      readTime: '5 min read',
      content: {
        hero: {
          title: 'Lecture Transcription Service',
          subtitle: 'Professional lecture transcription service. Convert lecture recordings to text with 99% accuracy. AI-powered lecture notes and transcription for students and educators.'
        },
        features: [
          '99% accuracy with AI-powered transcription',
          'Educational content optimization',
          'Study note generation',
          'Support for long-form content',
          'Multiple export formats (TXT, PDF, DOC, Notion)'
        ],
        useCases: [
          {
            title: 'Students',
            description: 'Convert lecture recordings into study notes and transcripts',
            icon: '🎓'
          },
          {
            title: 'Educators',
            description: 'Create accessible content and improve learning outcomes',
            icon: '👨‍🏫'
          },
          {
            title: 'Researchers',
            description: 'Transcribe academic presentations and research interviews',
            icon: '🔬'
          }
        ]
      }
    },
    'soundcloud-transcript-generator': {
      title: 'SoundCloud Transcript Generator - Get SoundCloud Transcripts',
      description: 'Extract transcripts from SoundCloud audio instantly. Convert SoundCloud tracks to text with 99% accuracy. Free SoundCloud transcript generator with AI-powered transcription.',
      keywords: [
        'soundcloud transcript', 'soundcloud to text', 'soundcloud transcription', 'soundcloud audio transcript',
        'soundcloud transcript generator', 'soundcloud transcription service', 'soundcloud audio to text',
        'soundcloud transcript download', 'soundcloud transcript online', 'soundcloud transcript free',
        'soundcloud transcript ai', 'soundcloud transcript tool', 'soundcloud transcript app'
      ],
      slug: 'soundcloud-transcript-generator',
      date: '2024-12-19',
      category: 'SoundCloud',
      readTime: '4 min read',
      content: {
        hero: {
          title: 'SoundCloud Transcript Generator',
          subtitle: 'Extract transcripts from SoundCloud audio instantly. Convert SoundCloud tracks to text with 99% accuracy. Free SoundCloud transcript generator with AI-powered transcription.'
        },
        features: [
          '99% accuracy with AI-powered transcription',
          'Direct SoundCloud URL support',
          'Music and speech recognition',
          'Multiple export formats (TXT, PDF, DOC)',
          'Free tier available'
        ],
        useCases: [
          {
            title: 'Musicians',
            description: 'Create lyrics and song transcripts from SoundCloud tracks',
            icon: '🎵'
          },
          {
            title: 'Content Creators',
            description: 'Extract text from SoundCloud podcasts and interviews',
            icon: '🎙️'
          },
          {
            title: 'Researchers',
            description: 'Analyze audio content from SoundCloud for research',
            icon: '🔬'
          }
        ]
      }
    },
    'ai-transcription-service': {
      title: 'AI Transcription Service - Advanced Speech Recognition',
      description: 'Advanced AI transcription service with 99% accuracy. AI-powered speech recognition for meetings, interviews, lectures, and more. Free AI transcription available.',
      keywords: [
        'ai transcription', 'ai speech recognition', 'ai audio transcription', 'ai voice to text',
        'ai transcription service', 'ai transcription software', 'ai transcription tool',
        'ai transcription app', 'ai transcription online', 'ai transcription free',
        'artificial intelligence transcription', 'machine learning transcription', 'ai powered transcription'
      ],
      slug: 'ai-transcription-service',
      date: '2024-12-19',
      category: 'AI',
      readTime: '6 min read',
      content: {
        hero: {
          title: 'AI Transcription Service',
          subtitle: 'Advanced AI transcription service with 99% accuracy. AI-powered speech recognition for meetings, interviews, lectures, and more. Free AI transcription available.'
        },
        features: [
          '99% accuracy with advanced AI models',
          'Machine learning optimization',
          'Context-aware transcription',
          'Multi-language support',
          'Real-time processing capabilities'
        ],
        useCases: [
          {
            title: 'Tech Companies',
            description: 'Integrate AI transcription into your applications',
            icon: '🤖'
          },
          {
            title: 'Researchers',
            description: 'Use advanced AI for complex audio analysis',
            icon: '🔬'
          },
          {
            title: 'Enterprises',
            description: 'Scale transcription across large organizations',
            icon: '🏢'
          }
        ]
      }
    },
    'speech-to-text-converter': {
      title: 'Speech to Text Converter - AI Voice Recognition',
      description: 'Convert speech to text with 99% accuracy. AI-powered voice recognition for real-time transcription. Free speech to text converter online.',
      keywords: [
        'speech to text', 'voice to text', 'speech recognition', 'voice recognition',
        'speech to text converter', 'speech to text online', 'speech to text free',
        'speech to text ai', 'speech to text software', 'speech to text app',
        'real time speech to text', 'speech to text api', 'speech to text service'
      ],
      slug: 'speech-to-text-converter',
      date: '2024-12-19',
      category: 'Speech',
      readTime: '5 min read',
      content: {
        hero: {
          title: 'Speech to Text Converter',
          subtitle: 'Convert speech to text with 99% accuracy. AI-powered voice recognition for real-time transcription. Free speech to text converter online.'
        },
        features: [
          '99% accuracy with AI-powered voice recognition',
          'Real-time transcription capabilities',
          'Live audio processing',
          'Multiple language support',
          'API integration available'
        ],
        useCases: [
          {
            title: 'Developers',
            description: 'Integrate speech-to-text into your applications',
            icon: '💻'
          },
          {
            title: 'Accessibility',
            description: 'Make content accessible with voice input',
            icon: '♿'
          },
          {
            title: 'Productivity',
            description: 'Dictate documents and notes with voice',
            icon: '⚡'
          }
        ]
      }
    },
    'professional-transcription-service': {
      title: 'Professional Transcription Service - AI-Powered Transcription',
      description: 'Professional transcription service with 99% accuracy. AI-powered transcription for meetings, interviews, lectures, and more. Free transcription service available.',
      keywords: [
        'transcription service', 'professional transcription', 'transcription company', 'transcription business',
        'transcription service online', 'transcription service free', 'transcription service ai',
        'transcription service software', 'transcription service app', 'transcription service tool',
        'best transcription service', 'affordable transcription service', 'fast transcription service'
      ],
      slug: 'professional-transcription-service',
      date: '2024-12-19',
      category: 'Professional',
      readTime: '6 min read',
      content: {
        hero: {
          title: 'Professional Transcription Service',
          subtitle: 'Professional transcription service with 99% accuracy. AI-powered transcription for meetings, interviews, lectures, and more. Free transcription service available.'
        },
        features: [
          '99% accuracy with professional-grade AI',
          'Enterprise-level security',
          'Bulk processing capabilities',
          'Custom formatting options',
          'Dedicated support team'
        ],
        useCases: [
          {
            title: 'Law Firms',
            description: 'Transcribe legal proceedings and depositions',
            icon: '⚖️'
          },
          {
            title: 'Healthcare',
            description: 'Convert medical consultations to text',
            icon: '🏥'
          },
          {
            title: 'Media Companies',
            description: 'Professional transcription for broadcast content',
            icon: '📺'
          }
        ]
      }
    },
    'automatic-transcription-service': {
      title: 'Automatic Transcription Service - AI-Powered Auto Transcription',
      description: 'Automatic transcription service with 99% accuracy. AI-powered automatic transcription for meetings, interviews, lectures, and more. Free automatic transcription available.',
      keywords: [
        'automatic transcription', 'auto transcription', 'automatic speech recognition', 'automatic voice to text',
        'automatic transcription service', 'automatic transcription software', 'automatic transcription tool',
        'automatic transcription app', 'automatic transcription online', 'automatic transcription free',
        'automatic transcription ai', 'automatic transcription api', 'automatic transcription system'
      ],
      slug: 'automatic-transcription-service',
      date: '2024-12-19',
      category: 'Automation',
      readTime: '5 min read',
      content: {
        hero: {
          title: 'Automatic Transcription Service',
          subtitle: 'Automatic transcription service with 99% accuracy. AI-powered automatic transcription for meetings, interviews, lectures, and more. Free automatic transcription available.'
        },
        features: [
          '99% accuracy with automated processing',
          'Set-and-forget automation',
          'Scheduled transcription jobs',
          'Batch processing capabilities',
          'Automated quality control'
        ],
        useCases: [
          {
            title: 'Content Creators',
            description: 'Automatically transcribe all your content',
            icon: '🎬'
          },
          {
            title: 'Businesses',
            description: 'Automate meeting transcription workflows',
            icon: '🏢'
          },
          {
            title: 'Educators',
            description: 'Automatically transcribe lecture recordings',
            icon: '👨‍🏫'
          }
        ]
      }
    }
  }

  return posts[slug as keyof typeof posts] || null
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getBlogPost(params.slug)
  
  if (!post) {
    notFound()
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.description,
    "datePublished": post.date,
    "dateModified": post.date,
    "author": {
      "@type": "Organization",
      "name": "TranscribeAI"
    },
    "publisher": {
      "@type": "Organization",
      "name": "TranscribeAI",
      "url": baseUrl
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${baseUrl}/blog/${post.slug}`
    },
    "keywords": post.keywords.join(', ')
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData)
        }}
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-16">
        <div className="max-w-4xl mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <Link href="/blog" className="text-purple-300 hover:text-purple-200">
              ← Back to Blog
            </Link>
          </nav>

          {/* Article Header */}
          <div className="mb-12">
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-purple-500/20 text-purple-300 text-sm font-medium rounded-full">
                {post.category}
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              {post.content.hero.title}
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl">
              {post.content.hero.subtitle}
            </p>
            <div className="flex items-center space-x-4 text-gray-400">
              <span>{post.date}</span>
              <span>•</span>
              <span>{post.readTime}</span>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center mb-16">
            <Link 
              href="/"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
            >
              Try TranscribeAI Now
            </Link>
          </div>

          {/* Features Section */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20 mb-12">
            <h2 className="text-3xl font-bold text-white mb-6">Key Features</h2>
            <ul className="space-y-4">
              {post.content.features.map((feature, index) => (
                <li key={index} className="flex items-center space-x-3">
                  <span className="text-green-400">✓</span>
                  <span className="text-gray-300">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Use Cases Section */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20 mb-12">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">Perfect For</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {post.content.useCases.map((useCase, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl mb-4">{useCase.icon}</div>
                  <h3 className="text-xl font-semibold text-white mb-2">{useCase.title}</h3>
                  <p className="text-gray-300">{useCase.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Ready to Get Started?</h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of users who trust TranscribeAI for their transcription needs
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
    </>
  )
}
