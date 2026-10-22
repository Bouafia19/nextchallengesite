import puppeteer from 'puppeteer-core'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const htmlPath = path.join(__dirname, 'presentation.html')
const outPng = path.join(__dirname, 'proposals_comparison_sheet.png')
const artifactDir = '/home/next/.gemini/antigravity-cli/brain/43e49382-3d5b-4e0e-b4a8-11c641987abe/logo-proposals'

async function render() {
  console.log('📸 Rendering presentation sheet to high-res PNG...')
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  })

  const page = await browser.newPage()
  await page.setViewport({ width: 1440, height: 1600, deviceScaleFactor: 2 })
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' })
  await new Promise((r) => setTimeout(r, 1000))

  await page.screenshot({ path: outPng, fullPage: true })
  console.log(`✅ Screenshot saved to ${outPng}`)

  // Copy to artifact directory
  if (!fs.existsSync(artifactDir)) {
    fs.mkdirSync(artifactDir, { recursive: true })
  }
  fs.copyFileSync(outPng, path.join(artifactDir, 'proposals_comparison_sheet.png'))
  
  // Also copy SVGs
  const files = fs.readdirSync(__dirname)
  for (const f of files) {
    if (f.endsWith('.svg') || f.endsWith('.jpg') || f.endsWith('.png')) {
      fs.copyFileSync(path.join(__dirname, f), path.join(artifactDir, f))
    }
  }

  await browser.close()
  console.log('✅ All assets mirrored to artifact directory!')
}

render().catch(console.error)
