import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AppProvider from '@/components/AppProvider'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  title: 'TranscribeAI - Free Audio Transcript Generator',
  description: 'Transform audio content from any platform into searchable text and organized notes. Instantly, without uploading video files.',
  keywords: 'audio transcription, youtube transcript, podcast transcription, AI transcriber, audio to text',
  authors: [{ name: 'TranscribeAI' }],
  openGraph: {
    title: 'TranscribeAI - Free Audio Transcript Generator',
    description: 'Transform audio content from any platform into searchable text and organized notes.',
    type: 'website',
    url: '/',
    siteName: 'TranscribeAI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TranscribeAI - Free Audio Transcript Generator',
    description: 'Transform audio content from any platform into searchable text and organized notes.',
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
        <AppProvider>
          <Header />
          <main className="pt-16">
            {children}
          </main>
          <Footer />
        </AppProvider>
      </body>
    </html>
  )
}
