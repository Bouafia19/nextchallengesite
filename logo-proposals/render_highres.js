import puppeteer from 'puppeteer-core'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const svgPath = path.join(__dirname, 'modernized_logo.svg')
const pngPath = path.join(__dirname, 'modernized_logo_highres.png')
const artifactDir = '/home/next/.gemini/antigravity-cli/brain/43e49382-3d5b-4e0e-b4a8-11c641987abe'
const artifactPng = path.join(artifactDir, 'modernized_logo_highres.png')

async function render() {
  console.log('Rendering 2048x2048 high-res PNG from SVG...')
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  })

  const page = await browser.newPage()
  await page.setViewport({ width: 2048, height: 2048, deviceScaleFactor: 1 })
  
  const svgData = fs.readFileSync(svgPath, 'utf8')
  const html = `<!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@800;900&family=JetBrains+Mono:wght@700&display=swap" rel="stylesheet">
      <style>
        body, html {
          margin: 0;
          padding: 0;
          width: 2048px;
          height: 2048px;
          overflow: hidden;
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        svg {
          width: 2048px;
          height: 2048px;
        }
      </style>
    </head>
    <body>
      ${svgData}
    </body>
  </html>`

  await page.setContent(html, { waitUntil: 'networkidle0' })
  await new Promise((r) => setTimeout(r, 1200))

  await page.screenshot({ path: pngPath, omitBackground: false })
  console.log(`Saved to ${pngPath}`)

  fs.copyFileSync(pngPath, artifactPng)
  console.log(`Mirrored to artifact: ${artifactPng}`)

  await browser.close()
}

render().catch(console.error)
