import { test, expect } from '@playwright/test'

test('search box is focused on page load', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('input[type="search"]')).toBeFocused()
})
