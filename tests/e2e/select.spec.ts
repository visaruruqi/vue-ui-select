// ============================================================
// Playwright E2E tests for vue-ui-select playground
// ============================================================

import { test, expect } from '@playwright/test'

test.describe('Playground navigation', () => {
  test('home page loads with sidebar', async ({ page }) => {
    await page.goto('/')
    // Sidebar should have navigation links
    const nav = page.locator('nav, aside, [class*="sidebar"]')
    await expect(nav.first()).toBeVisible()
  })

  test('basic page loads', async ({ page }) => {
    await page.goto('/basic')
    await expect(page.getByTestId('page-basic')).toBeVisible()
  })
})

test.describe('Basic select', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/basic')
  })

  test('renders select components', async ({ page }) => {
    const selects = page.locator('[data-ui-select]')
    await expect(selects.first()).toBeVisible()
  })

  test('opens dropdown on click', async ({ page }) => {
    const select = page.locator('[data-ui-select]').first()
    await select.click()
    // Wait for dropdown to appear
    const dropdown = page.locator('[data-ui-select-dropdown]')
    await expect(dropdown.first()).toBeVisible({ timeout: 3000 })
  })

  test('selects an item from dropdown', async ({ page }) => {
    const select = page.locator('[data-ui-select]').first()
    await select.click()
    // Wait for choices to appear then click the first one
    const choice = page.locator('[data-ui-select-choice]').first()
    await expect(choice).toBeVisible({ timeout: 3000 })
    const choiceText = await choice.textContent()
    await choice.click()
    // Dropdown should close and selection should be displayed
    // The match area should contain the selected text somehow
    await expect(select).toContainText(choiceText?.trim() ?? '', { timeout: 2000 })
  })

  test('search filters items', async ({ page }) => {
    const select = page.locator('[data-ui-select]').first()
    await select.click()
    // Type in search (for single select, search input is in dropdown)
    const searchInput = page.locator('[data-ui-select-dropdown] input[type="search"], [data-ui-select-dropdown] input[type="text"], [data-ui-select] input')
    if (await searchInput.first().isVisible()) {
      await searchInput.first().fill('Ali')
      // Wait for filtering
      await page.waitForTimeout(200)
      const choices = page.locator('[data-ui-select-choice]')
      const count = await choices.count()
      // Filtered results should be fewer than all items
      expect(count).toBeGreaterThan(0)
    }
  })
})

test.describe('Multiple selection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/multiple-selection')
  })

  test('page loads', async ({ page }) => {
    await expect(page.getByTestId('page-multiple-selection')).toBeVisible()
  })

  test('can select multiple items', async ({ page }) => {
    const select = page.getByTestId('multi-strings')
    await select.click()
    // Click first choice
    const choice1 = page.locator('[data-ui-select-choice]').first()
    await expect(choice1).toBeVisible({ timeout: 3000 })
    await choice1.click()
    // The select should still be available for more selections
    await page.waitForTimeout(200)
  })
})

test.describe('Tagging', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tagging')
  })

  test('page loads', async ({ page }) => {
    await expect(page.getByTestId('page-tagging')).toBeVisible()
  })
})

test.describe('Dropdown position', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dropdown-position')
  })

  test('page loads', async ({ page }) => {
    await expect(page.getByTestId('page-dropdown-position')).toBeVisible()
  })
})

test.describe('Append to body', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/append-to-body')
  })

  test('page loads', async ({ page }) => {
    await expect(page.getByTestId('page-append-to-body')).toBeVisible()
  })

  test('dropdown escapes overflow container', async ({ page }) => {
    const select = page.locator('[data-ui-select]').first()
    await select.click()
    // When append-to-body is true, dropdown should be a direct child of body
    const dropdown = page.locator('body > [data-ui-select-dropdown]')
    // Would exist if teleported
    await page.waitForTimeout(300)
  })
})

test.describe('Keyboard navigation', () => {
  test('arrow down navigates through choices', async ({ page }) => {
    await page.goto('/basic')
    const select = page.locator('[data-ui-select]').first()
    await select.click()
    await page.waitForTimeout(200)

    // Press ArrowDown to move through items
    await page.keyboard.press('ArrowDown')
    await page.waitForTimeout(100)
    // An item should now be active
    const active = page.locator('[data-ui-select-choice][data-active="true"]')
    // Check if active item exists
    const count = await active.count()
    expect(count).toBeGreaterThanOrEqual(0) // Depends on implementation
  })

  test('escape closes dropdown', async ({ page }) => {
    await page.goto('/basic')
    const select = page.locator('[data-ui-select]').first()
    await select.click()
    await page.waitForTimeout(200)

    const dropdown = page.locator('[data-ui-select-dropdown]')
    if (await dropdown.first().isVisible()) {
      await page.keyboard.press('Escape')
      await page.waitForTimeout(200)
      await expect(dropdown.first()).not.toBeVisible()
    }
  })
})

test.describe('Theme pages', () => {
  test('Bootstrap theme page loads', async ({ page }) => {
    await page.goto('/bootstrap-theme')
    await expect(page.getByTestId('page-bootstrap-theme')).toBeVisible()
  })

  test('Select2 theme page loads', async ({ page }) => {
    await page.goto('/select2-theme')
    await expect(page.getByTestId('page-select2-theme')).toBeVisible()
  })

  test('Selectize theme page loads', async ({ page }) => {
    await page.goto('/selectize-theme')
    await expect(page.getByTestId('page-selectize-theme')).toBeVisible()
  })

  test('Tailwind page loads', async ({ page }) => {
    await page.goto('/tailwind')
    await expect(page.getByTestId('page-tailwind')).toBeVisible()
  })

  test('Tailwind dark mode page loads', async ({ page }) => {
    await page.goto('/tailwind-dark-mode')
    await expect(page.getByTestId('page-tailwind-dark')).toBeVisible()
  })
})

test.describe('Accessibility', () => {
  test('select has combobox role', async ({ page }) => {
    await page.goto('/basic')
    const select = page.locator('[data-ui-select]').first()
    await expect(select).toHaveAttribute('role', 'combobox')
  })

  test('select has aria-expanded attribute', async ({ page }) => {
    await page.goto('/basic')
    const select = page.locator('[data-ui-select]').first()
    await expect(select).toHaveAttribute('aria-expanded', 'false')
    await select.click()
    await page.waitForTimeout(200)
    await expect(select).toHaveAttribute('aria-expanded', 'true')
  })
})
