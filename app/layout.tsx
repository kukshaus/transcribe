import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Audio Transcriber',
  description: 'Transcribe audio from YouTube, Spotify, and other platforms with AI-powered notes',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Audio Transcriber
            </h1>
            <p className="text-lg text-gray-600">
              Transform audio content from any platform into searchable text and organized notes
            </p>
          </header>
          {children}
        </div>
      </body>
    </html>
  )
}
