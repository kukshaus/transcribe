import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { checkUserTokens } from '@/lib/usage'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    console.log('=== TOKEN API DEBUG ===')
    console.log('Session:', session?.user)
    console.log('User ID from session:', session?.user?.id)
    console.log('User email from session:', session?.user?.email)
    
    if (!session?.user?.id) {
      console.log('No user ID found in session')
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    console.log('Checking tokens for user ID:', session.user.id)
    const { hasTokens, tokenCount } = await checkUserTokens(session.user.id)
    
    console.log('Token check result:', { hasTokens, tokenCount })
    console.log('=== END TOKEN API DEBUG ===')

    return NextResponse.json({
      tokens: tokenCount,
      hasTokens
    })
  } catch (error) {
    console.error('Error fetching user tokens:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
