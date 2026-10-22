import puppeteer from 'puppeteer-core'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'
import { spawn } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const screenshotsDir = path.join(__dirname, 'test-screenshots', 'admin')

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true })
}

const TEST_PORT = 5199
const BASE_URL = `http://localhost:${TEST_PORT}`
const ADMIN_KEY = 'nc_admin_secret_2026'

let serverProcess = null

function startServer() {
  return new Promise((resolve, reject) => {
    console.log(`🚀 Launching Next Challenge Express + MongoDB Server on port ${TEST_PORT}...`)
    serverProcess = spawn('node', ['server/server.js'], {
      cwd: __dirname,
      env: {
        ...process.env,
        PORT: String(TEST_PORT),
        ADMIN_API_KEY: ADMIN_KEY,
        NODE_ENV: 'production'
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
      console.error(`   [Server err] ${d.toString().trim()}`)
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

    console.log('\n--- TEST SUITE: Edge Case & Bug Fix Verification ---')

    // 1. Health check
    const healthRes = await fetch(`${BASE_URL}/health`).then((r) => r.json())
    console.log('✔ Health check:', healthRes)
    if (healthRes.database !== 'connected') {
      throw new Error(`Database is not connected! Status: ${healthRes.database}`)
    }

    // 2. Test Invalid Key response format
    const badKeyRes = await fetch(`${BASE_URL}/api/admin/verify`, {
      method: 'POST',
      headers: { 'x-admin-key': 'WRONG_KEY_123' }
    })
    const badKeyData = await badKeyRes.json()
    console.log('✔ Invalid key test:', badKeyRes.status, badKeyData)
    if (badKeyRes.status !== 401 || badKeyData.message !== 'Invalid Admin API Key. Access denied.') {
      throw new Error(`Expected 'Invalid Admin API Key. Access denied.', got ${badKeyData.message}`)
    }

    // 3. Test Quotes in Header (e.g. '"nc_admin_secret_2026"')
    const quotedKeyRes = await fetch(`${BASE_URL}/api/admin/verify`, {
      method: 'POST',
      headers: { 'x-admin-key': `"${ADMIN_KEY}"` }
    })
    const quotedKeyData = await quotedKeyRes.json()
    console.log('✔ Quoted key test:', quotedKeyRes.status, quotedKeyData.success)
    if (!quotedKeyData.success) {
      throw new Error('Failed to normalize quoted key')
    }

    // 4. Test Authorization: Bearer header
    const bearerKeyRes = await fetch(`${BASE_URL}/api/admin/verify`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${ADMIN_KEY}` }
    })
    const bearerKeyData = await bearerKeyRes.json()
    console.log('✔ Bearer token test:', bearerKeyRes.status, bearerKeyData.success)
    if (!bearerKeyData.success) {
      throw new Error('Failed to authenticate via Bearer token')
    }

    // 5. Test x-api-key alternative header
    const xApiKeyRes = await fetch(`${BASE_URL}/api/admin/verify`, {
      method: 'POST',
      headers: { 'x-api-key': ADMIN_KEY }
    })
    const xApiKeyData = await xApiKeyRes.json()
    console.log('✔ x-api-key header test:', xApiKeyRes.status, xApiKeyData.success)
    if (!xApiKeyData.success) {
      throw new Error('Failed to authenticate via x-api-key')
    }

    // 6. Test CORS Preflight OPTIONS
    const corsOptionsRes = await fetch(`${BASE_URL}/api/admin/verify`, {
      method: 'OPTIONS',
      headers: {
        Origin: 'https://nextchallenge.tech',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type, x-admin-key, authorization'
      }
    })
    console.log('✔ CORS Preflight status:', corsOptionsRes.status)
    if (corsOptionsRes.status !== 200 && corsOptionsRes.status !== 204) {
      throw new Error(`CORS Preflight failed with status: ${corsOptionsRes.status}`)
    }

    // 7. Test Submitting and Fetching Contacts
    console.log('\n--- Testing Contact Submission & Fetching ---')
    const contactPayload = {
      fullName: 'Redha Hamidi',
      email: 'redha.h@atlas-tech.dz',
      phone: '0551 22 33 44',
      company: 'Atlas Cloud Systems',
      subject: 'MongoDB Atlas Architecture Audit',
      message: 'Inquiring about modernizing enterprise databases and real-time dashboard systems.'
    }

    const postRes = await fetch(`${BASE_URL}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contactPayload)
    })
    const postData = await postRes.json()
    console.log('✔ POST /api/contact:', postData.success, postData.data?.name)
    if (!postData.success) {
      throw new Error('Failed to save contact submission')
    }

    const getRes = await fetch(`${BASE_URL}/api/admin/contacts`, {
      headers: { 'x-admin-key': ADMIN_KEY }
    })
    const getData = await getRes.json()
    console.log('✔ GET /api/admin/contacts count:', getData.count, 'unreadCount:', getData.unreadCount)
    if (!getData.success || getData.count === 0) {
      throw new Error('Failed to fetch contact submissions')
    }

    console.log('\n--- STEP 2: Puppeteer Browser & Admin UI UI Verification ---')
    const browser = await puppeteer.launch({
      executablePath: '/usr/bin/google-chrome',
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
    })

    const page = await browser.newPage()
    await page.setViewport({ width: 1440, height: 900 })

    console.log('🌐 Opening Admin Portal with auth key: ' + `${BASE_URL}/#admin`)
    await page.goto(`${BASE_URL}/#admin`, { waitUntil: 'networkidle0', timeout: 15000 })

    const hasAdminTopBar = await page.$('.admin-topbar')
    console.log('✔ Admin topbar loaded:', Boolean(hasAdminTopBar))

    const kpiCards = await page.$$('.kpi-card')
    console.log('✔ KPI cards rendered:', kpiCards.length)

    await page.screenshot({ path: path.join(screenshotsDir, '01-admin-dashboard.png') })
    console.log('📸 Captured 01-admin-dashboard.png')

    await browser.close()
    console.log('\n🎉 ALL EDGE CASE & REGRESSION TESTS PASSED!')
  } catch (err) {
    console.error('❌ Test failed:', err)
    process.exitCode = 1
  } finally {
    stopServer()
  }
}

runTests()
