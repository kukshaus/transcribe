// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' })

const { MongoClient } = require('mongodb')

async function checkTranscriptionUsers() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error('MONGODB_URI environment variable is required')
    console.error('Please check your .env.local file')
    process.exit(1)
  }

  console.log('Using MongoDB URI:', uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'))
  
  const client = new MongoClient(uri)
  
  try {
    await client.connect()
    console.log('Connected to MongoDB')
    
    const db = client.db('transcriber')
    console.log('\nConnected to database: transcriber')
    
    // Check transcriptions collection
    const transcriptionsCollection = db.collection('transcriptions')
    const usersCollection = db.collection('users')
    
    console.log('\nChecking transcriptions and users...')
    
    // Get all transcriptions
    const transcriptions = await transcriptionsCollection.find({}).toArray()
    console.log(`Total transcriptions: ${transcriptions.length}`)
    
    // Group transcriptions by userId
    const transcriptionsByUser = {}
    const anonymousTranscriptions = []
    
    transcriptions.forEach(transcription => {
      if (transcription.userId) {
        if (!transcriptionsByUser[transcription.userId]) {
          transcriptionsByUser[transcription.userId] = []
        }
        transcriptionsByUser[transcription.userId].push(transcription)
      } else if (transcription.userFingerprint) {
        anonymousTranscriptions.push(transcription)
      } else {
        console.log('Transcription without user:', transcription._id)
      }
    })
    
    console.log('\nTranscriptions by user:')
    Object.entries(transcriptionsByUser).forEach(([userId, userTranscriptions]) => {
      console.log(`\nUser ID: ${userId}`)
      console.log(`  Transcriptions: ${userTranscriptions.length}`)
      
      // Get user details
      usersCollection.findOne({ _id: new (require('mongodb')).ObjectId(userId) })
        .then(user => {
          if (user) {
            console.log(`  User email: ${user.email}`)
            console.log(`  User name: ${user.name}`)
          } else {
            console.log(`  User not found in users collection`)
          }
        })
        .catch(err => console.log(`  Error fetching user: ${err.message}`))
      
      // Show first few transcriptions
      userTranscriptions.slice(0, 3).forEach(t => {
        console.log(`    - ${t.title || t.url} (${t.status})`)
      })
    })
    
    if (anonymousTranscriptions.length > 0) {
      console.log(`\nAnonymous transcriptions: ${anonymousTranscriptions.length}`)
      anonymousTranscriptions.slice(0, 3).forEach(t => {
        console.log(`  - ${t.title || t.url} (${t.status}) - Fingerprint: ${t.userFingerprint}`)
      })
    }
    
    // Check users collection
    console.log('\nUsers in database:')
    const users = await usersCollection.find({}).toArray()
    users.forEach(user => {
      console.log(`  - ${user.email} (${user.name}) - ID: ${user._id}`)
    })
    
  } catch (error) {
    console.error('Error checking transcription users:', error)
    process.exit(1)
  } finally {
    await client.close()
    console.log('\nDisconnected from MongoDB')
  }
}

// Run check if called directly
if (require.main === module) {
  checkTranscriptionUsers()
}

module.exports = { checkTranscriptionUsers }
