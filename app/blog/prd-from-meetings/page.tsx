import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import { ArrowLeft, Calendar, Clock, FileText, CheckCircle, Star, Zap, Target, Users, TrendingUp, Lightbulb } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Create PRDs from Meeting Recordings: AI-Powered Product Development | TranscribeAI',
  description: 'Streamline your product development process by automatically generating PRDs from meeting recordings. Save hours of manual work and create comprehensive product requirements documents.',
  keywords: 'PRD generation, product requirements document, meeting to PRD, AI product development, product management automation',
  openGraph: {
    title: 'Create PRDs from Meeting Recordings: AI-Powered Product Development',
    description: 'Streamline your product development process by automatically generating PRDs from meeting recordings. Save hours of manual work and create comprehensive product requirements documents.',
    type: 'article',
    url: '/blog/prd-from-meetings',
    publishedTime: '2024-01-08T00:00:00.000Z',
    authors: ['TranscribeAI'],
    tags: ['PRD Generation', 'Product Development', 'Product Management', 'AI Automation'],
  },
}

export default function PRDFromMeetings() {
  const benefits = [
    {
      icon: <Zap className="h-6 w-6 text-yellow-400" />,
      title: "Save 8-12 Hours Per PRD",
      description: "Transform hours of manual documentation into minutes of AI-powered generation. Focus on strategy, not paperwork."
    },
    {
      icon: <Target className="h-6 w-6 text-red-400" />,
      title: "Capture Every Detail",
      description: "Never miss important requirements, constraints, or stakeholder feedback that gets lost in manual note-taking."
    },
    {
      icon: <Users className="h-6 w-6 text-blue-400" />,
      title: "Stakeholder Alignment",
      description: "Ensure all voices are heard and documented, creating PRDs that truly reflect the collective vision."
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-green-400" />,
      title: "Faster Time to Market",
      description: "Accelerate product development cycles by reducing documentation bottlenecks and improving requirement clarity."
    }
  ]

  const prdSections = [
    {
      title: "Executive Summary",
      description: "AI-generated overview of the product vision, goals, and key success metrics discussed in the meeting."
    },
    {
      title: "Product Overview",
      description: "Clear description of what the product is, who it's for, and why it's needed based on meeting discussions."
    },
    {
      title: "User Stories & Requirements",
      description: "Detailed user stories and functional requirements extracted from stakeholder conversations and use case discussions."
    },
    {
      title: "Technical Requirements",
      description: "Technical specifications, constraints, and integration requirements mentioned during technical discussions."
    },
    {
      title: "Success Metrics",
      description: "KPIs and success criteria that stakeholders identified as important for measuring product success."
    },
    {
      title: "Timeline & Milestones",
      description: "Project timeline and key milestones based on discussions about development phases and launch dates."
    }
  ]

  const workflow = [
    {
      step: 1,
      title: "Record Stakeholder Meetings",
      description: "Record all relevant meetings: stakeholder interviews, requirement gathering sessions, technical discussions, and user research sessions. Our AI works with any audio format."
    },
    {
      step: 2,
      title: "Upload to TranscribeAI",
      description: "Upload your meeting recordings or paste URLs if they're hosted online. Process multiple meetings at once to create comprehensive PRDs."
    },
    {
      step: 3,
      title: "AI Analysis & PRD Generation",
      description: "Our AI analyzes the conversations, identifies key requirements, extracts user stories, and structures everything into a professional PRD format."
    },
    {
      step: 4,
      title: "Review & Refine",
      description: "Review the AI-generated PRD, make any adjustments, add missing details, and ensure all requirements are accurately captured."
    },
    {
      step: 5,
      title: "Share & Iterate",
      description: "Share the PRD with stakeholders for feedback, make revisions based on their input, and finalize the document for development teams."
    }
  ]

  const useCases = [
    "Product managers creating PRDs for new features",
    "Startup founders documenting product vision",
    "Enterprise teams managing complex product portfolios",
    "Consultants delivering client requirements",
    "Development teams clarifying project scope",
    "Stakeholders aligning on product direction"
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
              <span className="bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                Product Management
              </span>
              <span className="text-orange-300 text-sm">PRD Generation</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Create PRDs from Meeting Recordings: AI-Powered Product Development
            </h1>
            
            <p className="text-xl text-gray-300 mb-6 leading-relaxed">
              Streamline your product development process by automatically generating PRDs from meeting recordings. Save hours of manual work and create comprehensive product requirements documents.
            </p>
            
            <div className="flex items-center gap-6 text-gray-400">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span>January 8, 2024</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span>12 min read</span>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <article className="prose prose-invert prose-lg max-w-none">
            <div className="bg-white/5 rounded-xl p-8 border border-white/10 backdrop-blur-sm mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">The PRD Problem in Product Development</h2>
              <p className="text-gray-300 mb-6">
                Product Requirements Documents (PRDs) are the foundation of successful product development, but creating them is often a painful, time-consuming process. Product managers spend countless hours listening to meeting recordings, taking notes, and manually crafting documents that should capture the collective wisdom of stakeholders.
              </p>
              <p className="text-gray-300">
                The traditional approach has several flaws: important details get lost in translation, stakeholder feedback isn't consistently captured, and the final document often doesn't reflect the full scope of discussions. This leads to misaligned teams, scope creep, and products that don't meet user needs.
              </p>
            </div>

            {/* Benefits */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-white mb-8">Why AI-Powered PRD Generation Changes Everything</h2>
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

            {/* PRD Sections */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-white mb-8">Comprehensive PRD Sections Generated Automatically</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {prdSections.map((section, index) => (
                  <div key={index} className="bg-white/5 rounded-xl p-6 border border-white/10 backdrop-blur-sm">
                    <h3 className="text-lg font-semibold text-white mb-3">{section.title}</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">{section.description}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Workflow */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-white mb-8">How AI PRD Generation Works</h2>
              <div className="space-y-6">
                {workflow.map((step) => (
                  <div key={step.step} className="bg-white/5 rounded-xl p-6 border border-white/10 backdrop-blur-sm">
                    <div className="flex items-start gap-4">
                      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
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
              <h2 className="text-3xl font-bold text-white mb-6">Perfect For These Product Teams</h2>
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
              <h2 className="text-3xl font-bold text-white mb-6">The ROI of AI PRD Generation</h2>
              <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 rounded-xl p-8 border border-orange-500/30">
                <div className="grid md:grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-3xl font-bold text-orange-400 mb-2">8-12 Hours</div>
                    <div className="text-gray-300 text-sm">Saved per PRD</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-orange-400 mb-2">100%</div>
                    <div className="text-gray-300 text-sm">Stakeholder coverage</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-orange-400 mb-2">50%</div>
                    <div className="text-gray-300 text-sm">Faster development</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Best Practices */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-white mb-6">Best Practices for AI PRD Generation</h2>
              <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl p-6 border border-purple-500/30">
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-gray-300">
                    <span className="text-purple-300 font-bold">💡</span>
                    <span>Record all stakeholder meetings, not just formal requirement sessions</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-300">
                    <span className="text-purple-300 font-bold">💡</span>
                    <span>Include diverse perspectives: users, developers, designers, and business stakeholders</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-300">
                    <span className="text-purple-300 font-bold">💡</span>
                    <span>Process multiple meetings together for comprehensive coverage</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-300">
                    <span className="text-purple-300 font-bold">💡</span>
                    <span>Always review and refine AI-generated content before sharing</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* CTA */}
            <section className="text-center bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl p-8 border border-purple-500/30">
              <h2 className="text-2xl font-bold text-white mb-4">Ready to Revolutionize Your PRD Process?</h2>
              <p className="text-gray-300 mb-6">
                Start generating comprehensive PRDs from your meeting recordings today and transform how your team develops products.
              </p>
              <Link
                href="/"
                className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
              >
                <Lightbulb className="h-5 w-5 mr-2" />
                Start Generating PRDs
              </Link>
            </section>
          </article>

          {/* Related Articles */}
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-white mb-6">Related Articles</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Link
                href="/blog/ai-meeting-notes"
                className="bg-white/5 rounded-xl p-6 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
              >
                <h3 className="text-lg font-semibold text-white mb-2">AI-Powered Meeting Notes</h3>
                <p className="text-gray-300 text-sm">Transform meeting recordings into actionable notes with AI technology.</p>
              </Link>
              <Link
                href="/blog/how-to-transcribe-youtube-videos"
                className="bg-white/5 rounded-xl p-6 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
              >
                <h3 className="text-lg font-semibold text-white mb-2">How to Transcribe YouTube Videos</h3>
                <p className="text-gray-300 text-sm">Complete guide to transcribing YouTube videos with step-by-step instructions.</p>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
