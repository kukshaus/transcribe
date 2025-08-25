import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import { ArrowLeft, GraduationCap, Users, Building2, Mic, FileText, Video, Music } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Transcription Use Cases: Students, Product Managers, Journalists & More | TranscribeAI',
  description: 'Discover how different industries use TranscribeAI. Perfect for students, product managers, journalists, content creators, and researchers. Transform audio into actionable insights.',
  keywords: 'transcription use cases, student transcription, product manager transcription, journalist transcription, content creator transcription, researcher transcription',
  openGraph: {
    title: 'Transcription Use Cases: Students, Product Managers, Journalists & More',
    description: 'Discover how different industries use TranscribeAI. Perfect for students, product managers, journalists, and researchers.',
    type: 'website',
    url: '/use-cases',
  },
}

export default function UseCasesPage() {
  const useCases = [
    {
      icon: <GraduationCap className="h-12 w-12" />,
      title: "Students & Researchers",
      description: "Transform long lectures into searchable study notes and research materials",
      benefits: [
        "Convert hour-long lectures to searchable text in minutes",
        "Extract key points from educational videos",
        "Create study materials from audio content",
        "Research interview transcription and analysis"
      ],
      examples: [
        "Academic lecture transcription",
        "Research interview notes",
        "Study material creation",
        "Podcast learning content"
      ],
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Users className="h-12 w-12" />,
      title: "Product Managers",
      description: "Generate PRDs and documentation from meeting recordings automatically",
      benefits: [
        "Create PRDs from stakeholder meetings",
        "Document user feedback sessions",
        "Track product decisions and action items",
        "Streamline requirement gathering"
      ],
      examples: [
        "Stakeholder meeting transcription",
        "User feedback documentation",
        "Product requirement documents",
        "Sprint planning notes"
      ],
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <Mic className="h-12 w-12" />,
      title: "Journalists & Media",
      description: "Quick transcription of interviews, press conferences, and media content",
      benefits: [
        "Fast interview transcription for deadlines",
        "Accurate press conference documentation",
        "Content repurposing and analysis",
        "Multi-language support for international coverage"
      ],
      examples: [
        "Interview transcription",
        "Press conference notes",
        "Podcast content creation",
        "News analysis preparation"
      ],
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <Video className="h-12 w-12" />,
      title: "Content Creators",
      description: "Generate captions, transcripts, and content from your audio/video",
      benefits: [
        "Automatic caption generation for videos",
        "Content repurposing and SEO optimization",
        "Accessibility compliance for all content",
        "Multi-platform content distribution"
      ],
      examples: [
        "YouTube video captions",
        "Podcast transcript creation",
        "Social media content repurposing",
        "Blog post generation from audio"
      ],
      color: "from-orange-500 to-red-500"
    },
    {
      icon: <Building2 className="h-12 w-12" />,
      title: "Business & Enterprise",
      description: "Professional meeting documentation and compliance requirements",
      benefits: [
        "Meeting minutes and action item tracking",
        "Compliance and audit trail documentation",
        "Training material creation",
        "Executive briefing preparation"
      ],
      examples: [
        "Board meeting transcription",
        "Training session documentation",
        "Compliance audit trails",
        "Executive briefings"
      ],
      color: "from-indigo-500 to-purple-500"
    },
    {
      icon: <Music className="h-12 w-12" />,
      title: "Music & Audio Professionals",
      description: "Transcribe lyrics, interviews, and audio content for production",
      benefits: [
        "Lyric transcription and documentation",
        "Artist interview content creation",
        "Audio production notes and scripts",
        "Content licensing and rights management"
      ],
      examples: [
        "Song lyric transcription",
        "Artist interview documentation",
        "Podcast script creation",
        "Audio content licensing"
      ],
      color: "from-pink-500 to-rose-500"
    }
  ]

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "PhD Student, Computer Science",
      content: "TranscribeAI has revolutionized my research workflow. I can now focus on analysis instead of manual transcription.",
      avatar: "SC"
    },
    {
      name: "Marcus Rodriguez",
      role: "Senior Product Manager",
      content: "The PRD generation feature saves me hours every week. It's like having an AI assistant for documentation.",
      avatar: "MR"
    },
    {
      name: "Emma Thompson",
      role: "Content Creator & YouTuber",
      content: "Automatic captions and transcripts have improved my content's accessibility and SEO significantly.",
      avatar: "ET"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
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
              Transcription Use Cases
            </h1>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto">
              Discover how TranscribeAI serves different industries and professions. 
              From students to enterprise professionals, we have solutions for every transcription need.
            </p>
          </div>

          {/* Use Cases Grid */}
          <div className="mb-16">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {useCases.map((useCase, index) => (
                <div key={index} className="bg-white/5 rounded-xl p-6 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
                  <div className={`w-16 h-16 bg-gradient-to-r ${useCase.color} rounded-lg flex items-center justify-center text-white mb-4`}>
                    {useCase.icon}
                  </div>
                  
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {useCase.title}
                  </h3>
                  
                  <p className="text-gray-300 mb-4 leading-relaxed">
                    {useCase.description}
                  </p>
                  
                  <div className="mb-4">
                    <h4 className="text-white font-medium mb-2">Key Benefits:</h4>
                    <ul className="space-y-1">
                      {useCase.benefits.map((benefit, benefitIndex) => (
                        <li key={benefitIndex} className="text-gray-300 text-sm flex items-start">
                          <span className="text-green-400 mr-2 mt-1">•</span>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-white font-medium mb-2">Common Examples:</h4>
                    <ul className="space-y-1">
                      {useCase.examples.map((example, exampleIndex) => (
                        <li key={exampleIndex} className="text-gray-300 text-sm flex items-start">
                          <span className="text-blue-400 mr-2 mt-1">•</span>
                          {example}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonials */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              What Our Users Say
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white/5 rounded-xl p-6 border border-white/10 backdrop-blur-sm">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">{testimonial.name}</h4>
                      <p className="text-gray-400 text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-300 italic">"{testimonial.content}"</p>
                </div>
              ))}
            </div>
          </div>

          {/* Industry Solutions */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              Industry-Specific Solutions
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl p-8 border border-purple-500/30">
                <h3 className="text-2xl font-bold text-white mb-4">Education & Research</h3>
                <p className="text-gray-300 mb-6">
                  Transform the way students and researchers work with audio content. 
                  From lecture transcription to research interview analysis.
                </p>
                <Link
                  href="/guide/youtube-transcription"
                  className="inline-flex items-center text-purple-300 hover:text-white font-medium"
                >
                  Learn more about educational transcription →
                </Link>
              </div>
              
              <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-xl p-8 border border-blue-500/30">
                <h3 className="text-2xl font-bold text-white mb-4">Business & Enterprise</h3>
                <p className="text-gray-300 mb-6">
                  Professional-grade transcription for meetings, training, and compliance. 
                  Enterprise security and scalability built-in.
                </p>
                <Link
                  href="/pricing"
                  className="inline-flex items-center text-blue-300 hover:text-white font-medium"
                >
                  View enterprise pricing →
                </Link>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl p-8 border border-purple-500/30">
            <h2 className="text-2xl font-bold text-white mb-4">
              Ready to Transform Your Workflow?
            </h2>
            <p className="text-gray-300 mb-6">
              Join thousands of professionals who have revolutionized their transcription process with TranscribeAI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
              >
                <FileText className="h-5 w-5 mr-2" />
                Start Free Trial
              </Link>
              <Link
                href="/compare"
                className="inline-flex items-center justify-center px-8 py-3 bg-white/10 text-white font-medium rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-200"
              >
                <FileText className="h-5 w-5 mr-2" />
                Compare Features
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
