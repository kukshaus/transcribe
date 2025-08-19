/**
 * DATABASE CLEANUP SCRIPT - DEBUG/DEVELOPMENT ONLY
 * 
 * ⚠️  WARNING: This script will DELETE ALL DATA from the database!
 * ⚠️  Only use this for development/debugging purposes!
 * 
 * Usage: 
 *   npm run db:cleanup         (shows warning and instructions)
 *   npm run db:cleanup:confirm (actually runs the cleanup)
 */

import { MongoClient } from 'mongodb'
import { getDatabase } from '../lib/mongodb'

const DATABASE_NAME = 'transcriber'

// Safety check - prevent running in production
const ALLOWED_ENVIRONMENTS = ['development', 'dev', 'local', 'debug']
const currentEnv = process.env.NODE_ENV || 'development'

async function cleanupDatabase(): Promise<void> {
  // Environment safety check
  if (!ALLOWED_ENVIRONMENTS.includes(currentEnv.toLowerCase())) {
    console.error('❌ SAFETY CHECK FAILED!')
    console.error(`   Current environment: ${currentEnv}`)
    console.error(`   This script only runs in: ${ALLOWED_ENVIRONMENTS.join(', ')}`)
    console.error('   Set NODE_ENV to one of the allowed values to proceed.')
    process.exit(1)
  }

  // Additional safety check for production-like URIs
  const mongoUri = process.env.MONGODB_URI
  if (mongoUri && (
    mongoUri.includes('prod') || 
    mongoUri.includes('production') ||
    mongoUri.includes('live') ||
    mongoUri.includes('atlas') // MongoDB Atlas cloud (if production)
  )) {
    console.error('❌ PRODUCTION DATABASE DETECTED!')
    console.error('   This script cannot run against production databases.')
    console.error('   Database URI contains production-like keywords.')
    process.exit(1)
  }

  console.log('🧹 DATABASE CLEANUP SCRIPT')
  console.log('=' .repeat(50))
  console.log(`📍 Environment: ${currentEnv}`)
  console.log(`🔗 Database: ${DATABASE_NAME}`)
  console.log('')

  // Check for confirmation flag
  const args = process.argv.slice(2)
  if (!args.includes('--confirm')) {
    console.log('⚠️  WARNING: This will DELETE ALL DATA!')
    console.log('   Collections that will be cleaned:')
    console.log('   - users (all user accounts)')
    console.log('   - transcriptions (all transcriptions)')
    console.log('   - spendingHistory (all token transactions)')
    console.log('   - payments (all payment records)')
    console.log('   - anonymousUsers (all anonymous sessions)')
    console.log('')
    console.log('🛡️  Safety check: Add --confirm flag to proceed')
    console.log('   Example: npm run db:cleanup:confirm')
    process.exit(0)
  }

  try {
    console.log('🔌 Connecting to database...')
    const db = await getDatabase()
    console.log('✅ Connected successfully!')
    console.log('')

    // Define the collections we want to clean
    const collectionsToClean = [
      'users',
      'transcriptions', 
      'spendingHistory',
      'payments',
      'anonymousUsers'
    ]

    let totalDeleted = 0

    // Clean each collection
    for (const collectionName of collectionsToClean) {
      try {
        console.log(`🗑️  Cleaning collection: ${collectionName}`)
        
        const collection = db.collection(collectionName)
        
        // Count documents before deletion
        const countBefore = await collection.countDocuments()
        
        if (countBefore > 0) {
          const result = await collection.deleteMany({})
          console.log(`   ✅ Deleted ${result.deletedCount} documents`)
          totalDeleted += result.deletedCount
        } else {
          console.log(`   ℹ️  Collection was already empty`)
        }
      } catch (error) {
        console.error(`   ❌ Error cleaning ${collectionName}:`, error instanceof Error ? error.message : error)
      }
    }

    console.log('')
    console.log('🎉 DATABASE CLEANUP COMPLETED!')
    console.log(`📊 Total documents deleted: ${totalDeleted}`)
    console.log('')
    
    // Verify cleanup
    console.log('🔍 Verification:')
    for (const collectionName of collectionsToClean) {
      try {
        const collection = db.collection(collectionName)
        const count = await collection.countDocuments()
        const status = count === 0 ? '✅' : '⚠️ '
        console.log(`   ${status} ${collectionName}: ${count} documents remaining`)
      } catch (error) {
        console.log(`   ❌ ${collectionName}: Error checking count`)
      }
    }

    console.log('')
    console.log('🔄 Next steps:')
    console.log('   - Restart your Next.js development server')
    console.log('   - Sign in again to create a fresh user account')
    console.log('   - Test the application with clean data')

  } catch (error) {
    console.error('❌ Error during cleanup:', error)
    process.exit(1)
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

// Run the cleanup if this file is executed directly
if (require.main === module) {
  cleanupDatabase().catch(error => {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  })
}

export { cleanupDatabase }
