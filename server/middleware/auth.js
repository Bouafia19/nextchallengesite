import crypto from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

// Ensure env variables are available in auth middleware
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '../..')

dotenv.config()
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.resolve(rootDir, '.env') })
}

/**
 * Clean and normalize API keys (strip quotes, whitespace, carriage returns)
 */
function normalizeKey(str) {
  if (!str || typeof str !== 'string') return ''
  return str.trim().replace(/^["']|["']$/g, '').trim()
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
function secureCompare(a, b) {
  if (!a || !b) return false
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) return false
  return crypto.timingSafeEqual(bufA, bufB)
}

/**
 * Admin Authentication Middleware
 * Secures administrative endpoints against header mismatches, casing differences,
 * and malformed environment variables.
 */
export function requireAdminAuth(req, res, next) {
  const isProduction = process.env.NODE_ENV === 'production'
  const rawConfiguredKey =
    process.env.ADMIN_API_KEY ||
    process.env.ADMIN_KEY ||
    (!isProduction ? 'nc_admin_secret_dev' : '')

  const configuredKey = normalizeKey(rawConfiguredKey)

  if (!configuredKey) {
    console.error('[Admin Auth Error] ADMIN_API_KEY is not configured in server environment.')
    return res.status(500).json({
      success: false,
      message: 'Server security configuration error. ADMIN_API_KEY is not configured.'
    })
  }

  // Extract key across all possible header casings and conventions
  let rawProvidedKey =
    req.headers['x-admin-key'] ||
    req.headers['x-api-key'] ||
    req.headers['admin-api-key'] ||
    req.headers['admin_api_key']

  // Check Authorization header (Bearer <key>, ApiKey <key>, or raw key)
  if (!rawProvidedKey && req.headers.authorization) {
    const authHeader = req.headers.authorization.trim()
    const parts = authHeader.split(/\s+/)
    if (parts.length === 2 && /^(Bearer|ApiKey|Token)$/i.test(parts[0])) {
      rawProvidedKey = parts[1]
    } else if (parts.length === 1 && !authHeader.toLowerCase().startsWith('bearer')) {
      rawProvidedKey = parts[0]
    }
  }

  // In non-production environments only, allow query parameters for testing/debugging.
  // In production, query parameter authentication is prohibited to prevent credential leakage in URLs, access logs, and referer headers.
  if (!rawProvidedKey && !isProduction && req.query) {
    rawProvidedKey = req.query.apiKey || req.query.key || req.query.adminKey
  }

  // Check JSON request body if present
  if (!rawProvidedKey && req.body && typeof req.body === 'object') {
    rawProvidedKey = req.body.apiKey || req.body.adminKey || req.body.key
  }

  const providedKey = normalizeKey(rawProvidedKey)

  if (!providedKey || !secureCompare(providedKey, configuredKey)) {
    return res.status(401).json({
      success: false,
      message: 'Invalid Admin API Key. Access denied.'
    })
  }

  next()
}
