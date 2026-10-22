import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Ensure dotenv is initialized at the very top of the file before any database code runs
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

// Also check project root .env if present
dotenv.config({ path: path.resolve(rootDir, '.env') })

import mongoose from 'mongoose'

/**
 * Safely mask sensitive credentials in MongoDB / Atlas connection string
 */
function maskMongoUri(uri) {
  if (!uri || typeof uri !== 'string') return ''
  return uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:*****@')
}

/**
 * MongoDB Atlas & Local connection helper with resilient reconnects
 */
export async function connectDB() {
  // Strictly prioritize process.env.MONGODB_URI, falling back to localhost only if undefined
  const rawUri = process.env.MONGODB_URI
  const uri = (rawUri && typeof rawUri === 'string' && rawUri.trim())
    ? rawUri.trim().replace(/^["']|["']$/g, '').trim()
    : 'mongodb://127.0.0.1:27017/nextchallenge'

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

    // Print safely masked version of the URI right before connection
    const maskedUri = maskMongoUri(uri)
    console.log(`[MongoDB] Initializing connection to: ${maskedUri}`)

    const connectionOptions = {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      autoIndex: true,
      maxPoolSize: 10
    }

    if (dbName) {
      connectionOptions.dbName = dbName
    }

    await mongoose.connect(uri, connectionOptions)

    return mongoose.connection
  } catch (error) {
    console.error('[MongoDB] Initial connection failed:', error.message)
    return null
  }
}

export function isDbConnected() {
  return mongoose.connection.readyState === 1
}

export default connectDB
