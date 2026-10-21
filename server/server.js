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

// Middleware
app.use(cors())
app.use(express.json({ limit: '1mb' }))

// Basic In-Memory Rate Limiter (5 requests per 10 minutes per IP)
const rateLimitMap = new Map()
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000 // 10 minutes
const MAX_REQUESTS_PER_WINDOW = 5

function rateLimiter(req, res, next) {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown'
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

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'nextchallengesite-api',
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
  if (!email || !emailRegex.test(email.trim())) {
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

  const safeName = fullName.trim()
  const safeEmail = email.trim()
  const safePhone = (phone || 'Not provided').trim()
  const safeCompany = (company || 'Not provided').trim()
  const safeSubject = subject.trim()
  const safeMessage = message.trim()

  const mailOptions = {
    from: process.env.SMTP_FROM || `"Next Challenge Web" <${process.env.SMTP_USER || 'no-reply@nextchallenge.tech'}>`,
    to: RECEIVER_EMAIL,
    replyTo: safeEmail,
    subject: `[Next Challenge Inquiry] ${safeSubject} — from ${safeName}`,
    text: `New message received from Next Challenge Website:

Full Name: ${safeName}
Email: ${safeEmail}
Phone: ${safePhone}
Company: ${safeCompany}
Subject: ${safeSubject}

Message:
${safeMessage}

---
Sent via nextchallenge.tech contact gateway
Timestamp: ${new Date().toISOString()}
`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b;">
        <div style="border-bottom: 2px solid #5b54e8; padding-bottom: 12px; margin-bottom: 20px;">
          <h2 style="margin: 0; color: #5b54e8; font-size: 22px;">Next Challenge — New Website Inquiry</h2>
          <p style="margin: 4px 0 0; color: #64748b; font-size: 13px;">Received via nextchallenge.tech</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 14px; width: 120px;"><strong>Sender Name:</strong></td>
            <td style="padding: 8px 0; color: #0f172a; font-size: 14px;">${safeName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 14px;"><strong>Email:</strong></td>
            <td style="padding: 8px 0; color: #0f172a; font-size: 14px;"><a href="mailto:${safeEmail}" style="color: #5b54e8;">${safeEmail}</a></td>
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
            <td style="padding: 8px 0; color: #0f172a; font-size: 14px;">${safeSubject}</td>
          </tr>
        </table>

        <div style="background-color: #f8fafc; border-left: 4px solid #5b54e8; padding: 16px; border-radius: 4px; margin-bottom: 24px;">
          <strong style="display: block; margin-bottom: 8px; color: #334155; font-size: 14px;">Message:</strong>
          <p style="margin: 0; white-space: pre-line; line-height: 1.6; color: #1e293b; font-size: 14px;">${safeMessage}</p>
        </div>

        <div style="font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 14px;">
          This message was submitted on <strong>https://nextchallenge.tech</strong> and forwarded to <strong>${RECEIVER_EMAIL}</strong>.
        </div>
      </div>
    `
  }

  // Check if SMTP is configured
  const hasSmtpConfig = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS

  if (hasSmtpConfig) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true' || Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      })

      await transporter.sendMail(mailOptions)

      return res.status(200).json({
        success: true,
        message: 'Your message has been delivered to Next Challenge successfully.'
      })
    } catch (err) {
      console.error('[SMTP Error]', err)
      return res.status(500).json({
        success: false,
        message: 'Failed to deliver message via mail server. Please contact us directly by phone or email.'
      })
    }
  } else {
    // Development / Unconfigured SMTP mode: log securely to server console
    console.log('\n========================================')
    console.log('[Next Challenge Website Contact Submission]')
    console.log(`To: ${RECEIVER_EMAIL}`)
    console.log(`From: ${safeName} <${safeEmail}>`)
    console.log(`Phone: ${safePhone}`)
    console.log(`Company: ${safeCompany}`)
    console.log(`Subject: ${safeSubject}`)
    console.log(`Message:\n${safeMessage}`)
    console.log('NOTE: Configure SMTP_HOST, SMTP_USER, SMTP_PASS in .env to send real emails.')
    console.log('========================================\n')

    return res.status(200).json({
      success: true,
      message: 'Your message has been received by Next Challenge.'
    })
  }
})

// Serve production static assets if dist exists
const distPath = path.join(rootDir, 'dist')
app.use(express.static(distPath))

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('Next Challenge API Server running. Run `npm run build` to serve frontend.')
    }
  })
})

app.listen(PORT, () => {
  console.log(`[Next Challenge Server] Running on http://localhost:${PORT}`)
  console.log(`[Next Challenge Server] Inquiries target: ${RECEIVER_EMAIL}`)
})
