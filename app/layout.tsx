import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AppProvider from '@/components/AppProvider'
import Script from 'next/script'
import PerformanceMonitor from '@/components/PerformanceMonitor'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://transcribe.snapcoder.io'),
  title: 'TranscribeAI - Best AI Transcription Software for YouTube, Podcasts & Meetings',
  description: 'Transform YouTube videos, SoundCloud audio, and meetings into searchable text instantly. Best AI transcription software for students, product managers, and professionals. Free trial available.',
  keywords: 'AI transcription software, YouTube transcript generator, SoundCloud to text, meeting notes AI, PRD generator, podcast transcription, audio to text converter, AI note-taking, product documentation software, transcription credits',
  authors: [{ name: 'TranscribeAI' }],
  creator: 'TranscribeAI',
  publisher: 'TranscribeAI',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'TranscribeAI - Best AI Transcription Software for YouTube, Podcasts & Meetings',
    description: 'Transform YouTube videos, SoundCloud audio, and meetings into searchable text instantly. Best AI transcription software for students, product managers, and professionals.',
    type: 'website',
    url: '/',
    siteName: 'TranscribeAI',
    locale: 'en_US',
    images: [
      {
        url: '/transcribeai-logo.png',
        width: 1200,
        height: 630,
        alt: 'TranscribeAI - AI Transcription Software',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TranscribeAI - Best AI Transcription Software for YouTube, Podcasts & Meetings',
    description: 'Transform YouTube videos, SoundCloud audio, and meetings into searchable text instantly. Best AI transcription software for students, product managers, and professionals.',
    images: ['/transcribeai-logo.png'],
    creator: '@transcribeai',
    site: '@transcribeai',
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  // Additional meta tags for better SEO
  other: {
    'twitter:site': '@transcribeai',
    'twitter:creator': '@transcribeai',
    'og:site_name': 'TranscribeAI',
    'og:type': 'website',
    'og:locale': 'en_US',
    'article:author': 'TranscribeAI',
    'article:publisher': 'TranscribeAI',
    'category': 'Technology',
    'classification': 'AI Software',
    'subject': 'Transcription Software',
    'language': 'en',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.svg" />
      </head>
      <body className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 min-h-screen">
        {/* Google Analytics */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
              page_title: document.title,
              page_location: window.location.href,
            });
          `}
        </Script>
        
        <AppProvider>
          <Header />
          <main className="pt-16">
            {children}
          </main>
          <Footer />
          <PerformanceMonitor />
        </AppProvider>
      </body>
    </html>
  )
}
