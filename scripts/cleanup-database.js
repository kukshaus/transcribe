#!/usr/bin/env node

/**
 * DATABASE CLEANUP SCRIPT - DEBUG/DEVELOPMENT ONLY
 * 
 * ⚠️  WARNING: This script will DELETE ALL DATA from the database!
 * ⚠️  Only use this for development/debugging purposes!
 * 
 * Usage: node scripts/cleanup-database.js
 */

const { MongoClient } = require('mongodb')
const path = require('path')

// Load environment variables from the project root
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

const MONGODB_URI = process.env.MONGODB_URI
const DATABASE_NAME = 'transcriber'

// Safety check - prevent running in production
const ALLOWED_ENVIRONMENTS = ['development', 'dev', 'local', 'debug']
const currentEnv = process.env.NODE_ENV || 'development'

if (!ALLOWED_ENVIRONMENTS.includes(currentEnv.toLowerCase())) {
  console.error('❌ SAFETY CHECK FAILED!')
  console.error(`   Current environment: ${currentEnv}`)
  console.error(`   This script only runs in: ${ALLOWED_ENVIRONMENTS.join(', ')}`)
  console.error('   Set NODE_ENV to one of the allowed values to proceed.')
  process.exit(1)
}

// Additional safety check for production-like URIs
if (MONGODB_URI && (
  MONGODB_URI.includes('prod') || 
  MONGODB_URI.includes('production') ||
  MONGODB_URI.includes('live') ||
  MONGODB_URI.includes('atlas') // MongoDB Atlas cloud
)) {
  console.error('❌ PRODUCTION DATABASE DETECTED!')
  console.error('   This script cannot run against production databases.')
  console.error('   Database URI contains production-like keywords.')
  process.exit(1)
}

async function cleanupDatabase() {
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI environment variable is not set')
    process.exit(1)
  }

  console.log('🧹 DATABASE CLEANUP SCRIPT')
  console.log('=' .repeat(50))
  console.log(`📍 Environment: ${currentEnv}`)
  console.log(`🔗 Database: ${DATABASE_NAME}`)
  console.log(`🌐 URI: ${MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`) // Hide credentials
  console.log('')

  // Final confirmation
  console.log('⚠️  WARNING: This will DELETE ALL DATA!')
  console.log('   - All users')
  console.log('   - All transcriptions') 
  console.log('   - All spending history')
  console.log('   - All payments')
  console.log('   - All anonymous users')
  console.log('')
  
  // In Node.js scripts, we can't use interactive prompts easily
  // So we'll add a command line argument check instead
  const args = process.argv.slice(2)
  if (!args.includes('--confirm')) {
    console.log('🛡️  Safety check: Add --confirm flag to proceed')
    console.log('   Example: node scripts/cleanup-database.js --confirm')
    process.exit(0)
  }

  let client

  try {
    console.log('🔌 Connecting to database...')
    client = new MongoClient(MONGODB_URI)
    await client.connect()
    
    const db = client.db(DATABASE_NAME)
    
    console.log('✅ Connected successfully!')
    console.log('')

    // List all collections
    const collections = await db.listCollections().toArray()
    const collectionNames = collections.map(c => c.name)
    
    console.log(`📋 Found ${collections.length} collections:`)
    collectionNames.forEach(name => console.log(`   - ${name}`))
    console.log('')

    let totalDeleted = 0

    // Delete from each collection
    for (const collectionName of collectionNames) {
      try {
        console.log(`🗑️  Cleaning collection: ${collectionName}`)
        
        const collection = db.collection(collectionName)
        const countBefore = await collection.countDocuments()
        
        if (countBefore > 0) {
          const result = await collection.deleteMany({})
          console.log(`   ✅ Deleted ${result.deletedCount} documents`)
          totalDeleted += result.deletedCount
        } else {
          console.log(`   ℹ️  Collection was already empty`)
        }
      } catch (error) {
        console.error(`   ❌ Error cleaning ${collectionName}:`, error.message)
      }
    }

    console.log('')
    console.log('🎉 DATABASE CLEANUP COMPLETED!')
    console.log(`📊 Total documents deleted: ${totalDeleted}`)
    console.log('')
    
    // Verify cleanup
    console.log('🔍 Verification:')
    for (const collectionName of collectionNames) {
      const collection = db.collection(collectionName)
      const count = await collection.countDocuments()
      console.log(`   ${collectionName}: ${count} documents remaining`)
    }

  } catch (error) {
    console.error('❌ Error during cleanup:', error)
    process.exit(1)
  } finally {
    if (client) {
      await client.close()
      console.log('')
      console.log('🔌 Database connection closed')
    }
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n⚠️  Script interrupted by user')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\n⚠️  Script terminated')
  process.exit(0)
})

// Run the cleanup
cleanupDatabase().catch(error => {
  console.error('💥 Fatal error:', error)
  process.exit(1)
})
