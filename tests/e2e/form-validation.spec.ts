// ============================================================
// E2E: oop-validator integration via DOM events + validator classes
//
// Verifies that v-required on <ui-select> behaves identically to
// v-required on a native <input>: classes flip, submit blocks, etc.
// ============================================================

import { test, expect } from '@playwright/test'

test.describe('Form Validation page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/form-validation')
    await expect(page.getByTestId('page-form-validation')).toBeVisible()
  })

  test('page renders all four required fields', async ({ page }) => {
    await expect(page.getByTestId('full-name-input')).toBeVisible()
    await expect(page.getByTestId('country-select')).toBeVisible()
    await expect(page.getByTestId('languages-select')).toBeVisible()
    await expect(page.getByTestId('account-type-select')).toBeVisible()
  })

  test('clicking outside an empty required ui-select marks it touched', async ({ page }) => {
    const country = page.getByTestId('country-select')
    await country.click()
    // Click outside (the form heading) to trigger blur on the widget
    await page.locator('h2').first().click()
    // The synthetic blur fires; oop-validator toggles v-touched
    await expect(country).toHaveClass(/v-touched/)
  })

  test('attempting submit on empty form marks all fields invalid', async ({ page }) => {
    await page.getByTestId('submit-button').click()
    // After v-submit, all required fields become $touched and $invalid
    const country = page.getByTestId('country-select')
    await expect(country).toHaveClass(/v-invalid/)
    await expect(country).toHaveClass(/v-touched/)
  })

  test('selecting a value clears v-invalid via the synthetic input event', async ({ page }) => {
    const country = page.getByTestId('country-select')
    await country.click()
    // Pick the first option
    const firstChoice = page.locator('[data-ui-select-choice]').first()
    await firstChoice.click()
    // After selection v-invalid should be gone (still v-touched/dirty though)
    await expect(country).not.toHaveClass(/v-invalid/)
    await expect(country).toHaveClass(/v-valid/)
  })

  test('multi-select v-required goes valid after one pick', async ({ page }) => {
    const langs = page.getByTestId('languages-select')
    await langs.click()
    await langs.locator('[data-ui-select-choice]').first().click()
    // remove-selected default true → first choice is replaced; close the dropdown
    await page.locator('h2').first().click()
    await expect(langs).toHaveClass(/v-touched/)
    await expect(langs).toHaveClass(/v-valid/)
  })

  test('picking a value emits synthetic input → field becomes valid', async ({ page }) => {
    const country = page.getByTestId('country-select')
    await country.click()
    await country.locator('[data-ui-select-choice]').first().click()
    // Single-select closes the dropdown automatically
    await expect(country).toHaveClass(/v-valid/)
    await expect(country).not.toHaveClass(/v-invalid/)
  })

  test('native input gets red border on submit when invalid', async ({ page }) => {
    // Click Submit in the second (custom-rule) form without touching anything.
    // The native email input must end up styled like the ui-select fields.
    await page.getByTestId('custom-submit-button').click()
    const email = page.getByTestId('custom-email-input')
    await expect(email).toHaveClass(/v-invalid/)
    await expect(email).toHaveClass(/v-touched/)
    // Computed style must be SOME shade of red (not the default gray).
    // We don't pin a specific palette here: when multiple themes are
    // loaded the last theme's color wins (documented behavior).
    const borderColor = await email.evaluate((el) => getComputedStyle(el).borderColor)
    expect(borderColor).toMatch(/^rgb\((22[02]|192),\s*(38|53|57),\s*(38|43|69)\)$/)
  })

  test('custom rule is scoped to ONE field, not the whole form', async ({ page }) => {
    // Pick a country in the custom form's Country select (single-select, v-required only).
    // Filling it must NOT cause `minSelections` to appear on countryId — that rule was
    // registered only against 'languages'.
    const country = page.getByTestId('custom-country-select')
    await country.click()
    await country.locator('[data-ui-select-choice]').first().click()
    await expect(country).toHaveClass(/v-valid/)
    await expect(country).not.toHaveClass(/v-invalid-minSelections/)

    // The languages field in the SAME form still has minSelections active.
    const langs = page.getByTestId('custom-languages-select')
    await langs.click()
    await langs.locator('[data-ui-select-choice]').first().click()
    await page.locator('h2').first().click()
    await expect(langs).toHaveClass(/v-invalid-minSelections/)
  })

  test('custom MinSelectionsRule: one pick fails, two picks pass', async ({ page }) => {
    const langs = page.getByTestId('custom-languages-select')

    // Pick exactly one — should still be invalid via custom rule
    await langs.click()
    await langs.locator('[data-ui-select-choice]').first().click()
    await page.locator('h2').first().click()  // blur to mark touched
    await expect(langs).toHaveClass(/v-touched/)
    await expect(langs).toHaveClass(/v-invalid/)
    await expect(langs).toHaveClass(/v-invalid-minSelections/)

    // Pick a second item — rule passes
    await langs.click()
    await langs.locator('[data-ui-select-choice]').first().click()
    await page.locator('h2').first().click()
    await expect(langs).toHaveClass(/v-valid/)
    await expect(langs).not.toHaveClass(/v-invalid-minSelections/)
  })
})
