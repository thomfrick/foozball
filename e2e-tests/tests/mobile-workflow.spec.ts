// ABOUTME: End-to-end tests for mobile game recording workflow
// ABOUTME: Tests the application on mobile devices and touch interactions

import { test, expect, devices } from '@playwright/test'

test.describe('Mobile Game Recording Workflow', () => {
  test.use({ ...devices['iPhone 12'] })

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('mobile navigation works correctly', async ({ page }) => {
    // Should render mobile layout
    await expect(page.locator('h2:has-text("Record Game")')).toBeVisible()

    // Test mobile navigation
    const navLink = page.getByRole('link', { name: /players/i })
    await navLink.click()

    await expect(page).toHaveURL('/players')
    await expect(page.getByText('Player Management')).toBeVisible()

    // Navigate back home
    await page.getByRole('link', { name: /home/i }).click()
    await expect(page).toHaveURL('/')
  })

  test('touch interactions work for game recording', async ({ page }) => {
    // Ensure we have the game recording form
    await expect(page.locator('h2:has-text("Record Game")')).toBeVisible()

    // Test touch interactions on dropdowns
    await page.locator('#player1').tap()
    await page.selectOption('#player1', { index: 1 })

    await page.locator('#player2').tap()
    await page.selectOption('#player2', { index: 1 })

    await page.locator('#winner').tap()
    await page.selectOption('#winner', { index: 1 })

    // Test touch on submit button
    const submitButton = page.locator('button:has-text("Record Game")')
    await submitButton.tap()

    // Should submit successfully
    await expect(page.locator('#player1')).toHaveValue('0', { timeout: 5000 })
  })

  test('mobile form elements are appropriately sized', async ({ page }) => {
    await expect(page.locator('h2:has-text("Record Game")')).toBeVisible()

    // Check that form elements have touch-friendly sizes
    const player1Select = page.locator('#player1')
    const player2Select = page.locator('#player2')
    const winnerSelect = page.locator('#winner')
    const submitButton = page.locator('button:has-text("Record Game")')

    // Get bounding boxes to check sizes
    const player1Box = await player1Select.boundingBox()
    const player2Box = await player2Select.boundingBox()
    const winnerBox = await winnerSelect.boundingBox()
    const submitBox = await submitButton.boundingBox()

    // Touch targets should be at least 44px (iOS) or 48px (Android) for accessibility
    const minTouchSize = 44

    expect(player1Box?.height).toBeGreaterThanOrEqual(minTouchSize)
    expect(player2Box?.height).toBeGreaterThanOrEqual(minTouchSize)
    expect(winnerBox?.height).toBeGreaterThanOrEqual(minTouchSize)
    expect(submitBox?.height).toBeGreaterThanOrEqual(minTouchSize)
  })

  test('mobile viewport displays content without horizontal scroll', async ({ page }) => {
    // Check that content fits within mobile viewport
    const viewportSize = page.viewportSize()
    expect(viewportSize?.width).toBeLessThanOrEqual(390) // iPhone 12 width

    // Navigate to different pages and check for horizontal overflow
    await page.goto('/')
    let documentWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    expect(documentWidth).toBeLessThanOrEqual(viewportSize?.width || 390)

    await page.goto('/players')
    await expect(page.getByText('Player Management')).toBeVisible()
    documentWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    expect(documentWidth).toBeLessThanOrEqual(viewportSize?.width || 390)

    await page.goto('/about')
    documentWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    expect(documentWidth).toBeLessThanOrEqual(viewportSize?.width || 390)
  })

  test('mobile player management works correctly', async ({ page }) => {
    // Navigate to players page
    await page.goto('/players')
    await expect(page.getByText('Player Management')).toBeVisible()

    // Test adding a player on mobile
    await page.getByRole('button', { name: /add.*player/i }).tap()
    await expect(page.getByText('Add New Player')).toBeVisible()

    // Fill form with touch interactions
    const nameInput = page.getByLabel(/name/i)
    const emailInput = page.getByLabel(/email/i)

    await nameInput.tap()
    await nameInput.fill('Mobile Test Player')

    await emailInput.tap()
    await emailInput.fill('mobile@test.com')

    // Submit with tap
    await page.getByRole('button', { name: /create player/i }).tap()

    // Should close modal and show new player
    await expect(page.getByText('Add New Player')).not.toBeVisible()
    await expect(page.getByText('Mobile Test Player')).toBeVisible()
  })

  test('mobile game history is readable and scrollable', async ({ page }) => {
    await page.goto('/')

    // Should show recent games section
    await expect(page.locator('h3:has-text("Recent Games")')).toBeVisible()

    const recentGamesList = page.locator('[data-testid="recent-games-list"], .recent-games')
    await expect(recentGamesList).toBeVisible()

    // Check if games are displayed
    const gameEntries = page.locator('[data-testid="game-entry"], .game-entry, li').filter({ hasText: /vs|won|beat/ })
    const gameCount = await gameEntries.count()

    if (gameCount > 0) {
      // Test scrolling through games
      const firstGame = gameEntries.first()
      await firstGame.scrollIntoViewIfNeeded()
      await expect(firstGame).toBeVisible()

      // Games should be readable (text not too small)
      const gameText = await firstGame.textContent()
      expect(gameText).toBeTruthy()
      expect(gameText!.length).toBeGreaterThan(5) // Should have meaningful content
    }
  })

  test('mobile form validation messages are visible', async ({ page }) => {
    await expect(page.locator('h2:has-text("Record Game")')).toBeVisible()

    // Submit empty form to trigger validation
    await page.locator('button:has-text("Record Game")').tap()

    // Validation messages should be visible and readable on mobile
    const error1 = page.locator('text=Please select Player 1')
    const error2 = page.locator('text=Please select Player 2')
    const error3 = page.locator('text=Please select the winner')

    await expect(error1).toBeVisible()
    await expect(error2).toBeVisible()
    await expect(error3).toBeVisible()

    // Error messages should not be cut off or overlapping
    const error1Box = await error1.boundingBox()
    const error2Box = await error2.boundingBox()
    const error3Box = await error3.boundingBox()

    expect(error1Box?.y).toBeLessThan(error2Box?.y || 0)
    expect(error2Box?.y).toBeLessThan(error3Box?.y || 0)
  })

  test('mobile orientation change handling', async ({ page }) => {
    // Start in portrait mode (default for iPhone 12)
    await expect(page.locator('h2:has-text("Record Game")')).toBeVisible()

    // Simulate landscape orientation
    await page.setViewportSize({ width: 844, height: 390 })

    // Content should still be accessible
    await expect(page.locator('h2:has-text("Record Game")')).toBeVisible()

    // Form should still work in landscape
    await page.selectOption('#player1', { index: 1 })
    await page.selectOption('#player2', { index: 1 })
    await page.selectOption('#winner', { index: 1 })

    await page.locator('button:has-text("Record Game")').tap()

    // Should still submit successfully
    await expect(page.locator('#player1')).toHaveValue('0', { timeout: 5000 })

    // Return to portrait
    await page.setViewportSize({ width: 390, height: 844 })
    await expect(page.locator('h2:has-text("Record Game")')).toBeVisible()
  })
})

test.describe('Mobile Cross-Browser Testing', () => {
  test('works on mobile Safari simulation', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPhone 12'],
      // Safari-specific settings
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
    })

    const page = await context.newPage()
    await page.goto('/')

    // Test basic functionality
    await expect(page.locator('h2:has-text("Record Game")')).toBeVisible()

    // Test form interaction
    await page.selectOption('#player1', { index: 1 })
    const selectedValue = await page.locator('#player1').inputValue()
    expect(selectedValue).not.toBe('0')

    await context.close()
  })

  test('works on Android simulation', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['Pixel 5']
    })

    const page = await context.newPage()
    await page.goto('/')

    // Test basic functionality
    await expect(page.locator('h2:has-text("Record Game")')).toBeVisible()

    // Test navigation
    await page.getByRole('link', { name: /players/i }).click()
    await expect(page.getByText('Player Management')).toBeVisible()

    await context.close()
  })
})
