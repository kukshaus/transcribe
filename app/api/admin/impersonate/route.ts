import { NextRequest, NextResponse } from 'next/server'
import { checkAdminPermission } from '@/lib/admin'
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function POST(request: NextRequest) {
  try {
    const adminCheck = await checkAdminPermission()
    
    if (!adminCheck.isAdmin) {
      return NextResponse.json({ error: adminCheck.error }, { status: 403 })
    }

    const body = await request.json()
    const { userId } = body

    if (!userId || !ObjectId.isValid(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
    }

    const db = await getDatabase()
    const usersCollection = db.collection('users')
    
    // Get the user to impersonate
    const userToImpersonate = await usersCollection.findOne({ _id: new ObjectId(userId) })
    
    if (!userToImpersonate) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get the current admin session
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Admin session not found' }, { status: 401 })
    }

    // Store impersonation data in the session
    const impersonationData = {
      originalAdminId: session.user.id,
      originalAdminEmail: session.user.email,
      impersonatedUserId: userId,
      impersonatedUserEmail: userToImpersonate.email,
      impersonatedAt: new Date().toISOString()
    }

    // Create a new session for the impersonated user
    const response = NextResponse.json({ 
      success: true,
      message: `Now impersonating ${userToImpersonate.email}`,
      impersonationData
    })

    // Set cookies to maintain the impersonation session
    response.cookies.set('impersonation', JSON.stringify(impersonationData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 2 // 2 hours
    })

    return response
  } catch (error) {
    console.error('Error impersonating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const response = NextResponse.json({ 
      success: true,
      message: 'Impersonation ended'
    })

    // Clear the impersonation cookie
    response.cookies.set('impersonation', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0
    })

    return response
  } catch (error) {
    console.error('Error ending impersonation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
