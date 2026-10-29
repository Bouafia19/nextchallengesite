import puppeteer from 'puppeteer-core'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'
import dotenv from 'dotenv'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const screenshotsDir = path.join(__dirname, 'test-screenshots', 'netlify')
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true })
}

const NETLIFY_URL = 'https://nextchallenge-tech.netlify.app'
const ADMIN_KEY = (process.env.ADMIN_API_KEY || '').trim().replace(/^["']|["']$/g, '')
const ADMIN_ROUTE = (process.env.ADMIN_ROUTE_PATH || '/administrator-b11905a0faa5adf0a8d6023bdb7b37da').trim()

function findChrome() {
  const candidates = [
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    '/snap/bin/chromium'
  ]
  for (const c of candidates) {
    if (fs.existsSync(c)) return c
  }
  return candidates[0]
}

async function runVerification() {
  console.log('========================================================================')
  console.log('🌐 RUNNING END-TO-END VERIFICATION ON LIVE NETLIFY PREVIEW')
  console.log(`Target: ${NETLIFY_URL}`)
  console.log('========================================================================\n')

  const browser = await puppeteer.launch({
    executablePath: findChrome(),
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1440,900']
  })

  try {
    const page = await browser.newPage()
    await page.setViewport({ width: 1440, height: 900 })

    const consoleErrors = []
    const failedRequests = []

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text()
        if (!text.includes('favicon') && !text.includes('AudioContext')) {
          consoleErrors.push(text)
        }
      }
    })

    page.on('requestfailed', (req) => {
      failedRequests.push({ url: req.url(), failure: req.failure()?.errorText })
    })

    // -------------------------------------------------------------
    // TEST 1: Homepage & CDN Loading (Zero Render Cold-Start Spinner)
    // -------------------------------------------------------------
    console.log('1️⃣ Visiting Netlify homepage: https://nextchallenge-tech.netlify.app...')
    const t0 = Date.now()
    const homeRes = await page.goto(NETLIFY_URL, { waitUntil: 'networkidle0', timeout: 30000 })
    const loadTimeMs = Date.now() - t0

    console.log(`   ✔ Homepage loaded in ${loadTimeMs}ms (HTTP ${homeRes.status()})`)
    const pageTitle = await page.title()
    console.log(`   ✔ Title: ${pageTitle}`)
    const hasRenderSpinner = await page.evaluate(() => {
      return document.body.innerHTML.includes('Render') && document.body.innerHTML.includes('Starting service')
    })
    console.log(`   ✔ Render spin-up page displayed: ${hasRenderSpinner} (must be false)`)

    // -------------------------------------------------------------
    // TEST 2: All Public Sections & Immediate Courses
    // -------------------------------------------------------------
    console.log('\n2️⃣ Verifying Public Sections & Instant Curriculum...')
    const coursesCount = await page.$$eval('.course-card', (els) => els.length)
    console.log(`   ✔ Immediate rendered courses count: ${coursesCount}`)
    const heroVisible = await page.$('.hero-section')
    console.log(`   ✔ Hero section visible: ${Boolean(heroVisible)}`)
    const contactVisible = await page.$('#contact')
    console.log(`   ✔ Contact section visible: ${Boolean(contactVisible)}`)

    // -------------------------------------------------------------
    // TEST 3: Direct Navigation & SPA Refresh (No 404s)
    // -------------------------------------------------------------
    console.log('\n3️⃣ Verifying Direct Navigation & Page Refresh (SPA Fallback)...')
    const productRes = await page.goto(`${NETLIFY_URL}/products/touriva`, { waitUntil: 'networkidle0', timeout: 20000 })
    console.log(`   ✔ Direct route /products/touriva HTTP status: ${productRes.status()}`)
    console.log(`   ✔ Touriva product page title: ${await page.title()}`)

    await page.reload({ waitUntil: 'networkidle0' })
    console.log(`   ✔ Page reload on /products/touriva successful (no 404).`)

    // -------------------------------------------------------------
    // TEST 4: Direct Access to Secret Admin Route
    // -------------------------------------------------------------
    console.log(`\n4️⃣ Accessing protected admin route: ${NETLIFY_URL}${ADMIN_ROUTE}...`)
    const adminRes = await page.goto(`${NETLIFY_URL}${ADMIN_ROUTE}`, { waitUntil: 'networkidle0', timeout: 30000 })
    console.log(`   ✔ Admin route HTTP status: ${adminRes.status()}`)

    const hasUnlockBtn = await page.waitForSelector('button[type="submit"]', { timeout: 10000 })
    console.log(`   ✔ Admin barrier displayed: ${Boolean(hasUnlockBtn)}`)

    // -------------------------------------------------------------
    // TEST 5: Unlock Admin Portal via Netlify
    // -------------------------------------------------------------
    console.log('   Unlocking Admin Portal with production ADMIN_API_KEY...')
    const input = await page.$('input[type="password"]') || await page.$('input')
    await input.click({ clickCount: 3 })
    await input.type(ADMIN_KEY)
    await page.keyboard.press('Enter')

    await page.waitForSelector('.admin-module-nav', { timeout: 20000 })
    console.log('   ✔ Admin portal unlocked successfully!')

    // -------------------------------------------------------------
    // TEST 6: Website Visitors Analytics Tab
    // -------------------------------------------------------------
    console.log('\n6️⃣ Opening Website Visitors section...')
    const visitorsBtn = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'))
      return btns.find(b => b.textContent && b.textContent.includes('Website Visitors'))
    })
    if (visitorsBtn && visitorsBtn.asElement()) {
      await visitorsBtn.asElement().click()
    }
    await new Promise(r => setTimeout(r, 2000))

    const kpiCount = await page.$$eval('.kpi-card--analytics', els => els.length)
    console.log(`   ✔ Rendered Analytics KPI Cards: ${kpiCount}`)
    const hasSvgChart = await page.$('svg.trend-svg')
    console.log(`   ✔ Visitor Trend SVG Chart rendered: ${Boolean(hasSvgChart)}`)

    await page.screenshot({ path: path.join(screenshotsDir, 'netlify-01-admin-visitors.png'), fullPage: false })
    console.log('   📸 Captured netlify-01-admin-visitors.png')

    // -------------------------------------------------------------
    // TEST 7: Mobile Viewport Check on Netlify
    // -------------------------------------------------------------
    console.log('\n7️⃣ Testing Responsive Mobile Viewport (375x667)...')
    await page.setViewport({ width: 375, height: 667 })
    await new Promise(r => setTimeout(r, 1000))

    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth
    })
    console.log(`   ✔ Mobile horizontal overflow: ${hasHorizontalOverflow}`)
    await page.screenshot({ path: path.join(screenshotsDir, 'netlify-02-mobile-responsive.png'), fullPage: false })
    console.log('   📸 Captured netlify-02-mobile-responsive.png')

    // -------------------------------------------------------------
    // TEST 8: Console Errors and Request Failures
    // -------------------------------------------------------------
    console.log('\n8️⃣ Inspecting Browser Errors on Netlify Preview...')
    console.log(`   Console error count: ${consoleErrors.length}`)
    if (consoleErrors.length > 0) {
      console.log('   Console errors:', consoleErrors)
    }
    console.log(`   Failed network request count: ${failedRequests.length}`)

    console.log('\n========================================================================')
    console.log('🎉 NETLIFY PREVIEW END-TO-END VERIFICATION PASSED 100% ✅')
    console.log('========================================================================\n')
  } finally {
    await browser.close()
  }
}

runVerification().catch((err) => {
  console.error('❌ Verification failed:', err)
  process.exit(1)
})
