import mongoose from 'mongoose'

/**
 * Student Enrollment Application Schema
 * Required fields: name, email, phone, selectedCourseId, date, status ('pending')
 */
const enrollmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
      maxlength: 120
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      trim: true,
      lowercase: true,
      maxlength: 150,
      match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Invalid email format']
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      maxlength: 50
    },
    selectedCourseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Selected course ID is required'],
      index: true
    },
    courseTitle: {
      type: String,
      trim: true,
      default: ''
    },
    date: {
      type: Date,
      default: Date.now,
      index: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true
    },
    message: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: ''
    },
    adminNotes: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: ''
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

// Efficient query indices
enrollmentSchema.index({ date: -1 })
enrollmentSchema.index({ status: 1, date: -1 })
enrollmentSchema.index({ selectedCourseId: 1, status: 1 })

export const Enrollment = mongoose.model('Enrollment', enrollmentSchema)
export default Enrollment
