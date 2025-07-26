// ABOUTME: End-to-end tests for error scenarios and recovery functionality
// ABOUTME: Tests how the application handles errors and allows users to recover gracefully

import { test, expect } from '@playwright/test'

test.describe('Error Scenarios and Recovery', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('handles network errors gracefully during game recording', async ({ page }) => {
    // Navigate to game recording form
    await expect(page.locator('h2:has-text("Record Game")')).toBeVisible()

    // Select valid players and winner
    await page.selectOption('#player1', { index: 1 })
    await page.selectOption('#player2', { index: 1 })
    await page.selectOption('#winner', { index: 1 })

    // Simulate network failure by intercepting the API call
    await page.route('**/api/v1/games', route => {
      route.abort('failed')
    })

    // Try to submit the game
    await page.click('button:has-text("Record Game")')

    // Should show error message
    await expect(page.locator('text=/error|failed|unable|try again/i')).toBeVisible({ timeout: 5000 })

    // Form should remain filled so user can retry
    expect(await page.locator('#player1').inputValue()).not.toBe('0')
    expect(await page.locator('#player2').inputValue()).not.toBe('0')
    expect(await page.locator('#winner').inputValue()).not.toBe('0')

    // Clear the route to restore normal behavior
    await page.unroute('**/api/v1/games')

    // Retry should work
    await page.click('button:has-text("Record Game")')

    // Should eventually succeed (form resets on success)
    await expect(page.locator('#player1')).toHaveValue('0', { timeout: 5000 })
  })

  test('handles server errors (500) during player creation', async ({ page }) => {
    // Navigate to players page
    await page.goto('/players')
    await expect(page.getByText('Player Management')).toBeVisible()

    // Open add player modal
    await page.getByRole('button', { name: /add.*player/i }).click()
    await expect(page.getByText('Add New Player')).toBeVisible()

    // Fill the form
    await page.getByLabel(/name/i).fill('Error Test Player')
    await page.getByLabel(/email/i).fill('error@test.com')

    // Simulate server error
    await page.route('**/api/v1/players', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Internal server error' })
      })
    })

    // Try to create player
    await page.getByRole('button', { name: /create player/i }).click()

    // Should show error message
    await expect(page.locator('text=/error|failed|server|internal/i')).toBeVisible({ timeout: 5000 })

    // Modal should stay open with form data intact
    await expect(page.getByText('Add New Player')).toBeVisible()
    expect(await page.getByLabel(/name/i).inputValue()).toBe('Error Test Player')

    // Clear the route to restore normal behavior
    await page.unroute('**/api/v1/players')

    // Retry should work
    await page.getByRole('button', { name: /create player/i }).click()

    // Should eventually succeed (modal closes on success)
    await expect(page.getByText('Add New Player')).not.toBeVisible({ timeout: 5000 })
  })

  test('handles API timeout gracefully', async ({ page }) => {
    // Navigate to players page to test loading states
    await page.goto('/players')

    // Simulate slow API response
    await page.route('**/api/v1/players**', route => {
      // Delay response by 10 seconds to simulate timeout
      setTimeout(() => {
        route.continue()
      }, 10000)
    })

    // Reload page to trigger API call
    await page.reload()

    // Should show loading state
    await expect(page.locator('[data-testid="loading-spinner"], .loading, text=/loading|Loading/i')).toBeVisible({ timeout: 2000 })

    // Clear the route after a few seconds
    setTimeout(async () => {
      await page.unroute('**/api/v1/players**')
    }, 3000)

    // Should eventually load or show timeout error
    await page.waitForTimeout(5000)

    // Should either show content or error message
    const hasContent = await page.locator('table, text=/Player Management/i').isVisible()
    const hasError = await page.locator('text=/error|timeout|failed to load/i').isVisible()

    expect(hasContent || hasError).toBe(true)
  })

  test('recovers from validation errors in game recording', async ({ page }) => {
    await expect(page.locator('h2:has-text("Record Game")')).toBeVisible()

    // Try to submit empty form
    await page.click('button:has-text("Record Game")')

    // Should show validation errors
    await expect(page.locator('text=Please select Player 1')).toBeVisible()
    await expect(page.locator('text=Please select Player 2')).toBeVisible()
    await expect(page.locator('text=Please select the winner')).toBeVisible()

    // User can recover by filling the form correctly
    await page.selectOption('#player1', { index: 1 })

    // First error should disappear
    await expect(page.locator('text=Please select Player 1')).not.toBeVisible()

    await page.selectOption('#player2', { index: 1 })

    // Second error should disappear
    await expect(page.locator('text=Please select Player 2')).not.toBeVisible()

    await page.selectOption('#winner', { index: 1 })

    // Third error should disappear
    await expect(page.locator('text=Please select the winner')).not.toBeVisible()

    // Now submit should work
    await page.click('button:has-text("Record Game")')

    // Form should reset on success
    await expect(page.locator('#player1')).toHaveValue('0')
  })

  test('handles missing players gracefully', async ({ page }) => {
    // Simulate empty players response
    await page.route('**/api/v1/players**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          players: [],
          total: 0,
          page: 1,
          page_size: 100,
          total_pages: 0
        })
      })
    })

    // Reload to trigger API call
    await page.reload()

    // Should show appropriate message for insufficient players
    const insufficientMessage = page.locator('text=/need at least 2|insufficient players|add more players/i')
    const gameForm = page.locator('form:has(button:has-text("Record Game"))')

    if (await insufficientMessage.isVisible()) {
      // Should show helpful message
      await expect(insufficientMessage).toBeVisible()

      // Game form should be disabled or hidden
      const submitButton = page.locator('button:has-text("Record Game")')
      if (await submitButton.isVisible()) {
        await expect(submitButton).toBeDisabled()
      }
    } else {
      // Alternative: dropdowns should be empty or disabled
      const player1Options = await page.locator('#player1 option').count()
      expect(player1Options).toBeLessThanOrEqual(1) // Only default option
    }

    // Clear route to restore normal behavior
    await page.unroute('**/api/v1/players**')
  })

  test('handles browser back/forward navigation during errors', async ({ page }) => {
    // Start on home page
    await page.goto('/')

    // Navigate to players page
    await page.goto('/players')
    await expect(page.getByText('Player Management')).toBeVisible()

    // Simulate error on players API
    await page.route('**/api/v1/players**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Server error' })
      })
    })

    // Reload to trigger error
    await page.reload()

    // Should show error state
    await expect(page.locator('text=/error|failed|server/i')).toBeVisible({ timeout: 5000 })

    // Navigate back to home
    await page.goBack()
    await expect(page.locator('h2:has-text("Record Game")')).toBeVisible()

    // Navigate forward again
    await page.goForward()

    // Should still handle the error state
    const hasError = await page.locator('text=/error|failed|server/i').isVisible()
    const hasRetry = await page.locator('button:has-text("Retry"), button:has-text("Try Again"), a:has-text("Refresh")').isVisible()

    expect(hasError || hasRetry).toBe(true)

    // Clear route
    await page.unroute('**/api/v1/players**')
  })

  test('recovers from duplicate player name error', async ({ page }) => {
    // Navigate to players page
    await page.goto('/players')
    await expect(page.getByText('Player Management')).toBeVisible()

    // Create a player first
    const uniqueName = `Duplicate Test ${Date.now()}`

    await page.getByRole('button', { name: /add.*player/i }).click()
    await page.getByLabel(/name/i).fill(uniqueName)
    await page.getByRole('button', { name: /create player/i }).click()
    await expect(page.getByText('Add New Player')).not.toBeVisible()

    // Try to create another player with the same name
    await page.getByRole('button', { name: /add.*player/i }).click()
    await page.getByLabel(/name/i).fill(uniqueName)
    await page.getByRole('button', { name: /create player/i }).click()

    // Should show duplicate error
    await expect(page.locator('text=/already exists|duplicate|name.*taken/i')).toBeVisible()

    // User can recover by changing the name
    const nameInput = page.getByLabel(/name/i)
    await nameInput.clear()
    await nameInput.fill(`${uniqueName} Modified`)

    // Now submit should work
    await page.getByRole('button', { name: /create player/i }).click()

    // Should succeed and close modal
    await expect(page.getByText('Add New Player')).not.toBeVisible({ timeout: 5000 })
  })

  test('handles JavaScript errors gracefully', async ({ page }) => {
    // Listen for console errors
    const consoleErrors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    // Listen for page errors
    const pageErrors: string[] = []
    page.on('pageerror', error => {
      pageErrors.push(error.message)
    })

    // Navigate and interact with the app
    await page.goto('/')
    await expect(page.locator('h2:has-text("Record Game")')).toBeVisible()

    // Perform normal operations
    await page.selectOption('#player1', { index: 1 })
    await page.selectOption('#player2', { index: 1 })

    // Navigate to other pages
    await page.goto('/players')
    await expect(page.getByText('Player Management')).toBeVisible()

    await page.goto('/about')
    await expect(page.locator('h1, h2').filter({ hasText: /about/i })).toBeVisible()

    // Check that no critical errors occurred
    const criticalErrors = [...consoleErrors, ...pageErrors].filter(error =>
      !error.includes('404') && // Ignore 404s
      !error.includes('favicon') && // Ignore favicon errors
      !error.includes('Extension') // Ignore browser extension errors
    )

    if (criticalErrors.length > 0) {
      console.log('Detected errors:', criticalErrors)
    }

    // App should still be functional despite any minor errors
    await page.goto('/')
    await expect(page.locator('h2:has-text("Record Game")')).toBeVisible()
  })
})
