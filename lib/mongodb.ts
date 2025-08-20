import { MongoClient, Db } from 'mongodb'

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const uri = process.env.MONGODB_URI
const options = {}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export default clientPromise

export async function getDatabase(): Promise<Db> {
  try {
    console.log('=== MONGODB CONNECTION DEBUG ===')
    console.log('Attempting to connect to MongoDB...')
    console.log('NODE_ENV:', process.env.NODE_ENV)
    console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI)
    console.log('MONGODB_URI starts with mongodb:', process.env.MONGODB_URI?.startsWith('mongodb'))
    
    const client = await clientPromise
    console.log('MongoDB client connected successfully')
    
    const db = client.db('transcriber')
    console.log('Database instance created for: transcriber')
    
    // Test the connection
    await db.admin().ping()
    console.log('MongoDB ping successful')
    console.log('=== END MONGODB CONNECTION DEBUG ===')
    
    return db
  } catch (error) {
    console.error('=== MONGODB CONNECTION ERROR ===')
    console.error('Failed to connect to MongoDB:', error)
    console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error)
    console.error('Error message:', error instanceof Error ? error.message : String(error))
    console.error('MONGODB_URI (first 20 chars):', process.env.MONGODB_URI?.substring(0, 20) + '...')
    console.error('=== END MONGODB CONNECTION ERROR ===')
    throw error
  }
}
