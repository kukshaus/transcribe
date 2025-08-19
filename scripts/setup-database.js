#!/usr/bin/env node

/**
 * Comprehensive database setup script for production deployment
 * Ensures all necessary indexes and collections are properly configured
 */

require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function setupDatabase() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('🔗 Connected to MongoDB');
    
    const db = client.db();
    
    // Ensure payments collection indexes
    const paymentsCollection = db.collection('payments');
    
    try {
      const paymentIndexResult = await paymentsCollection.createIndex(
        { stripeSessionId: 1 },
        { 
          unique: true,
          name: 'unique_stripe_session_id'
        }
      );
      console.log('✅ Created unique index on stripeSessionId:', paymentIndexResult);
    } catch (error) {
      if (error.code === 11000 || error.codeName === 'IndexOptionsConflict') {
        console.log('✅ Stripe session ID index already exists');
      } else {
        throw error;
      }
    }
    
    // Ensure users collection indexes (for better query performance)
    const usersCollection = db.collection('users');
    
    try {
      await usersCollection.createIndex(
        { email: 1 },
        { 
          unique: true,
          name: 'unique_user_email'
        }
      );
      console.log('✅ Created unique index on user email');
    } catch (error) {
      if (error.code === 11000 || error.codeName === 'IndexOptionsConflict') {
        console.log('✅ User email index already exists');
      } else {
        throw error;
      }
    }
    
    // Ensure transcriptions collection indexes
    const transcriptionsCollection = db.collection('transcriptions');
    
    try {
      await transcriptionsCollection.createIndex(
        { userId: 1 },
        { name: 'user_transcriptions' }
      );
      console.log('✅ Created index on transcription userId');
    } catch (error) {
      if (error.codeName === 'IndexOptionsConflict') {
        console.log('✅ Transcription userId index already exists');
      } else {
        throw error;
      }
    }
    
    try {
      await transcriptionsCollection.createIndex(
        { createdAt: -1 },
        { name: 'transcription_created_desc' }
      );
      console.log('✅ Created index on transcription createdAt');
    } catch (error) {
      if (error.codeName === 'IndexOptionsConflict') {
        console.log('✅ Transcription createdAt index already exists');
      } else {
        throw error;
      }
    }
    
    // List all collections and their indexes
    const collections = await db.listCollections().toArray();
    console.log('\n📋 Database collections and indexes:');
    
    for (const collection of collections) {
      const coll = db.collection(collection.name);
      const indexes = await coll.listIndexes().toArray();
      console.log(`\n  ${collection.name}:`);
      indexes.forEach(index => {
        const uniqueLabel = index.unique ? ' (unique)' : '';
        console.log(`    - ${index.name}: ${JSON.stringify(index.key)}${uniqueLabel}`);
      });
    }
    
    console.log('\n🎉 Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('🔒 Database connection closed');
  }
}

if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };
