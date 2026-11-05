import puppeteer from 'puppeteer-core'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const screenshotsDir = path.join(__dirname, 'test-screenshots', 'inventory-links')
const artifactScreenshotsDir = '/home/next/.gemini/antigravity-cli/brain/5f93b330-d5e4-4362-aa56-d0bb72783e03/screenshots'

for (const dir of [screenshotsDir, artifactScreenshotsDir]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

const NC_PROD_URL = 'https://nextchallenge.tech'
const INVENTORY_PROD_URL = 'https://inventory.nextchallenge.tech'

function copyToArtifacts(filename) {
  const src = path.join(screenshotsDir, filename)
  const dest = path.join(artifactScreenshotsDir, filename)
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest)
  }
}

async function verifyAll() {
  console.log('========================================================================')
  console.log('🔍 NEXT CHALLENGE: INVENTORY V2 DEMO LINK LIVE PRODUCTION VERIFICATION')
  console.log(`Corporate Website: ${NC_PROD_URL}`)
  console.log(`Inventory V2 Demo: ${INVENTORY_PROD_URL}`)
  console.log('========================================================================\n')

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1440,900']
  })

  const results = {
    homepageLoaded: false,
    inventoryCardFound: false,
    homepageDemoButtonUrl: null,
    homepageDemoButtonTarget: null,
    homepageDemoButtonRel: null,
    detailPageLoaded: false,
    detailHeroCtaUrl: null,
    detailHeroCtaTarget: null,
    detailHeroCtaRel: null,
    detailPortalCtaUrl: null,
    detailPortalCtaTarget: null,
    detailPortalCtaRel: null,
    inventoryAppLoaded: false,
    inventoryAppTitle: null,
    inventoryAppStatus: null,
    tourivaLinksValid: false,
    fleetoraLinksValid: false,
    mobileResponsiveOk: false,
    tabletResponsiveOk: false,
    consoleErrors: []
  }

  try {
    const page = await browser.newPage()
    await page.setViewport({ width: 1440, height: 900 })

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text()
        if (!text.includes('favicon') && !text.includes('AudioContext')) {
          results.consoleErrors.push(text)
        }
      }
    })

    // -------------------------------------------------------------
    // TEST 1: Homepage & Inventory V2 Product Card
    // -------------------------------------------------------------
    console.log('1️⃣ Navigating to Next Challenge Homepage...')
    const homeRes = await page.goto(NC_PROD_URL, { waitUntil: 'networkidle0', timeout: 30000 })
    console.log(`   ✔ Homepage HTTP status: ${homeRes.status()}`)
    results.homepageLoaded = homeRes.status() === 200

    // Scroll to products section
    await page.evaluate(() => {
      const el = document.getElementById('products')
      if (el) el.scrollIntoView({ behavior: 'instant' })
    })
    await new Promise(r => setTimeout(r, 1000))

    // Inspect all product links and find Inventory V2 card
    const cardData = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.product-card'))
      const inventoryCard = cards.find(c => c.textContent && c.textContent.includes('Inventory V2'))
      if (!inventoryCard) return null

      // Find the direct external link button inside the card
      const externalBtn = inventoryCard.querySelector('a[href], button[href]') ||
        Array.from(inventoryCard.querySelectorAll('a')).find(a => a.href && a.href.includes('inventory'))

      const allCardLinks = Array.from(inventoryCard.querySelectorAll('a')).map(a => ({
        href: a.href,
        target: a.getAttribute('target'),
        rel: a.getAttribute('rel'),
        text: a.textContent.trim()
      }))

      return {
        hasCard: true,
        buttonHref: externalBtn?.getAttribute('href') || (externalBtn ? externalBtn.href : null),
        buttonTarget: externalBtn?.getAttribute('target'),
        buttonRel: externalBtn?.getAttribute('rel'),
        allCardLinks
      }
    })

    if (cardData && cardData.hasCard) {
      results.inventoryCardFound = true
      results.homepageDemoButtonUrl = cardData.buttonHref
      results.homepageDemoButtonTarget = cardData.buttonTarget
      results.homepageDemoButtonRel = cardData.buttonRel
      console.log(`   ✔ Found Inventory V2 card on homepage!`)
      console.log(`   ✔ Demo button URL: ${cardData.buttonHref}`)
      console.log(`   ✔ Demo button target: ${cardData.buttonTarget}`)
      console.log(`   ✔ Demo button rel: ${cardData.buttonRel}`)
    } else {
      console.error('   ❌ Could not find Inventory V2 card on homepage')
    }

    // Capture screenshot of Products section with Inventory V2
    const shot1 = '01_nc_homepage_products_inventory.png'
    await page.screenshot({ path: path.join(screenshotsDir, shot1), fullPage: false })
    copyToArtifacts(shot1)
    console.log(`   📸 Captured ${shot1}`)

    // -------------------------------------------------------------
    // TEST 2: Product Detail Page (/products/inventory-v2)
    // -------------------------------------------------------------
    console.log('\n2️⃣ Navigating to Inventory V2 Product Detail page (/products/inventory-v2)...')
    await page.goto(`${NC_PROD_URL}/products/inventory-v2`, { waitUntil: 'networkidle0', timeout: 30000 })
    await new Promise(r => setTimeout(r, 1500))

    const detailData = await page.evaluate(() => {
      const title = document.title
      const heroBtn = document.querySelector('.btn-hero-cta')
      const portalCard = document.querySelector('.portal-card')
      const portalBtn = portalCard ? portalCard.querySelector('a[href]') : null

      return {
        title,
        heroBtn: heroBtn ? {
          href: heroBtn.getAttribute('href') || heroBtn.href,
          target: heroBtn.getAttribute('target'),
          rel: heroBtn.getAttribute('rel'),
          text: heroBtn.textContent.trim()
        } : null,
        portalBtn: portalBtn ? {
          href: portalBtn.getAttribute('href') || portalBtn.href,
          target: portalBtn.getAttribute('target'),
          rel: portalBtn.getAttribute('rel'),
          text: portalBtn.textContent.trim()
        } : null
      }
    })

    console.log(`   ✔ Detail Page Title: ${detailData.title}`)
    results.detailPageLoaded = detailData.title.includes('Inventory V2')

    if (detailData.heroBtn) {
      results.detailHeroCtaUrl = detailData.heroBtn.href
      results.detailHeroCtaTarget = detailData.heroBtn.target
      results.detailHeroCtaRel = detailData.heroBtn.rel
      console.log(`   ✔ Hero CTA text: "${detailData.heroBtn.text}"`)
      console.log(`   ✔ Hero CTA URL: ${detailData.heroBtn.href}`)
      console.log(`   ✔ Hero CTA target: ${detailData.heroBtn.target}, rel: ${detailData.heroBtn.rel}`)
    }

    if (detailData.portalBtn) {
      results.detailPortalCtaUrl = detailData.portalBtn.href
      results.detailPortalCtaTarget = detailData.portalBtn.target
      results.detailPortalCtaRel = detailData.portalBtn.rel
      console.log(`   ✔ Sub-portal button text: "${detailData.portalBtn.text}"`)
      console.log(`   ✔ Sub-portal button URL: ${detailData.portalBtn.href}`)
      console.log(`   ✔ Sub-portal target: ${detailData.portalBtn.target}, rel: ${detailData.portalBtn.rel}`)
    }

    const shot2 = '02_nc_inventory_detail_desktop.png'
    await page.screenshot({ path: path.join(screenshotsDir, shot2), fullPage: false })
    copyToArtifacts(shot2)
    console.log(`   📸 Captured ${shot2}`)

    // -------------------------------------------------------------
    // TEST 3: Click/Open Official Demo: https://inventory.nextchallenge.tech
    // -------------------------------------------------------------
    console.log('\n3️⃣ Opening Official Demo (https://inventory.nextchallenge.tech)...')
    const invPage = await browser.newPage()
    await invPage.setViewport({ width: 1440, height: 900 })

    const invRes = await invPage.goto(INVENTORY_PROD_URL, { waitUntil: 'networkidle0', timeout: 30000 })
    const invTitle = await invPage.title()
    console.log(`   ✔ Inventory V2 HTTP status: ${invRes.status()}`)
    console.log(`   ✔ Inventory V2 Title: ${invTitle}`)

    // Wait for the Inventory V2 Vue app to mount and render
    await invPage.waitForSelector('#app', { timeout: 10000 })
    await new Promise(r => setTimeout(r, 2000))

    results.inventoryAppStatus = invRes.status()
    results.inventoryAppTitle = invTitle
    results.inventoryAppLoaded = invRes.status() === 200 && invTitle.includes('Inventory V2')

    const shot3 = '03_inventory_v2_live_opened.png'
    await invPage.screenshot({ path: path.join(screenshotsDir, shot3), fullPage: false })
    copyToArtifacts(shot3)
    console.log(`   📸 Captured ${shot3}`)
    await invPage.close()

    // -------------------------------------------------------------
    // TEST 4: Verify Touriva and Fleetora Links Are Unchanged
    // -------------------------------------------------------------
    console.log('\n4️⃣ Checking Touriva and Fleetora product links...')
    await page.goto(NC_PROD_URL, { waitUntil: 'networkidle0' })
    await page.evaluate(() => {
      const el = document.getElementById('products')
      if (el) el.scrollIntoView({ behavior: 'instant' })
    })

    const otherLinks = await page.evaluate(() => {
      const allLinks = Array.from(document.querySelectorAll('a[href]')).map(a => a.href)
      const tourivaLinks = allLinks.filter(h => h.includes('touriva'))
      const fleetoraLinks = allLinks.filter(h => h.includes('fleetora'))
      const obsoleteRenderInventory = allLinks.filter(h => h.includes('inventory-v2-web-demo.onrender.com'))
      return {
        tourivaLinks,
        fleetoraLinks,
        obsoleteRenderInventory
      }
    })

    console.log(`   ✔ Touriva links detected: ${otherLinks.tourivaLinks.length}`)
    console.log(`   ✔ Fleetora links detected: ${otherLinks.fleetoraLinks.length}`)
    console.log(`   ✔ Obsolete Render Inventory links detected: ${otherLinks.obsoleteRenderInventory.length} (must be 0)`)

    results.tourivaLinksValid = otherLinks.tourivaLinks.length > 0
    results.fleetoraLinksValid = otherLinks.fleetoraLinks.length > 0
    results.obsoleteRenderInventoryCount = otherLinks.obsoleteRenderInventory.length

    // -------------------------------------------------------------
    // TEST 5: Responsive Layouts (Tablet 768px & Mobile 375px)
    // -------------------------------------------------------------
    console.log('\n5️⃣ Testing Responsive Tablet Viewport (768x1024)...')
    await page.setViewport({ width: 768, height: 1024 })
    await page.evaluate(() => {
      const el = document.getElementById('products')
      if (el) el.scrollIntoView({ behavior: 'instant' })
    })
    await new Promise(r => setTimeout(r, 1000))

    const tabletOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
    results.tabletResponsiveOk = !tabletOverflow
    console.log(`   ✔ Tablet horizontal overflow: ${tabletOverflow}`)

    const shot4 = '04_nc_inventory_tablet.png'
    await page.screenshot({ path: path.join(screenshotsDir, shot4), fullPage: false })
    copyToArtifacts(shot4)
    console.log(`   📸 Captured ${shot4}`)

    console.log('\n6️⃣ Testing Responsive Mobile Viewport (375x667)...')
    await page.setViewport({ width: 375, height: 667 })
    await page.evaluate(() => {
      const el = document.getElementById('products')
      if (el) el.scrollIntoView({ behavior: 'instant' })
    })
    await new Promise(r => setTimeout(r, 1000))

    const mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
    results.mobileResponsiveOk = !mobileOverflow
    console.log(`   ✔ Mobile horizontal overflow: ${mobileOverflow}`)

    const shot5 = '05_nc_inventory_mobile.png'
    await page.screenshot({ path: path.join(screenshotsDir, shot5), fullPage: false })
    copyToArtifacts(shot5)
    console.log(`   📸 Captured ${shot5}`)

    // Print summary
    console.log('\n========================================================================')
    console.log('📊 PRODUCTION VERIFICATION SUMMARY')
    console.log('========================================================================')
    console.log(JSON.stringify(results, null, 2))

    const allPassed =
      results.homepageLoaded &&
      results.inventoryCardFound &&
      results.homepageDemoButtonUrl === INVENTORY_PROD_URL &&
      results.homepageDemoButtonTarget === '_blank' &&
      results.homepageDemoButtonRel?.includes('noopener') &&
      results.detailPageLoaded &&
      results.detailHeroCtaUrl === INVENTORY_PROD_URL &&
      results.detailPortalCtaUrl === INVENTORY_PROD_URL &&
      results.inventoryAppLoaded &&
      results.tourivaLinksValid &&
      results.fleetoraLinksValid &&
      results.obsoleteRenderInventoryCount === 0 &&
      results.mobileResponsiveOk &&
      results.tabletResponsiveOk

    console.log(`\nOVERALL STATUS: ${allPassed ? '✅ ALL CHECKS PASSED 100%' : '❌ SOME CHECKS FAILED'}`)
    if (!allPassed) {
      process.exit(1)
    }
  } finally {
    await browser.close()
  }
}

verifyAll().catch(err => {
  console.error('Fatal error during verification:', err)
  process.exit(1)
})
