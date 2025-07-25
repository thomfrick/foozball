// ABOUTME: Basic end-to-end navigation tests
// ABOUTME: Tests fundamental app navigation and routing without complex API interactions

import { test, expect } from '@playwright/test'

test.describe('Basic Navigation E2E', () => {
  test('should load home page', async ({ page }) => {
    // Navigate to home page
    await page.goto('/')

    // Should show welcome message
    await expect(page.getByText('🏓 Foosball ELO Tracker')).toBeVisible()
  })

  test('should navigate to players page', async ({ page }) => {
    await page.goto('/')

    // Navigate to Players page
    await page.getByRole('link', { name: /players/i }).click()
    await expect(page.getByText('Player Management')).toBeVisible()
  })

  // Test API connectivity
  test('API should be reachable', async ({ request }) => {
    const response = await request.get('http://localhost:8000/health')
    expect(response.ok()).toBeTruthy()
    const body = await response.json()
    expect(body.status).toBe('healthy')
    expect(body.service).toBe('foosball-api')
  })
})
