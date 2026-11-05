import puppeteer from 'puppeteer-core'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'
import https from 'node:https'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const screenshotsDir = path.join(__dirname, 'test-screenshots', 'favicon')
const artifactScreenshotsDir = '/home/next/.gemini/antigravity-cli/brain/5f93b330-d5e4-4362-aa56-d0bb72783e03/screenshots'

for (const dir of [screenshotsDir, artifactScreenshotsDir]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

function copyToArtifacts(filename) {
  const src = path.join(screenshotsDir, filename)
  const dest = path.join(artifactScreenshotsDir, filename)
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest)
  }
}

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const chunks = []
      res.on('data', chunk => chunks.push(chunk))
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: Buffer.concat(chunks)
        })
      })
    }).on('error', reject)
  })
}

async function verifyFavicons() {
  console.log('========================================================================')
  console.log('🔍 LIVE PRODUCTION VERIFICATION: INVENTORY V2 FAVICON ON NEXT CHALLENGE')
  console.log('Target: https://nextchallenge.tech')
  console.log('========================================================================\n')

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1440,900']
  })

  const results = {
    homepageStatus: null,
    faviconLinks: [],
    networkFaviconRequests: [],
    faviconUrlChecks: {},
    consoleErrors: []
  }

  try {
    const page = await browser.newPage()
    await page.setViewport({ width: 1440, height: 900 })

    page.on('console', msg => {
      if (msg.type() === 'error') {
        results.consoleErrors.push(msg.text())
      }
    })

    page.on('response', response => {
      const url = response.url()
      if (url.includes('favicon') || url.includes('apple-touch-icon') || url.includes('android-chrome') || url.includes('manifest')) {
        results.networkFaviconRequests.push({
          url,
          status: response.status(),
          contentType: response.headers()['content-type']
        })
      }
    })

    console.log('1️⃣ Loading https://nextchallenge.tech in Chrome...')
    const res = await page.goto('https://nextchallenge.tech', { waitUntil: 'networkidle0', timeout: 30000 })
    results.homepageStatus = res.status()
    console.log(`   ✔ Homepage returned HTTP ${res.status()}`)

    // Inspect all icon link tags in head
    const iconTags = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('link[rel*="icon"], link[rel="manifest"]'))
      return links.map(l => ({
        rel: l.getAttribute('rel'),
        href: l.getAttribute('href'),
        type: l.getAttribute('type'),
        sizes: l.getAttribute('sizes'),
        resolvedHref: l.href
      }))
    })

    console.log(`\n2️⃣ Inspecting Head Favicon Declarations:`)
    console.log(JSON.stringify(iconTags, null, 2))
    results.faviconLinks = iconTags

    // 3️⃣ Verify each declared icon URL directly over HTTPS
    console.log('\n3️⃣ Directly probing and validating each favicon URL on production CDN:')
    const testUrls = [
      'https://nextchallenge.tech/favicon.ico?v=inv2',
      'https://nextchallenge.tech/favicon.ico',
      'https://nextchallenge.tech/favicon.svg?v=inv2',
      'https://nextchallenge.tech/favicon-32x32.png?v=inv2',
      'https://nextchallenge.tech/favicon-16x16.png?v=inv2',
      'https://nextchallenge.tech/favicon.png?v=inv2',
      'https://nextchallenge.tech/apple-touch-icon.png?v=inv2',
      'https://nextchallenge.tech/site.webmanifest?v=inv2',
      'https://nextchallenge.tech/android-chrome-192x192.png?v=inv2',
      'https://nextchallenge.tech/android-chrome-512x512.png?v=inv2'
    ]

    for (const u of testUrls) {
      const r = await fetchUrl(u)
      const is200 = r.statusCode === 200
      const sizeBytes = r.data.length
      results.faviconUrlChecks[u] = {
        status: r.statusCode,
        contentType: r.headers['content-type'],
        contentLength: sizeBytes
      }
      console.log(`   ${is200 ? '✔' : '❌'} ${u} -> HTTP ${r.statusCode} (${r.headers['content-type']}, ${sizeBytes} bytes)`)
    }

    // Capture standard desktop view
    const shot1 = '01_nc_live_favicon_desktop.png'
    await page.screenshot({ path: path.join(screenshotsDir, shot1), fullPage: false })
    copyToArtifacts(shot1)
    console.log(`\n📸 Captured ${shot1}`)

    // 4️⃣ Create visual browser tab bar preview showing the Inventory V2 favicon in tab
    console.log('4️⃣ Rendering realistic browser tab inspection view...')
    const tabPreviewHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { margin: 0; background: #0f172a; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #fff; padding: 30px; }
        .card { background: #1e293b; border-radius: 12px; padding: 24px; max-width: 900px; margin: 0 auto; box-shadow: 0 10px 25px rgba(0,0,0,0.5); border: 1px solid #334155; }
        .browser-mockup { background: #090d16; border-radius: 8px; overflow: hidden; border: 1px solid #334155; margin-bottom: 24px; }
        .browser-chrome { background: #1e293b; padding: 10px 16px; display: flex; align-items: center; border-bottom: 1px solid #334155; }
        .dots { display: flex; gap: 8px; margin-right: 20px; }
        .dot { width: 12px; height: 12px; border-radius: 50%; }
        .dot.red { background: #ef4444; }
        .dot.yellow { background: #f59e0b; }
        .dot.green { background: #10b981; }
        .tab { background: #090d16; border-radius: 8px 8px 0 0; padding: 8px 16px; display: flex; align-items: center; gap: 10px; font-size: 13px; color: #f8fafc; border: 1px solid #334155; border-bottom: none; max-width: 280px; }
        .tab-favicon { width: 18px; height: 18px; object-fit: contain; }
        .tab-title { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .address-bar { background: #0f172a; border-radius: 6px; padding: 6px 14px; margin: 8px 16px; display: flex; align-items: center; gap: 8px; font-size: 13px; color: #94a3b8; font-family: monospace; border: 1px solid #334155; }
        .address-lock { color: #10b981; }
        .preview-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-top: 20px; }
        .icon-box { background: #090d16; border: 1px solid #334155; border-radius: 8px; padding: 16px; text-align: center; }
        .icon-box img { width: 64px; height: 64px; object-fit: contain; margin-bottom: 8px; }
        .icon-label { font-size: 12px; color: #94a3b8; word-break: break-all; }
        .badge { background: #10b981; color: #000; font-weight: bold; font-size: 11px; padding: 2px 8px; border-radius: 12px; display: inline-block; margin-bottom: 8px; }
      </style>
    </head>
    <body>
      <div class="card">
        <h2 style="margin-top:0; color:#10b981;">Browser Tab Inspection: Official Inventory V2 Favicon</h2>
        <p style="color:#94a3b8; font-size:14px;">Live production website browser-tab simulation for <strong>https://nextchallenge.tech</strong></p>
        
        <div class="browser-mockup">
          <div class="browser-chrome">
            <div class="dots">
              <div class="dot red"></div>
              <div class="dot yellow"></div>
              <div class="dot green"></div>
            </div>
            <div class="tab">
              <img class="tab-favicon" src="https://nextchallenge.tech/favicon-32x32.png?v=inv2" alt="Favicon" />
              <span class="tab-title">Next Challenge | Développement Logiciel & Solutions Numériques</span>
            </div>
          </div>
          <div class="address-bar">
            <span class="address-lock">🔒</span>
            <span style="color:#f8fafc;">https://nextchallenge.tech/</span>
          </div>
        </div>

        <h3 style="color:#e2e8f0; margin-bottom:12px;">Generated & Deployed Production Favicon Suite</h3>
        <div class="preview-grid">
          <div class="icon-box">
            <span class="badge">Tab Icon (16x16 / 32x32)</span><br>
            <img src="https://nextchallenge.tech/favicon-32x32.png?v=inv2" alt="favicon-32x32" style="width:32px; height:32px; image-rendering:pixelated;" />
            <div class="icon-label">/favicon-32x32.png?v=inv2</div>
          </div>
          <div class="icon-box">
            <span class="badge">Apple Touch (180x180)</span><br>
            <img src="https://nextchallenge.tech/apple-touch-icon.png?v=inv2" alt="apple-touch-icon" />
            <div class="icon-label">/apple-touch-icon.png?v=inv2</div>
          </div>
          <div class="icon-box">
            <span class="badge">Android PWA (192x192)</span><br>
            <img src="https://nextchallenge.tech/android-chrome-192x192.png?v=inv2" alt="android-192" />
            <div class="icon-label">/android-chrome-192x192.png?v=inv2</div>
          </div>
          <div class="icon-box">
            <span class="badge">High-Res Master (512x512)</span><br>
            <img src="https://nextchallenge.tech/favicon.png?v=inv2" alt="favicon-512" />
            <div class="icon-label">/favicon.png?v=inv2</div>
          </div>
        </div>
      </div>
    </body>
    </html>
    `

    const tabInspectionPage = await browser.newPage()
    await tabInspectionPage.setViewport({ width: 1000, height: 750 })
    await tabInspectionPage.setContent(tabPreviewHtml, { waitUntil: 'networkidle0' })
    const shot2 = '02_nc_browser_tab_inspection.png'
    await tabInspectionPage.screenshot({ path: path.join(screenshotsDir, shot2), fullPage: false })
    copyToArtifacts(shot2)
    console.log(`📸 Captured ${shot2}`)
    await tabInspectionPage.close()

    // 5️⃣ Mobile Viewport Check
    console.log('\n5️⃣ Testing Responsive Mobile Viewport (375x667)...')
    await page.setViewport({ width: 375, height: 667 })
    await page.goto('https://nextchallenge.tech', { waitUntil: 'networkidle0' })
    const shot3 = '03_nc_mobile_view.png'
    await page.screenshot({ path: path.join(screenshotsDir, shot3), fullPage: false })
    copyToArtifacts(shot3)
    console.log(`📸 Captured ${shot3}`)

    const allUrlsOk = Object.values(results.faviconUrlChecks).every(c => c.status === 200)
    console.log(`\n========================================================================`)
    console.log(`ALL FAVICON ASSETS RETURNED HTTP 200: ${allUrlsOk ? '✅ YES' : '❌ NO'}`)
    console.log(`========================================================================`)

    if (!allUrlsOk) {
      process.exit(1)
    }
  } finally {
    await browser.close()
  }
}

verifyFavicons().catch(err => {
  console.error('Fatal error during verification:', err)
  process.exit(1)
})
