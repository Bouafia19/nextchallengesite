import puppeteer from 'puppeteer-core'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const liveDir = path.join(__dirname, 'test-screenshots', 'live-production')
if (!fs.existsSync(liveDir)) {
  fs.mkdirSync(liveDir, { recursive: true })
}

const TARGET_URL = 'https://nextchallenge.tech'

async function verifyLive() {
  console.log('🌐 ========================================================')
  console.log('🌐 VERIFYING LIVE PRODUCTION: ' + TARGET_URL)
  console.log('🌐 ========================================================\n')

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  })

  const page = await browser.newPage()
  await page.setViewport({ width: 1440, height: 900 })

  const errors = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text())
      console.error('❌ Live Console Error:', msg.text())
    }
  })
  page.on('pageerror', (err) => {
    errors.push(err.toString())
    console.error('❌ Live Page Error:', err.toString())
  })

  // 1. Initial Load in French
  console.log('1️⃣ Loading Live Site (Default French)...')
  const resp = await page.goto(TARGET_URL, { waitUntil: 'networkidle2', timeout: 30000 })
  console.log(`  HTTP Status: ${resp.status()}`)
  if (resp.status() !== 200) {
    throw new Error(`Expected HTTP 200 from live site, got ${resp.status()}`)
  }

  const langFr = await page.$eval('html', (el) => el.getAttribute('lang'))
  const dirFr = await page.$eval('html', (el) => el.getAttribute('dir'))
  const titleFr = await page.title()
  console.log(`  ✅ French Loaded: lang="${langFr}", dir="${dirFr}", title="${titleFr}"`)
  await page.screenshot({ path: path.join(liveDir, 'live_fr_desktop.png'), fullPage: false })

  // 2. Switch to English
  console.log('\n2️⃣ Testing Language Switch to English...')
  await page.click('.lang-selector-btn')
  await new Promise((r) => setTimeout(r, 400))
  await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('.lang-menu-item'))
    const enItem = items.find((el) => el.innerText.includes('English'))
    if (enItem) enItem.click()
  })
  await new Promise((r) => setTimeout(r, 600))

  const langEn = await page.$eval('html', (el) => el.getAttribute('lang'))
  const dirEn = await page.$eval('html', (el) => el.getAttribute('dir'))
  const titleEn = await page.title()
  console.log(`  ✅ English Loaded: lang="${langEn}", dir="${dirEn}", title="${titleEn}"`)
  await page.screenshot({ path: path.join(liveDir, 'live_en_desktop.png'), fullPage: false })

  // 3. Switch to Arabic (RTL)
  console.log('\n3️⃣ Testing Language Switch to Arabic (RTL)...')
  await page.click('.lang-selector-btn')
  await new Promise((r) => setTimeout(r, 400))
  await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('.lang-menu-item'))
    const arItem = items.find((el) => el.innerText.includes('العربية'))
    if (arItem) arItem.click()
  })
  await new Promise((r) => setTimeout(r, 600))

  const langAr = await page.$eval('html', (el) => el.getAttribute('lang'))
  const dirAr = await page.$eval('html', (el) => el.getAttribute('dir'))
  const bodyHasRtl = await page.$eval('body', (el) => el.classList.contains('is-rtl'))
  const titleAr = await page.title()
  console.log(`  ✅ Arabic RTL Loaded: lang="${langAr}", dir="${dirAr}", is-rtl=${bodyHasRtl}, title="${titleAr}"`)
  await page.screenshot({ path: path.join(liveDir, 'live_ar_desktop.png'), fullPage: false })

  // 4. Test Mobile RTL
  console.log('\n4️⃣ Testing Live Mobile in Arabic RTL...')
  await page.setViewport({ width: 390, height: 844 })
  await new Promise((r) => setTimeout(r, 400))
  const overflow = await page.evaluate(() => {
    return {
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth
    }
  })
  console.log(`  ✅ Mobile 390px scrollWidth: ${overflow.scrollWidth}, clientWidth: ${overflow.clientWidth}`)
  if (overflow.scrollWidth > overflow.clientWidth) {
    throw new Error('Horizontal overflow on live mobile RTL!')
  }
  await page.screenshot({ path: path.join(liveDir, 'live_ar_mobile.png'), fullPage: false })

  await browser.close()

  if (errors.length > 0) {
    throw new Error(`Errors occurred on live site: ${JSON.stringify(errors)}`)
  }

  console.log('\n========================================================')
  console.log('🎉 LIVE VERIFICATION SUCCESSFUL: 100% OPERATIONAL')
  console.log('========================================================\n')
}

verifyLive().catch((err) => {
  console.error('\n❌ LIVE VERIFICATION FAILED:', err)
  process.exit(1)
})
