// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' })

const { MongoClient } = require('mongodb')

async function checkDatabaseSimple() {
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
    
    // List all databases
    console.log('\nAvailable databases:')
    const adminDb = client.db('admin')
    const databases = await adminDb.admin().listDatabases()
    
    databases.databases.forEach(db => {
      console.log(`  - ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`)
    })
    
    // Get the database from the URI
    const dbName = new URL(uri).pathname.slice(1) || 'test'
    console.log(`\nUsing database: ${dbName}`)
    
    const db = client.db(dbName)
    
    // List all collections
    console.log(`\nCollections in ${dbName}:`)
    const collections = await db.listCollections().toArray()
    
    if (collections.length === 0) {
      console.log('  No collections found')
    } else {
      collections.forEach(collection => {
        console.log(`  - ${collection.name}`)
      })
    }
    
    // Check transcriptions collection if it exists
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
      }
    }
    
  } catch (error) {
    console.error('Error checking database:', error)
    process.exit(1)
  } finally {
    await client.close()
    console.log('\nDisconnected from MongoDB')
  }
}

// Run check if called directly
if (require.main === module) {
  checkDatabaseSimple()
}

module.exports = { checkDatabaseSimple }
