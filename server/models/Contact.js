import mongoose from 'mongoose'

/**
 * Contact Submission Schema
 * Requirements: name, email, message, date, readStatus
 */
const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 120
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      maxlength: 150,
      match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Invalid email format']
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: 5000
    },
    date: {
      type: Date,
      default: Date.now,
      index: true
    },
    readStatus: {
      type: Boolean,
      default: false,
      index: true
    },
    // Supplementary metadata preserved from inquiries
    phone: {
      type: String,
      trim: true,
      maxlength: 50,
      default: ''
    },
    company: {
      type: String,
      trim: true,
      maxlength: 100,
      default: ''
    },
    subject: {
      type: String,
      trim: true,
      maxlength: 150,
      default: 'General Inquiry'
    },
    ip: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
)

// Index for efficient sorting and search
contactSchema.index({ date: -1 })
contactSchema.index({ readStatus: 1, date: -1 })

export const Contact = mongoose.model('Contact', contactSchema)
export default Contact
