import puppeteer from 'puppeteer-core'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'
import crypto from 'node:crypto'
import { spawn } from 'node:child_process'
import dotenv from 'dotenv'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const screenshotsDir = path.join(__dirname, 'test-screenshots', 'analytics')
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true })
}

const TEST_PORT = 5201
const BASE_URL = `http://localhost:${TEST_PORT}`
const ADMIN_KEY = (process.env.ADMIN_API_KEY || `nc_test_analytics_${crypto.randomBytes(8).toString('hex')}`).trim()
const ADMIN_ROUTE = (process.env.ADMIN_ROUTE_PATH || '/administrator-b11905a0faa5adf0a8d6023bdb7b37da').trim()

let serverProcess = null

function startServer() {
  return new Promise((resolve, reject) => {
    console.log(`🚀 Starting test server on port ${TEST_PORT}...`)
    serverProcess = spawn('node', ['server/server.js'], {
      cwd: __dirname,
      env: {
        ...process.env,
        PORT: String(TEST_PORT),
        ADMIN_API_KEY: ADMIN_KEY,
        ADMIN_ROUTE_PATH: ADMIN_ROUTE,
        NODE_ENV: 'test'
      },
      stdio: ['ignore', 'pipe', 'pipe']
    })

    serverProcess.stdout.on('data', (d) => {
      const out = d.toString()
      if (out.includes(`${TEST_PORT}`)) {
        console.log(`   [Server log] ${out.trim()}`)
      }
    })

    serverProcess.stderr.on('data', (d) => {
      const err = d.toString().trim()
      if (err) console.error(`   [Server err] ${err}`)
    })

    serverProcess.on('error', reject)
    setTimeout(resolve, 2000)
  })
}

function stopServer() {
  if (serverProcess) {
    console.log('🛑 Shutting down test server...')
    serverProcess.kill('SIGTERM')
  }
}

async function runTests() {
  try {
    await startServer()

    console.log('\n========================================================')
    console.log('🧪 RUNNING COMPREHENSIVE VISITOR ANALYTICS TEST SUITE')
    console.log('========================================================\n')

    // -----------------------------------------------------------------
    // TEST 1: Visitor Tracking Endpoint (POST /api/analytics/track)
    // -----------------------------------------------------------------
    console.log('1️⃣ Testing Public Visitor Tracking Endpoint...')
    const visitorA = `visitor_test_${crypto.randomUUID()}`
    const sessionA = `session_test_${crypto.randomUUID()}`

    const trackRes = await fetch(`${BASE_URL}/api/analytics/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      body: JSON.stringify({
        visitorId: visitorA,
        sessionId: sessionA,
        path: '/',
        device: 'desktop',
        browser: 'chrome',
        isClientNew: true
      })
    })

    if (!trackRes.ok) {
      throw new Error(`Track endpoint returned status ${trackRes.status}`)
    }
    const trackData = await trackRes.json()
    console.log('   ✔ Initial visit recorded:', trackData.success, 'isUnique:', trackData.isUniqueVisitorToday)
    if (!trackData.success || !trackData.isUniqueVisitorToday) {
      throw new Error('Initial public visit was not recorded as unique visitor today.')
    }

    // -----------------------------------------------------------------
    // TEST 2: Unique Visitor Detection & Same-Day Deduplication
    // -----------------------------------------------------------------
    console.log('\n2️⃣ Testing Unique Visitor Detection & Same-Day Deduplication...')
    const duplicateRes = await fetch(`${BASE_URL}/api/analytics/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      body: JSON.stringify({
        visitorId: visitorA, // SAME visitor
        sessionId: sessionA,
        path: '/products/fleetora',
        device: 'desktop',
        browser: 'chrome',
        isClientNew: false
      })
    })
    const duplicateData = await duplicateRes.json()
    console.log('   ✔ Duplicate same-day visit deduplicated: isUnique =', duplicateData.isUniqueVisitorToday)
    if (duplicateData.isUniqueVisitorToday !== false) {
      throw new Error('Same visitor on same day was incorrectly counted as unique again!')
    }

    // -----------------------------------------------------------------
    // TEST 3: Repeat / Returning Visitor Behavior
    // -----------------------------------------------------------------
    console.log('\n3️⃣ Testing Returning Visitor vs New Visitor Detection...')
    // Distinct visitor B
    const visitorB = `visitor_test_${crypto.randomUUID()}`
    const sessionB = `session_test_${crypto.randomUUID()}`
    const trackResB = await fetch(`${BASE_URL}/api/analytics/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1'
      },
      body: JSON.stringify({
        visitorId: visitorB,
        sessionId: sessionB,
        path: '/courses',
        device: 'mobile',
        browser: 'safari',
        isClientNew: true
      })
    })
    const trackDataB = await trackResB.json()
    console.log('   ✔ New visitor B recorded: isReturning =', trackDataB.isReturningVisitor)
    if (trackDataB.isReturningVisitor !== false) {
      throw new Error('New visitor was incorrectly flagged as returning!')
    }

    // Now simulate visitor C who visited yesterday in DailyVisitor
    const visitorC = `visitor_prior_${crypto.randomUUID()}`
    const sessionC = `session_prior_${crypto.randomUUID()}`

    // Insert prior date entry for visitor C directly into DailyVisitor
    const mongoose = (await import('mongoose')).default
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nextchallenge')
    }
    const DailyVisitor = (await import('./server/models/DailyVisitor.js')).default
    const salt = process.env.ANALYTICS_SALT || ADMIN_KEY || 'nc_analytics_salt_prod_2026'
    const visitorHashC = crypto.createHmac('sha256', salt).update(visitorC).digest('hex')

    const yesterdayDate = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
    await DailyVisitor.create({
      date: yesterdayDate,
      visitorHash: visitorHashC
    })

    // Now visitor C visits today
    const trackResC = await fetch(`${BASE_URL}/api/analytics/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      },
      body: JSON.stringify({
        visitorId: visitorC,
        sessionId: sessionC,
        path: '/products/touriva',
        device: 'desktop',
        browser: 'safari',
        isClientNew: false
      })
    })
    const trackDataC = await trackResC.json()
    console.log('   ✔ Repeat visitor C detected as returning visitor: isReturning =', trackDataC.isReturningVisitor)
    if (trackDataC.isReturningVisitor !== true) {
      throw new Error('Repeat visitor was not identified as returning visitor!')
    }

    // -----------------------------------------------------------------
    // TEST 4: Bot & Crawler Exclusion
    // -----------------------------------------------------------------
    console.log('\n4️⃣ Testing Bot & Crawler Exclusion...')
    const botUserAgents = [
      'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
      'curl/8.5.0',
      'python-requests/2.31.0',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/120.0.0.0 Safari/537.36'
    ]

    for (const botUa of botUserAgents) {
      const botRes = await fetch(`${BASE_URL}/api/analytics/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': botUa
        },
        body: JSON.stringify({
          visitorId: `bot_${crypto.randomUUID()}`,
          sessionId: `bot_session_${crypto.randomUUID()}`,
          path: '/'
        })
      })
      const botData = await botRes.json()
      if (botData.recorded !== false || botData.reason !== 'bot_excluded') {
        throw new Error(`Bot UA "${botUa}" was not excluded! Got: ${JSON.stringify(botData)}`)
      }
    }
    console.log(`   ✔ Verified ${botUserAgents.length} bot user-agents successfully excluded from analytics.`)

    // -----------------------------------------------------------------
    // TEST 5: Admin & Health Check Exclusion
    // -----------------------------------------------------------------
    console.log('\n5️⃣ Testing Admin & Internal Route Exclusion...')
    const adminTrackRes = await fetch(`${BASE_URL}/api/analytics/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0'
      },
      body: JSON.stringify({
        visitorId: `admin_visit_${crypto.randomUUID()}`,
        sessionId: `admin_sess_${crypto.randomUUID()}`,
        path: `${ADMIN_ROUTE}/overview`
      })
    })
    const adminTrackData = await adminTrackRes.json()
    console.log('   ✔ Admin route tracking attempt rejected:', adminTrackData.reason)
    if (adminTrackData.recorded !== false) {
      throw new Error('Admin portal route was not excluded from visitor tracking!')
    }

    // -----------------------------------------------------------------
    // TEST 6: Admin Authentication Security & Unauthorized Rejection
    // -----------------------------------------------------------------
    console.log('\n6️⃣ Testing Admin API Security & Unauthorized Rejection...')
    // Unauthenticated request
    const noAuthRes = await fetch(`${BASE_URL}/api/admin/analytics/visitors`)
    console.log('   ✔ Unauthenticated request status:', noAuthRes.status)
    if (noAuthRes.status !== 401) {
      throw new Error(`Expected HTTP 401 Unauthorized, got ${noAuthRes.status}`)
    }

    // Bad key request
    const badKeyRes = await fetch(`${BASE_URL}/api/admin/analytics/visitors`, {
      headers: { 'x-admin-key': 'nc_invalid_key_attempt' }
    })
    console.log('   ✔ Bad key request status:', badKeyRes.status)
    if (badKeyRes.status !== 401) {
      throw new Error(`Expected HTTP 401 Unauthorized for bad key, got ${badKeyRes.status}`)
    }

    // -----------------------------------------------------------------
    // TEST 7: Authorized Admin Analytics Retrieval (7d, 30d, 90d)
    // -----------------------------------------------------------------
    console.log('\n7️⃣ Testing Authorized Admin Analytics Retrieval & Aggregation...')
    const authHeaders = { 'x-admin-key': ADMIN_KEY }

    // Test 30d range
    const res30d = await fetch(`${BASE_URL}/api/admin/analytics/visitors?range=30d`, { headers: authHeaders })
    if (!res30d.ok) {
      throw new Error(`Admin analytics request failed with status ${res30d.status}`)
    }
    const data30d = await res30d.json()
    console.log('   ✔ 30d analytics retrieved successfully:')
    console.log('     • Activation Date:', data30d.activationDate)
    console.log('     • Total Visitors:', data30d.summary.totalVisitors)
    console.log('     • Today Visitors:', data30d.summary.todayVisitors)
    console.log('     • Today Visits:', data30d.summary.todayVisits)
    console.log('     • Last 7 Days Visitors:', data30d.summary.last7DaysVisitors)
    console.log('     • Last 30 Days Visitors:', data30d.summary.last30DaysVisitors)
    console.log('     • Daily History Length:', data30d.dailyHistory.length, 'days')
    console.log('     • Top Pages:', data30d.topPages)
    console.log('     • Devices:', data30d.devices)
    console.log('     • Browsers:', data30d.browsers)

    if (!data30d.success) throw new Error('data.success is false')
    if (data30d.activationDate !== '2026-10-29') throw new Error(`Expected activation date 2026-10-29, got ${data30d.activationDate}`)
    if (data30d.dailyHistory.length !== 30) throw new Error(`Expected 30 daily history records, got ${data30d.dailyHistory.length}`)
    if (data30d.summary.todayVisitors < 2) throw new Error(`Expected at least 2 today visitors, got ${data30d.summary.todayVisitors}`)

    // Test 7d range
    const res7d = await fetch(`${BASE_URL}/api/admin/analytics/visitors?range=7d`, { headers: authHeaders })
    const data7d = await res7d.json()
    console.log('   ✔ 7d analytics retrieved. History length:', data7d.dailyHistory.length)
    if (data7d.dailyHistory.length !== 7) throw new Error(`Expected 7 days history, got ${data7d.dailyHistory.length}`)

    // Test 90d range
    const res90d = await fetch(`${BASE_URL}/api/admin/analytics/visitors?range=90d`, { headers: authHeaders })
    const data90d = await res90d.json()
    console.log('   ✔ 90d analytics retrieved. History length:', data90d.dailyHistory.length)
    if (data90d.dailyHistory.length !== 90) throw new Error(`Expected 90 days history, got ${data90d.dailyHistory.length}`)

    // -----------------------------------------------------------------
    // TEST 8: Zero PII Guarantee Verification
    // -----------------------------------------------------------------
    console.log('\n8️⃣ Verifying Zero PII & Raw Identifier Leakage...')
    const serialized = JSON.stringify(data30d)
    if (serialized.includes('ip') && serialized.includes('127.0.0.1')) {
      throw new Error('CRITICAL: Raw IP address found in admin analytics response!')
    }
    if (serialized.includes(visitorA) || serialized.includes(visitorB)) {
      throw new Error('CRITICAL: Raw client visitor ID found in admin analytics response!')
    }
    console.log('   ✔ Zero PII or raw visitor identifiers leaked in analytics payload.')

    // -----------------------------------------------------------------
    // TEST 9: Puppeteer Browser & Admin Dashboard Rendering
    // -----------------------------------------------------------------
    console.log('\n9️⃣ Testing Puppeteer Browser Admin Dashboard Rendering...')
    const browser = await puppeteer.launch({
      executablePath: '/usr/bin/google-chrome',
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
    })

    const page = await browser.newPage()
    await page.setViewport({ width: 1440, height: 900 })

    // Set stored admin key before page load
    await page.evaluateOnNewDocument((key) => {
      localStorage.setItem('nc_admin_key', key)
    }, ADMIN_KEY)

    // Navigate to secret admin gate route
    console.log(`   🌐 Accessing protected admin route: ${BASE_URL}${ADMIN_ROUTE}`)
    await page.goto(`${BASE_URL}${ADMIN_ROUTE}`, { waitUntil: 'networkidle0', timeout: 15000 })

    // Wait for admin panel
    await page.waitForSelector('.admin-module-nav', { timeout: 8000 })
    console.log('   ✔ Admin navigation panel loaded.')

    // Find and click the Website Visitors module tab button
    const buttons = await page.$$('.module-tab-btn')
    let visitorsBtn = null
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn)
      if (text.includes('Website Visitors')) {
        visitorsBtn = btn
        break
      }
    }

    if (!visitorsBtn) {
      throw new Error('Website Visitors module tab button not found in Admin navigation!')
    }

    console.log('   🖱 Clicking "Website Visitors" tab...')
    await visitorsBtn.click()
    await new Promise(r => setTimeout(r, 1200)) // Wait for analytics render

    // Verify Prominent KPI Cards
    const kpiCards = await page.$$('.kpi-card--analytics')
    console.log('   ✔ Prominent Analytics KPI cards rendered:', kpiCards.length)
    if (kpiCards.length !== 4) {
      throw new Error(`Expected 4 Analytics KPI cards, found ${kpiCards.length}`)
    }

    // Verify Trend SVG Chart
    const trendSvg = await page.$('.trend-svg')
    console.log('   ✔ Visitor Trend SVG Chart rendered:', Boolean(trendSvg))
    if (!trendSvg) {
      throw new Error('Visitor Trend SVG chart was not rendered on the page!')
    }

    // Verify Activation Notice
    const noticeText = await page.$eval('.activation-notice-strip', el => el.textContent)
    console.log('   ✔ Activation notice displayed:', noticeText.includes('October 29, 2026'))
    if (!noticeText.includes('October 29, 2026')) {
      throw new Error('Activation notice missing date "October 29, 2026"')
    }

    // Capture desktop screenshot
    await page.screenshot({ path: path.join(screenshotsDir, '01-admin-visitors-desktop.png') })
    console.log('   📸 Captured 01-admin-visitors-desktop.png')

    // -----------------------------------------------------------------
    // TEST 10: Tablet and Mobile Responsiveness
    // -----------------------------------------------------------------
    console.log('\n🔟 Testing Tablet and Mobile Responsiveness...')
    // Tablet Viewport
    await page.setViewport({ width: 768, height: 1024 })
    await new Promise(r => setTimeout(r, 400))
    await page.screenshot({ path: path.join(screenshotsDir, '02-admin-visitors-tablet.png') })
    console.log('   📸 Captured 02-admin-visitors-tablet.png (768x1024)')

    // Mobile Viewport
    await page.setViewport({ width: 375, height: 667 })
    await new Promise(r => setTimeout(r, 400))
    await page.screenshot({ path: path.join(screenshotsDir, '03-admin-visitors-mobile.png') })
    console.log('   📸 Captured 03-admin-visitors-mobile.png (375x667)')

    // Check for horizontal overflow on mobile
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)
    console.log(`   ✔ Mobile horizontal overflow check: scrollWidth (${scrollWidth}) <= clientWidth (${clientWidth})`)
    if (scrollWidth > clientWidth) {
      throw new Error(`Horizontal overflow detected on mobile: ${scrollWidth} > ${clientWidth}`)
    }

    await browser.close()

    console.log('\n========================================================')
    console.log('🎉 ALL 12 VISITOR ANALYTICS TEST CRITERIA PASSED 100%!')
    console.log('========================================================\n')
  } catch (err) {
    console.error('❌ Analytics test suite failed:', err)
    process.exitCode = 1
  } finally {
    try {
      const mongoose = (await import('mongoose')).default
      if (mongoose.connection.readyState === 1) {
        await mongoose.disconnect()
      }
    } catch {}
    stopServer()
  }
}

runTests()
