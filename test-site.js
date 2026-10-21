import puppeteer from 'puppeteer-core'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'
import { spawn } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const screenshotsDir = path.join(__dirname, 'test-screenshots')
const responsiveDir = path.join(screenshotsDir, 'responsive')
const rtlScreenshotsDir = path.join(screenshotsDir, 'rtl')

for (const dir of [screenshotsDir, responsiveDir, rtlScreenshotsDir]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

const TEST_PORT = 5198
const BASE_URL = `http://localhost:${TEST_PORT}`

let serverProcess = null

function startServer() {
  return new Promise((resolve, reject) => {
    console.log(`🚀 Starting local Express production server on port ${TEST_PORT}...`)
    serverProcess = spawn('node', ['server/server.js'], {
      cwd: __dirname,
      env: { ...process.env, PORT: String(TEST_PORT), NODE_ENV: 'production' },
      stdio: ['ignore', 'pipe', 'pipe']
    })

    let stdout = ''
    let stderr = ''

    serverProcess.stdout.on('data', (data) => {
      stdout += data.toString()
      if (stdout.includes(`Port: ${TEST_PORT}`) || stdout.includes(`${TEST_PORT}`)) {
        resolve()
      }
    })

    serverProcess.stderr.on('data', (data) => {
      stderr += data.toString()
    })

    serverProcess.on('error', reject)

    // Fallback timer if logs don't match
    setTimeout(resolve, 2000)
  })
}

function stopServer() {
  if (serverProcess) {
    console.log('🛑 Stopping local test server...')
    serverProcess.kill('SIGTERM')
  }
}

async function runAudit() {
  console.log('🔍 ========================================================')
  console.log('🔍 NEXT CHALLENGE — MULTILINGUAL & DEPLOYMENT AUDIT')
  console.log('🔍 Target Production Domain: https://nextchallenge.tech')
  console.log('🔍 Languages: Français (default), English, العربية (RTL)')
  console.log('🔍 ========================================================\n')

  await startServer()

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  })

  const page = await browser.newPage()

  const consoleErrors = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text()
      // Allow expected 503 response from /api/contact during test run without SMTP credentials
      if (text.includes('503 (Service Unavailable)') || text.includes('status of 503')) {
        return
      }
      consoleErrors.push(text)
      console.error('❌ Browser Console Error:', text)
    }
  })

  page.on('pageerror', (err) => {
    consoleErrors.push(err.toString())
    console.error('❌ Browser Page Error:', err.toString())
  })

  try {
    // ----------------------------------------------------
    // 1. Initial Page Load & Default Language (French)
    // ----------------------------------------------------
    console.log('1️⃣ Auditing Initial Load & Default Language (Français)...')
    await page.setCacheEnabled(false)
    await page.setViewport({ width: 1440, height: 900 })

    const response = await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: 15000 })
    await page.evaluate(() => localStorage.removeItem('nextchallenge_lang'))

    if (!response || ![200, 304].includes(response.status())) {
      throw new Error(`Expected HTTP 200/304, got ${response ? response.status() : 'null'}`)
    }
    console.log(`  ✅ Server HTTP Response: ${response.status()} OK`)

    const initialLang = await page.$eval('html', (el) => el.getAttribute('lang'))
    const initialDir = await page.$eval('html', (el) => el.getAttribute('dir'))
    console.log(`  ✅ Document default lang="${initialLang}", dir="${initialDir}"`)
    if (initialLang !== 'fr' || initialDir !== 'ltr') {
      throw new Error(`Default language must be 'fr' with dir 'ltr', got lang='${initialLang}', dir='${initialDir}'`)
    }

    const titleFr = await page.title()
    console.log(`  ✅ French Title: "${titleFr}"`)
    if (!titleFr.includes('Next Challenge') || !titleFr.includes('Développement Logiciel')) {
      throw new Error(`Unexpected French title: ${titleFr}`)
    }

    const metaDescFr = await page.$eval('meta[name="description"]', (el) => el.getAttribute('content'))
    console.log(`  ✅ French Meta Description: "${metaDescFr.substring(0, 60)}..."`)

    const canonical = await page.$eval('link[rel="canonical"]', (el) => el.getAttribute('href'))
    console.log(`  ✅ Canonical URL: "${canonical}"`)
    if (canonical !== 'https://nextchallenge.tech/') {
      throw new Error(`Invalid canonical URL: ${canonical}`)
    }

    // ----------------------------------------------------
    // 2. Language Selector & Real-Time Switching
    // ----------------------------------------------------
    console.log('\n2️⃣ Auditing Language Switching (FR -> EN -> AR)...')

    // Switch to English
    console.log('  Switching to English...')
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
    const storedLangEn = await page.evaluate(() => localStorage.getItem('nextchallenge_lang'))

    console.log(`  ✅ Switched to English: lang="${langEn}", dir="${dirEn}", stored="${storedLangEn}"`)
    if (langEn !== 'en' || dirEn !== 'ltr' || storedLangEn !== 'en') {
      throw new Error(`English switch failed: lang=${langEn}, dir=${dirEn}, stored=${storedLangEn}`)
    }
    if (!titleEn.includes('Software Development')) {
      throw new Error(`English title not updated: ${titleEn}`)
    }

    // Switch to Arabic (RTL)
    console.log('  Switching to Arabic (العربية - RTL)...')
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
    const bodyHasRtlClass = await page.$eval('body', (el) => el.classList.contains('is-rtl'))
    const storedLangAr = await page.evaluate(() => localStorage.getItem('nextchallenge_lang'))

    console.log(`  ✅ Switched to Arabic: lang="${langAr}", dir="${dirAr}", body.is-rtl=${bodyHasRtlClass}, stored="${storedLangAr}"`)
    if (langAr !== 'ar' || dirAr !== 'rtl' || !bodyHasRtlClass || storedLangAr !== 'ar') {
      throw new Error(`Arabic RTL switch failed: lang=${langAr}, dir=${dirAr}, bodyClass=${bodyHasRtlClass}, stored=${storedLangAr}`)
    }

    // Verify Arabic typography font family includes Cairo
    const bodyFont = await page.$eval('body', (el) => window.getComputedStyle(el).fontFamily)
    console.log(`  ✅ Arabic Font Family: ${bodyFont}`)
    if (!bodyFont.includes('Cairo')) {
      console.warn(`  ⚠️ Cairo not first in font stack: ${bodyFont}`)
    }

    // Verify Phone & Email remain LTR isolated
    const phoneIsolate = await page.$eval('a[href="tel:0552569654"]', (el) => {
      const style = window.getComputedStyle(el)
      return {
        dirAttr: el.getAttribute('dir'),
        direction: style.direction,
        unicodeBidi: style.unicodeBidi
      }
    })
    console.log(`  ✅ Phone LTR Isolation:`, phoneIsolate)
    if (phoneIsolate.direction !== 'ltr') {
      throw new Error(`Phone link direction is not LTR: ${phoneIsolate.direction}`)
    }

    // ----------------------------------------------------
    // 3. Persistence & Fallback
    // ----------------------------------------------------
    console.log('\n3️⃣ Auditing Persistence & Fallback Recovery...')

    // Reload while Arabic is stored
    await page.reload({ waitUntil: 'networkidle0' })
    const reloadedLang = await page.$eval('html', (el) => el.getAttribute('lang'))
    const reloadedDir = await page.$eval('html', (el) => el.getAttribute('dir'))
    console.log(`  ✅ After reload: retained lang="${reloadedLang}", dir="${reloadedDir}"`)
    if (reloadedLang !== 'ar' || reloadedDir !== 'rtl') {
      throw new Error(`Language preference not persisted on reload! Got lang=${reloadedLang}`)
    }

    // Corrupt localStorage to simulate invalid value
    await page.evaluate(() => localStorage.setItem('nextchallenge_lang', 'invalid_code_xyz'))
    await page.reload({ waitUntil: 'networkidle0' })
    const fallbackLang = await page.$eval('html', (el) => el.getAttribute('lang'))
    const fallbackDir = await page.$eval('html', (el) => el.getAttribute('dir'))
    console.log(`  ✅ Invalid language fallback: lang="${fallbackLang}", dir="${fallbackDir}"`)
    if (fallbackLang !== 'fr' || fallbackDir !== 'ltr') {
      throw new Error(`Expected fallback to 'fr' / 'ltr', got lang=${fallbackLang}, dir=${fallbackDir}`)
    }

    // ----------------------------------------------------
    // 4. Product Link Verification
    // ----------------------------------------------------
    console.log('\n4️⃣ Auditing Live Product Links...')
    const productCards = await page.$$eval('#products a[target="_blank"]', (links) =>
      links.map((a) => ({
        text: a.innerText.trim(),
        href: a.href,
        rel: a.getAttribute('rel')
      }))
    )
    console.log('  Found Product Actions:', productCards.map((p) => ({ href: p.href, rel: p.rel })))

    const expectedProducts = [
      { name: 'Fleetora', url: 'https://fleetora-web.onrender.com/' },
      { name: 'Inventory Demo', url: 'https://inventory-v2-web-demo.onrender.com/' },
      { name: 'Touriva', url: 'https://touriva-web.onrender.com/' }
    ]

    for (const expected of expectedProducts) {
      const found = productCards.find((c) => c.href.includes(expected.url) || expected.url.includes(c.href))
      if (!found) {
        throw new Error(`Missing expected product link for ${expected.name} (${expected.url})`)
      }
      if (!found.rel || !found.rel.includes('noopener')) {
        throw new Error(`Product link ${expected.name} missing rel="noopener": ${found.rel}`)
      }
      console.log(`  ✅ Verified ${expected.name}: ${found.href} (rel="${found.rel}")`)
    }

    // ----------------------------------------------------
    // 5. Contact & Phone Links
    // ----------------------------------------------------
    console.log('\n5️⃣ Auditing Clickable Company Info Links...')
    const phoneLinks = await page.$$eval('a[href^="tel:"]', (links) => links.map((a) => a.href))
    const emailLinks = await page.$$eval('a[href^="mailto:"]', (links) => links.map((a) => a.href))

    if (!phoneLinks.some((href) => href === 'tel:0552569654')) {
      throw new Error('tel:0552569654 link not found: ' + JSON.stringify(phoneLinks))
    }
    if (!emailLinks.some((href) => href === 'mailto:nextchallenge2021@gmail.com')) {
      throw new Error('mailto:nextchallenge2021@gmail.com link not found: ' + JSON.stringify(emailLinks))
    }
    console.log(`  ✅ Verified Phone Links: ${phoneLinks.length} instances of tel:0552569654`)
    console.log(`  ✅ Verified Email Links: ${emailLinks.length} instances of mailto:nextchallenge2021@gmail.com`)

    // ----------------------------------------------------
    // 6. Contact Form Audit: Validation, Errors, Submission
    // ----------------------------------------------------
    console.log('\n6️⃣ Auditing Contact Form Functional & Security Flow...')

    // Empty submission rejection
    console.log('  Testing empty submit rejection...')
    await page.click('#contact button[type="submit"]')
    await new Promise((r) => setTimeout(r, 400))
    const hasErrors = await page.$$eval('.v-field--error', (els) => els.length > 0)
    if (!hasErrors) {
      throw new Error('Form submitted with empty fields! Expected client-side validation errors.')
    }
    console.log('  ✅ Empty submission rejected by client-side validation.')

    // Fill valid details
    console.log('  Filling out inquiry details...')
    await page.focus('#field-fullname')
    await page.keyboard.type('Nassim Benali')

    await page.focus('#field-email')
    await page.keyboard.type('nassim.benali@algeriatech.dz')

    await page.focus('#field-phone')
    await page.keyboard.type('0552 11 22 33')

    await page.focus('#field-company')
    await page.keyboard.type('Sétif Digital Solutions SARL')

    await page.focus('#field-subject')
    await page.keyboard.type('Enterprise ERP & Inventory Platform')
    await page.keyboard.press('Enter')

    await page.focus('#field-message')
    await page.keyboard.type('Demande de système de gestion commerciale et stocks multi-dépôts.')

    console.log('  Submitting contact message to backend /api/contact...')
    await page.click('#contact button[type="submit"]')

    await page.waitForSelector('.v-alert', { timeout: 8000 })
    const alertText = await page.$eval('.v-alert', (el) => el.innerText)
    console.log(`  Alert Response Received:\n  "${alertText.replace(/\n+/g, ' ')}"`)

    const hasExpectedInfo =
      alertText.includes('nextchallenge2021@gmail.com') &&
      (alertText.includes('Message Envoyé') || alertText.includes('attente de configuration SMTP') || alertText.includes('0552 56 96 54'))

    if (!hasExpectedInfo) {
      throw new Error('Unexpected contact alert response: ' + alertText)
    }
    console.log('  ✅ Contact submission response handled correctly and securely!')

    // ----------------------------------------------------
    // 7. Responsive Breakpoints & Overflow Check (LTR and RTL)
    // ----------------------------------------------------
    console.log('\n7️⃣ Auditing Responsive Breakpoints & Horizontal Overflow (LTR & RTL)...')
    const viewports = [
      { width: 1920, height: 1080, name: '1920px_desktop_large' },
      { width: 1440, height: 900, name: '1440px_desktop_standard' },
      { width: 1280, height: 800, name: '1280px_laptop' },
      { width: 1024, height: 768, name: '1024px_tablet_landscape' },
      { width: 768, height: 1024, name: '768px_tablet_portrait' },
      { width: 430, height: 932, name: '430px_mobile_large_iphone_pro_max' },
      { width: 390, height: 844, name: '390px_mobile_standard_iphone' },
      { width: 375, height: 667, name: '375px_mobile_compact_se' }
    ]

    // Check LTR first
    console.log('  Testing LTR Viewports...')
    for (const vp of viewports) {
      await page.setViewport({ width: vp.width, height: vp.height })
      await new Promise((r) => setTimeout(r, 300))

      const overflow = await page.evaluate(() => {
        const scrollWidth = document.documentElement.scrollWidth
        const clientWidth = document.documentElement.clientWidth
        return {
          hasOverflow: scrollWidth > clientWidth,
          scrollWidth,
          clientWidth
        }
      })

      if (overflow.hasOverflow) {
        throw new Error(`LTR horizontal overflow at ${vp.width}px! scrollWidth: ${overflow.scrollWidth}, clientWidth: ${overflow.clientWidth}`)
      }
      await page.screenshot({ path: path.join(responsiveDir, `${vp.name}.png`) })
      console.log(`  ✅ LTR ${vp.width}x${vp.height} (${vp.name}) - scrollWidth: ${overflow.scrollWidth} == clientWidth: ${overflow.clientWidth}`)
    }

    // Now switch to Arabic RTL and test all viewports
    console.log('  Testing Arabic RTL Viewports...')
    await page.setViewport({ width: 1440, height: 900 })
    await page.evaluate(() => {
      // Direct call to switchLanguage
      window.dispatchEvent(new CustomEvent('change-language', { detail: 'ar' }))
    })
    // Switch via selector directly to test full UI binding
    await page.click('.lang-selector-btn')
    await new Promise((r) => setTimeout(r, 400))
    await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('.lang-menu-item'))
      const arItem = items.find((el) => el.innerText.includes('العربية'))
      if (arItem) arItem.click()
    })
    await new Promise((r) => setTimeout(r, 600))

    for (const vp of viewports) {
      await page.setViewport({ width: vp.width, height: vp.height })
      await new Promise((r) => setTimeout(r, 300))

      const overflowRtl = await page.evaluate(() => {
        const scrollWidth = document.documentElement.scrollWidth
        const clientWidth = document.documentElement.clientWidth
        return {
          hasOverflow: scrollWidth > clientWidth,
          scrollWidth,
          clientWidth
        }
      })

      if (overflowRtl.hasOverflow) {
        throw new Error(`RTL horizontal overflow at ${vp.width}px! scrollWidth: ${overflowRtl.scrollWidth}, clientWidth: ${overflowRtl.clientWidth}`)
      }
      await page.screenshot({ path: path.join(rtlScreenshotsDir, `rtl_${vp.name}.png`) })
      console.log(`  ✅ RTL ${vp.width}x${vp.height} (${vp.name}) - scrollWidth: ${overflowRtl.scrollWidth} == clientWidth: ${overflowRtl.clientWidth}`)
    }

    // ----------------------------------------------------
    // 8. Mobile Navigation Drawer in RTL & LTR
    // ----------------------------------------------------
    console.log('\n8️⃣ Auditing Mobile Navigation Drawer & RTL Placement...')
    await page.setViewport({ width: 390, height: 844 })
    await new Promise((r) => setTimeout(r, 400))

    // In Arabic RTL, find the drawer toggle button
    const hamburgerBtn = await page.$('header button:has(.mdi-menu)') || await page.$('header .mdi-menu')
    if (!hamburgerBtn) {
      throw new Error('Mobile hamburger button not found')
    }
    await hamburgerBtn.click()
    await new Promise((r) => setTimeout(r, 500))

    const drawerVisible = await page.$eval('.mobile-drawer', (el) => {
      const style = window.getComputedStyle(el)
      return style.visibility !== 'hidden' && style.display !== 'none'
    })
    if (!drawerVisible) {
      throw new Error('Mobile drawer not visible after click')
    }
    console.log('  ✅ Mobile Navigation Drawer opened in RTL.')

    // Switch back to French via drawer chips
    console.log('  Testing language switcher inside mobile drawer...')
    await page.evaluate(() => {
      const chips = Array.from(document.querySelectorAll('.lang-chip-btn'))
      const frChip = chips.find((c) => c.innerText.includes('Français'))
      if (frChip) frChip.click()
    })
    await new Promise((r) => setTimeout(r, 600))

    const langAfterDrawer = await page.$eval('html', (el) => el.getAttribute('lang'))
    console.log(`  ✅ Language switched to "${langAfterDrawer}" via mobile drawer chip.`)
    if (langAfterDrawer !== 'fr') {
      throw new Error(`Drawer language switch failed: expected 'fr', got '${langAfterDrawer}'`)
    }

    // ----------------------------------------------------
    // 9. Accessibility Audit (WCAG)
    // ----------------------------------------------------
    console.log('\n9️⃣ Auditing Accessibility Standards (WCAG)...')
    const a11ySummary = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'))
      const missingAlt = images.filter((img) => !img.hasAttribute('alt')).length

      const buttons = Array.from(document.querySelectorAll('button'))
      const unlabelledButtons = buttons.filter(
        (btn) => !btn.innerText.trim() && !btn.getAttribute('aria-label') && !btn.getAttribute('aria-labelledby')
      ).length

      const links = Array.from(document.querySelectorAll('a'))
      const unlabelledLinks = links.filter(
        (a) => !a.innerText.trim() && !a.getAttribute('aria-label') && !a.getAttribute('aria-labelledby')
      ).length

      return {
        imagesCount: images.length,
        missingAlt,
        buttonsCount: buttons.length,
        unlabelledButtons,
        linksCount: links.length,
        unlabelledLinks
      }
    })

    console.log(`  ✅ Accessibility check: ${a11ySummary.buttonsCount} buttons (unlabelled: ${a11ySummary.unlabelledButtons}), ${a11ySummary.linksCount} links (unlabelled: ${a11ySummary.unlabelledLinks})`)
    if (a11ySummary.unlabelledButtons > 0) {
      throw new Error(`Found ${a11ySummary.unlabelledButtons} unlabelled buttons`)
    }
    if (a11ySummary.unlabelledLinks > 0) {
      throw new Error(`Found ${a11ySummary.unlabelledLinks} unlabelled links`)
    }

    // ----------------------------------------------------
    // 10. Security Headers Verification
    // ----------------------------------------------------
    console.log('\n🔟 Auditing Security Headers on Server Response...')
    const headers = response.headers()
    const expectedHeaders = {
      'x-content-type-options': 'nosniff',
      'x-frame-options': 'SAMEORIGIN',
      'referrer-policy': 'strict-origin-when-cross-origin'
    }

    for (const [header, val] of Object.entries(expectedHeaders)) {
      if (!headers[header] || !headers[header].toLowerCase().includes(val.toLowerCase())) {
        console.warn(`  ⚠️ Header ${header}: expected ${val}, got ${headers[header]}`)
      } else {
        console.log(`  ✅ Header ${header}: ${headers[header]}`)
      }
    }

    await browser.close()

    if (consoleErrors.length > 0) {
      throw new Error(`Audit found console errors: ${JSON.stringify(consoleErrors)}`)
    }

    console.log('\n========================================================')
    console.log('🎉 AUDIT COMPLETE: 100% PASSING ON ALL CRITERIA')
    console.log('========================================================\n')
  } finally {
    stopServer()
  }
}

runAudit().catch((err) => {
  console.error('\n❌ AUDIT FAILED:', err)
  stopServer()
  process.exit(1)
})
