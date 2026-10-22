import mongoose from 'mongoose'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

// Ensure environment variables are loaded regardless of how node was invoked
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

dotenv.config({ path: path.resolve(rootDir, '.env') })
dotenv.config()

/**
 * Sanitize and validate MongoDB / Atlas connection strings
 */
function getSanitizedMongoUri() {
  const rawUri =
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    process.env.DATABASE_URL ||
    'mongodb://127.0.0.1:27017/nextchallenge'

  // Strip wrapping single or double quotes, whitespace, and carriage returns
  let cleanUri = String(rawUri).trim().replace(/^["']|["']$/g, '').trim()

  return cleanUri
}

/**
 * MongoDB Atlas & Local connection helper with resilient reconnects
 */
export async function connectDB() {
  const uri = getSanitizedMongoUri()
  const dbName = process.env.MONGODB_DB_NAME || 'nextchallenge'

  // Prevent multiple connection attempts if already connected or connecting
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection
  }

  try {
    // Remove all previous event listeners to prevent memory leak on re-connect
    mongoose.connection.removeAllListeners('connected')
    mongoose.connection.removeAllListeners('error')
    mongoose.connection.removeAllListeners('disconnected')

    mongoose.connection.on('connected', () => {
      console.log(`[MongoDB] Connected successfully to database: ${mongoose.connection.name || dbName}`)
    })

    mongoose.connection.on('error', (err) => {
      console.error('[MongoDB] Connection error:', err.message)
    })

    mongoose.connection.on('disconnected', () => {
      console.warn('[MongoDB] Connection disconnected. Attempting automatic reconnection...')
    })

    // Mask credentials for logging
    const maskedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:*****@')
    console.log(`[MongoDB] Initializing connection to: ${maskedUri}`)

    await mongoose.connect(uri, {
      dbName,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      autoIndex: true,
      maxPoolSize: 10
    })

    return mongoose.connection
  } catch (error) {
    console.error('[MongoDB] Initial connection failed:', error.message)
    return null
  }
}

export function isDbConnected() {
  return mongoose.connection.readyState === 1
}
