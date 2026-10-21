import express from 'express'
import cors from 'cors'
import nodemailer from 'nodemailer'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

const app = express()
const PORT = process.env.PORT || 5000
const RECEIVER_EMAIL = process.env.CONTACT_RECEIVER_EMAIL || 'nextchallenge2021@gmail.com'

// Disable x-powered-by header
app.disable('x-powered-by')

// Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'SAMEORIGIN')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  // HSTS when on HTTPS
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  }
  next()
})

// Production CORS Configuration
const allowedOrigins = [
  'https://nextchallenge.tech',
  'https://www.nextchallenge.tech',
  process.env.FRONTEND_URL
].filter(Boolean)

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server, same-origin)
      if (!origin) return callback(null, true)
      
      // Allow localhost on any port for local development & automated auditing
      if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true)
      }

      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.onrender.com') ||
        origin.endsWith('.nextchallenge.tech')
      ) {
        return callback(null, true)
      }

      // Deny CORS gracefully without throwing an unhandled 500 error
      return callback(null, false)
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept']
  })
)

// Body Parser with strict payload limit
app.use(express.json({ limit: '32kb' }))

// In-Memory Rate Limiter (5 requests per 10 minutes per IP)
const rateLimitMap = new Map()
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000 // 10 minutes
const MAX_REQUESTS_PER_WINDOW = 5

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
      message: 'Too many message requests. Please wait a few minutes before trying again.'
    })
  }

  next()
}

// HTML escape helper to prevent HTML injection in emails
function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'nextchallengesite-unified',
    domain: 'nextchallenge.tech',
    timestamp: new Date().toISOString()
  })
})

// Contact Form Endpoint
app.post('/api/contact', rateLimiter, async (req, res) => {
  const { fullName, email, phone, company, subject, message } = req.body || {}

  // Validation
  if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Full name is required (minimum 2 characters).'
    })
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
    return res.status(400).json({
      success: false,
      message: 'A valid email address is required.'
    })
  }

  if (!subject || typeof subject !== 'string' || subject.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Subject is required.'
    })
  }

  if (!message || typeof message !== 'string' || message.trim().length < 10) {
    return res.status(400).json({
      success: false,
      message: 'Message is required (minimum 10 characters).'
    })
  }

  const rawName = fullName.trim().slice(0, 100)
  const rawEmail = email.trim().slice(0, 120)
  const rawPhone = (phone || 'Not provided').trim().slice(0, 50)
  const rawCompany = (company || 'Not provided').trim().slice(0, 100)
  const rawSubject = subject.trim().slice(0, 150)
  const rawMessage = message.trim().slice(0, 5000)

  // Escaped for HTML email
  const safeName = escapeHtml(rawName)
  const safeEmail = escapeHtml(rawEmail)
  const safePhone = escapeHtml(rawPhone)
  const safeCompany = escapeHtml(rawCompany)
  const safeSubject = escapeHtml(rawSubject)
  const safeMessage = escapeHtml(rawMessage)

  const mailOptions = {
    from: process.env.SMTP_FROM || `"Next Challenge Web" <${process.env.SMTP_USER || 'no-reply@nextchallenge.tech'}>`,
    to: RECEIVER_EMAIL,
    replyTo: rawEmail,
    subject: `[Next Challenge Inquiry] ${rawSubject} — from ${rawName}`,
    text: `New inquiry received from Next Challenge website (https://nextchallenge.tech):

Full Name: ${rawName}
Email: ${rawEmail}
Phone: ${rawPhone}
Company: ${rawCompany}
Subject: ${rawSubject}

Message:
${rawMessage}

---
Delivered to: ${RECEIVER_EMAIL}
Client IP: ${getClientIp(req)}
Timestamp: ${new Date().toISOString()}
`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 620px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 14px; background-color: #ffffff; color: #1e293b;">
        <div style="border-bottom: 2px solid #5b54e8; padding-bottom: 14px; margin-bottom: 20px;">
          <h2 style="margin: 0; color: #5b54e8; font-size: 22px;">Next Challenge — New Website Inquiry</h2>
          <p style="margin: 4px 0 0; color: #64748b; font-size: 13px;">Submitted via <strong>https://nextchallenge.tech</strong></p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 14px; width: 130px;"><strong>Sender Name:</strong></td>
            <td style="padding: 8px 0; color: #0f172a; font-size: 14px; font-weight: 600;">${safeName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 14px;"><strong>Email Address:</strong></td>
            <td style="padding: 8px 0; color: #0f172a; font-size: 14px;"><a href="mailto:${safeEmail}" style="color: #5b54e8; text-decoration: none; font-weight: 600;">${safeEmail}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 14px;"><strong>Phone:</strong></td>
            <td style="padding: 8px 0; color: #0f172a; font-size: 14px;">${safePhone}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 14px;"><strong>Company:</strong></td>
            <td style="padding: 8px 0; color: #0f172a; font-size: 14px;">${safeCompany}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 14px;"><strong>Subject:</strong></td>
            <td style="padding: 8px 0; color: #0f172a; font-size: 14px; font-weight: 600;">${safeSubject}</td>
          </tr>
        </table>

        <div style="background-color: #f8fafc; border-left: 4px solid #5b54e8; padding: 16px; border-radius: 6px; margin-bottom: 24px;">
          <strong style="display: block; margin-bottom: 8px; color: #334155; font-size: 14px;">Project Details / Message:</strong>
          <p style="margin: 0; white-space: pre-line; line-height: 1.6; color: #1e293b; font-size: 14px;">${safeMessage}</p>
        </div>

        <div style="font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 14px;">
          This message was securely submitted on <strong>https://nextchallenge.tech</strong> and forwarded to <strong>${RECEIVER_EMAIL}</strong>.
        </div>
      </div>
    `
  }

  // SMTP Configuration
  const smtpUser = process.env.SMTP_USER || process.env.MAIL_USER
  const smtpPass = process.env.SMTP_PASS || process.env.MAIL_PASS
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com'
  const smtpPort = Number(process.env.SMTP_PORT) || 587
  const smtpSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465
  const hasSmtpConfig = Boolean(smtpUser && smtpPass)

  if (!hasSmtpConfig) {
    console.warn('[Contact API] SMTP credentials not configured (SMTP_USER/SMTP_PASS missing). Email not sent.')
    return res.status(503).json({
      success: false,
      message: 'Email service is currently awaiting SMTP configuration. Please reach us directly at nextchallenge2021@gmail.com or call 0552 56 96 54.'
    })
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    })

    await transporter.sendMail(mailOptions)

    return res.status(200).json({
      success: true,
      message: 'Your message has been delivered to Next Challenge successfully.'
    })
  } catch (err) {
    console.error('[SMTP Delivery Error]', err.message || err)
    return res.status(500).json({
      success: false,
      message: 'Failed to deliver message via mail server. Please contact us directly by phone at 0552 56 96 54 or email nextchallenge2021@gmail.com.'
    })
  }
})

// Serve production static assets from dist
const distPath = path.join(rootDir, 'dist')

// Cache control: Hashed assets cached for 1 year, index.html not cached
app.use(
  express.static(distPath, {
    setHeaders: (res, filePath) => {
      if (filePath.includes('/assets/')) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
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
  console.log(`[Next Challenge Server] Inquiries target: ${RECEIVER_EMAIL}`)
})
