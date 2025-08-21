// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' })

const { MongoClient } = require('mongodb')

async function setupTranscriberIndexes() {
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
    
    // Connect to the transcriber database specifically
    const db = client.db('transcriber')
    console.log('\nConnected to database: transcriber')
    
    // Create indexes for transcriptions collection
    const transcriptionsCollection = db.collection('transcriptions')
    
    console.log('Creating indexes for transcriptions collection...')
    
    // Compound index for authenticated users (userId + createdAt for sorting)
    try {
      await transcriptionsCollection.createIndex(
        { userId: 1, createdAt: -1 },
        { 
          name: 'userId_createdAt_desc',
          background: true 
        }
      )
      console.log('✓ Created index: userId_createdAt_desc')
    } catch (error) {
      if (error.code === 85) {
        console.log('⚠ Index already exists: userId_createdAt_desc')
      } else {
        console.error('✗ Error creating userId index:', error.message)
      }
    }
    
    // Compound index for anonymous users (userFingerprint + createdAt for sorting)
    try {
      await transcriptionsCollection.createIndex(
        { userFingerprint: 1, createdAt: -1 },
        { 
          name: 'userFingerprint_createdAt_desc',
          background: true 
        }
      )
      console.log('✓ Created index: userFingerprint_createdAt_desc')
    } catch (error) {
      if (error.code === 85) {
        console.log('⚠ Index already exists: userFingerprint_createdAt_desc')
      } else {
        console.error('✗ Error creating userFingerprint index:', error.message)
      }
    }
    
    // Index for status queries
    try {
      await transcriptionsCollection.createIndex(
        { status: 1 },
        { 
          name: 'status',
          background: true 
        }
      )
      console.log('✓ Created index: status')
    } catch (error) {
      if (error.code === 85) {
        console.log('⚠ Index already exists: status')
      } else {
        console.error('✗ Error creating status index:', error.message)
      }
    }
    
    // Index for URL queries
    try {
      await transcriptionsCollection.createIndex(
        { url: 1 },
        { 
          name: 'url',
          background: true 
        }
      )
      console.log('✓ Created index: url')
    } catch (error) {
      if (error.code === 85) {
        console.log('⚠ Index already exists: url')
      } else {
        console.error('✗ Error creating url index:', error.message)
      }
    }
    
    // Text index for content search
    try {
      await transcriptionsCollection.createIndex(
        { content: 'text', title: 'text' },
        { 
          name: 'content_text_search',
          background: true,
          weights: {
            title: 10,
            content: 5
          }
        }
      )
      console.log('✓ Created index: content_text_search')
    } catch (error) {
      if (error.code === 85) {
        console.log('⚠ Text index already exists')
      } else {
        console.error('Error creating text index:', error.message)
      }
    }
    
    console.log('\n🎉 Database indexes setup completed!')
    console.log('\nPerformance improvements:')
    console.log('- User queries now use compound indexes for faster sorting')
    console.log('- Status and URL queries are indexed')
    console.log('- Text search capability enabled for content and titles')
    console.log('- All indexes created in background mode (non-blocking)')
    
    // Show final index status
    console.log('\n📋 Final index status:')
    const finalIndexes = await transcriptionsCollection.listIndexes().toArray()
    finalIndexes.forEach(idx => {
      const uniqueLabel = idx.unique ? ' (unique)' : ''
      console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}${uniqueLabel}`)
    })
    
  } catch (error) {
    console.error('Error setting up database indexes:', error)
    process.exit(1)
  } finally {
    await client.close()
    console.log('\nDisconnected from MongoDB')
  }
}

// Run setup if called directly
if (require.main === module) {
  setupTranscriberIndexes()
}

module.exports = { setupTranscriberIndexes }
