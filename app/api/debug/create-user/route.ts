import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function POST() {
  try {
    const db = await getDatabase()
    const usersCollection = db.collection('users')
    
    // Create the user that should exist for your session
    const userId = '68a35b00647d38ec095fe725'
    const user = {
      _id: new ObjectId(userId),
      email: 'sagei.lol@googlemail.com',
      name: 'Sergej Kukshausen',
      image: 'https://lh3.googleusercontent.com/a/ACg8ocIjYuRNQqd3ktjblRbz8wPf8F0BuVE6U9WI6XpOBEckOpwSXTJl=s96-c',
      tokens: 23, // 3 free + 20 from payments (2 payments of 10 each)
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    // Check if user already exists
    const existingUser = await usersCollection.findOne({ _id: new ObjectId(userId) })
    
    if (existingUser) {
      return NextResponse.json({ 
        message: 'User already exists',
        user: existingUser 
      })
    }
    
    await usersCollection.insertOne(user)
    
    console.log('Created user:', user)
    
    return NextResponse.json({ 
      message: 'User created successfully',
      user 
    })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
