// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' })

const { MongoClient } = require('mongodb')

async function checkDatabaseStructure() {
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
    
    // List all databases
    console.log('\n🗄️ Available databases:')
    const adminDb = client.db('admin')
    const databases = await adminDb.admin().listDatabases()
    
    databases.databases.forEach(db => {
      console.log(`  - ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`)
    })
    
    // Get the database from the URI
    const dbName = new URL(uri).pathname.slice(1) || 'test'
    console.log(`\n📊 Using database: ${dbName}`)
    
    const db = client.db(dbName)
    
    // List all collections in the current database
    console.log(`\n📁 Collections in ${dbName}:`)
    const collections = await db.listCollections().toArray()
    
    if (collections.length === 0) {
      console.log('  No collections found')
    } else {
      collections.forEach(collection => {
        console.log(`  - ${collection.name}`)
      })
    }
    
    // Check if transcriptions collection exists and has data
    if (collections.some(c => c.name === 'transcriptions')) {
      console.log(`\n🔍 Checking transcriptions collection...`)
      
      const transcriptionsCollection = db.collection('transcriptions')
      const count = await transcriptionsCollection.countDocuments({})
      console.log(`  Total documents: ${count}`)
      
      if (count > 0) {
        // Sample a few documents
        console.log(`\n📋 Sample documents:`)
        const samples = await transcriptionsCollection.find({}).limit(3).toArray()
        
        samples.forEach((doc, index) => {
          console.log(`\n  ${index + 1}. Document ID: ${doc._id}`)
          console.log(`     URL: ${doc.url || 'N/A'}`)
          console.log(`     Title: ${doc.title || 'N/A'}`)
          console.log(`     Status: ${doc.status || 'N/A'}`)
          console.log(`     User ID: ${doc.userId || 'N/A'}`)
          console.log(`     Created: ${doc.createdAt || 'N/A'}`)
          
          if (doc.audioFile) {
            console.log(`     Audio File:`)
            console.log(`       Filename: ${doc.audioFile.filename || 'N/A'}`)
            console.log(`       Size: ${doc.audioFile.size || 'N/A'} bytes`)
            console.log(`       Storage Type: ${doc.audioFile.storageType || 'N/A'}`)
            console.log(`       Has Data: ${!!doc.audioFile.data}`)
            
            if (doc.audioFile.data) {
              let dataType = 'unknown'
              let dataSize = 0
              
              if (Buffer.isBuffer(doc.audioFile.data)) {
                dataType = 'Buffer'
                dataSize = doc.audioFile.data.length
              } else if (typeof doc.audioFile.data === 'string') {
                dataType = 'String'
                dataSize = doc.audioFile.data.length
              } else if (doc.audioFile.data && typeof doc.audioFile.data === 'object') {
                dataType = 'Binary'
                dataSize = doc.audioFile.data.length || 0
              }
              
              console.log(`       Data Type: ${dataType}`)
              console.log(`       Data Size: ${(dataSize / 1024 / 1024).toFixed(2)} MB`)
            }
          } else {
            console.log(`     Audio File: None`)
          }
          
          // Check document size
          const docSize = JSON.stringify(doc).length
          console.log(`     Document Size: ${(docSize / 1024 / 1024).toFixed(2)} MB`)
        }
        
        // Check for large documents
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
      }
    }
    
    // Check other potential collections
    const potentialCollections = ['transcriber', 'audioFiles', 'users', 'payments']
    
    for (const collectionName of potentialCollections) {
      if (collections.some(c => c.name === collectionName)) {
        console.log(`\n📊 ${collectionName} collection:`)
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
    console.error('Error checking database structure:', error)
    process.exit(1)
  } finally {
    await client.close()
    console.log('\nDisconnected from MongoDB')
  }
}

// Run check if called directly
if (require.main === module) {
  checkDatabaseStructure()
}

module.exports = { checkDatabaseStructure }
