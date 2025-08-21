// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' })

const { MongoClient } = require('mongodb')

async function checkTranscriberDB() {
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
    
    // List all collections
    console.log('\nCollections in transcriber:')
    const collections = await db.listCollections().toArray()
    
    if (collections.length === 0) {
      console.log('  No collections found')
    } else {
      collections.forEach(collection => {
        console.log(`  - ${collection.name}`)
      })
    }
    
    // Check transcriptions collection
    if (collections.some(c => c.name === 'transcriptions')) {
      console.log('\nChecking transcriptions collection...')
      
      const transcriptionsCollection = db.collection('transcriptions')
      const count = await transcriptionsCollection.countDocuments({})
      console.log(`  Total documents: ${count}`)
      
      if (count > 0) {
        // Get one sample document
        const sample = await transcriptionsCollection.findOne({})
        console.log('\nSample document structure:')
        console.log('  Keys:', Object.keys(sample))
        
        if (sample.audioFile) {
          console.log('\nAudio file details:')
          console.log('  Filename:', sample.audioFile.filename)
          console.log('  Size:', sample.audioFile.size, 'bytes')
          console.log('  Storage type:', sample.audioFile.storageType)
          console.log('  Has data field:', !!sample.audioFile.data)
          
          if (sample.audioFile.data) {
            let dataType = 'unknown'
            let dataSize = 0
            
            if (Buffer.isBuffer(sample.audioFile.data)) {
              dataType = 'Buffer'
              dataSize = sample.audioFile.data.length
            } else if (typeof sample.audioFile.data === 'string') {
              dataType = 'String'
              dataSize = sample.audioFile.data.length
            } else if (sample.audioFile.data && typeof sample.audioFile.data === 'object') {
              dataType = 'Binary'
              dataSize = sample.audioFile.data.length || 0
            }
            
            console.log('  Data type:', dataType)
            console.log('  Data size:', (dataSize / 1024 / 1024).toFixed(2), 'MB')
          }
        }
        
        // Check document size
        const docSize = JSON.stringify(sample).length
        console.log('\nDocument size:', (docSize / 1024 / 1024).toFixed(2), 'MB')
        
        // Check for large documents
        console.log('\nChecking for large documents...')
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
          console.log(`\nLarge documents found (${largestDocs.length}):`)
          largestDocs.sort((a, b) => b.size - a.size)
          largestDocs.slice(0, 5).forEach(doc => {
            console.log(`  - ${doc.title}`)
            console.log(`    Size: ${(doc.size / 1024 / 1024).toFixed(2)} MB`)
            console.log(`    Has audio data: ${doc.hasAudioData}`)
          })
        } else {
          console.log('\nNo unusually large documents found')
        }
      }
    }
    
    // Check other potential collections
    const potentialCollections = ['transcriber', 'audioFiles', 'users', 'payments']
    
    for (const collectionName of potentialCollections) {
      if (collections.some(c => c.name === collectionName)) {
        console.log(`\n${collectionName} collection:`)
        const collection = db.collection(collectionName)
        const count = await collection.countDocuments({})
        console.log(`  Total documents: ${count}`)
        
        if (count > 0) {
          const sample = await collection.find({}).limit(1).toArray()
          if (sample.length > 0) {
            console.log('  Sample document keys:', Object.keys(sample[0]))
          }
        }
      }
    }
    
  } catch (error) {
    console.error('Error checking transcriber database:', error)
    process.exit(1)
  } finally {
    await client.close()
    console.log('\nDisconnected from MongoDB')
  }
}

// Run check if called directly
if (require.main === module) {
  checkTranscriberDB()
}

module.exports = { checkTranscriberDB }
