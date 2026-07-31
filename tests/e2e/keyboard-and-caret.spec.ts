// ============================================================
// Real-browser regression tests for the keyboard/focus/caret audit fixes.
// jsdom cannot verify these: tab order, focus falling to <body> across a
// teleport unmount, and the caret/word-selection defaults of mousedown.
// ============================================================

import { test, expect } from '@playwright/test'

const SELECT = '[data-testid="basic-select"]'

test.describe('Keyboard reachability and focus return (single + search)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/basic')
    await expect(page.getByTestId('page-basic')).toBeVisible()
  })

  test('root is in the tab order', async ({ page }) => {
    await expect(page.locator(SELECT)).toHaveAttribute('tabindex', '0')
  })

  test('ArrowDown on the focused root opens; Escape returns focus to the root', async ({ page }) => {
    const root = page.locator(SELECT)
    await root.focus()
    await page.keyboard.press('ArrowDown')
    await expect(page.locator('.ui-select__dropdown').first()).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(page.locator('.ui-select__dropdown')).toHaveCount(0)

    const focusIsOnRoot = await root.evaluate((el) => document.activeElement === el)
    expect(focusIsOnRoot).toBe(true) // used to fall to <body>
  })

  test('selecting with Enter also returns focus to the root', async ({ page }) => {
    const root = page.locator(SELECT)
    await root.focus()
    await page.keyboard.press('ArrowDown') // open + highlight first
    await expect(page.locator('.ui-select__dropdown').first()).toBeVisible()
    await page.keyboard.press('Enter')
    await expect(page.locator('.ui-select__dropdown')).toHaveCount(0)

    const focusIsOnRoot = await root.evaluate((el) => document.activeElement === el)
    expect(focusIsOnRoot).toBe(true)
  })
})

test.describe('Search-box text editing defaults', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/basic')
    await expect(page.getByTestId('page-basic')).toBeVisible()
  })

  test('double-click selects a word in the search box', async ({ page }) => {
    await page.locator(`${SELECT} .ui-select-match`).click()
    const input = page.locator('.ui-select__input').first()
    await expect(input).toBeVisible()
    await input.fill('hello world')

    // Word-select is a mousedown default action; the old dropdown-wide
    // mousedown.prevent suppressed it, freezing the caret entirely.
    const box = await input.boundingBox()
    if (!box) throw new Error('input has no box')
    await page.mouse.dblclick(box.x + 20, box.y + box.height / 2)

    const selection = await input.evaluate((el: HTMLInputElement) => ({
      start: el.selectionStart,
      end: el.selectionEnd,
    }))
    expect(selection.end! - selection.start!).toBeGreaterThan(0)
  })

  test('clicking mid-text moves the caret', async ({ page }) => {
    await page.locator(`${SELECT} .ui-select-match`).click()
    const input = page.locator('.ui-select__input').first()
    await input.fill('hello world')

    // fill() leaves the caret at the end — park it at 0 so only the CLICK can
    // move it; otherwise this test passes even with the mousedown swallowed.
    await input.evaluate((el: HTMLInputElement) => el.setSelectionRange(0, 0))

    const box = await input.boundingBox()
    if (!box) throw new Error('input has no box')
    // Click near the text's end — far past the first character.
    await page.mouse.click(box.x + 60, box.y + box.height / 2)

    const caret = await input.evaluate((el: HTMLInputElement) => el.selectionStart)
    expect(caret).toBeGreaterThan(0) // used to stay wherever it was
  })
})
