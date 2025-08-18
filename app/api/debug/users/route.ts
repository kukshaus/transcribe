import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'

export async function GET() {
  try {
    const db = await getDatabase()
    
    // Check both possible collections
    const usersCollection = db.collection('users')
    const nextAuthUsersCollection = db.collection('users') // NextAuth might use this
    
    const [users, allCollections] = await Promise.all([
      usersCollection.find({}).limit(10).toArray(),
      db.listCollections().toArray()
    ])
    
    console.log('Available collections:', allCollections.map(c => c.name))
    console.log('Users found:', users.length)
    
    return NextResponse.json({
      collections: allCollections.map(c => c.name),
      users: users.map(user => ({
        _id: user._id.toString(),
        email: user.email,
        tokens: user.tokens || 0,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        rawUser: user // Show the full user object for debugging
      }))
    })
  } catch (error) {
    console.error('Error fetching users for debug:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
