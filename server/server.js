import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Ensure dotenv is initialized at the very top of the file before any database code runs
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

// Only load local .env in non-production environments
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.resolve(rootDir, '.env') })
}

import express from 'express'
import cors from 'cors'
import { connectDB, isDbConnected, getLastMongoError } from './db.js'
import Contact from './models/Contact.js'
import Course from './models/Course.js'
import Enrollment from './models/Enrollment.js'
import { requireAdminAuth } from './middleware/auth.js'

const app = express()
const PORT = process.env.PORT || 5000

// Connect to MongoDB Atlas or local instance
connectDB()

// Disable x-powered-by header
app.disable('x-powered-by')

// Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'SAMEORIGIN')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  // Content Security Policy (Strictly defines authorized script, font, image, and style origins)
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https://nextchallenge.tech https://*.onrender.com",
    "connect-src 'self' https://nextchallenge.tech https://nextchallenge-tech.onrender.com",
    "frame-ancestors 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'"
  ]
  res.setHeader('Content-Security-Policy', cspDirectives.join('; '))

  // HSTS when on HTTPS
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  }
  next()
})

// Sensitive File and Directory Guard Middleware (defense-in-depth against reconnaissance)
app.use((req, res, next) => {
  let decodedPath = ''
  try {
    decodedPath = decodeURIComponent(req.path).toLowerCase()
  } catch {
    return res.status(400).json({ success: false, message: 'Bad request URI' })
  }

  // Reject directory traversal attempts
  if (decodedPath.includes('..') || decodedPath.includes('//')) {
    return res.status(400).json({ success: false, message: 'Invalid path traversal detected' })
  }

  // Block dotfiles and hidden system directories (e.g. /.env, /.git, /.aws)
  // Permitted exception: /.well-known/ for RFC 9116 security.txt and standard verification
  if (/^\/\.(?!well-known\/)/.test(decodedPath)) {
    return res.status(404).json({ success: false, message: 'Resource not found' })
  }

  // Block sensitive file extensions (backups, source configs, secrets, databases, logs)
  const sensitiveExtRegex = /\.(env|git|bak|backup|old|save|sql|sqlite|db|log|conf|ini|yaml|yml|sh|bash|tar|gz|zip)$/i
  if (sensitiveExtRegex.test(decodedPath)) {
    return res.status(404).json({ success: false, message: 'Resource not found' })
  }

  next()
})

// CORS Configuration - Strictly restricted to Next Challenge domains and explicit endpoints
const allowedOrigins = [
  'https://nextchallenge.tech',
  'https://www.nextchallenge.tech',
  'https://nextchallenge-tech.onrender.com',
  process.env.FRONTEND_URL
].filter(Boolean)

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, server-to-server, same-origin)
    if (!origin) return callback(null, true)

    // Allow localhost on any port for local development & automated auditing
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true)
    }

    // Match exact allowed origins or subdomains of nextchallenge.tech
    if (
      allowedOrigins.includes(origin) ||
      /^https:\/\/([a-zA-Z0-9-]+\.)?nextchallenge\.tech$/.test(origin)
    ) {
      return callback(null, true)
    }

    // In non-production environments, allow origin for developer tooling
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true)
    }

    return callback(null, false)
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Accept',
    'x-admin-key',
    'X-Admin-Key',
    'x-api-key',
    'X-Api-Key',
    'admin-api-key',
    'Admin-Api-Key',
    'Authorization',
    'authorization',
    'Origin',
    'X-Requested-With',
    'Cache-Control',
    'Pragma'
  ],
  credentials: true
}

app.use(cors(corsOptions))
app.options('*', cors(corsOptions)) // Explicit preflight handling for all routes

// Body Parser with strict payload limit
app.use(express.json({ limit: '64kb' }))

// In-Memory Rate Limiter (10 requests per 10 minutes per IP for contact and enrollment submissions)
const rateLimitMap = new Map()
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000 // 10 minutes
const MAX_REQUESTS_PER_WINDOW = 10

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for']
  if (forwarded && typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim()
  }
  return req.socket?.remoteAddress || 'unknown'
}

function rateLimiter(req, res, next) {
  const ip = getClientIp(req)
  const now = Date.now()

  let record = rateLimitMap.get(ip)
  if (!record || now - record.startTime > RATE_LIMIT_WINDOW_MS) {
    record = { startTime: now, count: 1 }
    rateLimitMap.set(ip, record)
  } else {
    record.count += 1
  }

  // Periodic cleanup
  if (rateLimitMap.size > 2000) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (now - value.startTime > RATE_LIMIT_WINDOW_MS) {
        rateLimitMap.delete(key)
      }
    }
  }

  if (record.count > MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({
      success: false,
      message: 'Too many submissions received. Please wait a few minutes before submitting again.'
    })
  }

  next()
}

// In-Memory Admin Rate Limiter (25 requests per 5 minutes per IP for admin routes to mitigate brute force)
const adminRateLimitMap = new Map()
const ADMIN_RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000 // 5 minutes
const MAX_ADMIN_REQUESTS_PER_WINDOW = 25

function adminRateLimiter(req, res, next) {
  const ip = getClientIp(req)
  const now = Date.now()

  let record = adminRateLimitMap.get(ip)
  if (!record || now - record.startTime > ADMIN_RATE_LIMIT_WINDOW_MS) {
    record = { startTime: now, count: 1 }
    adminRateLimitMap.set(ip, record)
  } else {
    record.count += 1
  }

  // Periodic cleanup if map grows
  if (adminRateLimitMap.size > 1000) {
    for (const [key, value] of adminRateLimitMap.entries()) {
      if (now - value.startTime > ADMIN_RATE_LIMIT_WINDOW_MS) {
        adminRateLimitMap.delete(key)
      }
    }
  }

  if (record.count > MAX_ADMIN_REQUESTS_PER_WINDOW) {
    return res.status(429).json({
      success: false,
      message: 'Too many administrative requests received. Access temporarily restricted. Please try again in a few minutes.'
    })
  }

  next()
}

// Apply admin rate limiting to all /api/admin routes
app.use('/api/admin', adminRateLimiter)

// RFC 9116 Security.txt endpoint
app.get(['/.well-known/security.txt', '/security.txt'], (req, res) => {
  res.type('text/plain').send(
    'Contact: mailto:security@nextchallenge.tech\n' +
    'Contact: https://nextchallenge.tech/#contact\n' +
    'Expires: 2027-12-31T23:59:59.000Z\n' +
    'Preferred-Languages: fr, en, ar\n' +
    'Canonical: https://nextchallenge.tech/.well-known/security.txt\n' +
    'Policy: https://nextchallenge.tech/security\n'
  )
})

// Health Check - Sanitized for production
app.get('/health', (req, res) => {
  const isConnected = isDbConnected()
  const dbStatus = isConnected ? 'connected' : 'disconnected'

  const responseBody = {
    status: isConnected ? 'ok' : 'degraded',
    service: 'nextchallengesite-unified',
    domain: 'nextchallenge.tech',
    database: dbStatus,
    timestamp: new Date().toISOString()
  }

  // Disclose detailed internal error only in non-production environments
  if (!isConnected && process.env.NODE_ENV !== 'production') {
    const err = getLastMongoError()
    if (err) responseBody.error = err
  }

  res.status(200).json(responseBody)
})

/**
 * -------------------------------------------------------------
 * Public API Routes
 * -------------------------------------------------------------
 */

// POST /api/contact - Saves inquiry submissions directly to MongoDB
app.post('/api/contact', rateLimiter, async (req, res) => {
  try {
    const { fullName, name, email, phone, company, subject, message } = req.body || {}

    const senderName = (fullName || name || '').trim()

    // Validation
    if (!senderName || senderName.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Name is required (minimum 2 characters).'
      })
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'A valid email address is required.'
      })
    }

    if (!message || typeof message !== 'string' || message.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Message is required (minimum 5 characters).'
      })
    }

    const cleanSubject = (subject || 'General Inquiry').trim().slice(0, 150)
    const cleanPhone = (phone || '').trim().slice(0, 50)
    const cleanCompany = (company || '').trim().slice(0, 100)
    const cleanMessage = message.trim().slice(0, 5000)

    // Save submission to MongoDB
    const newSubmission = new Contact({
      name: senderName.slice(0, 120),
      email: email.trim().toLowerCase().slice(0, 150),
      phone: cleanPhone,
      company: cleanCompany,
      subject: cleanSubject,
      message: cleanMessage,
      date: new Date(),
      readStatus: false,
      ip: getClientIp(req)
    })

    const savedDoc = await newSubmission.save()

    console.log(`[Contact Submission] Stored message from "${savedDoc.name}" <${savedDoc.email}> (ID: ${savedDoc._id})`)

    return res.status(201).json({
      success: true,
      message: 'Thank you! Your message has been received and saved successfully.',
      data: {
        id: savedDoc._id,
        name: savedDoc.name,
        email: savedDoc.email,
        date: savedDoc.date,
        readStatus: savedDoc.readStatus
      }
    })
  } catch (err) {
    console.error('[Contact Submission Error]', err.message || err)
    return res.status(500).json({
      success: false,
      message: 'Failed to save contact submission. Please try again or reach us at 0552 56 96 54.'
    })
  }
})

// POST /api/enroll - Public endpoint for student course enrollment applications
app.post('/api/enroll', rateLimiter, async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database temporarily unavailable. Please try again shortly or contact us at 0552 56 96 54.'
      })
    }

    const { name, fullName, email, phone, selectedCourseId, courseId, message } = req.body || {}
    const studentName = (name || fullName || '').trim()
    const targetCourseId = selectedCourseId || courseId

    // Validation
    if (!studentName || studentName.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Student name is required (minimum 2 characters).'
      })
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'A valid email address is required.'
      })
    }

    if (!phone || typeof phone !== 'string' || phone.trim().length < 6) {
      return res.status(400).json({
        success: false,
        message: 'A valid phone number is required (minimum 6 digits).'
      })
    }

    if (!targetCourseId) {
      return res.status(400).json({
        success: false,
        message: 'Please select a course to register for.'
      })
    }

    // Verify course exists
    let courseDoc = null
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(String(targetCourseId))
    if (isObjectId) {
      courseDoc = await Course.findById(targetCourseId).lean()
    } else {
      courseDoc = await Course.findOne({
        $or: [{ slug: String(targetCourseId).toLowerCase() }, { title: String(targetCourseId) }]
      }).lean()
    }

    if (!courseDoc) {
      return res.status(404).json({
        success: false,
        message: 'The selected course program was not found.'
      })
    }

    const newEnrollment = new Enrollment({
      name: studentName.slice(0, 120),
      email: email.trim().toLowerCase().slice(0, 150),
      phone: phone.trim().slice(0, 50),
      selectedCourseId: courseDoc._id,
      courseTitle: courseDoc.title,
      date: new Date(),
      status: 'pending',
      message: (message || '').trim().slice(0, 2000),
      ip: getClientIp(req)
    })

    const savedDoc = await newEnrollment.save()
    console.log(`[Student Enrollment] New application from "${savedDoc.name}" for "${savedDoc.courseTitle}" (ID: ${savedDoc._id})`)

    return res.status(201).json({
      success: true,
      message: 'Your registration application has been submitted successfully! Our admissions team will reach out to you shortly.',
      enrollment: {
        id: savedDoc._id,
        name: savedDoc.name,
        email: savedDoc.email,
        phone: savedDoc.phone,
        courseTitle: savedDoc.courseTitle,
        status: savedDoc.status,
        date: savedDoc.date
      }
    })
  } catch (err) {
    console.error('[Enrollment Application Error]', err.message || err)
    return res.status(500).json({
      success: false,
      message: 'Failed to process course registration application. Please try again.'
    })
  }
})

// GET /api/courses - Public endpoint to retrieve active training courses
app.get('/api/courses', async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database temporarily unavailable. Please try again shortly.'
      })
    }

    const { tech, search } = req.query
    const filter = { isActive: true }

    if (tech && typeof tech === 'string' && tech.trim()) {
      const escapedTech = tech.trim().slice(0, 50).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      filter.technologies = { $in: [new RegExp(escapedTech, 'i')] }
    }

    if (search && typeof search === 'string' && search.trim()) {
      const escapedSearch = search.trim().slice(0, 50).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const searchRegex = new RegExp(escapedSearch, 'i')
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { technologies: searchRegex }
      ]
    }

    const courses = await Course.find(filter)
      .sort({ order: 1, createdAt: 1 })
      .lean()

    return res.status(200).json({
      success: true,
      count: courses.length,
      courses
    })
  } catch (err) {
    console.error('[Public Courses API Error]', err.message || err)
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve training curriculum.'
    })
  }
})

// GET /api/courses/:idOrSlug - Public single course view
app.get('/api/courses/:idOrSlug', async (req, res) => {
  try {
    const { idOrSlug } = req.params
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrSlug)

    const query = isObjectId
      ? { _id: idOrSlug }
      : { slug: idOrSlug.toLowerCase() }

    const course = await Course.findOne(query).lean()
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.'
      })
    }

    return res.status(200).json({
      success: true,
      course
    })
  } catch (err) {
    console.error('[Course Detail Error]', err.message || err)
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve course details.'
    })
  }
})

/**
 * -------------------------------------------------------------
 * Secured Admin API Routes
 * -------------------------------------------------------------
 */

// POST /api/admin/verify - Verify admin credentials
app.post('/api/admin/verify', requireAdminAuth, (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Admin authorization key verified successfully.'
  })
})

// GET /api/admin/contacts - Fetch submissions with filtering, search, and pagination
app.get('/api/admin/contacts', requireAdminAuth, async (req, res) => {
  try {
    if (!isDbConnected()) {
      const err = getLastMongoError()
      return res.status(503).json({
        success: false,
        message: err ? `Database currently disconnected: ${err}` : 'Database currently disconnected. MongoDB is initializing connection.'
      })
    }

    const { status, search, page = 1, limit = 100, sort = '-date' } = req.query

    const filter = {}

    if (status === 'unread') {
      filter.readStatus = false
    } else if (status === 'read') {
      filter.readStatus = true
    }

    if (search && typeof search === 'string' && search.trim()) {
      const escapedSearch = search.trim().slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const regex = new RegExp(escapedSearch, 'i')
      filter.$or = [
        { name: regex },
        { email: regex },
        { subject: regex },
        { message: regex },
        { company: regex },
        { phone: regex }
      ]
    }

    // Whitelist allowed sort parameters to prevent unexpected query behavior
    const ALLOWED_CONTACT_SORTS = new Set([
      '-date', 'date',
      '-createdAt', 'createdAt',
      'name', '-name',
      'email', '-email',
      'readStatus', '-readStatus',
      '_id', '-_id'
    ])
    const cleanSort = typeof sort === 'string' && ALLOWED_CONTACT_SORTS.has(sort.trim()) ? sort.trim() : '-date'

    const pageNum = Math.max(1, parseInt(page, 10) || 1)
    const limitNum = Math.min(500, Math.max(1, parseInt(limit, 10) || 100))
    const skip = (pageNum - 1) * limitNum

    const [contacts, totalCount, unreadCount] = await Promise.all([
      Contact.find(filter)
        .sort(cleanSort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Contact.countDocuments(filter),
      Contact.countDocuments({ readStatus: false })
    ])

    return res.status(200).json({
      success: true,
      count: contacts.length,
      totalCount,
      unreadCount,
      page: pageNum,
      totalPages: Math.ceil(totalCount / limitNum) || 1,
      contacts
    })
  } catch (err) {
    console.error('[Admin Contacts API Error]', err.message || err)
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve contact submissions from database.'
    })
  }
})

// GET /api/admin/contacts/stats - Fetch summary counts
app.get('/api/admin/contacts/stats', requireAdminAuth, async (req, res) => {
  try {
    if (!isDbConnected()) {
      const err = getLastMongoError()
      return res.status(503).json({
        success: false,
        message: err ? `Database currently disconnected: ${err}` : 'Database currently disconnected. MongoDB is initializing connection.'
      })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [total, unread, read, todayCount, pendingEnrollments] = await Promise.all([
      Contact.countDocuments(),
      Contact.countDocuments({ readStatus: false }),
      Contact.countDocuments({ readStatus: true }),
      Contact.countDocuments({ date: { $gte: today } }),
      Enrollment.countDocuments({ status: 'pending' })
    ])

    return res.status(200).json({
      success: true,
      stats: {
        total,
        unread,
        read,
        today: todayCount,
        pendingEnrollments
      }
    })
  } catch (err) {
    console.error('[Admin Contacts Stats Error]', err.message || err)
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve contact statistics.'
    })
  }
})

// PATCH /api/admin/contacts/:id/read - Toggle or set readStatus
app.patch('/api/admin/contacts/:id/read', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params
    const { readStatus } = req.body || {}

    const contact = await Contact.findById(id)
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found.'
      })
    }

    contact.readStatus = typeof readStatus === 'boolean' ? readStatus : !contact.readStatus
    await contact.save()

    const unreadCount = await Contact.countDocuments({ readStatus: false })

    return res.status(200).json({
      success: true,
      message: `Marked as ${contact.readStatus ? 'read' : 'unread'}.`,
      contact,
      unreadCount
    })
  } catch (err) {
    console.error('[Admin Read Update Error]', err.message || err)
    return res.status(500).json({
      success: false,
      message: 'Failed to update read status.'
    })
  }
})

// PATCH /api/admin/contacts/mark-all-read - Mark all unread submissions as read
app.patch('/api/admin/contacts/mark-all-read', requireAdminAuth, async (req, res) => {
  try {
    const result = await Contact.updateMany({ readStatus: false }, { $set: { readStatus: true } })
    return res.status(200).json({
      success: true,
      message: 'All unread submissions have been marked as read.',
      modifiedCount: result.modifiedCount,
      unreadCount: 0
    })
  } catch (err) {
    console.error('[Admin Mark All Read Error]', err.message || err)
    return res.status(500).json({
      success: false,
      message: 'Failed to update submissions.'
    })
  }
})

// DELETE /api/admin/contacts/:id - Remove a submission
app.delete('/api/admin/contacts/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params
    const deleted = await Contact.findByIdAndDelete(id)

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found.'
      })
    }

    const unreadCount = await Contact.countDocuments({ readStatus: false })
    const totalCount = await Contact.countDocuments()

    return res.status(200).json({
      success: true,
      message: 'Submission deleted successfully.',
      unreadCount,
      totalCount
    })
  } catch (err) {
    console.error('[Admin Delete Error]', err.message || err)
    return res.status(500).json({
      success: false,
      message: 'Failed to delete submission.'
    })
  }
})

/**
 * -------------------------------------------------------------
 * Secured Admin Courses API Routes (/api/admin/courses)
 * -------------------------------------------------------------
 */

// GET /api/admin/courses - Fetch all courses with stats
app.get('/api/admin/courses', requireAdminAuth, async (req, res) => {
  try {
    if (!isDbConnected()) {
      const err = getLastMongoError()
      return res.status(503).json({
        success: false,
        message: err ? `Database currently disconnected: ${err}` : 'Database currently disconnected.'
      })
    }

    const { status, search } = req.query
    const filter = {}

    if (status === 'active') {
      filter.isActive = true
    } else if (status === 'inactive') {
      filter.isActive = false
    }

    if (search && typeof search === 'string' && search.trim()) {
      const escapedSearch = search.trim().slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const searchRegex = new RegExp(escapedSearch, 'i')
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { technologies: searchRegex }
      ]
    }

    const [courses, totalCount, activeCount] = await Promise.all([
      Course.find(filter).sort({ order: 1, createdAt: -1 }).lean(),
      Course.countDocuments(),
      Course.countDocuments({ isActive: true })
    ])

    return res.status(200).json({
      success: true,
      count: courses.length,
      totalCount,
      activeCount,
      inactiveCount: totalCount - activeCount,
      courses
    })
  } catch (err) {
    console.error('[Admin Courses GET Error]', err.message || err)
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve courses.'
    })
  }
})

// POST /api/admin/courses - Create a new course
app.post('/api/admin/courses', requireAdminAuth, async (req, res) => {
  try {
    const { title, description, syllabus, technologies, icon, duration, badge, level, order, isActive } = req.body || {}

    if (!title || typeof title !== 'string' || title.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Course title is required (minimum 2 characters).'
      })
    }

    if (!description || typeof description !== 'string' || description.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Course description is required (minimum 5 characters).'
      })
    }

    // Normalize technologies
    let techArray = []
    if (Array.isArray(technologies)) {
      techArray = technologies.map(t => String(t).trim()).filter(Boolean)
    } else if (typeof technologies === 'string' && technologies.trim()) {
      techArray = technologies.split(',').map(t => t.trim()).filter(Boolean)
    }

    // Normalize syllabus
    let syllabusData = []
    if (Array.isArray(syllabus)) {
      syllabusData = syllabus
    } else if (typeof syllabus === 'string' && syllabus.trim()) {
      syllabusData = [syllabus.trim()]
    }

    const course = new Course({
      title: title.trim(),
      description: description.trim(),
      syllabus: syllabusData,
      technologies: techArray,
      icon: (icon || 'mdi-school-outline').trim(),
      duration: (duration || '').trim(),
      badge: (badge || 'Training Program').trim(),
      level: (level || 'All Levels').trim(),
      order: Number(order) || 0,
      isActive: isActive !== undefined ? Boolean(isActive) : true
    })

    await course.save()
    console.log(`[Admin Course Created] "${course.title}" (ID: ${course._id})`)

    return res.status(201).json({
      success: true,
      message: 'Course program created successfully.',
      course
    })
  } catch (err) {
    console.error('[Admin Course Create Error]', err.message || err)
    return res.status(500).json({
      success: false,
      message: 'Failed to create course.'
    })
  }
})

// PUT /api/admin/courses/:id - Update course
app.put('/api/admin/courses/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params
    const { title, description, syllabus, technologies, icon, duration, badge, level, order, isActive } = req.body || {}

    const course = await Course.findById(id)
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.'
      })
    }

    if (title && typeof title === 'string') course.title = title.trim()
    if (description && typeof description === 'string') course.description = description.trim()
    if (icon && typeof icon === 'string') course.icon = icon.trim()
    if (duration !== undefined) course.duration = String(duration).trim()
    if (badge !== undefined) course.badge = String(badge).trim()
    if (level !== undefined) course.level = String(level).trim()
    if (order !== undefined) course.order = Number(order) || 0
    if (isActive !== undefined) course.isActive = Boolean(isActive)

    if (technologies !== undefined) {
      if (Array.isArray(technologies)) {
        course.technologies = technologies.map(t => String(t).trim()).filter(Boolean)
      } else if (typeof technologies === 'string') {
        course.technologies = technologies.split(',').map(t => t.trim()).filter(Boolean)
      }
    }

    if (syllabus !== undefined) {
      course.syllabus = Array.isArray(syllabus) ? syllabus : [String(syllabus).trim()]
    }

    await course.save()
    console.log(`[Admin Course Updated] "${course.title}" (ID: ${course._id})`)

    return res.status(200).json({
      success: true,
      message: 'Course program updated successfully.',
      course
    })
  } catch (err) {
    console.error('[Admin Course Update Error]', err.message || err)
    return res.status(500).json({
      success: false,
      message: 'Failed to update course.'
    })
  }
})

// DELETE /api/admin/courses/:id - Delete course
app.delete('/api/admin/courses/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params
    const deleted = await Course.findByIdAndDelete(id)

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.'
      })
    }

    console.log(`[Admin Course Deleted] "${deleted.title}" (ID: ${deleted._id})`)
    const totalCount = await Course.countDocuments()

    return res.status(200).json({
      success: true,
      message: 'Course program deleted successfully.',
      totalCount
    })
  } catch (err) {
    console.error('[Admin Course Delete Error]', err.message || err)
    return res.status(500).json({
      success: false,
      message: 'Failed to delete course.'
    })
  }
})

// PATCH /api/admin/courses/:id/toggle-active - Toggle active status
app.patch('/api/admin/courses/:id/toggle-active', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params
    const course = await Course.findById(id)
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.'
      })
    }

    course.isActive = !course.isActive
    await course.save()

    return res.status(200).json({
      success: true,
      message: `Course "${course.title}" is now ${course.isActive ? 'active' : 'inactive'}.`,
      course
    })
  } catch (err) {
    console.error('[Admin Course Toggle Error]', err.message || err)
    return res.status(500).json({
      success: false,
      message: 'Failed to toggle course active status.'
    })
  }
})

/**
 * -------------------------------------------------------------
 * Secured Admin Student Enrollments API Routes
 * -------------------------------------------------------------
 */

// GET /api/admin/enrollments - List student enrollment applications with filters & stats
app.get('/api/admin/enrollments', requireAdminAuth, async (req, res) => {
  try {
    if (!isDbConnected()) {
      const err = getLastMongoError()
      return res.status(503).json({
        success: false,
        message: err ? `Database temporarily unavailable: ${err}` : 'Database temporarily unavailable.'
      })
    }

    const { status, search, courseId } = req.query
    const filter = {}

    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      filter.status = status
    }

    if (courseId && /^[0-9a-fA-F]{24}$/.test(courseId)) {
      filter.selectedCourseId = courseId
    }

    if (search && typeof search === 'string' && search.trim()) {
      const escapedSearch = search.trim().slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const searchRegex = new RegExp(escapedSearch, 'i')
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { courseTitle: searchRegex },
        { message: searchRegex }
      ]
    }

    const [enrollments, totalCount, pendingCount, approvedCount, rejectedCount] = await Promise.all([
      Enrollment.find(filter)
        .populate('selectedCourseId', 'title icon badge duration level')
        .sort({ date: -1 })
        .lean(),
      Enrollment.countDocuments(),
      Enrollment.countDocuments({ status: 'pending' }),
      Enrollment.countDocuments({ status: 'approved' }),
      Enrollment.countDocuments({ status: 'rejected' })
    ])

    return res.status(200).json({
      success: true,
      count: enrollments.length,
      totalCount,
      pendingCount,
      approvedCount,
      rejectedCount,
      enrollments
    })
  } catch (err) {
    console.error('[Admin Enrollments Error]', err.message || err)
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve student enrollments.'
    })
  }
})

// PATCH /api/admin/enrollments/:id/status - Update enrollment status & admin notes
app.patch('/api/admin/enrollments/:id/status', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params
    const { status, adminNotes } = req.body || {}

    const updateFields = {}
    if (status) {
      if (!['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status value. Must be "pending", "approved", or "rejected".'
        })
      }
      updateFields.status = status
    }

    if (typeof adminNotes === 'string') {
      updateFields.adminNotes = adminNotes.trim().slice(0, 2000)
    }

    const updated = await Enrollment.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).populate('selectedCourseId', 'title icon badge duration level')

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment application not found.'
      })
    }

    return res.status(200).json({
      success: true,
      message: `Enrollment status updated to "${updated.status}".`,
      enrollment: updated
    })
  } catch (err) {
    console.error('[Admin Enrollment Status Error]', err.message || err)
    return res.status(500).json({
      success: false,
      message: 'Failed to update enrollment status.'
    })
  }
})

// DELETE /api/admin/enrollments/:id - Delete an enrollment application
app.delete('/api/admin/enrollments/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params
    const deleted = await Enrollment.findByIdAndDelete(id)

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment application not found.'
      })
    }

    const totalCount = await Enrollment.countDocuments()

    return res.status(200).json({
      success: true,
      message: 'Enrollment application deleted successfully.',
      totalCount
    })
  } catch (err) {
    console.error('[Admin Enrollment Delete Error]', err.message || err)
    return res.status(500).json({
      success: false,
      message: 'Failed to delete enrollment application.'
    })
  }
})

// Serve production static assets from dist
const distPath = path.join(rootDir, 'dist')

// Cache control and MIME types: Hashed assets cached for 1 year, APK downloads forced as attachment, index.html not cached
app.use(
  express.static(distPath, {
    setHeaders: (res, filePath) => {
      if (filePath.includes('/assets/')) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
      } else if (filePath.endsWith('.apk')) {
        res.setHeader('Content-Type', 'application/vnd.android.package-archive')
        res.setHeader('Content-Disposition', 'attachment')
        res.setHeader('Cache-Control', 'public, max-age=86400')
      } else if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache')
      }
    }
  })
)

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('Next Challenge Server running. Run `npm run build` to generate frontend.')
    }
  })
})

app.listen(PORT, () => {
  console.log(`[Next Challenge Server] Running on port ${PORT}`)
  console.log(`[Next Challenge Server] Target Domain: https://nextchallenge.tech`)
  console.log(`[Next Challenge Server] Database backend: MongoDB active`)
})
