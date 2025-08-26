import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AppProvider from '@/components/AppProvider'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  title: {
    default: 'TranscribeAI - #1 AI Audio Transcription Service | YouTube, Podcast, Meeting Transcripts',
    template: '%s | TranscribeAI - AI Audio Transcription'
  },
  description: 'Transform audio content from YouTube, SoundCloud, podcasts, meetings, and lectures into searchable text instantly. Best AI transcription service with 99% accuracy. No file uploads required.',
  keywords: [
    'audio transcription', 'youtube transcript', 'podcast transcription', 'AI transcriber', 'audio to text',
    'meeting transcription', 'lecture transcription', 'speech to text', 'automatic transcription',
    'transcription service', 'AI transcription software', 'bulk audio transcription', 'professional transcription',
    'video to text', 'soundcloud transcript', 'webinar transcription', 'interview transcription',
    'voice to text', 'real-time transcription', 'multilingual transcription', 'HIPAA compliant transcription',
    'enterprise transcription', 'transcription API', 'AI note-taking', 'product documentation software',
    'meeting notes automation', 'PRD generation', 'study notes from audio', 'lecture notes generator'
  ],
  authors: [{ name: 'TranscribeAI Team' }],
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
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'TranscribeAI',
    title: 'TranscribeAI - #1 AI Audio Transcription Service | YouTube, Podcast, Meeting Transcripts',
    description: 'Transform audio content from YouTube, SoundCloud, podcasts, meetings, and lectures into searchable text instantly. Best AI transcription service with 99% accuracy.',
    images: [
      {
        url: '/transcribeai-logo.png',
        width: 1200,
        height: 630,
        alt: 'TranscribeAI - AI Audio Transcription Service',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@transcribeai',
    creator: '@transcribeai',
    title: 'TranscribeAI - #1 AI Audio Transcription Service',
    description: 'Transform audio content from YouTube, SoundCloud, podcasts, meetings, and lectures into searchable text instantly.',
    images: ['/transcribeai-logo.png'],
  },
  alternates: {
    canonical: '/',
  },
  category: 'technology',
  classification: 'AI Transcription Service',
  other: {
    'application-name': 'TranscribeAI',
    'apple-mobile-web-app-title': 'TranscribeAI',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'format-detection': 'telephone=no',
    'mobile-web-app-capable': 'yes',
    'msapplication-TileColor': '#7c3aed',
    'msapplication-config': '/browserconfig.xml',
    'theme-color': '#7c3aed',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        "url": baseUrl,
        "name": "TranscribeAI",
        "description": "Transform audio content from YouTube, SoundCloud, podcasts, meetings, and lectures into searchable text instantly. Best AI transcription service with 99% accuracy.",
        "publisher": {
          "@id": `${baseUrl}/#organization`
        },
        "potentialAction": [
          {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": `${baseUrl}/?q={search_term_string}`
            },
            "query-input": "required name=search_term_string"
          }
        ],
        "inLanguage": "en-US"
      },
      {
        "@type": "Organization",
        "@id": `${baseUrl}/#organization`,
        "name": "TranscribeAI",
        "url": baseUrl,
        "logo": {
          "@type": "ImageObject",
          "inLanguage": "en-US",
          "@id": `${baseUrl}/#/schema/logo/image/`,
          "url": `${baseUrl}/transcribeai-logo.png`,
          "contentUrl": `${baseUrl}/transcribeai-logo.png`,
          "width": 512,
          "height": 512,
          "caption": "TranscribeAI"
        },
        "image": {
          "@id": `${baseUrl}/#/schema/logo/image/`
        },
        "sameAs": [
          "https://twitter.com/transcribeai",
          "https://linkedin.com/company/transcribeai"
        ],
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "customer service",
          "availableLanguage": "English"
        }
      },
      {
        "@type": "WebPage",
        "@id": `${baseUrl}/#webpage`,
        "url": baseUrl,
        "name": "TranscribeAI - #1 AI Audio Transcription Service | YouTube, Podcast, Meeting Transcripts",
        "isPartOf": {
          "@id": `${baseUrl}/#website`
        },
        "about": {
          "@id": `${baseUrl}/#organization`
        },
        "description": "Transform audio content from YouTube, SoundCloud, podcasts, meetings, and lectures into searchable text instantly. Best AI transcription service with 99% accuracy.",
        "breadcrumb": {
          "@id": `${baseUrl}/#breadcrumb`
        },
        "inLanguage": "en-US"
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${baseUrl}/#breadcrumb`,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": baseUrl
          }
        ]
      },
      {
        "@type": "SoftwareApplication",
        "name": "TranscribeAI",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Web Browser",
        "description": "AI-powered audio transcription service that converts YouTube videos, podcasts, meetings, and lectures into searchable text instantly.",
        "url": baseUrl,
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
          "description": "Free tier available with premium features"
        },
        "featureList": [
          "YouTube video transcription",
          "Podcast transcription",
          "Meeting transcription",
          "Lecture transcription",
          "SoundCloud audio transcription",
          "AI-powered note generation",
          "PRD generation from meetings",
          "Real-time transcription",
          "Bulk transcription",
          "Multilingual support"
        ],
        "screenshot": `${baseUrl}/transcribeai-logo.png`,
        "softwareVersion": "2.0",
        "datePublished": "2024-01-01",
        "dateModified": "2024-12-19",
        "author": {
          "@id": `${baseUrl}/#organization`
        },
        "publisher": {
          "@id": `${baseUrl}/#organization`
        }
      },
      {
        "@type": "Service",
        "name": "AI Audio Transcription Service",
        "description": "Professional AI-powered transcription service for YouTube videos, podcasts, meetings, lectures, and audio files.",
        "provider": {
          "@id": `${baseUrl}/#organization`
        },
        "areaServed": "Worldwide",
        "serviceType": "Transcription Service",
        "offers": {
          "@type": "Offer",
          "name": "Transcription Service",
          "description": "Convert audio to text with 99% accuracy",
          "price": "0",
          "priceCurrency": "USD"
        },
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": "Transcription Services",
          "itemListElement": [
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "YouTube Video Transcription"
              }
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Podcast Transcription"
              }
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Meeting Transcription"
              }
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Lecture Transcription"
              }
            }
          ]
        }
      }
    ]
  }

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.svg" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData)
          }}
        />
        <meta name="google-site-verification" content="your-google-verification-code" />
        <meta name="msvalidate.01" content="your-bing-verification-code" />
        <meta name="yandex-verification" content="your-yandex-verification-code" />
        <meta name="baidu-site-verification" content="your-baidu-verification-code" />
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
