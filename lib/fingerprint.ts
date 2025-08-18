import { NextRequest } from 'next/server'
import crypto from 'crypto'

export function generateUserFingerprint(request: NextRequest): string {
  const ip = request.ip || 
             request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown'
  
  const userAgent = request.headers.get('user-agent') || 'unknown'
  const acceptLanguage = request.headers.get('accept-language') || 'unknown'
  const acceptEncoding = request.headers.get('accept-encoding') || 'unknown'
  
  // Create a hash from multiple browser characteristics
  const fingerprintData = `${ip}-${userAgent}-${acceptLanguage}-${acceptEncoding}`
  
  return crypto
    .createHash('sha256')
    .update(fingerprintData)
    .digest('hex')
    .substring(0, 16) // Shorter hash for storage
}

export function getClientIP(request: NextRequest): string {
  return request.ip || 
         request.headers.get('x-forwarded-for')?.split(',')[0] || 
         request.headers.get('x-real-ip') || 
         'unknown'
}
