import NextAuth, { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { MongoDBAdapter } from '@auth/mongodb-adapter'
import { MongoClient } from 'mongodb'

const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(
    (async () => {
      const client = new MongoClient(process.env.MONGODB_URI!)
      await client.connect()
      return client
    })()
  ),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.uid = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.uid as string
      }
      return session
    },
    async signIn({ user, account, profile }) {
      // Ensure user exists in our users collection with token field
      if (user.email) {
        try {
          const { MongoClient } = await import('mongodb')
          const client = new MongoClient(process.env.MONGODB_URI!)
          await client.connect()
          const db = client.db()
          const usersCollection = db.collection('users')
          
          // Check if user exists, if not create them with initial tokens
          const existingUser = await usersCollection.findOne({ email: user.email })
          
          if (!existingUser) {
            console.log('Creating new user with tokens:', user.email)
            await usersCollection.insertOne({
              email: user.email,
              name: user.name,
              image: user.image,
              tokens: 3, // Free tokens for new users
              createdAt: new Date(),
              updatedAt: new Date()
            })
          } else if (existingUser.tokens === undefined) {
            // User exists but doesn't have tokens field, add it
            console.log('Adding tokens field to existing user:', user.email)
            await usersCollection.updateOne(
              { email: user.email },
              { 
                $set: { 
                  tokens: 3,
                  updatedAt: new Date()
                }
              }
            )
          }
          
          await client.close()
        } catch (error) {
          console.error('Error ensuring user exists:', error)
        }
      }
      return true
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST, authOptions }
