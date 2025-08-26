const { MongoClient } = require('mongodb')
require('dotenv').config({ path: '.env.local' })

async function setupAdmin() {
  const mongoUri = process.env.MONGODB_URI
  
  if (!mongoUri) {
    console.error('❌ MONGODB_URI not found in environment variables')
    console.error('Please make sure your .env file contains MONGODB_URI')
    process.exit(1)
  }
  
  console.log('🔗 Connecting to MongoDB...')
  const client = new MongoClient(mongoUri)
  
  try {
    await client.connect()
    console.log('✅ Connected to MongoDB successfully')
    
    const db = client.db('transcriber')
    const usersCollection = db.collection('users')
    
    // Get command line arguments
    const args = process.argv.slice(2)
    const email = args[0]
    
    if (!email) {
      console.error('❌ Email address is required')
      console.error('Usage: node setup-admin.js <email>')
      console.error('Example: node setup-admin.js admin@example.com')
      process.exit(1)
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.error('❌ Invalid email format')
      process.exit(1)
    }
    
    // Find the user by email
    const user = await usersCollection.findOne({ email: email })
    
    if (!user) {
      console.error(`User with email ${email} not found`)
      process.exit(1)
    }
    
    console.log(`Found user: ${user.name} (${user.email})`)
    console.log(`Current tokens: ${user.tokens}`)
    console.log(`Current isAdmin: ${user.isAdmin || false}`)
    
    // Update the user to be an admin
    const result = await usersCollection.updateOne(
      { email: email },
      { 
        $set: { 
          isAdmin: true,
          isActive: true,
          updatedAt: new Date()
        }
      }
    )
    
    if (result.modifiedCount > 0) {
      console.log(`✅ Successfully made ${email} an admin`)
      
      // Verify the update
      const updatedUser = await usersCollection.findOne({ email: email })
      console.log(`Updated user data:`)
      console.log(`- Name: ${updatedUser.name}`)
      console.log(`- Email: ${updatedUser.email}`)
      console.log(`- Tokens: ${updatedUser.tokens}`)
      console.log(`- isAdmin: ${updatedUser.isAdmin}`)
      console.log(`- isActive: ${updatedUser.isActive}`)
      
      console.log('\n🎉 Admin setup complete!')
      console.log(`You can now access the admin dashboard at: http://localhost:3000/admin`)
    } else {
      console.error('Failed to update user')
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    if (error.message.includes('ECONNREFUSED')) {
      console.error('💡 Make sure your MongoDB is running and MONGODB_URI is correct')
      console.error('   If using MongoDB Atlas, check your connection string')
    }
    process.exit(1)
  } finally {
    await client.close()
    console.log('🔌 Disconnected from MongoDB')
  }
}

setupAdmin()
