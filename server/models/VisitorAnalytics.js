import mongoose from 'mongoose'

/**
 * VisitorAnalytics Schema
 * Stores daily aggregated metrics for Next Challenge website visitors.
 * Designed for lightweight, fast queries and zero PII storage.
 */
const pageViewSchema = new mongoose.Schema(
  {
    path: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    views: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  { _id: false }
)

const visitorAnalyticsSchema = new mongoose.Schema(
  {
    date: {
      type: String, // 'YYYY-MM-DD' (UTC date)
      required: true,
      unique: true,
      trim: true
    },
    uniqueVisitors: {
      type: Number,
      default: 0,
      min: 0
    },
    totalVisits: {
      type: Number,
      default: 0,
      min: 0
    },
    newVisitors: {
      type: Number,
      default: 0,
      min: 0
    },
    returningVisitors: {
      type: Number,
      default: 0,
      min: 0
    },
    topPages: {
      type: [pageViewSchema],
      default: []
    },
    devices: {
      desktop: { type: Number, default: 0, min: 0 },
      mobile: { type: Number, default: 0, min: 0 },
      tablet: { type: Number, default: 0, min: 0 }
    },
    browsers: {
      chrome: { type: Number, default: 0, min: 0 },
      safari: { type: Number, default: 0, min: 0 },
      firefox: { type: Number, default: 0, min: 0 },
      edge: { type: Number, default: 0, min: 0 },
      other: { type: Number, default: 0, min: 0 }
    }
  },
  {
    timestamps: true
  }
)

// Ensure indexed lookup by date
visitorAnalyticsSchema.index({ date: -1 })

const VisitorAnalytics =
  mongoose.models.VisitorAnalytics || mongoose.model('VisitorAnalytics', visitorAnalyticsSchema)

export default VisitorAnalytics
