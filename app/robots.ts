import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://transcribe.snapcoder.io'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/debug/',
          '/debug-tokens/',
          '/debug-version/',
          '/api/auth/',
          '/api/user/',
          '/api/transcriptions/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
