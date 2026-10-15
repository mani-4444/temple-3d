// Scenarios for scripts/smoke.mjs. Each scenario gets a fresh browser context.

const desktop = { width: 1440, height: 900 }
const mobile = { width: 390, height: 844 }
const READY_TIMEOUT = 90_000 // software WebGL in headless Chrome is slow

async function waitForScene(page, status = 'ready') {
  await page.locator(`[data-scene-status="${status}"]`).waitFor({ timeout: READY_TIMEOUT })
}

export const scenarios = [
  {
    id: 'landing-desktop',
    name: 'Landing + model load (desktop)',
    viewport: desktop,
    async run({ page, base, check, out }) {
      const t0 = Date.now()
      await page.goto(base)
      const title = page.getByRole('heading', { level: 1, name: 'Sanatan' })
      await title.waitFor()
      check('hero heading visible', await title.isVisible())
      await page.screenshot({ path: `${out}/00-loading-desktop.png` })
      await waitForScene(page)
      check('3D model loads and scene becomes ready', true, `${((Date.now() - t0) / 1000).toFixed(1)}s`)
      const canvas = page.locator('canvas')
      check('WebGL canvas present', (await canvas.count()) === 1)
      await page.waitForTimeout(2500)
      await page.screenshot({ path: `${out}/01-landing-desktop.png` })

      await page.keyboard.press('Tab')
      const focused = await page.evaluate(() => document.activeElement?.textContent?.trim() ?? '')
      check('Tab focuses a header control', focused.includes('Sanatan'), focused)
      const outline = await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle)
      check('focus ring visible', outline !== 'none', outline)

      await page.getByRole('button', { name: 'About & credits' }).click()
      const dialog = page.getByRole('dialog', { name: 'Sanatan' })
      check('about dialog opens', await dialog.isVisible())
      await page.keyboard.press('Escape')
      await page.waitForTimeout(100)
      check('about dialog closes on Escape', !(await dialog.isVisible()))

      await page.getByRole('button', { name: 'Explore the temple' }).click()
      await page.getByRole('region', { name: 'Exploration' }).waitFor()
      check('CTA enters exploration mode', true)
      await page.waitForTimeout(3500)
      await page.screenshot({ path: `${out}/02-explore-desktop.png` })
      await page.getByRole('button', { name: 'Back to introduction' }).click()
      await title.waitFor()
      check('return to introduction works', await title.isVisible())
    },
  },
  {
    id: 'landing-mobile',
    name: 'Landing (mobile)',
    viewport: mobile,
    context: { isMobile: true, hasTouch: true },
    async run({ page, base, check, out }) {
      await page.goto(base)
      await page.getByRole('heading', { level: 1, name: 'Sanatan' }).waitFor()
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)
      check('no horizontal overflow at 390px', !overflow)
      const cta = page.getByRole('button', { name: 'Explore the temple' })
      const box = await cta.boundingBox()
      check('CTA fully on screen and ≥44px tall', !!box && box.y + box.height <= mobile.height && box.height >= 44, JSON.stringify(box))
      await waitForScene(page)
      await page.waitForTimeout(2500)
      await page.screenshot({ path: `${out}/03-landing-mobile.png` })
      await cta.tap()
      await page.getByRole('region', { name: 'Exploration' }).waitFor()
      check('CTA works by touch', true)
      await page.waitForTimeout(3500)
      await page.screenshot({ path: `${out}/04-explore-mobile.png` })
    },
  },
  {
    id: 'model-failure',
    name: 'Model load failure + retry',
    viewport: desktop,
    expectedErrors: [/404|Failed to load resource|Could not load|fetch/i],
    async run({ page, base, check, out }) {
      await page.route('**/models/temple.glb', (route) => route.fulfill({ status: 404, body: 'missing' }))
      await page.goto(base)
      await waitForScene(page, 'error')
      const alert = page.getByRole('alert')
      check('error notice shown on model 404', (await alert.textContent()).includes('didn’t load'))
      await page.screenshot({ path: `${out}/05-model-error.png` })
      await page.unroute('**/models/temple.glb')
      await page.getByRole('button', { name: 'Try again' }).click()
      await waitForScene(page)
      check('retry recovers once the model is reachable', true)
    },
  },
  {
    id: 'no-webgl',
    name: 'No WebGL fallback',
    viewport: desktop,
    async run({ page, base, check, out }) {
      await page.addInitScript(() => {
        const orig = HTMLCanvasElement.prototype.getContext
        HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
          return /webgl/i.test(type) ? null : orig.call(this, type, ...rest)
        }
      })
      await page.goto(base)
      await waitForScene(page, 'unsupported')
      check('unsupported state detected', true)
      check('no canvas rendered', (await page.locator('canvas').count()) === 0)
      await page.getByRole('button', { name: 'Explore the temple' }).click()
      check('fallback notice explains 3D is unavailable', await page.getByText('3D unavailable').isVisible())
      await page.screenshot({ path: `${out}/06-no-webgl.png` })
    },
  },
]
