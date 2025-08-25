// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' })

const { MongoClient } = require('mongodb')

async function addSharingFields() {
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

    // Count total transcriptions
    const totalCount = await transcriptionsCollection.countDocuments()
    console.log(`\nTotal transcriptions found: ${totalCount}`)

    if (totalCount === 0) {
      console.log('No transcriptions to update')
      return
    }

    // Add sharing fields to all transcriptions
    const result = await transcriptionsCollection.updateMany(
      {}, // Update all documents
      {
        $set: {
          isPublic: false,
          shareSettings: {
            allowComments: false,
            allowDownload: true,
            allowAudio: false
          }
        }
      }
    )

    console.log(`\n✅ Updated ${result.modifiedCount} transcriptions with sharing fields`)
    console.log('\nSharing fields added:')
    console.log('- isPublic: false (default: private)')
    console.log('- shareSettings.allowComments: false (default: no comments)')
    console.log('- shareSettings.allowDownload: true (default: allow downloads)')
    console.log('- shareSettings.allowAudio: false (default: no audio)')

    // Verify the update
    const sampleTranscription = await transcriptionsCollection.findOne({}, { 
      projection: { 
        isPublic: 1, 
        shareSettings: 1, 
        title: 1 
      } 
    })

    if (sampleTranscription) {
      console.log('\n📋 Sample transcription after update:')
      console.log(`Title: ${sampleTranscription.title || 'Untitled'}`)
      console.log(`isPublic: ${sampleTranscription.isPublic}`)
      console.log(`shareSettings:`, sampleTranscription.shareSettings)
    }

    console.log('\n🎉 Sharing fields migration completed successfully!')
    console.log('\nNext steps:')
    console.log('1. Restart your application')
    console.log('2. Test the sharing functionality')
    console.log('3. Users can now share transcriptions publicly')

  } catch (error) {
    console.error('Error adding sharing fields:', error)
    process.exit(1)
  } finally {
    await client.close()
    console.log('\nDisconnected from MongoDB')
  }
}

// Run migration if called directly
if (require.main === module) {
  addSharingFields()
}

module.exports = { addSharingFields }
