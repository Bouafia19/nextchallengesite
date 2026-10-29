import mongoose from 'mongoose'

/**
 * DailyVisitor Schema
 * Stores anonymous hashed visitor tokens per day for accurate daily deduplication.
 * Does NOT store raw IP addresses or PII.
 * Auto-expires records after 60 days via TTL index to keep storage lightweight.
 */
const dailyVisitorSchema = new mongoose.Schema(
  {
    date: {
      type: String, // 'YYYY-MM-DD'
      required: true,
      trim: true
    },
    visitorHash: {
      type: String, // One-way SHA-256 HMAC hash of anonymous client ID
      required: true,
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 60 * 86400 // 60 days TTL
    }
  },
  {
    versionKey: false
  }
)

// Ensure uniqueness per day and fast lookup across days
dailyVisitorSchema.index({ date: 1, visitorHash: 1 }, { unique: true })
dailyVisitorSchema.index({ visitorHash: 1 })

const DailyVisitor =
  mongoose.models.DailyVisitor || mongoose.model('DailyVisitor', dailyVisitorSchema)

export default DailyVisitor
