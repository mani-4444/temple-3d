// Browser smoke test: serves the production build with `vite preview` and drives the locally
// installed Google Chrome (or Edge) headlessly via playwright-core. Writes screenshots to
// ./smoke-output and exits non-zero if any check fails.
//
//   npm run build && npm run smoke
//
// Set SMOKE_CHANNEL=msedge to use Edge instead of Chrome.
import { mkdir } from 'node:fs/promises'
import { chromium } from 'playwright-core'
import { preview } from 'vite'

const OUT = 'smoke-output'
const channel = process.env.SMOKE_CHANNEL ?? 'chrome'
const results = []

function check(name, ok, detail = '') {
  results.push({ name, ok, detail })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`)
}

await mkdir(OUT, { recursive: true })
const server = await preview({ preview: { port: 4317, strictPort: true }, logLevel: 'warn' })
const base = server.resolvedUrls.local[0]

const browser = await chromium.launch({
  channel,
  headless: true,
  // SwiftShader gives headless Chrome a software WebGL implementation.
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
})

async function newPage(viewport, extra = {}) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, ...extra })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`console: ${m.text()}`)
  })
  return { context, page, errors }
}

try {
  for (const scenario of (await import('./smoke-scenarios.mjs')).scenarios) {
    console.log(`\n# ${scenario.name}`)
    const { context, page, errors } = await newPage(scenario.viewport, scenario.context)
    try {
      await scenario.run({ page, base, check, out: OUT })
    } catch (e) {
      check(`${scenario.name}: completed without exception`, false, String(e).split('\n')[0])
      await page.screenshot({ path: `${OUT}/${scenario.id}-failure.png` }).catch(() => {})
    }
    const relevant = errors.filter((e) => !(scenario.expectedErrors ?? []).some((re) => re.test(e)))
    check(`${scenario.name}: no unexpected console/page errors`, relevant.length === 0, relevant.slice(0, 3).join(' | '))
    await context.close()
  }
} finally {
  await browser.close()
  await new Promise((r) => server.httpServer.close(r))
}

const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} checks passed. Screenshots in ./${OUT}`)
process.exit(failed.length ? 1 : 0)
