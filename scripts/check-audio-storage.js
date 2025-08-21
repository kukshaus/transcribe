#!/usr/bin/env node

/**
 * Check current audio file storage distribution
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' })

const { MongoClient, ObjectId } = require('mongodb')

async function checkAudioStorage() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error('MONGODB_URI environment variable is required')
    console.error('Please check your .env.local file')
    process.exit(1)
  }

  console.log('Using MongoDB URI:', uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')) // Hide credentials
  
  const client = new MongoClient(uri)
  
  try {
    await client.connect()
    console.log('Connected to MongoDB')
    
    const db = client.db()
    
    // Get collections
    const transcriptionsCollection = db.collection('transcriptions')
    const audioFilesCollection = db.collection('audioFiles.files')
    const audioChunksCollection = db.collection('audioFiles.chunks')
    
    console.log('\n🔍 Checking audio file storage status...')
    
    // Check total transcriptions
    const totalTranscriptions = await transcriptionsCollection.countDocuments({})
    console.log(`\n📊 Total transcriptions: ${totalTranscriptions}`)
    
    // Check transcriptions with audio files
    const transcriptionsWithAudio = await transcriptionsCollection.find({
      'audioFile': { $exists: true, $ne: null }
    }).toArray()
    
    console.log(`📁 Transcriptions with audio files: ${transcriptionsWithAudio.length}`)
    
    if (transcriptionsWithAudio.length > 0) {
      console.log('\n📋 Audio file storage details:')
      
      const storageTypes = {}
      const dataTypes = {}
      let totalEmbeddedSize = 0
      
      for (const transcription of transcriptionsWithAudio) {
        const audioFile = transcription.audioFile
        
        // Count storage types
        const storageType = audioFile.storageType || 'unknown'
        storageTypes[storageType] = (storageTypes[storageType] || 0) + 1
        
        // Check data field
        if (audioFile.data) {
          let dataType = 'unknown'
          let dataSize = 0
          
          if (Buffer.isBuffer(audioFile.data)) {
            dataType = 'Buffer'
            dataSize = audioFile.data.length
          } else if (typeof audioFile.data === 'string') {
            dataType = 'String'
            dataSize = audioFile.data.length
          } else if (audioFile.data && typeof audioFile.data === 'object') {
            dataType = 'Binary'
            dataSize = audioFile.data.length || 0
          }
          
          dataTypes[dataType] = (dataTypes[dataType] || 0) + 1
          totalEmbeddedSize += dataSize
          
          console.log(`  - ${transcription.title || transcription.url}`)
          console.log(`    Storage: ${storageType}`)
          console.log(`    Data type: ${dataType}`)
          console.log(`    Size: ${(dataSize / 1024 / 1024).toFixed(2)} MB`)
          console.log(`    Filename: ${audioFile.filename}`)
        }
      }
      
      console.log(`\n📈 Storage type breakdown:`)
      Object.entries(storageTypes).forEach(([type, count]) => {
        console.log(`  ${type}: ${count} files`)
      })
      
      console.log(`\n📊 Data type breakdown:`)
      Object.entries(dataTypes).forEach(([type, count]) => {
        console.log(`  ${type}: ${count} files`)
      })
      
      console.log(`\n💾 Total embedded data size: ${(totalEmbeddedSize / 1024 / 1024).toFixed(2)} MB`)
    }
    
    // Check GridFS collections
    const gridfsFiles = await audioFilesCollection.countDocuments({})
    const gridfsChunks = await audioChunksCollection.countDocuments({})
    
    console.log(`\n🗄️ GridFS status:`)
    console.log(`  Files collection: ${gridfsFiles} files`)
    console.log(`  Chunks collection: ${gridfsChunks} chunks`)
    
    if (gridfsFiles > 0) {
      console.log(`\n📋 GridFS files:`)
      const files = await audioFilesCollection.find({}).limit(5).toArray()
      files.forEach(file => {
        console.log(`  - ${file.filename} (${(file.length / 1024 / 1024).toFixed(2)} MB)`)
        console.log(`    ID: ${file._id}`)
        console.log(`    Metadata:`, file.metadata || 'None')
      })
      
      if (gridfsFiles > 5) {
        console.log(`  ... and ${gridfsFiles - 5} more files`)
      }
    }
    
    // Check for any transcriptions that might have large data
    console.log(`\n🔍 Checking for large documents...`)
    const largeDocs = await transcriptionsCollection.find({}).toArray()
    
    let largestDocs = []
    for (const doc of largeDocs) {
      const docSize = JSON.stringify(doc).length
      if (docSize > 1000000) { // Documents larger than 1MB
        largestDocs.push({
          id: doc._id,
          title: doc.title || doc.url,
          size: docSize,
          hasAudioData: !!doc.audioFile?.data
        })
      }
    }
    
    if (largestDocs.length > 0) {
      console.log(`\n⚠️ Large documents found (${largestDocs.length}):`)
      largestDocs.sort((a, b) => b.size - a.size)
      largestDocs.slice(0, 5).forEach(doc => {
        console.log(`  - ${doc.title}`)
        console.log(`    Size: ${(doc.size / 1024 / 1024).toFixed(2)} MB`)
        console.log(`    Has audio data: ${doc.hasAudioData}`)
      })
    } else {
      console.log(`\n✅ No unusually large documents found`)
    }
    
  } catch (error) {
    console.error('Error checking audio storage:', error)
    process.exit(1)
  } finally {
    await client.close()
    console.log('\nDisconnected from MongoDB')
  }
}

// Run check if called directly
if (require.main === module) {
  checkAudioStorage()
}

module.exports = { checkAudioStorage }