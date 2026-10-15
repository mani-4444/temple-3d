// Scenarios for scripts/smoke.mjs. Each scenario gets a fresh browser context.
import { createRequire } from 'node:module'

const axePath = createRequire(import.meta.url).resolve('axe-core/axe.min.js')

/** Runs axe-core on the current page state; fails on serious/critical violations, reports the rest. */
async function a11y(page, check, label) {
  if (!(await page.evaluate(() => 'axe' in window))) await page.addScriptTag({ path: axePath })
  const violations = await page.evaluate(async () => {
    const r = await window.axe.run(document, { resultTypes: ['violations'] })
    return r.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length }))
  })
  const blocking = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
  const summary = violations.map((v) => `${v.id}(${v.impact}×${v.nodes})`).join(', ') || 'none'
  check(`axe: no serious/critical a11y violations — ${label}`, blocking.length === 0, summary)
}

const desktop = { width: 1440, height: 900 }
const mobile = { width: 390, height: 844 }
const READY_TIMEOUT = 90_000 // software WebGL in headless Chrome is slow
const LANDMARK_TERMS = ['Gopuram', 'Shala crown & kalashas', 'Dhvajastambha', 'Mandapa', 'Vimana', 'Pushkarini']

async function waitForScene(page, status = 'ready') {
  await page.locator(`[data-scene-status="${status}"]`).waitFor({ timeout: READY_TIMEOUT })
}

/** Screenshot of the 3D canvas only: HTML overlays (UI, hotspot markers) are hidden while capturing. */
async function canvasShot(page) {
  // Park the cursor in the sky so hiding the UI doesn't put it over a landmark (hover highlight).
  await page.mouse.move(2, 2)
  await page.evaluate(() => {
    const style = document.createElement('style')
    style.id = 'smoke-hide-ui'
    // display:none (not visibility) so the panels' backdrop-filter layers are removed entirely.
    style.textContent = 'header, main, .hotspot { display: none !important; }'
    document.head.append(style)
    return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
  })
  const shot = await page.locator('canvas').screenshot()
  await page.evaluate(() => document.getElementById('smoke-hide-ui')?.remove())
  return shot
}
/** Mean absolute per-channel difference (0–255) between two PNG screenshots, computed in the page. */
async function diff(page, a, b) {
  return page.evaluate(
    async ([x, y]) => {
      const load = async (b64) => {
        const img = new Image()
        img.src = `data:image/png;base64,${b64}`
        await img.decode()
        const c = new OffscreenCanvas(img.width, img.height)
        const ctx = c.getContext('2d')
        ctx.drawImage(img, 0, 0)
        return ctx.getImageData(0, 0, img.width, img.height).data
      }
      const [da, db] = await Promise.all([load(x), load(y)])
      let sum = 0
      for (let i = 0; i < da.length; i += 4) sum += Math.abs(da[i] - db[i]) + Math.abs(da[i + 1] - db[i + 1]) + Math.abs(da[i + 2] - db[i + 2])
      return sum / ((da.length / 4) * 3)
    },
    [a.toString('base64'), b.toString('base64')],
  )
}
const CHANGED = 2 // mean difference above this = the view clearly moved
const SAME = 0.6 // below this = visually the same view

const panelTitle = (page) => page.locator('#landmark-title')

async function enterExplore(page) {
  await page.getByRole('button', { name: 'Explore the temple' }).click()
  await page.getByRole('region', { name: 'Exploration' }).waitFor()
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
      check('WebGL canvas present', (await page.locator('canvas').count()) === 1)
      await page.waitForTimeout(2500)
      await page.screenshot({ path: `${out}/01-landing-desktop.png` })
      await a11y(page, check, 'landing')

      await page.keyboard.press('Tab')
      const focused = await page.evaluate(() => document.activeElement?.textContent?.trim() ?? '')
      check('Tab focuses a header control', focused.includes('Sanatan'), focused)
      const outline = await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle)
      check('focus ring visible', outline !== 'none', outline)

      await page.getByRole('button', { name: 'About & credits' }).click()
      const dialog = page.getByRole('dialog', { name: 'Sanatan' })
      check('about dialog opens', await dialog.isVisible())
      await a11y(page, check, 'about dialog')
      await page.keyboard.press('Escape')
      await page.waitForTimeout(100)
      check('about dialog closes on Escape', !(await dialog.isVisible()))

      await enterExplore(page)
      check('CTA enters exploration mode', true)
      await page.waitForTimeout(3500)
      await page.screenshot({ path: `${out}/02-explore-desktop.png` })
      await page.getByRole('button', { name: 'Introduction', exact: true }).click()
      await title.waitFor()
      check('return to introduction works', await title.isVisible())
    },
  },
  {
    id: 'explore-desktop',
    name: 'Landmarks, camera and controls (desktop)',
    viewport: desktop,
    async run({ page, base, check, out }) {
      await page.goto(base)
      await waitForScene(page)
      await enterExplore(page)
      await page.waitForTimeout(3000)
      const overview = await canvasShot(page)

      const list = page.getByRole('navigation', { name: 'Landmarks' })
      let previous = overview
      for (const [i, term] of LANDMARK_TERMS.entries()) {
        await list.getByRole('button', { name: new RegExp(`^${term}`) }).click()
        await page.waitForTimeout(3200)
        const titleText = await panelTitle(page).textContent()
        const pressed = await list.locator('[aria-pressed="true"]').count()
        const shot = await canvasShot(page)
        const d = await diff(page, shot, previous)
        check(`select "${term}": panel, highlight state and camera update`, titleText === term && pressed >= 1 && d > CHANGED, `Δ${d.toFixed(1)}`)
        previous = shot
        await page.screenshot({ path: `${out}/10-landmark-${i + 1}.png` })
      }

      await a11y(page, check, 'explore + landmark panel')

      // Panel sequence controls, close button and Escape
      await page.getByRole('navigation', { name: 'Landmark sequence' }).getByRole('button', { name: /Gopuram/ }).click()
      check('next button wraps to the first landmark', (await panelTitle(page).textContent()) === 'Gopuram')
      await page.getByRole('button', { name: 'Close landmark panel' }).click()
      check('close button hides the panel', (await panelTitle(page).count()) === 0)
      await list.getByRole('button', { name: /Mandapa/ }).click()
      await page.keyboard.press('Escape')
      check('Escape hides the panel', (await panelTitle(page).count()) === 0)

      // 3D hotspot marker (DOM button anchored in the scene)
      await page.getByRole('button', { name: 'Vimana — Tower over the sanctum' }).click()
      check('hotspot marker selects its landmark', (await panelTitle(page).textContent()) === 'Vimana')

      // Reset returns to the overview and clears the selection
      await page.getByRole('button', { name: 'Reset view' }).click()
      await page.waitForTimeout(3200)
      check('reset clears selection', (await panelTitle(page).count()) === 0)
      const afterReset = await canvasShot(page)

      // Mouse orbit, zoom and pan
      const box = await page.locator('canvas').boundingBox()
      const cx = box.x + box.width / 2
      const cy = box.y + box.height / 2
      await page.mouse.move(cx, cy)
      await page.mouse.down()
      await page.mouse.move(cx + 220, cy + 30, { steps: 12 })
      await page.mouse.up()
      await page.waitForTimeout(800)
      const orbited = await canvasShot(page)
      const dOrbit = await diff(page, orbited, afterReset)
      check('mouse drag orbits the camera', dOrbit > CHANGED, `Δ${dOrbit.toFixed(1)}`)
      await page.mouse.wheel(0, -600)
      await page.waitForTimeout(1200)
      const zoomed = await canvasShot(page)
      const dZoom = await diff(page, zoomed, orbited)
      check('mouse wheel zooms', dZoom > CHANGED, `Δ${dZoom.toFixed(1)}`)
      await page.mouse.move(cx, cy)
      await page.mouse.down({ button: 'right' })
      await page.mouse.move(cx - 150, cy, { steps: 10 })
      await page.mouse.up({ button: 'right' })
      await page.waitForTimeout(800)
      const dPan = await diff(page, await canvasShot(page), zoomed)
      check('right-drag pans', dPan > CHANGED, `Δ${dPan.toFixed(1)}`)
      await page.screenshot({ path: `${out}/11-free-orbit.png` })

      await page.getByRole('button', { name: 'Reset view' }).click()
      await page.waitForTimeout(3500)
      const reset2 = await canvasShot(page)
      const dReset = await diff(page, reset2, afterReset)
      check('reset returns to the overview pose', dReset < SAME, `Δ${dReset.toFixed(2)} vs first reset`)

      // Keyboard orbit when the canvas is focused
      await page.locator('canvas').focus()
      await page.keyboard.press('ArrowLeft')
      await page.keyboard.press('ArrowLeft')
      await page.waitForTimeout(1500)
      const dKey = await diff(page, await canvasShot(page), reset2)
      check('arrow keys orbit when the 3D view is focused', dKey > CHANGED, `Δ${dKey.toFixed(1)}`)

      // Clicking the model itself selects the landmark under the cursor (gateway tower, right of centre)
      await page.getByRole('button', { name: 'Reset view' }).click()
      await page.waitForTimeout(3500)
      await page.mouse.click(1075, 430)
      await page.waitForTimeout(500)
      check('clicking the 3D gopuram selects it', (await panelTitle(page).textContent().catch(() => null)) === 'Gopuram')
    },
  },
  {
    id: 'landing-mobile',
    name: 'Mobile layout and touch',
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

      const chips = page.getByRole('navigation', { name: 'Landmarks' })
      await chips.getByRole('button', { name: /Vimana/ }).tap()
      await page.waitForTimeout(3200)
      check('tapping a landmark chip opens its panel', (await panelTitle(page).textContent()) === 'Vimana')
      const panel = await page.getByRole('complementary').boundingBox()
      const strip = await chips.boundingBox()
      check('panel does not cover the landmark strip', panel.y + panel.height <= strip.y + 1, `${panel.y + panel.height} ≤ ${strip.y}`)
      check('panel leaves the upper scene visible', panel.y > mobile.height * 0.35, `panel top ${Math.round(panel.y)}px`)
      await page.screenshot({ path: `${out}/12-panel-mobile.png` })
      await a11y(page, check, 'mobile panel')
      const touchTargets = await page.$$eval('button', (els) =>
        els.filter((e) => e.offsetParent).map((e) => e.getBoundingClientRect()).filter((r) => r.height < 44 || r.width < 44).length,
      )
      check('all visible buttons are ≥44px touch targets', touchTargets === 0, `${touchTargets} undersized`)
      await page.getByRole('button', { name: 'Close landmark panel' }).tap()
      check('panel closes by touch', (await panelTitle(page).count()) === 0)
    },
  },
  ...[
    { id: 'tablet-portrait', viewport: { width: 820, height: 1180 } },
    { id: 'tablet-landscape', viewport: { width: 1180, height: 820 } },
  ].map(({ id, viewport }) => ({
    id,
    name: `Tablet ${viewport.width}×${viewport.height}`,
    viewport,
    context: { hasTouch: true },
    async run({ page, base, check, out }) {
      await page.goto(base)
      await waitForScene(page)
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)
      check('no horizontal overflow', !overflow)
      await page.waitForTimeout(2000)
      await page.screenshot({ path: `${out}/20-${id}-landing.png` })
      await enterExplore(page)
      await page.getByRole('navigation', { name: 'Landmarks' }).getByRole('button', { name: /^Gopuram/ }).click()
      await page.waitForTimeout(3200)
      check('landmark panel opens', (await panelTitle(page).textContent()) === 'Gopuram')
      const panel = await page.getByRole('complementary').boundingBox()
      check('panel fits in the viewport', panel.y >= 0 && panel.y + panel.height <= viewport.height && panel.x >= 0 && panel.x + panel.width <= viewport.width)
      await page.screenshot({ path: `${out}/21-${id}-panel.png` })
    },
  })),
  {
    id: 'reduced-motion',
    name: 'Reduced motion',
    viewport: desktop,
    context: { reducedMotion: 'reduce' },
    async run({ page, base, check }) {
      await page.goto(base)
      await waitForScene(page)
      await page.waitForTimeout(2000)
      const a = await canvasShot(page)
      await page.waitForTimeout(1200)
      const dSway = await diff(page, a, await canvasShot(page))
      check('landing camera sway is disabled', dSway < SAME, `Δ${dSway.toFixed(2)}`)
      await enterExplore(page)
      await page.getByRole('navigation', { name: 'Landmarks' }).getByRole('button', { name: /Mandapa/ }).click()
      await page.waitForTimeout(400)
      const b = await canvasShot(page)
      await page.waitForTimeout(1500)
      const dJump = await diff(page, b, await canvasShot(page))
      check('camera focus jumps without a long transition', dJump < SAME, `Δ${dJump.toFixed(2)} between 0.4s and 1.9s`)
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
      const poster = page.getByRole('img', { name: /Still image of the 3D temple model/ })
      await poster.waitFor()
      const posterWidth = await poster.evaluate((img) => img.complete && img.naturalWidth)
      check('still poster of the model is shown instead', posterWidth > 0, `naturalWidth ${posterWidth}`)
      await enterExplore(page)
      check('fallback notice explains 3D is unavailable', await page.getByText('3D unavailable').isVisible())
      await page.screenshot({ path: `${out}/06-no-webgl.png` })
      await page.getByRole('navigation', { name: 'Landmarks' }).getByRole('button', { name: /Pushkarini/ }).click()
      check('landmark descriptions still readable without WebGL', (await panelTitle(page).textContent()) === 'Pushkarini')
    },
  },
]
