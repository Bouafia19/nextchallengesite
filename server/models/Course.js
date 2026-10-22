import mongoose from 'mongoose'

/**
 * Course / Training Program Schema
 * Required fields: title, description, syllabus, technologies, icon, isActive
 */
const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
      maxlength: 200
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true
    },
    description: {
      type: String,
      required: [true, 'Course description is required'],
      trim: true
    },
    // Supports an array of strings or structured module/level objects
    syllabus: {
      type: [mongoose.Schema.Types.Mixed],
      default: []
    },
    // Array of technology tags (e.g. ['Vue.js', 'Node.js', 'Python', 'Odoo'])
    technologies: [
      {
        type: String,
        trim: true
      }
    ],
    icon: {
      type: String,
      default: 'mdi-school-outline'
    },
    badge: {
      type: String,
      trim: true,
      default: 'Training Program'
    },
    duration: {
      type: String,
      trim: true,
      default: ''
    },
    level: {
      type: String,
      trim: true,
      default: 'All Levels'
    },
    order: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true
  }
)

// Auto-generate slug before save if not provided
courseSchema.pre('save', function () {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }
})

courseSchema.index({ isActive: 1, order: 1, createdAt: -1 })

export const Course = mongoose.model('Course', courseSchema)
export default Course
