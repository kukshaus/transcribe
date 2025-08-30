import NextAuth, { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { MongoClient, ObjectId } from 'mongodb'

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
    async jwt({ token, user, account, trigger }) {
      console.log('JWT callback triggered:', { 
        trigger, 
        hasUser: !!user, 
        userEmail: user?.email,
        currentTokenUid: token.uid,
        tokenKeys: Object.keys(token)
      })
      
      if (user && user.email) {
        // Get the user ID from our database
        try {
          const { MongoClient } = await import('mongodb')
          const client = new MongoClient(process.env.MONGODB_URI!)
          await client.connect()
          const db = client.db('transcriber')
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
      
      console.log('JWT callback returning token with uid:', token.uid)
      return token
    },
    async session({ session, token, user }) {
      if (token) {
        session.user.id = token.uid as string
        console.log('Session callback - User ID set to:', session.user.id, 'for email:', session.user.email)
        
        // Check for impersonation
        try {
          const { MongoClient } = await import('mongodb')
          const client = new MongoClient(process.env.MONGODB_URI!)
          await client.connect()
          const db = client.db('transcriber')
          const usersCollection = db.collection('users')
          
          // Get the current user to check if they're an admin
          const currentUser = await usersCollection.findOne({ _id: new ObjectId(session.user.id) })
          
          if (currentUser?.isAdmin) {
            // Add admin flag to session
            session.user.isAdmin = true
            
            // Check if there's an impersonation cookie
            const impersonationCookie = await import('next/headers').then(h => h.cookies().get('impersonation'))
            
            if (impersonationCookie?.value) {
              try {
                const impersonationData = JSON.parse(impersonationCookie.value)
                
                // Verify the impersonation is valid (admin is impersonating)
                if (impersonationData.originalAdminId === session.user.id) {
                  // Get the impersonated user's data
                  const impersonatedUser = await usersCollection.findOne({ 
                    _id: new ObjectId(impersonationData.impersonatedUserId) 
                  })
                  
                  if (impersonatedUser) {
                    // Override session with impersonated user data
                    session.user.id = impersonatedUser._id.toString()
                    session.user.email = impersonatedUser.email
                    session.user.name = impersonatedUser.name
                    session.user.isImpersonating = true
                    session.user.originalAdminId = impersonationData.originalAdminId
                    session.user.originalAdminEmail = impersonationData.originalAdminEmail
                    
                    console.log('Session callback - Impersonating user:', impersonatedUser.email)
                  }
                }
              } catch (error) {
                console.error('Session callback - Error parsing impersonation cookie:', error)
              }
            }
          }
          
          await client.close()
        } catch (error) {
          console.error('Session callback - Error checking impersonation:', error)
        }
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
          const db = client.db('transcriber')
          const usersCollection = db.collection('users')
          
          // Check if user exists, if not create them WITHOUT tokens initially
          const existingUser = await usersCollection.findOne({ email: user.email })
          
          if (!existingUser) {
            console.log('SignIn callback - Creating new user WITHOUT tokens (will be handled by transfer logic):', user.email)
            const newUser = {
              email: user.email,
              name: user.name,
              image: user.image,
              tokens: 0, // Initialize with 0 tokens - will be added by frontend transfer logic
              hasReceivedInitialFreeTokens: false, // SECURITY: Will be set by transfer logic
              hasReceivedAnonymousTransfer: false, // SECURITY: Initialize transfer flag
              hasReceivedAnonymousTranscriptions: false, // SECURITY: Initialize transcription transfer flag
              createdAt: new Date(),
              updatedAt: new Date()
            }
            console.log('SignIn callback - Inserting user:', JSON.stringify(newUser, null, 2))
            const insertResult = await usersCollection.insertOne(newUser)
            console.log('SignIn callback - User created with ID:', insertResult.insertedId.toString())
            console.log('SignIn callback - Insert acknowledged:', insertResult.acknowledged)
          } else if (existingUser.tokens === undefined && existingUser.hasReceivedInitialFreeTokens === undefined) {
            // User exists but needs security flags initialized
            console.log('Initializing security flags for existing user:', user.email)
            await usersCollection.updateOne(
              { email: user.email },
              { 
                $set: { 
                  tokens: 0, // Initialize with 0 tokens
                  hasReceivedInitialFreeTokens: false, // Will be set by transfer logic
                  hasReceivedAnonymousTransfer: false, // Initialize transfer flag
                  hasReceivedAnonymousTranscriptions: false, // Initialize transcription transfer flag
                  updatedAt: new Date()
                }
              }
            )
          }
          
          await client.close()
        } catch (error) {
          console.error('SignIn callback - Error ensuring user exists:', error)
          console.error('SignIn callback - Error details:', {
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            email: user.email
          })
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
