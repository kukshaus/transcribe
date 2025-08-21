#!/usr/bin/env node

/**
 * Migration script to move document-stored audio files to GridFS
 * This will significantly improve performance by removing large Binary data from documents
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' })

const { MongoClient, ObjectId } = require('mongodb')
const fs = require('fs')
const path = require('path')

async function migrateAudioToGridFS() {
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
    
    // Connect to the transcriber database specifically
    const db = client.db('transcriber')
    console.log('Using database: transcriber')
    
    // Get collections
    const transcriptionsCollection = db.collection('transcriptions')
    const audioFilesCollection = db.collection('audioFiles.files')
    const audioChunksCollection = db.collection('audioFiles.chunks')
    
    console.log('Starting audio file migration to GridFS...')
    
    // Find all transcriptions with embedded audio files
    const transcriptionsWithAudio = await transcriptionsCollection.find({
      'audioFile.data': { $exists: true, $ne: null },
      'audioFile.storageType': 'document'
    }).toArray()
    
    console.log(`Found ${transcriptionsWithAudio.length} transcriptions with embedded audio files`)
    
    if (transcriptionsWithAudio.length === 0) {
      console.log('No transcriptions with embedded audio files found. Migration not needed.')
      return
    }
    
    // Create temporary directory for processing
    const tempDir = path.join(process.cwd(), 'temp', 'migration')
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }
    
    let successCount = 0
    let errorCount = 0
    let totalSizeSaved = 0
    
    for (let i = 0; i < transcriptionsWithAudio.length; i++) {
      const transcription = transcriptionsWithAudio[i]
      const audioFile = transcription.audioFile
      
      try {
        console.log(`\n[${i + 1}/${transcriptionsWithAudio.length}] Processing: ${transcription.title || transcription.url}`)
        console.log(`  Audio file: ${audioFile.filename} (${(audioFile.size / 1024 / 1024).toFixed(2)} MB)`)
        
        // Convert Binary data to Buffer
        let audioData
        if (audioFile.data && audioFile.data.buffer) {
          // MongoDB Binary object
          audioData = Buffer.from(audioFile.data.buffer)
        } else if (Buffer.isBuffer(audioFile.data)) {
          audioData = audioFile.data
        } else if (typeof audioFile.data === 'string') {
          // If it's already a string, try to decode it
          try {
            audioData = Buffer.from(audioFile.data, 'base64')
          } catch (err) {
            console.log(`    ⚠ Could not decode audio data for ${audioFile.filename}`)
            continue
          }
        } else {
          console.log(`    ⚠ Unknown audio data type for ${audioFile.filename}`)
          continue
        }
        
        // Create temporary file
        const tempFilePath = path.join(tempDir, `${transcription._id}_${audioFile.filename}`)
        fs.writeFileSync(tempFilePath, audioData)
        
        // Upload to GridFS
        const bucket = new (require('mongodb')).GridFSBucket(db, { bucketName: 'audioFiles' })
        
        const uploadStream = bucket.openUploadStream(audioFile.filename, {
          metadata: {
            transcriptionId: transcription._id.toString(),
            originalSize: audioFile.size,
            mimeType: audioFile.mimeType,
            migratedAt: new Date()
          }
        })
        
        const fileStream = fs.createReadStream(tempFilePath)
        
        await new Promise((resolve, reject) => {
          fileStream.pipe(uploadStream)
          uploadStream.on('error', reject)
          uploadStream.on('finish', resolve)
        })
        
        // Get the GridFS file ID
        const gridfsId = uploadStream.id
        
        // Update the transcription document
        await transcriptionsCollection.updateOne(
          { _id: transcription._id },
          {
            $set: {
              'audioFile.storageType': 'gridfs',
              'audioFile.gridfsId': gridfsId.toString(),
              'audioFile.migratedAt': new Date()
            },
            $unset: {
              'audioFile.data': 1 // Remove the large embedded data
            }
          }
        )
        
        // Clean up temporary file
        fs.unlinkSync(tempFilePath)
        
        console.log(`    ✅ Migrated to GridFS: ${gridfsId}`)
        successCount++
        totalSizeSaved += audioFile.size
        
      } catch (error) {
        console.error(`    ❌ Error migrating ${transcription._id}:`, error.message)
        errorCount++
        
        // Clean up temporary file if it exists
        const tempFilePath = path.join(tempDir, `${transcription._id}_${audioFile.filename}`)
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath)
        }
      }
    }
    
    // Clean up temp directory
    try {
      fs.rmdirSync(tempDir)
    } catch (err) {
      // Directory might not be empty, ignore
    }
    
    console.log('\n🎉 Migration completed!')
    console.log(`\nResults:`)
    console.log(`  ✅ Successfully migrated: ${successCount} files`)
    console.log(`  ❌ Failed migrations: ${errorCount} files`)
    console.log(`  💾 Total space saved: ${(totalSizeSaved / 1024 / 1024).toFixed(2)} MB`)
    
    if (successCount > 0) {
      console.log(`\nPerformance improvements:`)
      console.log(`  - Database documents are now much smaller`)
      console.log(`  - Queries will be significantly faster`)
      console.log(`  - Memory usage reduced by ${(totalSizeSaved / 1024 / 1024).toFixed(2)} MB`)
      console.log(`  - GridFS provides better file management`)
      
      console.log(`\nNext steps:`)
      console.log(`  1. Test your application - it should be much faster now`)
      console.log(`  2. Monitor database performance improvements`)
      console.log(`  3. Consider implementing audio file cleanup for old/unused files`)
    }
    
  } catch (error) {
    console.error('Error during migration:', error)
    process.exit(1)
  } finally {
    await client.close()
    console.log('\nDisconnected from MongoDB')
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateAudioToGridFS()
}

module.exports = { migrateAudioToGridFS }