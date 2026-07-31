// ============================================================
// Playwright E2E — wheel scroll chaining out of a teleported dropdown
//
// These use page.mouse.wheel(), which dispatches TRUSTED wheel events and lets
// the browser do its own scrolling. That is the difference from the unit tests:
// they can only prove the handler's decisions, not that a real wheel ends up
// moving the right element.
// ============================================================

import { test, expect, type Page } from '@playwright/test'

const SCROLLER = '[data-testid="scroll-container"]'
const SELECT = '[data-testid="chaining-select"]'
const CHOICES = '.ui-select-choices'

async function scrollTopOf(page: Page, selector: string) {
  return page.locator(selector).evaluate((el) => el.scrollTop)
}

async function openDropdown(page: Page) {
  await page.locator(`${SELECT} .ui-select-match`).click()
  await expect(page.locator(CHOICES)).toBeVisible()
}

/** Park the pointer over the middle of the open dropdown. */
async function hoverDropdown(page: Page) {
  const box = await page.locator(CHOICES).boundingBox()
  if (!box) throw new Error('dropdown has no bounding box')
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
}

test.describe('Wheel scroll chaining from a teleported dropdown', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/scroll-chaining')
    await expect(page.getByTestId('page-scroll-chaining')).toBeVisible()
  })

  test('the dropdown really is teleported out of the scroll container', async ({ page }) => {
    await openDropdown(page)

    const isOutside = await page.evaluate(() => {
      const scroller = document.querySelector('[data-testid="scroll-container"]')!
      const choices = document.querySelector('.ui-select-choices')!
      return !scroller.contains(choices)
    })

    // If this ever becomes false the bug this suite guards is gone by other means.
    expect(isOutside).toBe(true)
  })

  test('wheel scrolls the choices list while it still has room', async ({ page }) => {
    await openDropdown(page)
    await hoverDropdown(page)

    const pageBefore = await scrollTopOf(page, SCROLLER)
    await page.mouse.wheel(0, 120)
    await page.waitForTimeout(250)

    expect(await scrollTopOf(page, CHOICES)).toBeGreaterThan(0)
    // The container must not move while the list can still absorb the scroll.
    expect(await scrollTopOf(page, SCROLLER)).toBe(pageBefore)
  })

  test('wheel scrolls the app container once the choices list is exhausted', async ({ page }) => {
    await openDropdown(page)

    // Drive the list to its end first.
    await page.locator(CHOICES).evaluate((el) => {
      el.scrollTop = el.scrollHeight
    })
    await page.waitForTimeout(250)

    const listMax = await page
      .locator(CHOICES)
      .evaluate((el) => el.scrollHeight - el.clientHeight)
    expect(await scrollTopOf(page, CHOICES)).toBeGreaterThanOrEqual(listMax - 2)

    await hoverDropdown(page)
    const pageBefore = await scrollTopOf(page, SCROLLER)

    await page.mouse.wheel(0, 200)
    await page.waitForTimeout(250)

    // This is the regression: it used to stay put because the scroll chained to
    // <body>, which the app shell holds at overflow:hidden.
    expect(await scrollTopOf(page, SCROLLER)).toBeGreaterThan(pageBefore)
  })

  test('scrolling up out of the top of the list also reaches the app container', async ({
    page,
  }) => {
    // Open first: focusing the select scrolls it back into view, which would
    // undo any scrolling done beforehand.
    await openDropdown(page)

    // Give the container somewhere to scroll back from.
    await page.locator(SCROLLER).evaluate((el) => {
      el.scrollTop = 150
    })
    await page.waitForTimeout(200)

    await hoverDropdown(page)

    const pageBefore = await scrollTopOf(page, SCROLLER)
    expect(pageBefore).toBeGreaterThan(0)
    expect(await scrollTopOf(page, CHOICES)).toBe(0) // list already at its top

    await page.mouse.wheel(0, -200)
    await page.waitForTimeout(250)

    expect(await scrollTopOf(page, SCROLLER)).toBeLessThan(pageBefore)
  })

  test('the container still scrolls normally with the dropdown closed', async ({ page }) => {
    const box = await page.locator(SCROLLER).boundingBox()
    if (!box) throw new Error('scroll container has no bounding box')
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)

    await page.mouse.wheel(0, 150)
    await page.waitForTimeout(250)

    expect(await scrollTopOf(page, SCROLLER)).toBeGreaterThan(0)
  })
})

// ============================================================
// Opening a teleported searchable dropdown focuses its search input. The browser's
// default focus behaviour scrolls to reveal it, and because the input can sit far
// down the document that throws the window to the bottom — the header goes out of
// sight and, before the wheel bridge above, could not be scrolled back to.
// ============================================================
test.describe('Focus on open must not scroll the window', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/focus-scroll')
    await expect(page.getByTestId('page-focus-scroll')).toBeVisible()
  })

  test('window stays put when the dropdown opens', async ({ page }) => {
    // Centre the select so Playwright's own scroll-into-view before a click
    // cannot be mistaken for the jump under test.
    await page
      .locator('[data-testid="focus-scroll-select"]')
      .evaluate((el) => el.scrollIntoView({ block: 'center' }))
    await page.waitForTimeout(250)

    const before = await page.evaluate(() => Math.round(window.scrollY))
    const range = await page.evaluate(
      () => document.documentElement.scrollHeight - window.innerHeight,
    )
    expect(range).toBeGreaterThan(0) // the window really can scroll

    await page.locator('[data-testid="focus-scroll-select"] .ui-select-match').click()
    await expect(page.locator('.ui-select-choices')).toBeVisible()
    await page.waitForTimeout(350)

    expect(await page.evaluate(() => Math.round(window.scrollY))).toBe(before)
  })

  test('the search input is still focused, just without the scroll', async ({ page }) => {
    await page
      .locator('[data-testid="focus-scroll-select"]')
      .evaluate((el) => el.scrollIntoView({ block: 'center' }))
    await page.waitForTimeout(250)

    await page.locator('[data-testid="focus-scroll-select"] .ui-select-match').click()
    await expect(page.locator('.ui-select-choices')).toBeVisible()

    const focusedClass = await page.evaluate(() => document.activeElement?.className ?? '')
    expect(focusedClass).toContain('ui-select')
  })
})
