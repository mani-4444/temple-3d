// Scenarios for scripts/smoke.mjs. Each scenario gets a fresh browser context.

const desktop = { width: 1440, height: 900 }
const mobile = { width: 390, height: 844 }

export const scenarios = [
  {
    id: 'landing-desktop',
    name: 'Landing (desktop)',
    viewport: desktop,
    async run({ page, base, check, out }) {
      await page.goto(base)
      const title = page.getByRole('heading', { level: 1, name: 'Sanatan' })
      await title.waitFor()
      check('hero heading visible', await title.isVisible())
      await page.screenshot({ path: `${out}/01-landing-desktop.png` })

      // Keyboard: first Tab stops land on real controls with visible focus.
      await page.keyboard.press('Tab')
      const focused = await page.evaluate(() => document.activeElement?.textContent?.trim() ?? '')
      check('Tab focuses a header control', focused.includes('Sanatan'), focused)
      const outline = await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle)
      check('focus ring visible', outline !== 'none', outline)

      // About dialog opens and closes with Escape.
      await page.getByRole('button', { name: 'About & credits' }).click()
      const dialog = page.getByRole('dialog', { name: 'Sanatan' })
      check('about dialog opens', await dialog.isVisible())
      await page.keyboard.press('Escape')
      await page.waitForTimeout(100)
      check('about dialog closes on Escape', !(await dialog.isVisible()))

      // CTA changes mode.
      await page.getByRole('button', { name: 'Explore the temple' }).click()
      await page.getByRole('region', { name: 'Exploration' }).waitFor()
      check('CTA enters exploration mode', true)
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
      await page.screenshot({ path: `${out}/03-landing-mobile.png` })
      await cta.tap()
      await page.getByRole('region', { name: 'Exploration' }).waitFor()
      check('CTA works by touch', true)
    },
  },
]
