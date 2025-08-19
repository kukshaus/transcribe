import NextAuth, { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { MongoClient } from 'mongodb'

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          // Force account selection every time
          hd: undefined // Allow any domain
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user && user.email) {
        // Get the user ID from our database
        try {
          const { MongoClient } = await import('mongodb')
          const client = new MongoClient(process.env.MONGODB_URI!)
          await client.connect()
          const db = client.db()
          const usersCollection = db.collection('users')
          
          const dbUser = await usersCollection.findOne({ email: user.email })
          if (dbUser) {
            token.uid = dbUser._id.toString()
            console.log('JWT callback - Set user ID from database:', token.uid, 'for email:', user.email)
          } else {
            console.error('JWT callback - User not found in database:', user.email)
          }
          
          await client.close()
        } catch (error) {
          console.error('JWT callback - Error getting user from database:', error)
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.uid as string
        console.log('Session callback - User ID set to:', session.user.id, 'for email:', session.user.email)
      }
      return session
    },
    async signIn({ user, account, profile }) {
      // Ensure user exists in our users collection but WITHOUT assigning tokens
      // Tokens will be handled by the frontend transfer logic
      if (user.email) {
        try {
          const { MongoClient } = await import('mongodb')
          const client = new MongoClient(process.env.MONGODB_URI!)
          await client.connect()
          const db = client.db()
          const usersCollection = db.collection('users')
          
          // Check if user exists, if not create them WITHOUT tokens initially
          const existingUser = await usersCollection.findOne({ email: user.email })
          
          if (!existingUser) {
            console.log('SignIn callback - Creating new user WITHOUT tokens (will be handled by transfer logic):', user.email)
            const insertResult = await usersCollection.insertOne({
              email: user.email,
              name: user.name,
              image: user.image,
              // NO TOKENS HERE - will be added by frontend transfer logic
              hasReceivedInitialFreeTokens: false, // SECURITY: Will be set by transfer logic
              hasReceivedAnonymousTransfer: false, // SECURITY: Initialize transfer flag
              createdAt: new Date(),
              updatedAt: new Date()
            })
            console.log('SignIn callback - User created with ID:', insertResult.insertedId.toString())
          } else if (existingUser.tokens === undefined && existingUser.hasReceivedInitialFreeTokens === undefined) {
            // User exists but needs security flags initialized
            console.log('Initializing security flags for existing user:', user.email)
            await usersCollection.updateOne(
              { email: user.email },
              { 
                $set: { 
                  hasReceivedInitialFreeTokens: false, // Will be set by transfer logic
                  hasReceivedAnonymousTransfer: false, // Initialize transfer flag
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
