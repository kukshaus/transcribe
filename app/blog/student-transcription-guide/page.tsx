import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import { ArrowLeft, Calendar, Clock, GraduationCap, CheckCircle, Star, Zap, BookOpen, Users, Target, Lightbulb } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Student Guide: Transform Lectures into Study Notes with AI | TranscribeAI',
  description: 'Students, discover how AI transcription can revolutionize your study routine. Convert long lectures into searchable study materials and never miss important information again.',
  keywords: 'student transcription, lecture notes, study materials, AI for students, educational transcription, academic transcription',
  openGraph: {
    title: 'Student Guide: Transform Lectures into Study Notes with AI',
    description: 'Students, discover how AI transcription can revolutionize your study routine. Convert long lectures into searchable study materials and never miss important information again.',
    type: 'article',
    url: '/blog/student-transcription-guide',
    publishedTime: '2024-01-03T00:00:00.000Z',
    authors: ['TranscribeAI'],
    tags: ['Student Transcription', 'Lecture Notes', 'Study Materials', 'AI for Education'],
  },
}

export default function StudentTranscriptionGuide() {
  const benefits = [
    {
      icon: <Zap className="h-6 w-6 text-yellow-400" />,
      title: "Save 3-5 Hours Per Week",
      description: "Stop frantically taking notes during lectures. Focus on understanding while our AI captures everything for you."
    },
    {
      icon: <BookOpen className="h-6 w-6 text-blue-400" />,
      title: "Never Miss Key Points",
      description: "Our AI captures every detail, ensuring you don't miss important concepts, examples, or exam hints."
    },
    {
      icon: <Target className="h-6 w-6 text-red-400" />,
      title: "Searchable Study Materials",
      description: "Find specific topics instantly in your transcripts. No more flipping through pages to locate information."
    },
    {
      icon: <Users className="h-6 w-6 text-green-400" />,
      title: "Perfect for Group Study",
      description: "Share comprehensive notes with classmates, ensuring everyone has access to the same information."
    }
  ]

  const useCases = [
    "University lectures and seminars",
    "Online course recordings",
    "Study group discussions",
    "Research interviews",
    "Academic presentations",
    "Tutorial sessions"
  ]

  const studyStrategies = [
    {
      title: "Pre-Lecture Preparation",
      description: "Review previous transcripts to refresh your memory and identify areas that need clarification."
    },
    {
      title: "Active Listening",
      description: "Focus on understanding concepts rather than note-taking. Our AI handles the documentation."
    },
    {
      title: "Post-Lecture Review",
      description: "Read through transcripts within 24 hours to reinforce learning and identify questions."
    },
    {
      title: "Study Session Integration",
      description: "Use transcripts to create flashcards, study guides, and practice questions."
    }
  ]

  const subjects = [
    {
      subject: "STEM Fields",
      examples: "Mathematics, Physics, Chemistry, Engineering, Computer Science",
      benefits: "Capture complex formulas, step-by-step problem solving, and technical terminology accurately."
    },
    {
      subject: "Humanities",
      examples: "History, Literature, Philosophy, Languages, Arts",
      benefits: "Preserve nuanced discussions, cultural context, and interpretive analysis."
    },
    {
      subject: "Social Sciences",
      examples: "Psychology, Sociology, Economics, Political Science",
      benefits: "Document case studies, research findings, and theoretical frameworks."
    },
    {
      subject: "Professional Programs",
      examples: "Medicine, Law, Business, Education",
      benefits: "Maintain detailed records for licensing exams and professional development."
    }
  ]

  const tips = [
    "Record lectures with your phone or laptop for high-quality audio",
    "Use timestamps to quickly navigate to specific topics",
    "Create study groups to share and compare transcripts",
    "Export transcripts to your preferred note-taking apps",
    "Use transcripts for exam preparation and review sessions",
    "Combine transcripts with your own notes for comprehensive study materials"
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
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                Education
              </span>
              <span className="text-blue-300 text-sm">Student Guide</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Student Guide: Transform Lectures into Study Notes with AI
            </h1>
            
            <p className="text-xl text-gray-300 mb-6 leading-relaxed">
              Students, discover how AI transcription can revolutionize your study routine. Convert long lectures into searchable study materials and never miss important information again.
            </p>
            
            <div className="flex items-center gap-6 text-gray-400">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span>January 3, 2024</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span>9 min read</span>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <article className="prose prose-invert prose-lg max-w-none">
            <div className="bg-white/5 rounded-xl p-8 border border-white/10 backdrop-blur-sm mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">The Student's Struggle with Note-Taking</h2>
              <p className="text-gray-300 mb-6">
                Every student knows the challenge: sitting in a lecture, trying to write down every important point while simultaneously understanding the material. It's like trying to catch water with your hands - you end up with some, but most slips through your fingers.
              </p>
              <p className="text-gray-300">
                Traditional note-taking forces you to make impossible choices: listen carefully or write quickly? Understand the concept or capture the details? With AI transcription, you don't have to choose anymore. You can focus entirely on learning while our technology handles the documentation.
              </p>
            </div>

            {/* Benefits */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-white mb-8">Why AI Transcription is a Game-Changer for Students</h2>
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
              <h2 className="text-3xl font-bold text-white mb-6">Perfect For These Academic Scenarios</h2>
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

            {/* Study Strategies */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-white mb-8">Optimize Your Study Routine with AI</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {studyStrategies.map((strategy, index) => (
                  <div key={index} className="bg-white/5 rounded-xl p-6 border border-white/10 backdrop-blur-sm">
                    <h3 className="text-lg font-semibold text-white mb-3">{strategy.title}</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">{strategy.description}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Subject-Specific Benefits */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-white mb-8">Benefits Across Different Academic Fields</h2>
              <div className="space-y-4">
                {subjects.map((subject, index) => (
                  <div key={index} className="bg-white/5 rounded-xl p-6 border border-white/10 backdrop-blur-sm">
                    <h3 className="text-lg font-semibold text-white mb-2">{subject.subject}</h3>
                    <p className="text-gray-300 text-sm mb-2">Examples: {subject.examples}</p>
                    <p className="text-gray-300 text-sm">{subject.benefits}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Pro Tips */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-white mb-6">Pro Tips for Student Success</h2>
              <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-xl p-6 border border-blue-500/30">
                <ul className="grid md:grid-cols-2 gap-3">
                  {tips.map((tip, index) => (
                    <li key={index} className="flex items-center gap-3 text-gray-300">
                      <Lightbulb className="h-5 w-5 text-blue-400 flex-shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Success Metrics */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-white mb-6">The Impact on Academic Performance</h2>
              <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-xl p-8 border border-green-500/30">
                <div className="grid md:grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-3xl font-bold text-green-400 mb-2">3-5 Hours</div>
                    <div className="text-gray-300 text-sm">Saved per week</div>
                    <div className="text-gray-400 text-xs">More study time</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-green-400 mb-2">95%+</div>
                    <div className="text-gray-300 text-sm">Information captured</div>
                    <div className="text-gray-400 text-xs">Nothing missed</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-green-400 mb-2">100%</div>
                    <div className="text-gray-300 text-sm">Searchable content</div>
                    <div className="text-gray-400 text-xs">Find anything fast</div>
                  </div>
                </div>
              </div>
            </section>

            {/* CTA */}
            <section className="text-center bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl p-8 border border-purple-500/30">
              <h2 className="text-2xl font-bold text-white mb-4">Ready to Transform Your Study Experience?</h2>
              <p className="text-gray-300 mb-6">
                Start using AI transcription today and never miss another important lecture detail again.
              </p>
              <Link
                href="/"
                className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
              >
                <GraduationCap className="h-5 w-5 mr-2" />
                Start Transcribing Lectures
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
                href="/blog/ai-meeting-notes"
                className="bg-white/5 rounded-xl p-6 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
              >
                <h3 className="text-lg font-semibold text-white mb-2">AI-Powered Meeting Notes</h3>
                <p className="text-gray-300 text-sm">Transform meeting recordings into actionable notes with AI technology.</p>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
