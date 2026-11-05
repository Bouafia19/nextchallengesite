import puppeteer from 'puppeteer-core'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'
import https from 'node:https'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const screenshotsDir = path.join(__dirname, 'test-screenshots', 'exact-favicon')
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

async function runExactVerification() {
  console.log('========================================================================')
  console.log('🔍 VERIFYING EXACT INVENTORY V2 APPLICATION LOGO ON NEXT CHALLENGE')
  console.log('Corporate Website: https://nextchallenge.tech')
  console.log('Official Inventory V2: https://inventory.nextchallenge.tech')
  console.log('========================================================================\n')

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1440,900']
  })

  try {
    const page = await browser.newPage()
    await page.setViewport({ width: 1440, height: 900 })

    // 1️⃣ Probe live favicon URLs
    console.log('1️⃣ Directly probing and validating all production favicon assets (?v=inv2.1):')
    const testUrls = [
      'https://nextchallenge.tech/favicon.svg?v=inv2.1',
      'https://nextchallenge.tech/favicon.ico?v=inv2.1',
      'https://nextchallenge.tech/favicon-32x32.png?v=inv2.1',
      'https://nextchallenge.tech/favicon-16x16.png?v=inv2.1',
      'https://nextchallenge.tech/favicon.png?v=inv2.1',
      'https://nextchallenge.tech/apple-touch-icon.png?v=inv2.1',
      'https://nextchallenge.tech/site.webmanifest?v=inv2.1',
      'https://nextchallenge.tech/android-chrome-192x192.png?v=inv2.1',
      'https://nextchallenge.tech/android-chrome-512x512.png?v=inv2.1'
    ]

    for (const u of testUrls) {
      const r = await fetchUrl(u)
      const is200 = r.statusCode === 200
      console.log(`   ${is200 ? '✔' : '❌'} ${u} -> HTTP ${r.statusCode} (${r.headers['content-type']}, ${r.data.length} bytes)`)
      if (!is200) throw new Error(`Asset failed: ${u}`)
    }

    // 2️⃣ Verify raw SVG byte match between corporate site and Inventory V2 official
    console.log('\n2️⃣ Verifying SVG identity between corporate site and official Inventory V2 demo...')
    const [ncSvgRes, invSvgRes] = await Promise.all([
      fetchUrl('https://nextchallenge.tech/favicon.svg?v=inv2.1'),
      fetchUrl('https://inventory.nextchallenge.tech/favicon.svg')
    ])

    const ncSvgText = ncSvgRes.data.toString('utf8').trim()
    const invSvgText = invSvgRes.data.toString('utf8').trim()
    const svgsMatch = ncSvgText === invSvgText
    console.log(`   ✔ Corporate site SVG size: ${ncSvgRes.data.length} bytes`)
    console.log(`   ✔ Inventory V2 official SVG size: ${invSvgRes.data.length} bytes`)
    console.log(`   ✔ Exact byte-for-byte SVG match: ${svgsMatch ? 'YES (100% IDENTICAL)' : 'NO'}`)
    if (!svgsMatch) throw new Error('SVGs do not match!')

    // 3️⃣ Open https://nextchallenge.tech in Chrome
    console.log('\n3️⃣ Loading https://nextchallenge.tech in real browser...')
    await page.goto('https://nextchallenge.tech', { waitUntil: 'networkidle0' })
    const shot1 = '01_nc_homepage_desktop_live.png'
    await page.screenshot({ path: path.join(screenshotsDir, shot1), fullPage: false })
    copyToArtifacts(shot1)
    console.log(`   📸 Captured ${shot1}`)

    // 4️⃣ Create visual side-by-side browser tab comparison
    console.log('\n4️⃣ Generating visual side-by-side browser tab comparison...')
    const comparisonHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { margin: 0; background: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #fff; padding: 40px; }
        .container { max-width: 1000px; margin: 0 auto; background: #131b2e; border: 1px solid #1e293b; border-radius: 16px; padding: 32px; box-shadow: 0 20px 40px rgba(0,0,0,0.6); }
        h1 { color: #863bff; margin-top: 0; font-size: 24px; display: flex; align-items: center; gap: 12px; }
        p.subtitle { color: #94a3b8; font-size: 15px; margin-bottom: 28px; }
        .tab-strip { background: #0f172a; border-radius: 10px; border: 1px solid #334155; overflow: hidden; margin-bottom: 24px; }
        .chrome-header { background: #1e293b; padding: 12px 16px; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid #334155; }
        .dots { display: flex; gap: 6px; }
        .dot { width: 12px; height: 12px; border-radius: 50%; }
        .dot.r { background: #ef4444; } .dot.y { background: #f59e0b; } .dot.g { background: #10b981; }
        .tabs { display: flex; gap: 4px; overflow-x: auto; }
        .tab { background: #0f172a; padding: 10px 18px; border-radius: 8px 8px 0 0; display: flex; align-items: center; gap: 10px; font-size: 13px; font-weight: 500; border: 1px solid #334155; border-bottom: none; }
        .tab.active { background: #131b2e; color: #fff; border-color: #3b82f6; }
        .tab img { width: 18px; height: 18px; }
        .tab-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; padding: 2px 6px; border-radius: 4px; background: rgba(134, 59, 255, 0.2); color: #c084fc; font-weight: bold; margin-left: 6px; }
        .url-bar { background: #090d16; padding: 8px 16px; margin: 12px 16px; border-radius: 6px; border: 1px solid #334155; font-family: monospace; font-size: 13px; color: #cbd5e1; display: flex; align-items: center; gap: 8px; }
        .lock { color: #10b981; }
        
        .side-by-side { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 32px; }
        .icon-card { background: #090d16; border: 1px solid #334155; border-radius: 12px; padding: 24px; text-align: center; }
        .icon-card h3 { margin-top: 0; font-size: 16px; color: #e2e8f0; }
        .icon-display { height: 140px; display: flex; align-items: center; justify-content: center; margin: 20px 0; background: rgba(255,255,255,0.03); border-radius: 8px; }
        .icon-display img { width: 96px; height: 96px; }
        .match-badge { display: inline-block; background: #10b981; color: #000; font-weight: bold; font-size: 13px; padding: 6px 14px; border-radius: 20px; }
        .details-list { text-align: left; font-size: 12px; color: #94a3b8; font-family: monospace; margin-top: 16px; line-height: 1.8; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>
          <span>⚡</span>
          Visual Confirmation: Official Inventory V2 Application Icon
        </h1>
        <p class="subtitle">Side-by-side comparison of active browser tab favicons between the official Inventory V2 demo and the Next Challenge corporate website.</p>

        <div class="tab-strip">
          <div class="chrome-header">
            <div class="dots"><div class="dot r"></div><div class="dot y"></div><div class="dot g"></div></div>
            <div class="tabs">
              <div class="tab">
                <img src="https://inventory.nextchallenge.tech/favicon.svg" alt="Inventory V2" />
                <span>Inventory V2 – Smart Inventory Management</span>
                <span class="tab-label">Original App</span>
              </div>
              <div class="tab active">
                <img src="https://nextchallenge.tech/favicon.svg?v=inv2.1" alt="Next Challenge" />
                <span>Next Challenge | Solutions Numériques</span>
                <span class="tab-label" style="background:rgba(16,185,129,0.2); color:#34d399;">Deployed Favicon</span>
              </div>
            </div>
          </div>
          <div class="url-bar">
            <span class="lock">🔒</span>
            <span>https://nextchallenge.tech/</span>
            <span style="margin-left: auto; color:#10b981; font-weight:bold;">HTTP 200 OK — Cache Version: ?v=inv2.1</span>
          </div>
        </div>

        <div style="text-align: center; margin: 24px 0;">
          <span class="match-badge">✔ 100% VISUAL & VECTOR MATCH CONFIRMED</span>
        </div>

        <div class="side-by-side">
          <div class="icon-card">
            <h3>Original Inventory V2 Application Icon</h3>
            <div class="icon-display">
              <img src="https://inventory.nextchallenge.tech/favicon.svg" alt="Original Icon" />
            </div>
            <div class="details-list">
              <div><strong>Path:</strong> inventory-v2-web-demo/public/favicon.svg</div>
              <div><strong>Format:</strong> Scalable Vector Graphics (SVG)</div>
              <div><strong>Primary Color:</strong> #863bff (Electric Violet)</div>
              <div><strong>Accent Color:</strong> #47bfff (Cyan / Blue Glow)</div>
            </div>
          </div>

          <div class="icon-card" style="border-color: #3b82f6;">
            <h3>Deployed Next Challenge Corporate Favicon</h3>
            <div class="icon-display">
              <img src="https://nextchallenge.tech/favicon.svg?v=inv2.1" alt="Corporate Favicon" />
            </div>
            <div class="details-list">
              <div><strong>Path:</strong> nextchallengesite/public/favicon.svg</div>
              <div><strong>Format:</strong> Scalable Vector Graphics (SVG) + Multi-Res PNG/ICO</div>
              <div><strong>Primary Color:</strong> #863bff (Electric Violet)</div>
              <div><strong>Accent Color:</strong> #47bfff (Cyan / Blue Glow)</div>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
    `

    const compPage = await browser.newPage()
    await compPage.setViewport({ width: 1080, height: 780 })
    await compPage.setContent(comparisonHtml, { waitUntil: 'networkidle0' })
    const shot2 = '02_favicon_visual_comparison.png'
    await compPage.screenshot({ path: path.join(screenshotsDir, shot2), fullPage: false })
    copyToArtifacts(shot2)
    console.log(`   📸 Captured ${shot2}`)
    await compPage.close()

    console.log('\n========================================================================')
    console.log('🎉 VERIFICATION COMPLETE: OFFICIAL INVENTORY V2 LOGO MATCH CONFIRMED ✅')
    console.log('========================================================================\n')

  } finally {
    await browser.close()
  }
}

runExactVerification().catch(err => {
  console.error('Verification failed:', err)
  process.exit(1)
})
