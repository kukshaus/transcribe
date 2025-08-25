import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import { ArrowLeft, CheckCircle, X, Star, Clock, Zap, Shield, Download } from 'lucide-react'

export const metadata: Metadata = {
  title: 'TranscribeAI vs Competitors: Best AI Transcription Software Comparison 2024',
  description: 'Compare TranscribeAI with other transcription services. See why we offer the best accuracy, speed, and features for YouTube, SoundCloud, and meeting transcription.',
  keywords: 'TranscribeAI vs competitors, best transcription software, AI transcription comparison, YouTube transcript tools comparison, meeting transcription services',
  openGraph: {
    title: 'TranscribeAI vs Competitors: Best AI Transcription Software Comparison 2024',
    description: 'Compare TranscribeAI with other transcription services. See why we offer the best accuracy, speed, and features.',
    type: 'website',
    url: '/compare',
  },
}

export default function ComparePage() {
  const features = [
    {
      name: 'YouTube Transcription',
      transcribeai: true,
      competitor1: true,
      competitor2: false,
      competitor3: true
    },
    {
      name: 'SoundCloud Support',
      transcribeai: true,
      competitor1: false,
      competitor2: true,
      competitor3: false
    },
    {
      name: 'AI Notes Generation',
      transcribeai: true,
      competitor1: false,
      competitor2: false,
      competitor3: false
    },
    {
      name: 'PRD Generation',
      transcribeai: true,
      competitor1: false,
      competitor2: false,
      competitor3: false
    },
    {
      name: 'No File Upload Required',
      transcribeai: true,
      competitor1: false,
      competitor2: false,
      competitor3: true
    },
    {
      name: '95%+ Accuracy',
      transcribeai: true,
      competitor1: true,
      competitor2: false,
      competitor3: true
    },
    {
      name: 'Instant Processing',
      transcribeai: true,
      competitor1: false,
      competitor2: false,
      competitor3: false
    },
    {
      name: 'Multiple Export Formats',
      transcribeai: true,
      competitor1: true,
      competitor2: true,
      competitor3: false
    },
    {
      name: 'Free Trial Available',
      transcribeai: true,
      competitor1: false,
      competitor2: false,
      competitor3: true
    },
    {
      name: 'No Subscription Required',
      transcribeai: true,
      competitor1: false,
      competitor2: false,
      competitor3: false
    }
  ]

  const competitors = [
    {
      name: 'Competitor A',
      description: 'Traditional transcription service with limited AI features',
      pros: ['Good accuracy', 'Multiple formats'],
      cons: ['Slow processing', 'File upload required', 'No AI features', 'Subscription only']
    },
    {
      name: 'Competitor B',
      description: 'Basic audio transcription with minimal features',
      pros: ['Simple interface', 'Affordable'],
      cons: ['Low accuracy', 'Limited platform support', 'No advanced features', 'Slow processing']
    },
    {
      name: 'Competitor C',
      description: 'YouTube-focused tool with basic transcription',
      pros: ['YouTube support', 'Free tier'],
      cons: ['Limited accuracy', 'No AI features', 'Platform restrictions', 'Basic exports only']
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
              TranscribeAI vs Competitors
            </h1>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto">
              See how TranscribeAI stacks up against other transcription services. 
              We offer the most comprehensive AI-powered transcription solution with unmatched features and accuracy.
            </p>
          </div>

          {/* Feature Comparison Table */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              Feature Comparison
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-6 text-white font-semibold">Feature</th>
                    <th className="text-center p-6 text-white font-semibold">TranscribeAI</th>
                    <th className="text-center p-6 text-gray-300 font-semibold">Competitor A</th>
                    <th className="text-center p-6 text-gray-300 font-semibold">Competitor B</th>
                    <th className="text-center p-6 text-gray-300 font-semibold">Competitor C</th>
                  </tr>
                </thead>
                <tbody>
                  {features.map((feature, index) => (
                    <tr key={index} className="border-b border-white/5">
                      <td className="p-6 text-white font-medium">{feature.name}</td>
                      <td className="text-center p-6">
                        {feature.transcribeai ? (
                          <CheckCircle className="h-6 w-6 text-green-400 mx-auto" />
                        ) : (
                          <X className="h-6 w-6 text-red-400 mx-auto" />
                        )}
                      </td>
                      <td className="text-center p-6">
                        {feature.competitor1 ? (
                          <CheckCircle className="h-6 w-6 text-green-400 mx-auto" />
                        ) : (
                          <X className="h-6 w-6 text-red-400 mx-auto" />
                        )}
                      </td>
                      <td className="text-center p-6">
                        {feature.competitor2 ? (
                          <CheckCircle className="h-6 w-6 text-green-400 mx-auto" />
                        ) : (
                          <X className="h-6 w-6 text-red-400 mx-auto" />
                        )}
                      </td>
                      <td className="text-center p-6">
                        {feature.competitor3 ? (
                          <CheckCircle className="h-6 w-6 text-green-400 mx-auto" />
                        ) : (
                          <X className="h-6 w-6 text-red-400 mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Why Choose TranscribeAI */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              Why Choose TranscribeAI?
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/5 rounded-xl p-6 border border-white/10 backdrop-blur-sm text-center">
                <Zap className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Fastest Processing</h3>
                <p className="text-gray-300 text-sm">Get transcripts in seconds, not minutes</p>
              </div>
              
              <div className="bg-white/5 rounded-xl p-6 border border-white/10 backdrop-blur-sm text-center">
                <Star className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Highest Accuracy</h3>
                <p className="text-gray-300 text-sm">95%+ accuracy with advanced AI models</p>
              </div>
              
              <div className="bg-white/5 rounded-xl p-6 border border-white/10 backdrop-blur-sm text-center">
                <Shield className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Most Secure</h3>
                <p className="text-gray-300 text-sm">Enterprise-grade security and privacy</p>
              </div>
              
              <div className="bg-white/5 rounded-xl p-6 border border-white/10 backdrop-blur-sm text-center">
                <Download className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Most Flexible</h3>
                <p className="text-gray-300 text-sm">Multiple export formats and integrations</p>
              </div>
            </div>
          </div>

          {/* Competitor Analysis */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              Detailed Competitor Analysis
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {competitors.map((competitor, index) => (
                <div key={index} className="bg-white/5 rounded-xl p-6 border border-white/10 backdrop-blur-sm">
                  <h3 className="text-xl font-semibold text-white mb-3">{competitor.name}</h3>
                  <p className="text-gray-300 mb-4 text-sm">{competitor.description}</p>
                  
                  <div className="mb-4">
                    <h4 className="text-green-400 font-medium mb-2">Pros:</h4>
                    <ul className="space-y-1">
                      {competitor.pros.map((pro, proIndex) => (
                        <li key={proIndex} className="text-gray-300 text-sm flex items-center">
                          <CheckCircle className="h-3 w-3 text-green-400 mr-2 flex-shrink-0" />
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-red-400 font-medium mb-2">Cons:</h4>
                    <ul className="space-y-1">
                      {competitor.cons.map((con, conIndex) => (
                        <li key={conIndex} className="text-gray-300 text-sm flex items-center">
                          <X className="h-3 w-3 text-red-400 mr-2 flex-shrink-0" />
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl p-8 border border-purple-500/30">
            <h2 className="text-2xl font-bold text-white mb-4">
              Ready to Experience the Difference?
            </h2>
            <p className="text-gray-300 mb-6">
              Join thousands of users who have switched to TranscribeAI for better transcription results.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
              >
                <Zap className="h-5 w-5 mr-2" />
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
