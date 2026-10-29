import mongoose from 'mongoose'

/**
 * DailySession Schema
 * Stores anonymous hashed session tokens to deduplicate visit/session counts per day.
 * Prevents page reloads and SPA component renders from artificially inflating session counts.
 * Auto-expires records after 7 days via TTL index.
 */
const dailySessionSchema = new mongoose.Schema(
  {
    date: {
      type: String, // 'YYYY-MM-DD'
      required: true,
      trim: true
    },
    sessionHash: {
      type: String, // One-way SHA-256 HMAC hash of anonymous session ID
      required: true,
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 7 * 86400 // 7 days TTL
    }
  },
  {
    versionKey: false
  }
)

dailySessionSchema.index({ date: 1, sessionHash: 1 }, { unique: true })

const DailySession =
  mongoose.models.DailySession || mongoose.model('DailySession', dailySessionSchema)

export default DailySession
