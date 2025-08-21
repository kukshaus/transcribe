#!/usr/bin/env node

/**
 * Clean up transcriptions with large binary data to improve performance
 * This script identifies and removes large audioFile.data fields that cause slow queries
 */

require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function cleanupLargeDocuments() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('🔗 Connected to MongoDB');
    
    const db = client.db();
    const transcriptionsCollection = db.collection('transcriptions');
    
    // Find transcriptions with potentially large documents
    console.log('🔍 Finding transcriptions with large binary data...');
    
    // Use aggregation to find documents with large binary data
    const largeDocs = await transcriptionsCollection.aggregate([
      {
        $match: {
          'audioFile.data': { $exists: true },
          'audioFile.storageType': 'document'
        }
      },
      {
        $addFields: {
          docSize: { $bsonSize: '$$ROOT' }
        }
      },
      {
        $match: {
          docSize: { $gt: 1024 * 1024 } // Documents larger than 1MB
        }
      },
      {
        $project: {
          _id: 1,
          title: 1,
          docSize: 1,
          'audioFile.size': 1,
          'audioFile.filename': 1,
          'audioFile.storageType': 1
        }
      },
      {
        $sort: { docSize: -1 }
      }
    ]).toArray();
    
    console.log(`📊 Found ${largeDocs.length} transcriptions with large binary data`);
    
    if (largeDocs.length === 0) {
      console.log('✅ No large documents found that need cleanup');
      return;
    }
    
    // Show the largest documents
    console.log('\n📋 Largest documents:');
    largeDocs.slice(0, 5).forEach((doc, index) => {
      const sizeMB = (doc.docSize / (1024 * 1024)).toFixed(2);
      const audioSizeMB = ((doc.audioFile?.size || 0) / (1024 * 1024)).toFixed(2);
      console.log(`  ${index + 1}. ${doc._id}: ${sizeMB} MB total (audio: ${audioSizeMB} MB) - "${doc.title || 'No title'}"`);
    });
    
    // Ask for confirmation in production
    if (process.env.NODE_ENV === 'production') {
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const answer = await new Promise(resolve => {
        readline.question('\n⚠️  Production environment detected. Are you sure you want to proceed? (yes/no): ', resolve);
      });
      
      readline.close();
      
      if (answer.toLowerCase() !== 'yes') {
        console.log('❌ Operation cancelled');
        return;
      }
    }
    
    console.log('\n🧹 Starting cleanup process...');
    
    let cleanedCount = 0;
    let errorCount = 0;
    
    for (const doc of largeDocs) {
      try {
        console.log(`🔄 Processing ${doc._id}...`);
        
        // Remove the large binary data field
        await transcriptionsCollection.updateOne(
          { _id: doc._id },
          {
            $unset: {
              'audioFile.data': ''
            },
            $set: {
              'audioFile.storageType': 'removed', // Mark as removed
              updatedAt: new Date()
            }
          }
        );
        
        console.log(`   ✅ Removed binary data from ${doc._id}`);
        cleanedCount++;
        
      } catch (error) {
        console.error(`   ❌ Error processing ${doc._id}:`, error.message);
        errorCount++;
      }
    }
    
    console.log(`\n🎉 Cleanup completed!`);
    console.log(`   ✅ Successfully cleaned: ${cleanedCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    
    // Check final sizes
    const remainingLargeDocs = await transcriptionsCollection.countDocuments({
      'audioFile.data': { $exists: true }
    });
    
    console.log(`\n📊 Final status:`);
    console.log(`   Documents with binary data remaining: ${remainingLargeDocs}`);
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('🔒 Database connection closed');
  }
}

if (require.main === module) {
  cleanupLargeDocuments();
}

module.exports = { cleanupLargeDocuments };