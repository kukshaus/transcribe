#!/usr/bin/env node

/**
 * Script to ensure proper database indexes for payment collection
 * This prevents duplicate payment processing at the database level
 */

require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function ensurePaymentIndexes() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    const paymentsCollection = db.collection('payments');
    
    // Create unique index on stripeSessionId to prevent duplicate payments
    const indexResult = await paymentsCollection.createIndex(
      { stripeSessionId: 1 },
      { 
        unique: true,
        name: 'unique_stripe_session_id'
      }
    );
    
    console.log('Created unique index on stripeSessionId:', indexResult);
    
    // List all indexes to verify
    const indexes = await paymentsCollection.listIndexes().toArray();
    console.log('Payment collection indexes:');
    indexes.forEach(index => {
      console.log(`- ${index.name}: ${JSON.stringify(index.key)} ${index.unique ? '(unique)' : ''}`);
    });
    
  } catch (error) {
    console.error('Error ensuring payment indexes:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('Database connection closed');
  }
}

if (require.main === module) {
  ensurePaymentIndexes();
}

module.exports = { ensurePaymentIndexes };
