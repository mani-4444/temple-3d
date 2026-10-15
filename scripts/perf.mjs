// Rough performance probe: serves the production build, opens it in the locally installed Chrome
// and reports the WebGL renderer, frame rate during the continuously rendered landing shot, and
// draw calls / triangles per frame (counted by instrumenting the WebGL context).
//
//   npm run build && npm run perf            # tries the hardware GPU (ANGLE/D3D11)
//   PERF_SOFTWARE=1 npm run perf             # forces SwiftShader (software) for comparison
//
// Numbers are indicative only: headless Chrome, single run, this machine.
import { chromium } from 'playwright-core'
import { preview } from 'vite'

const software = !!process.env.PERF_SOFTWARE
const server = await preview({ preview: { port: 4319, strictPort: true }, logLevel: 'warn' })
const browser = await chromium.launch({
  channel: process.env.SMOKE_CHANNEL ?? 'chrome',
  headless: true,
  args: software
    ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader']
    : ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-gpu'],
})

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.addInitScript(() => {
  const stats = { draws: 0, triangles: 0 }
  window.__perf = stats
  for (const proto of [WebGL2RenderingContext.prototype, WebGLRenderingContext.prototype]) {
    const drawElements = proto.drawElements
    proto.drawElements = function (mode, count, ...rest) {
      stats.draws++
      if (mode === this.TRIANGLES) stats.triangles += count / 3
      return drawElements.call(this, mode, count, ...rest)
    }
    const drawArrays = proto.drawArrays
    proto.drawArrays = function (mode, first, count) {
      stats.draws++
      if (mode === this.TRIANGLES) stats.triangles += count / 3
      return drawArrays.call(this, mode, first, count)
    }
  }
})

const t0 = Date.now()
await page.goto(server.resolvedUrls.local[0])
await page.locator('[data-scene-status="ready"]').waitFor({ timeout: 90_000 })
const readyMs = Date.now() - t0
await page.waitForTimeout(1500)

const result = await page.evaluate(async () => {
  const canvas = document.querySelector('canvas')
  const gl = canvas.getContext('webgl2')
  const info = gl?.getExtension('WEBGL_debug_renderer_info')
  const renderer = info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl?.getParameter(gl.RENDERER)
  const stats = window.__perf
  stats.draws = 0
  stats.triangles = 0
  let frames = 0
  const start = performance.now()
  await new Promise((resolve) => {
    const tick = () => {
      frames++
      if (performance.now() - start < 4000) requestAnimationFrame(tick)
      else resolve()
    }
    requestAnimationFrame(tick)
  })
  const seconds = (performance.now() - start) / 1000
  return {
    renderer,
    fps: frames / seconds,
    drawsPerFrame: stats.draws / frames,
    trianglesPerFrame: stats.triangles / frames,
    jsHeapMB: performance.memory ? performance.memory.usedJSHeapSize / 1048576 : null,
  }
})

console.log(`Mode:               ${software ? 'software (SwiftShader)' : 'hardware requested (ANGLE D3D11)'}`)
console.log(`WebGL renderer:     ${result.renderer}`)
console.log(`Ready after:        ${(readyMs / 1000).toFixed(1)} s (model load + first render)`)
console.log(`Landing shot FPS:   ${result.fps.toFixed(1)} (requestAnimationFrame rate, 4 s)`)
console.log(`Draw calls / frame: ${result.drawsPerFrame.toFixed(0)} (includes shadow pass)`)
console.log(`Triangles / frame:  ${Math.round(result.trianglesPerFrame).toLocaleString('en-US')} (includes shadow pass)`)
if (result.jsHeapMB) console.log(`JS heap:            ${result.jsHeapMB.toFixed(0)} MB`)

await browser.close()
await new Promise((r) => server.httpServer.close(r))
