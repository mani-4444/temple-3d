// Captures public/images/temple-poster.jpg — a still of the real 3D scene from the landing camera,
// used as the fallback image when WebGL is unavailable. Re-run after changing the model or lighting.
//
//   npm run build && npm run capture:poster
import { mkdir } from 'node:fs/promises'
import { chromium } from 'playwright-core'
import { preview } from 'vite'

const server = await preview({ preview: { port: 4320, strictPort: true }, logLevel: 'warn' })
const browser = await chromium.launch({
  channel: process.env.SMOKE_CHANNEL ?? 'chrome',
  headless: true,
  args: ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-gpu'],
})
// Reduced motion freezes the landing sway so the still is deterministic.
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, reducedMotion: 'reduce' })
await page.goto(server.resolvedUrls.local[0])
await page.locator('[data-scene-status="ready"]').waitFor({ timeout: 90_000 })
await page.waitForTimeout(2500)
await page.addStyleTag({ content: 'header, main, .hotspot { visibility: hidden !important; }' })
await page.waitForTimeout(200)
await mkdir('public/images', { recursive: true })
await page.locator('canvas').screenshot({ path: 'public/images/temple-poster.jpg', type: 'jpeg', quality: 80 })
console.log('Wrote public/images/temple-poster.jpg')
await browser.close()
await new Promise((r) => server.httpServer.close(r))
