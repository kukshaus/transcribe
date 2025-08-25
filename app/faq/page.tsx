import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import { ArrowLeft, HelpCircle, CheckCircle, Star } from 'lucide-react'

export const metadata: Metadata = {
  title: 'FAQ - How to Transcribe YouTube Videos, SoundCloud Audio & Generate Meeting Notes | TranscribeAI',
  description: 'Learn how to transcribe YouTube videos, SoundCloud audio, and generate meeting notes with our AI transcription software. Get answers to common questions about transcription services.',
  keywords: 'YouTube transcript, SoundCloud transcription, meeting notes AI, PRD generator, transcription FAQ, audio to text help',
  openGraph: {
    title: 'FAQ - How to Transcribe YouTube Videos, SoundCloud Audio & Generate Meeting Notes',
    description: 'Learn how to transcribe YouTube videos, SoundCloud audio, and generate meeting notes with our AI transcription software.',
    type: 'website',
    url: '/faq',
  },
}

export default function FAQPage() {
  const faqs = [
    {
      category: "YouTube Transcription",
      questions: [
        {
          q: "How to transcribe YouTube videos?",
          a: "Simply copy the YouTube video URL and paste it into our transcription tool. No need to download or upload the video file. Our AI will process the audio and provide you with a complete transcript in seconds."
        },
        {
          q: "Can I get transcripts from private YouTube videos?",
          a: "Yes, as long as you have access to the video URL, our tool can transcribe it. Just paste the URL and our system will handle the rest automatically."
        },
        {
          q: "How accurate are YouTube transcriptions?",
          a: "Our AI transcription software provides industry-leading accuracy, typically achieving 95%+ accuracy for clear audio. The quality depends on audio clarity, speaker accent, and background noise."
        }
      ]
    },
    {
      category: "SoundCloud & Audio Transcription",
      questions: [
        {
          q: "How to get a transcript from SoundCloud?",
          a: "Copy the SoundCloud track URL and paste it into our transcription tool. Our system will automatically extract the audio and convert it to text without requiring any file uploads."
        },
        {
          q: "What audio formats are supported?",
          a: "We support all major audio formats including MP3, WAV, M4A, FLAC, and more. You can also paste URLs from platforms like SoundCloud, Spotify, and other audio hosting services."
        },
        {
          q: "How long does audio transcription take?",
          a: "Most transcriptions are completed within 30 seconds to 2 minutes, depending on the audio length and quality. Our AI processes audio in real-time for optimal speed."
        }
      ]
    },
    {
      category: "Meeting Notes & PRD Generation",
      questions: [
        {
          q: "How to create PRDs from meetings?",
          a: "Upload your meeting recording or paste a meeting audio URL. Our AI will first transcribe the audio, then generate comprehensive meeting notes, and finally create a structured PRD document automatically."
        },
        {
          q: "Can I generate meeting notes from audio files?",
          a: "Absolutely! Our AI transcription software automatically generates meeting notes from any audio file. It identifies key points, action items, and decisions to create organized, searchable notes."
        },
        {
          q: "How accurate are the AI-generated notes?",
          a: "Our AI notes generation maintains the same high accuracy as transcription (95%+). The system intelligently summarizes content while preserving all important details and action items."
        }
      ]
    },
    {
      category: "Productivity & Time Saving",
      questions: [
        {
          q: "How much time does this save compared to manual transcription?",
          a: "Our AI transcription software typically saves 90% of the time compared to manual transcription. A 1-hour meeting that would take 4-6 hours to transcribe manually is completed in just 2-3 minutes."
        },
        {
          q: "Can I use this for academic research?",
          a: "Yes! Many students and researchers use our tool to transcribe lectures, interviews, and research materials. It's perfect for creating study notes and academic documentation."
        },
        {
          q: "Is this suitable for professional use?",
          a: "Absolutely. Our enterprise-grade transcription service is used by product managers, consultants, lawyers, and other professionals for creating accurate documentation and meeting records."
        }
      ]
    },
    {
      category: "Technical & Support",
      questions: [
        {
          q: "Do I need to install any software?",
          a: "No installation required! Our AI transcription software works entirely in your web browser. Just visit our website and start transcribing immediately."
        },
        {
          q: "How secure is my audio content?",
          a: "Your audio content is processed securely and never stored permanently. We use enterprise-grade encryption and follow strict privacy protocols to protect your data."
        },
        {
          q: "What if I'm not satisfied with the transcription?",
          a: "We offer a satisfaction guarantee. If you're not happy with the transcription quality, we'll provide a refund or additional credits to ensure you get the results you need."
        }
      ]
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
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Get answers to common questions about our AI transcription software, 
              YouTube transcription, SoundCloud audio conversion, and meeting notes generation.
            </p>
          </div>

          {/* FAQ Categories */}
          <div className="space-y-12">
            {faqs.map((category, categoryIndex) => (
              <div key={categoryIndex} className="bg-white/5 rounded-xl p-8 border border-white/10 backdrop-blur-sm">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <HelpCircle className="h-6 w-6 mr-3 text-purple-400" />
                  {category.category}
                </h2>
                
                <div className="space-y-6">
                  {category.questions.map((faq, faqIndex) => (
                    <div key={faqIndex} className="border-l-4 border-purple-500 pl-6">
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {faq.q}
                      </h3>
                      <p className="text-gray-300 leading-relaxed">
                        {faq.a}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="mt-16 text-center bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl p-8 border border-purple-500/30">
            <h2 className="text-2xl font-bold text-white mb-4">
              Ready to Start Transcribing?
            </h2>
            <p className="text-gray-300 mb-6">
              Join thousands of users who are already saving time with our AI transcription software.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                Start Free Transcription
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
