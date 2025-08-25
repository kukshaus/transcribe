import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import { ArrowLeft, Calendar, Clock, Users, CheckCircle, Star, Zap, FileText, Target, TrendingUp } from 'lucide-react'

export const metadata: Metadata = {
  title: 'AI-Powered Meeting Notes: Transform Audio into Actionable Insights | TranscribeAI',
  description: 'Stop taking manual notes during meetings. Learn how AI can automatically generate comprehensive meeting notes, identify action items, and create follow-up tasks.',
  keywords: 'AI meeting notes, meeting transcription, automatic meeting notes, AI note-taking, meeting productivity, action items',
  openGraph: {
    title: 'AI-Powered Meeting Notes: Transform Audio into Actionable Insights',
    description: 'Stop taking manual notes during meetings. Learn how AI can automatically generate comprehensive meeting notes, identify action items, and create follow-up tasks.',
    type: 'article',
    url: '/blog/ai-meeting-notes',
    publishedTime: '2024-01-10T00:00:00.000Z',
    authors: ['TranscribeAI'],
    tags: ['AI Meeting Notes', 'Meeting Productivity', 'AI Note-Taking', 'Business Productivity'],
  },
}

export default function AIMeetingNotes() {
  const benefits = [
    {
      icon: <Zap className="h-6 w-6 text-yellow-400" />,
      title: "Save 2-3 Hours Per Meeting",
      description: "Focus on the conversation instead of frantic note-taking. Our AI captures everything while you engage fully."
    },
    {
      icon: <Target className="h-6 w-6 text-red-400" />,
      title: "Never Miss Action Items",
      description: "AI automatically identifies and highlights tasks, deadlines, and follow-up items from your meetings."
    },
    {
      icon: <Users className="h-6 w-6 text-blue-400" />,
      title: "Perfect for Team Collaboration",
      description: "Share comprehensive notes instantly with team members, ensuring everyone stays on the same page."
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-green-400" />,
      title: "Improve Meeting ROI",
      description: "Transform meeting time into actionable outcomes with structured, searchable documentation."
    }
  ]

  const features = [
    {
      title: "Automatic Action Item Detection",
      description: "Our AI identifies tasks, deadlines, and responsibilities mentioned during meetings, creating a clear action plan."
    },
    {
      title: "Speaker Identification",
      description: "Know exactly who said what with automatic speaker detection and labeling throughout the conversation."
    },
    {
      title: "Smart Summarization",
      description: "Get executive summaries, key points, and main takeaways automatically generated from your meeting content."
    },
    {
      title: "Integration Ready",
      description: "Export to your favorite tools: Slack, Notion, Asana, Trello, or download as Word/PDF documents."
    }
  ]

  const useCases = [
    "Product managers documenting stakeholder meetings",
    "Sales teams recording customer calls and demos",
    "HR professionals documenting interviews and reviews",
    "Legal teams recording client consultations",
    "Research teams documenting focus groups",
    "Executive teams documenting board meetings"
  ]

  const workflow = [
    {
      step: 1,
      title: "Record Your Meeting",
      description: "Use any recording method: phone, computer, or dedicated recording device. Our AI works with all audio formats and quality levels."
    },
    {
      step: 2,
      title: "Upload to TranscribeAI",
      description: "Simply upload your audio file or paste a meeting recording URL. Our AI will process it automatically, regardless of length."
    },
    {
      step: 3,
      title: "AI Analysis & Processing",
      description: "Our advanced AI analyzes the conversation, identifies speakers, detects action items, and creates structured meeting notes."
    },
    {
      step: 4,
      title: "Review & Customize",
      description: "Review the AI-generated notes, make any adjustments, and add your own insights or follow-up items."
    },
    {
      step: 5,
      title: "Share & Act",
      description: "Share the comprehensive notes with your team, assign action items, and track progress through your preferred project management tools."
    }
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
              <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                Productivity
              </span>
              <span className="text-green-300 text-sm">AI Note-Taking</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              AI-Powered Meeting Notes: Transform Audio into Actionable Insights
            </h1>
            
            <p className="text-xl text-gray-300 mb-6 leading-relaxed">
              Stop taking manual notes during meetings. Learn how AI can automatically generate comprehensive meeting notes, identify action items, and create follow-up tasks.
            </p>
            
            <div className="flex items-center gap-6 text-gray-400">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span>January 10, 2024</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span>10 min read</span>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <article className="prose prose-invert prose-lg max-w-none">
            <div className="bg-white/5 rounded-xl p-8 border border-white/10 backdrop-blur-sm mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">The Problem with Traditional Note-Taking</h2>
              <p className="text-gray-300 mb-6">
                We've all been there: frantically scribbling notes during an important meeting, only to realize later that we missed crucial details or misunderstood key points. Traditional note-taking is not only time-consuming but also prone to errors, incomplete information, and missed action items.
              </p>
              <p className="text-gray-300">
                In today's fast-paced business environment, meetings are expensive investments of time and resources. When team members are focused on taking notes instead of actively participating, the quality of discussion suffers, and valuable insights are lost.
              </p>
            </div>

            {/* Benefits */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-white mb-8">Why AI Meeting Notes Are a Game-Changer</h2>
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

            {/* Features */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-white mb-8">Powerful AI Features for Meeting Notes</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {features.map((feature, index) => (
                  <div key={index} className="bg-white/5 rounded-xl p-6 border border-white/10 backdrop-blur-sm">
                    <h3 className="text-lg font-semibold text-white mb-3">{feature.title}</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Workflow */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-white mb-8">How AI Meeting Notes Work</h2>
              <div className="space-y-6">
                {workflow.map((step) => (
                  <div key={step.step} className="bg-white/5 rounded-xl p-6 border border-white/10 backdrop-blur-sm">
                    <div className="flex items-start gap-4">
                      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
                        {step.step}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                        <p className="text-gray-300 leading-relaxed">{step.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Use Cases */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-white mb-6">Perfect For These Professionals</h2>
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

            {/* ROI Section */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-white mb-6">The ROI of AI Meeting Notes</h2>
              <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-xl p-8 border border-green-500/30">
                <div className="grid md:grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-3xl font-bold text-green-400 mb-2">2-3 Hours</div>
                    <div className="text-gray-300 text-sm">Saved per meeting</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-green-400 mb-2">95%+</div>
                    <div className="text-gray-300 text-sm">Accuracy rate</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-green-400 mb-2">100%</div>
                    <div className="text-gray-300 text-sm">Action items captured</div>
                  </div>
                </div>
              </div>
            </section>

            {/* CTA */}
            <section className="text-center bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl p-8 border border-purple-500/30">
              <h2 className="text-2xl font-bold text-white mb-4">Ready to Transform Your Meeting Productivity?</h2>
              <p className="text-gray-300 mb-6">
                Start using AI-powered meeting notes today and never miss another important detail or action item.
              </p>
              <Link
                href="/"
                className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
              >
                <FileText className="h-5 w-5 mr-2" />
                Start Using AI Meeting Notes
              </Link>
            </section>
          </article>

          {/* Related Articles */}
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-white mb-6">Related Articles</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Link
                href="/blog/how-to-transcribe-youtube-videos"
                className="bg-white/5 rounded-xl p-6 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
              >
                <h3 className="text-lg font-semibold text-white mb-2">How to Transcribe YouTube Videos</h3>
                <p className="text-gray-300 text-sm">Complete guide to transcribing YouTube videos with step-by-step instructions.</p>
              </Link>
              <Link
                href="/blog/soundcloud-transcription-guide"
                className="bg-white/5 rounded-xl p-6 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
              >
                <h3 className="text-lg font-semibold text-white mb-2">SoundCloud Transcription Guide</h3>
                <p className="text-gray-300 text-sm">Transform SoundCloud audio tracks into searchable text with our comprehensive guide.</p>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
