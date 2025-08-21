#!/usr/bin/env node

/**
 * Comprehensive database setup script for production deployment
 * Ensures all necessary indexes and collections are properly configured
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' })

const { MongoClient } = require('mongodb')

async function setupDatabase() {
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
    
    // Create indexes for transcriptions collection
    const transcriptionsCollection = db.collection('transcriptions')
    
    console.log('Checking existing indexes...')
    
    // Get existing indexes
    const existingIndexes = await transcriptionsCollection.listIndexes().toArray()
    const existingIndexNames = existingIndexes.map(idx => idx.name)
    
    console.log('Existing indexes:', existingIndexNames)
    
    console.log('\nCreating/updating indexes for transcriptions collection...')
    
    // Define the indexes we want to create
    const targetIndexes = [
      {
        key: { userId: 1, createdAt: -1 },
        name: 'userId_createdAt_desc',
        background: true
      },
      {
        key: { userFingerprint: 1, createdAt: -1 },
        name: 'userFingerprint_createdAt_desc',
        background: true
      },
      {
        key: { status: 1 },
        name: 'status',
        background: true
      },
      {
        key: { url: 1 },
        name: 'url',
        background: true
      }
    ]
    
    // Create each index, handling conflicts gracefully
    for (const indexSpec of targetIndexes) {
      try {
        // Check if an equivalent index already exists
        const existingIndex = existingIndexes.find(idx => 
          JSON.stringify(idx.key) === JSON.stringify(indexSpec.key)
        )
        
        if (existingIndex) {
          if (existingIndex.name === indexSpec.name) {
            console.log(`✓ Index ${indexSpec.name} already exists`)
          } else {
            console.log(`⚠ Index with different name exists for ${JSON.stringify(indexSpec.key)}`)
            console.log(`  Existing: ${existingIndex.name}, Target: ${indexSpec.name}`)
          }
        } else {
          await transcriptionsCollection.createIndex(indexSpec.key, {
            name: indexSpec.name,
            background: true
          })
          console.log(`✓ Created index: ${indexSpec.name}`)
        }
      } catch (error) {
        if (error.code === 85) {
          console.log(`⚠ Index conflict for ${indexSpec.name}: ${error.message}`)
        } else {
          console.error(`✗ Error creating index ${indexSpec.name}:`, error.message)
        }
      }
    }
    
    // Text index for content search (if you want to enable text search later)
    try {
      const textIndexExists = existingIndexes.some(idx => 
        idx.key.content === 'text' || idx.key.title === 'text'
      )
      
      if (!textIndexExists) {
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
      } else {
        console.log('✓ Text index already exists')
      }
    } catch (error) {
      if (error.code === 85) {
        console.log('⚠ Text index already exists')
      } else {
        console.error('Error creating text index:', error.message)
      }
    }
    
    console.log('\n🎉 Database setup completed successfully!')
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
    console.error('Error setting up database:', error)
    process.exit(1)
  } finally {
    await client.close()
    console.log('\nDisconnected from MongoDB')
  }
}

setupDatabase()

module.exports = { setupDatabase };
