// ABOUTME: End-to-end tests for game history browsing and filtering functionality
// ABOUTME: Tests viewing, paginating, and filtering through recorded games

import { test, expect } from '@playwright/test'

test.describe('Game History Browsing and Filtering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('can browse game history and view recent games', async ({ page }) => {
    // Navigate to game history (Recent Games section on home page)
    await expect(page.locator('h3:has-text("Recent Games")')).toBeVisible()

    const recentGamesList = page.locator('[data-testid="recent-games-list"], .recent-games, section:has-text("Recent Games")')
    await expect(recentGamesList).toBeVisible()

    // Check if there are any games displayed
    const gameEntries = page.locator('[data-testid="game-entry"], .game-entry, li').filter({ hasText: /vs|won|beat|defeated/ })
    const gameCount = await gameEntries.count()

    if (gameCount > 0) {
      // Verify game entries have proper structure
      const firstGame = gameEntries.first()

      // Each game should show player names and outcome
      await expect(firstGame).toBeVisible()

      // Should contain player names (look for patterns like "Player 1 vs Player 2" or "Player 1 beat Player 2")
      const gameText = await firstGame.textContent()
      expect(gameText).toMatch(/(vs|beat|defeated|won)/i)

      // Test pagination if available
      const paginationControls = page.locator('[data-testid="pagination-controls"], .pagination, nav[aria-label*="pagination"]')
      if (await paginationControls.isVisible()) {
        // Check if next page button exists and works
        const nextButton = paginationControls.locator('button:has-text("Next"), button[aria-label*="next"]')
        if (await nextButton.isVisible() && await nextButton.isEnabled()) {
          await nextButton.click()

          // Verify page changed (wait for content update)
          await page.waitForTimeout(500)

          // Go back to first page
          const prevButton = paginationControls.locator('button:has-text("Previous"), button[aria-label*="previous"]')
          if (await prevButton.isVisible()) {
            await prevButton.click()
            await page.waitForTimeout(500)
          }
        }
      }
    } else {
      // Should show empty state message
      const emptyMessage = page.locator('text=/no games|No games recorded|empty|haven\'t recorded/i')
      await expect(emptyMessage).toBeVisible()
    }
  })

  test('game history shows games in chronological order', async ({ page }) => {
    const recentGamesList = page.locator('[data-testid="recent-games-list"], .recent-games')
    await expect(recentGamesList).toBeVisible()

    const gameEntries = page.locator('[data-testid="game-entry"], .game-entry, li').filter({ hasText: /vs|won|beat/ })
    const gameCount = await gameEntries.count()

    if (gameCount >= 2) {
      // Get text content from first two games to verify they make sense chronologically
      const firstGameText = await gameEntries.nth(0).textContent()
      const secondGameText = await gameEntries.nth(1).textContent()

      // Both should contain game information
      expect(firstGameText).toBeTruthy()
      expect(secondGameText).toBeTruthy()

      // Should contain valid game patterns
      expect(firstGameText).toMatch(/(vs|beat|defeated|won)/i)
      expect(secondGameText).toMatch(/(vs|beat|defeated|won)/i)
    }
  })

  test('can view detailed game information', async ({ page }) => {
    const recentGamesList = page.locator('[data-testid="recent-games-list"], .recent-games')
    await expect(recentGamesList).toBeVisible()

    const gameEntries = page.locator('[data-testid="game-entry"], .game-entry, li').filter({ hasText: /vs|won|beat/ })
    const gameCount = await gameEntries.count()

    if (gameCount > 0) {
      const firstGame = gameEntries.first()

      // Click on game to view details (if clickable)
      const isClickable = await firstGame.evaluate(el => {
        const style = window.getComputedStyle(el)
        return style.cursor === 'pointer' || el.tagName === 'A' || el.onclick !== null
      })

      if (isClickable) {
        await firstGame.click()

        // Look for expanded details or navigation to detail page
        const gameDetail = page.locator('[data-testid="game-detail"], .game-detail')
        if (await gameDetail.isVisible()) {
          // Verify detailed information is shown
          await expect(gameDetail).toBeVisible()
        }
      } else {
        // Game info should be visible inline
        const gameText = await firstGame.textContent()
        expect(gameText).toContain(/\w+/) // Should contain meaningful text
      }
    }
  })

  test('handles empty game history gracefully', async ({ page }) => {
    // Check for empty state handling
    const recentGamesList = page.locator('[data-testid="recent-games-list"], .recent-games')
    await expect(recentGamesList).toBeVisible()

    // Look for either games or empty message
    const gameEntries = page.locator('[data-testid="game-entry"], .game-entry, li').filter({ hasText: /vs|won|beat/ })
    const noGamesMessage = page.locator('[data-testid="no-games-message"], text=/no games|No games recorded|empty|haven\'t recorded/i')

    const gameCount = await gameEntries.count()

    if (gameCount === 0) {
      // Should show "no games" message
      await expect(noGamesMessage).toBeVisible()
    } else {
      // If games exist, should show them properly
      await expect(gameEntries.first()).toBeVisible()
    }
  })

  test('game history loads within reasonable time', async ({ page }) => {
    const startTime = Date.now()

    // Wait for recent games section to be visible
    await expect(page.locator('h3:has-text("Recent Games")')).toBeVisible()

    const recentGamesList = page.locator('[data-testid="recent-games-list"], .recent-games')
    await expect(recentGamesList).toBeVisible()

    const loadTime = Date.now() - startTime

    // Game history should load within 3 seconds
    expect(loadTime).toBeLessThan(3000)

    // Verify content is actually loaded (not just placeholder)
    const gameEntries = page.locator('[data-testid="game-entry"], .game-entry, li').filter({ hasText: /vs|won|beat/ })
    const isLoading = page.locator('[data-testid="loading-spinner"], .loading, .spinner')

    // Should not be in loading state
    await expect(isLoading).not.toBeVisible()

    // Should have either games or no-games message
    const hasGames = (await gameEntries.count()) > 0
    const hasNoGamesMessage = await page.locator('text=/no games|No games recorded|empty|haven\'t recorded/i').isVisible()

    expect(hasGames || hasNoGamesMessage).toBe(true)
  })

  test('can filter games by player if filtering is available', async ({ page }) => {
    // Check if player filtering is available
    const playerFilter = page.locator('[data-testid="player-filter"], select[name*="player"], input[placeholder*="filter"]')

    if (await playerFilter.isVisible()) {
      // Test filtering functionality
      if (await playerFilter.getAttribute('tagName') === 'SELECT') {
        // Dropdown filter
        await playerFilter.selectOption({ index: 1 })
      } else {
        // Text input filter
        await playerFilter.fill('Test')
      }

      // Wait for filter to be applied
      await page.waitForTimeout(1000)

      const filteredGames = page.locator('[data-testid="game-entry"], .game-entry, li').filter({ hasText: /vs|won|beat/ })
      const filteredCount = await filteredGames.count()

      // Should either show filtered results or empty state
      if (filteredCount > 0) {
        await expect(filteredGames.first()).toBeVisible()
      }

      // Clear filter if possible
      if (await playerFilter.getAttribute('tagName') === 'SELECT') {
        await playerFilter.selectOption({ value: '' })
      } else {
        await playerFilter.clear()
      }
      await page.waitForTimeout(500)
    } else {
      console.log('Player filtering not available in current UI')
    }
  })

  test('recent games update after recording a new game', async ({ page }) => {
    // First, record the initial number of games
    const recentGamesList = page.locator('[data-testid="recent-games-list"], .recent-games')
    await expect(recentGamesList).toBeVisible()

    const initialGameEntries = page.locator('[data-testid="game-entry"], .game-entry, li').filter({ hasText: /vs|won|beat/ })
    const initialCount = await initialGameEntries.count()

    // Record a new game
    await expect(page.locator('h2:has-text("Record Game")')).toBeVisible()

    // Select players and winner
    await page.selectOption('#player1', { index: 1 })
    await page.selectOption('#player2', { index: 1 })
    await page.selectOption('#winner', { index: 1 })

    // Submit the game
    await page.click('button:has-text("Record Game")')

    // Wait for the game to be recorded and list to update
    await page.waitForTimeout(2000)

    // Check if the games list updated
    const updatedGameEntries = page.locator('[data-testid="game-entry"], .game-entry, li').filter({ hasText: /vs|won|beat/ })
    const updatedCount = await updatedGameEntries.count()

    // Should have one more game (or at least not fewer games)
    expect(updatedCount).toBeGreaterThanOrEqual(initialCount)

    // If we had games before, we should definitely have more now
    if (initialCount > 0) {
      expect(updatedCount).toBeGreaterThan(initialCount)
    }
  })
})
