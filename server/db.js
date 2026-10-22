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

// Track last error for health check and diagnostics
let lastMongoError = null

/**
 * Explicit error event listener attached to Mongoose connection
 * Prints the complete error object so the exact reason why Atlas is rejecting is exposed
 */
mongoose.connection.on('error', (err) => {
  lastMongoError = err?.message || String(err)
  console.error('[MongoDB Error]', err)
})

mongoose.connection.on('connected', () => {
  lastMongoError = null
  console.log(`[MongoDB] Connected successfully to database: ${mongoose.connection.name || 'nextchallenge'}`)
})

mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB] Connection disconnected. Attempting automatic reconnection...')
})

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
    // Print safely masked version of the URI right before connection
    const maskedUri = maskMongoUri(uri)
    console.log(`[MongoDB] Initializing connection to: ${maskedUri}`)

    const connectionOptions = {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
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
    lastMongoError = error?.message || String(error)
    console.error('[MongoDB Error]', error)
    return null
  }
}

export function isDbConnected() {
  return mongoose.connection.readyState === 1
}

export function getLastMongoError() {
  return lastMongoError
}

export default connectDB
