// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' })

const { MongoClient } = require('mongodb')

async function testSharing() {
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

    // Get transcriptions collection
    const transcriptionsCollection = db.collection('transcriptions')

    // Find a transcription to test with
    const testTranscription = await transcriptionsCollection.findOne({}, { 
      projection: { 
        _id: 1, 
        title: 1, 
        isPublic: 1, 
        publicId: 1, 
        shareSettings: 1 
      } 
    })

    if (!testTranscription) {
      console.log('No transcriptions found to test with')
      return
    }

    console.log('\n📋 Test Transcription:')
    console.log(`ID: ${testTranscription._id}`)
    console.log(`Title: ${testTranscription.title || 'Untitled'}`)
    console.log(`isPublic: ${testTranscription.isPublic}`)
    console.log(`publicId: ${testTranscription.publicId || 'None'}`)
    console.log(`shareSettings:`, testTranscription.shareSettings)

    // Test sharing the transcription
    console.log('\n🧪 Testing sharing functionality...')
    
    // Generate a test public ID
    const crypto = require('crypto')
    const testPublicId = crypto.randomBytes(16).toString('hex')
    
    // Update the transcription to be public
    const updateResult = await transcriptionsCollection.updateOne(
      { _id: testTranscription._id },
      {
        $set: {
          isPublic: true,
          publicId: testPublicId,
          sharedAt: new Date(),
          shareSettings: {
            allowComments: false,
            allowDownload: true,
            allowAudio: false
          }
        }
      }
    )

    if (updateResult.modifiedCount > 0) {
      console.log('✅ Successfully made transcription public')
      
      // Verify the update
      const updatedTranscription = await transcriptionsCollection.findOne(
        { _id: testTranscription._id },
        { projection: { isPublic: 1, publicId: 1, shareSettings: 1 } }
      )
      
      console.log('\n📋 Updated Transcription:')
      console.log(`isPublic: ${updatedTranscription.isPublic}`)
      console.log(`publicId: ${updatedTranscription.publicId}`)
      console.log(`shareSettings:`, updatedTranscription.shareSettings)
      
      // Test public access
      const publicTranscription = await transcriptionsCollection.findOne(
        { publicId: testPublicId, isPublic: true }
      )
      
      if (publicTranscription) {
        console.log('✅ Public access test successful')
        console.log(`Public URL: ${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/shared/${testPublicId}`)
      } else {
        console.log('❌ Public access test failed')
      }
      
      // Test unsharing
      console.log('\n🧪 Testing unsharing functionality...')
      
      const unshareResult = await transcriptionsCollection.updateOne(
        { _id: testTranscription._id },
        {
          $set: { isPublic: false },
          $unset: { publicId: 1, sharedAt: 1, shareSettings: 1 }
        }
      )
      
      if (unshareResult.modifiedCount > 0) {
        console.log('✅ Successfully made transcription private')
        
        // Verify unsharing
        const finalTranscription = await transcriptionsCollection.findOne(
          { _id: testTranscription._id },
          { projection: { isPublic: 1, publicId: 1, shareSettings: 1 } }
        )
        
        console.log('\n📋 Final Transcription:')
        console.log(`isPublic: ${finalTranscription.isPublic}`)
        console.log(`publicId: ${finalTranscription.publicId || 'None'}`)
        console.log(`shareSettings: ${finalTranscription.shareSettings ? 'Exists' : 'None'}`)
      } else {
        console.log('❌ Unsharing test failed')
      }
      
    } else {
      console.log('❌ Failed to make transcription public')
    }

    console.log('\n🎉 Sharing functionality test completed!')

  } catch (error) {
    console.error('Error testing sharing functionality:', error)
    process.exit(1)
  } finally {
    await client.close()
    console.log('\nDisconnected from MongoDB')
  }
}

// Run test if called directly
if (require.main === module) {
  testSharing()
}

module.exports = { testSharing }
