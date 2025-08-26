import { NextRequest, NextResponse } from 'next/server'
import { checkAdminPermission, getAllUsers } from '@/lib/admin'

export async function GET(request: NextRequest) {
  try {
    const adminCheck = await checkAdminPermission()
    
    if (!adminCheck.isAdmin) {
      return NextResponse.json({ error: adminCheck.error }, { status: 403 })
    }

    const users = await getAllUsers()
    
    return NextResponse.json({ 
      users,
      total: users.length,
      adminUser: adminCheck.user
    })
  } catch (error) {
    console.error('Error fetching users for admin:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
