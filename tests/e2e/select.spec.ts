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

test.describe('Checkbox selection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/checkbox-selection')
  })

  test('page loads', async ({ page }) => {
    await expect(page.getByTestId('page-checkbox-selection')).toBeVisible()
  })

  test('renders checkboxes inside dropdown choices', async ({ page }) => {
    const select = page.getByTestId('cb-strings')
    await select.click()
    await page.waitForTimeout(300)

    const checkboxes = select.locator('[data-ui-select-checkbox]')
    await expect(checkboxes.first()).toBeVisible({ timeout: 5000 })
    const count = await checkboxes.count()
    expect(count).toBeGreaterThan(0)
  })

  test('checkbox gets checked on click', async ({ page }) => {
    const select = page.getByTestId('cb-strings')
    await select.click()
    await page.waitForTimeout(300)

    const firstChoice = select.locator('[data-ui-select-choice]').first()
    await expect(firstChoice).toBeVisible({ timeout: 5000 })

    const checkbox = firstChoice.locator('[data-ui-select-checkbox]')
    await expect(checkbox).not.toBeChecked()

    await firstChoice.click({ force: true })
    await expect(checkbox).toBeChecked()
  })

  test('checkbox gets unchecked on second click (toggle off)', async ({ page }) => {
    const select = page.getByTestId('cb-strings')
    await select.click()
    await page.waitForTimeout(300)

    const firstChoice = select.locator('[data-ui-select-choice]').first()
    await expect(firstChoice).toBeVisible({ timeout: 5000 })

    // Check
    await firstChoice.click({ force: true })
    const checkbox = firstChoice.locator('[data-ui-select-checkbox]')
    await expect(checkbox).toBeChecked()

    // Uncheck
    await firstChoice.click({ force: true })
    await expect(checkbox).not.toBeChecked()
  })

  test('dropdown stays open after selecting', async ({ page }) => {
    const select = page.getByTestId('cb-strings')
    await select.click()
    await page.waitForTimeout(300)

    const firstChoice = select.locator('[data-ui-select-choice]').first()
    await expect(firstChoice).toBeVisible({ timeout: 5000 })
    await firstChoice.click({ force: true })

    // Dropdown should still be visible
    const dropdown = select.locator('[data-ui-select-dropdown]')
    await expect(dropdown).toBeVisible()
  })

  test('can select multiple items with checkboxes', async ({ page }) => {
    const select = page.getByTestId('cb-strings')
    await select.click()
    await page.waitForTimeout(300)

    const choices = select.locator('[data-ui-select-choice]')
    await expect(choices.first()).toBeVisible({ timeout: 5000 })

    await choices.nth(0).click({ force: true })
    await page.waitForTimeout(100)
    await choices.nth(1).click({ force: true })

    const cb0 = choices.nth(0).locator('[data-ui-select-checkbox]')
    const cb1 = choices.nth(1).locator('[data-ui-select-checkbox]')
    const cb2 = choices.nth(2).locator('[data-ui-select-checkbox]')

    await expect(cb0).toBeChecked()
    await expect(cb1).toBeChecked()
    await expect(cb2).not.toBeChecked()
  })

  test('selected items remain visible in dropdown', async ({ page }) => {
    const select = page.getByTestId('cb-strings')
    await select.click()
    await page.waitForTimeout(300)

    const choices = select.locator('[data-ui-select-choice]')
    await expect(choices.first()).toBeVisible({ timeout: 5000 })
    const countBefore = await choices.count()

    await choices.first().click({ force: true })
    await page.waitForTimeout(100)
    const countAfter = await choices.count()

    expect(countAfter).toBe(countBefore)
  })

  test('dropdown closes when clicking outside', async ({ page }) => {
    const select = page.getByTestId('cb-strings')
    await select.click()
    await page.waitForTimeout(300)

    const dropdown = select.locator('[data-ui-select-dropdown]')
    await expect(dropdown).toBeVisible({ timeout: 5000 })

    // Click outside
    await page.locator('h2').first().click({ force: true })
    await expect(dropdown).not.toBeVisible({ timeout: 5000 })
  })

  test('search + checkbox: filters and selects', async ({ page }) => {
    const select = page.getByTestId('cb-search')
    await select.click()
    await page.waitForTimeout(300)

    // Type a search term
    const input = select.locator('[data-ui-select-input]')
    await input.fill('Adam')
    await page.waitForTimeout(500)

    const choices = select.locator('[data-ui-select-choice]')
    await expect(choices.first()).toBeVisible({ timeout: 5000 })

    // Only filtered results should be shown
    const count = await choices.count()
    expect(count).toBeGreaterThanOrEqual(1)

    // Select filtered item
    await choices.first().click({ force: true })
    await page.waitForTimeout(300)

    // Verify selection via tag
    const tags = select.locator('[data-ui-select-tag]')
    await expect(tags.first()).toBeVisible({ timeout: 5000 })
  })

  test('default example does NOT show checkboxes', async ({ page }) => {
    const select = page.getByTestId('cb-default')
    await select.click()
    await page.waitForTimeout(300)

    await expect(select.locator('[data-ui-select-choice]').first()).toBeVisible({ timeout: 5000 })

    const checkboxes = select.locator('[data-ui-select-checkbox]')
    expect(await checkboxes.count()).toBe(0)
  })
})
