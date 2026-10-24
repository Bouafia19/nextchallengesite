import nodemailer from 'nodemailer'

/**
 * Next Challenge — Contact Inquiry Notification Service
 * Supports SMTP (e.g. Gmail, Mailgun, SendGrid) and optional HTTP Webhook forwarding.
 *
 * Guaranteed Architecture Rule:
 * Email/webhook notification failures NEVER fail database storage or return 500 to the client.
 */

/**
 * Dispatches an inquiry notification email and/or webhook.
 * Safe execution: will never throw an unhandled exception.
 *
 * @param {Object} inquiry - The stored Contact Mongoose document or plain object
 * @returns {Promise<{ delivered: boolean, method?: string, error?: string }>}
 */
export async function sendContactNotification(inquiry) {
  const result = { delivered: false }

  const receiverEmail = process.env.CONTACT_RECEIVER_EMAIL || 'nextchallenge2021@gmail.com'
  const smtpUser = (process.env.SMTP_USER || '').trim()
  const smtpPass = (process.env.SMTP_PASS || '').trim()
  const webhookUrl = (process.env.CONTACT_WEBHOOK_URL || '').trim()

  const inquirySummary = {
    id: String(inquiry._id || inquiry.id || 'N/A'),
    name: inquiry.name || 'Anonymous',
    email: inquiry.email || 'N/A',
    phone: inquiry.phone || 'Not provided',
    company: inquiry.company || 'Not provided',
    subject: inquiry.subject || 'General Inquiry',
    message: inquiry.message || '',
    date: inquiry.date ? new Date(inquiry.date).toISOString() : new Date().toISOString()
  }

  // 1. Attempt SMTP delivery if configured
  if (smtpUser && smtpPass) {
    try {
      const port = Number(process.env.SMTP_PORT) || 465
      const isSecure = process.env.SMTP_SECURE === 'true' || port === 465

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port,
        secure: isSecure,
        auth: {
          user: smtpUser,
          pass: smtpPass
        },
        connectionTimeout: 6000,
        greetingTimeout: 6000,
        socketTimeout: 12000
      })

      const fromAddress = process.env.SMTP_FROM || `"Next Challenge Inquiries" <${smtpUser}>`

      const mailOptions = {
        from: fromAddress,
        to: receiverEmail,
        replyTo: inquirySummary.email,
        subject: `[Next Challenge Inquiry] ${inquirySummary.subject} - from ${inquirySummary.name}`,
        text: `New Contact Submission Received\n\n` +
          `Sender: ${inquirySummary.name}\n` +
          `Email: ${inquirySummary.email}\n` +
          `Phone: ${inquirySummary.phone}\n` +
          `Company: ${inquirySummary.company}\n` +
          `Subject: ${inquirySummary.subject}\n` +
          `Date: ${inquirySummary.date}\n` +
          `ID: ${inquirySummary.id}\n\n` +
          `Message:\n${inquirySummary.message}\n`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
            <div style="border-bottom: 2px solid #5b54e8; padding-bottom: 12px; margin-bottom: 20px;">
              <h2 style="color: #0f172a; margin: 0 0 6px 0;">New Contact Inquiry Received</h2>
              <span style="color: #5b54e8; font-weight: 600; font-size: 14px;">Next Challenge Corporate Platform</span>
            </div>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
              <tr>
                <td style="padding: 8px 0; color: #64748b; width: 120px;"><strong>Name:</strong></td>
                <td style="padding: 8px 0; color: #0f172a;">${escapeHtml(inquirySummary.name)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;"><strong>Email:</strong></td>
                <td style="padding: 8px 0; color: #0f172a;"><a href="mailto:${escapeHtml(inquirySummary.email)}">${escapeHtml(inquirySummary.email)}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;"><strong>Phone:</strong></td>
                <td style="padding: 8px 0; color: #0f172a;">${escapeHtml(inquirySummary.phone)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;"><strong>Company:</strong></td>
                <td style="padding: 8px 0; color: #0f172a;">${escapeHtml(inquirySummary.company)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;"><strong>Subject:</strong></td>
                <td style="padding: 8px 0; color: #0f172a;">${escapeHtml(inquirySummary.subject)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;"><strong>Submission ID:</strong></td>
                <td style="padding: 8px 0; color: #64748b; font-family: monospace;">${inquirySummary.id}</td>
              </tr>
            </table>

            <div style="background: #f8fafc; border-left: 4px solid #5b54e8; padding: 16px; border-radius: 4px; margin-bottom: 20px;">
              <div style="font-weight: 600; color: #334155; margin-bottom: 8px;">Message Content:</div>
              <div style="white-space: pre-wrap; color: #0f172a; line-height: 1.6; font-size: 14px;">${escapeHtml(inquirySummary.message)}</div>
            </div>

            <div style="font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 12px;">
              This notification was generated automatically by nextchallenge.tech backend.
            </div>
          </div>
        `
      }

      await transporter.sendMail(mailOptions)
      console.log(`[Contact Notification] Notification email dispatched successfully to ${receiverEmail}`)
      result.delivered = true
      result.method = 'smtp'
    } catch (err) {
      console.warn('[Contact Notification Warning] SMTP delivery failed:', err.message || err)
      result.error = err.message || 'SMTP delivery failed'
    }
  }

  // 2. Attempt Webhook delivery if configured
  if (webhookUrl) {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'NextChallenge-Notification/1.0'
        },
        body: JSON.stringify({
          event: 'contact.submission',
          source: 'https://nextchallenge.tech',
          inquiry: inquirySummary
        }),
        signal: AbortSignal.timeout(5000)
      })

      if (response.ok) {
        console.log(`[Contact Notification] Webhook notification dispatched successfully`)
        result.delivered = true
        result.method = result.method ? `${result.method}+webhook` : 'webhook'
      } else {
        console.warn(`[Contact Notification Warning] Webhook responded with status: ${response.status}`)
      }
    } catch (err) {
      console.warn('[Contact Notification Warning] Webhook delivery failed:', err.message || err)
      if (!result.error) result.error = err.message || 'Webhook delivery failed'
    }
  }

  // 3. Fallback log if neither is configured
  if (!smtpUser && !webhookUrl) {
    console.log('[Contact Notification] External email/webhook delivery not configured in environment. Inquiry safely stored in database only.')
  }

  return result
}

function escapeHtml(str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export default sendContactNotification
