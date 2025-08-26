import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export interface AdminUser {
  _id: string
  email: string
  name: string
  tokens: number
  isAdmin: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export async function checkAdminPermission(): Promise<{ isAdmin: boolean; user?: AdminUser; error?: string }> {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || !session?.user?.email) {
      return { isAdmin: false, error: 'Authentication required' }
    }

    const db = await getDatabase()
    const usersCollection = db.collection('users')
    
    const user = await usersCollection.findOne(
      { _id: new ObjectId(session.user.id) },
      { projection: { 
        _id: 1, 
        email: 1, 
        name: 1, 
        tokens: 1, 
        isAdmin: 1, 
        isActive: 1, 
        createdAt: 1, 
        updatedAt: 1 
      }}
    )

    if (!user) {
      return { isAdmin: false, error: 'User not found' }
    }

    if (!user.isAdmin) {
      return { isAdmin: false, error: 'Admin access required' }
    }

    return { 
      isAdmin: true, 
      user: {
        _id: user._id.toString(),
        email: user.email,
        name: user.name,
        tokens: user.tokens,
        isAdmin: user.isAdmin,
        isActive: user.isActive ?? true,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    }
  } catch (error) {
    console.error('Error checking admin permission:', error)
    return { isAdmin: false, error: 'Internal server error' }
  }
}

export async function getAllUsers(): Promise<AdminUser[]> {
  const db = await getDatabase()
  const usersCollection = db.collection('users')
  
  const users = await usersCollection.find({}, {
    projection: {
      _id: 1,
      email: 1,
      name: 1,
      tokens: 1,
      isAdmin: 1,
      isActive: 1,
      createdAt: 1,
      updatedAt: 1
    }
  }).sort({ createdAt: -1 }).toArray()

  return users.map(user => ({
    _id: user._id.toString(),
    email: user.email,
    name: user.name,
    tokens: user.tokens,
    isAdmin: user.isAdmin ?? false,
    isActive: user.isActive ?? true,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  }))
}

export async function getUserTranscriptions(userId: string): Promise<any[]> {
  const db = await getDatabase()
  const transcriptionsCollection = db.collection('transcriptions')
  
  return await transcriptionsCollection.find({ userId }).sort({ createdAt: -1 }).toArray()
}

export async function getUserSpendingHistory(userId: string): Promise<any[]> {
  const db = await getDatabase()
  const spendingHistoryCollection = db.collection('spendingHistory')
  
  return await spendingHistoryCollection.find({ userId }).sort({ createdAt: -1 }).toArray()
}
