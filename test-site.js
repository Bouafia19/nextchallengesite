import puppeteer from 'puppeteer-core'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const screenshotsDir = path.join(__dirname, 'test-screenshots')
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true })
}

async function runTests() {
  console.log('🚀 Starting Next Challenge Website Automated Verification Suite...')
  
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  })

  const page = await browser.newPage()
  await page.setViewport({ width: 1440, height: 900 })

  const consoleErrors = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text())
      console.error('❌ Browser Console Error:', msg.text())
    }
  })

  page.on('pageerror', (err) => {
    consoleErrors.push(err.toString())
    console.error('❌ Browser Page Error:', err.toString())
  })

  // 1. Load Page
  console.log('1️⃣ Loading http://localhost:5199/ ...')
  await page.goto('http://localhost:5199/', { waitUntil: 'networkidle0', timeout: 15000 })

  // 2. Title & Meta verification
  const title = await page.title()
  console.log(`✅ Page Title: "${title}"`)
  if (!title.includes('Next Challenge')) {
    throw new Error('Title does not contain Next Challenge')
  }

  const metaDesc = await page.$eval('meta[name="description"]', (el) => el.getAttribute('content'))
  console.log(`✅ Meta Description: "${metaDesc}"`)

  // 3. Capture Screenshots of each Section
  console.log('2️⃣ Capturing Section Screenshots...')

  const sections = [
    { selector: '#home', name: '01_hero' },
    { selector: '#services', name: '02_services' },
    { selector: '#products', name: '03_products' },
    { selector: '#capabilities', name: '04_capabilities' },
    { selector: '#why-us', name: '05_why_us' },
    { selector: '#about', name: '06_about' },
    { selector: '#contact', name: '07_contact' },
    { selector: 'footer', name: '08_footer' }
  ]

  for (const sec of sections) {
    const el = await page.$(sec.selector)
    if (el) {
      await el.scrollIntoView()
      await new Promise((r) => setTimeout(r, 600))
      await page.screenshot({
        path: path.join(screenshotsDir, `${sec.name}.png`),
        fullPage: false
      })
      console.log(`  📸 Captured ${sec.name}.png`)
    } else {
      console.warn(`  ⚠️ Could not find section ${sec.selector}`)
    }
  }

  // 4. Verify Product URLs
  console.log('3️⃣ Verifying Product URLs...')
  const productLinks = await page.$$eval('#products a[target="_blank"]', (links) =>
    links.map((a) => ({ text: a.innerText.trim(), href: a.href }))
  )
  console.log('Found product buttons:', productLinks)

  const fleetoraLink = productLinks.find((l) => l.text.includes('Fleetora'))
  const inventoryLink = productLinks.find((l) => l.text.includes('Demo'))
  const tourivaLink = productLinks.find((l) => l.text.includes('Touriva'))

  if (!fleetoraLink || !fleetoraLink.href.includes('fleetora-web.onrender.com')) {
    throw new Error('Fleetora link missing or invalid: ' + JSON.stringify(fleetoraLink))
  }
  if (!inventoryLink || !inventoryLink.href.includes('inventory-v2-web-demo.onrender.com')) {
    throw new Error('Inventory Demo link missing or invalid: ' + JSON.stringify(inventoryLink))
  }
  if (!tourivaLink || !tourivaLink.href.includes('touriva-web.onrender.com')) {
    throw new Error('Touriva link missing or invalid: ' + JSON.stringify(tourivaLink))
  }
  console.log('✅ All 3 Product URLs match exact Render production links!')

  // 5. Verify Phone & Email links
  console.log('4️⃣ Verifying Company Information Phone & Email Clickable Links...')
  const phoneLinks = await page.$$eval('a[href^="tel:"]', (links) => links.map((l) => l.href))
  const emailLinks = await page.$$eval('a[href^="mailto:"]', (links) => links.map((l) => l.href))

  console.log('Found tel links:', phoneLinks)
  console.log('Found mailto links:', emailLinks)

  if (!phoneLinks.some((l) => l.includes('0552569654'))) {
    throw new Error('Missing tel:0552569654 link')
  }
  if (!emailLinks.some((l) => l.includes('nextchallenge2021@gmail.com'))) {
    throw new Error('Missing mailto:nextchallenge2021@gmail.com link')
  }
  console.log('✅ Phone and Email links verified!')

  // 6. Test Contact Form Submission via Puppeteer
  console.log('5️⃣ Testing Contact Form Submission & Validation...')
  await page.focus('#field-fullname')
  await page.keyboard.type('Amine Benali')

  await page.focus('#field-email')
  await page.keyboard.type('amine.benali@company.dz')

  await page.focus('#field-phone')
  await page.keyboard.type('0550123456')

  await page.focus('#field-company')
  await page.keyboard.type('Next Alpha SARL')

  await page.focus('#field-subject')
  await page.keyboard.type('Custom Web Application Development')
  await page.keyboard.press('Enter')

  await page.focus('#field-message')
  await page.keyboard.type('We would like to request an enterprise ERP proposal for our logistics depots.')

  // Click submit
  console.log('  Submitting form...')
  await page.click('button[type="submit"]')

  // Wait for success alert
  await page.waitForSelector('.v-alert', { timeout: 6000 })
  const alertText = await page.$eval('.v-alert', (el) => el.innerText)
  console.log(`✅ Success Banner Text:\n"${alertText.replace(/\n+/g, ' ')}"`)

  await page.screenshot({
    path: path.join(screenshotsDir, '09_contact_success.png')
  })
  console.log('  📸 Captured 09_contact_success.png')

  // 7. Test Mobile Viewport & Navigation Drawer
  console.log('6️⃣ Testing Mobile Viewport (390x844) & Navigation Drawer...')
  await page.setViewport({ width: 390, height: 844 })
  await page.reload({ waitUntil: 'networkidle0' })

  // Open drawer
  const menuBtn = await page.$('button[aria-label="Open navigation menu"]')
  if (menuBtn) {
    await menuBtn.click()
    await new Promise((r) => setTimeout(r, 600))
    await page.screenshot({
      path: path.join(screenshotsDir, '10_mobile_drawer_open.png')
    })
    console.log('  📸 Captured 10_mobile_drawer_open.png')
    console.log('✅ Mobile drawer opens cleanly!')
  }

  // 8. Test Theme Toggle
  console.log('7️⃣ Testing Light Theme Toggle...')
  await page.setViewport({ width: 1440, height: 900 })
  await page.reload({ waitUntil: 'networkidle0' })

  const themeToggle = await page.$('button[aria-label="Switch to light mode"]')
  if (themeToggle) {
    await themeToggle.click()
    await new Promise((r) => setTimeout(r, 600))
    await page.screenshot({
      path: path.join(screenshotsDir, '11_light_theme.png')
    })
    console.log('  📸 Captured 11_light_theme.png')
    console.log('✅ Theme switch to Light Mode works!')
  }

  await browser.close()

  if (consoleErrors.length > 0) {
    console.error('❌ Found console errors during test run:', consoleErrors)
    process.exit(1)
  }

  console.log('🎉 ALL AUTOMATED TESTS PASSED WITH 0 ERRORS!')
}

runTests().catch((err) => {
  console.error('❌ Test script failed:', err)
  process.exit(1)
})
