// ABOUTME: End-to-end tests for complete game recording workflow
// ABOUTME: Tests the full user journey from selecting players to recording a game

import { test, expect } from '@playwright/test'

test.describe('Game Recording Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the home page
    await page.goto('/')
  })

  test('complete game recording workflow with existing players', async ({ page }) => {
    // Step 1: Navigate to Players page to ensure we have players
    await page.click('a[href="/players"]')
    await expect(page).toHaveURL('/players')

    // Check if we have at least 2 players, if not create them
    const playerRows = page.locator('tbody tr')
    const playerCount = await playerRows.count()

    if (playerCount < 2) {
      // Create first player
      await page.getByRole('button', { name: /add.*player/i }).click()
      await page.getByLabel(/name/i).fill('Test Player 1')
      await page.getByLabel(/email/i).fill('player1@test.com')
      await page.getByRole('button', { name: /create player/i }).click()

      // Wait for modal to close
      await expect(page.getByText('Add New Player')).not.toBeVisible()

      // Create second player
      await page.getByRole('button', { name: /add.*player/i }).click()
      await page.getByLabel(/name/i).fill('Test Player 2')
      await page.getByLabel(/email/i).fill('player2@test.com')
      await page.getByRole('button', { name: /create player/i }).click()

      // Wait for second player to be created
      await expect(page.getByText('Add New Player')).not.toBeVisible()
    }

    // Step 2: Navigate to Home page to record a game
    await page.click('a[href="/"]')
    await expect(page).toHaveURL('/')

    // Step 3: Find the game recording form
    await expect(page.locator('h2:has-text("Record Game")')).toBeVisible()

    // Step 4: Select Player 1
    await page.click('#player1')
    await page.selectOption('#player1', { index: 1 })

    // Verify Player 1 is selected
    const player1Value = await page.locator('#player1').inputValue()
    expect(player1Value).not.toBe('0')

    // Step 5: Select Player 2 (should be different from Player 1)
    await page.click('#player2')
    await page.selectOption('#player2', { index: 1 })

    // Verify Player 2 is selected and different from Player 1
    const player2Value = await page.locator('#player2').inputValue()
    expect(player2Value).not.toBe('0')
    expect(player2Value).not.toBe(player1Value)

    // Step 6: Select winner (should now be enabled)
    await expect(page.locator('#winner')).not.toBeDisabled()

    // Select Player 1 as winner
    await page.selectOption('#winner', player1Value)

    // Verify winner is selected
    const winnerValue = await page.locator('#winner').inputValue()
    expect(winnerValue).toBe(player1Value)

    // Step 7: Submit the form
    await page.click('button:has-text("Record Game")')

    // Step 8: Verify game was recorded successfully
    // The form should reset after successful submission
    await expect(page.locator('#player1')).toHaveValue('0')
    await expect(page.locator('#player2')).toHaveValue('0')
    await expect(page.locator('#winner')).toHaveValue('0')

    // Check if recent games section shows the new game
    await expect(page.locator('h3:has-text("Recent Games")')).toBeVisible()

    // The most recent game should appear in the list
    const recentGamesList = page.locator('[data-testid="recent-games-list"], .recent-games')
    await expect(recentGamesList).toBeVisible()

    // Verify the game appears (may take a moment due to API call)
    await page.waitForTimeout(1000) // Brief wait for API response

    // Look for game entries - they might be in different formats
    const gameEntries = page.locator('[data-testid="game-entry"], .game-entry, li').filter({ hasText: /vs|won|beat/ })
    const entries = await gameEntries.count()
    expect(entries).toBeGreaterThan(0)
  })

  test('form validation prevents invalid game submission', async ({ page }) => {
    await expect(page.locator('h2:has-text("Record Game")')).toBeVisible()

    // Try to submit without selecting any players
    await page.click('button:has-text("Record Game")')

    // Should show validation errors
    await expect(page.locator('text=Please select Player 1')).toBeVisible()
    await expect(page.locator('text=Please select Player 2')).toBeVisible()
    await expect(page.locator('text=Please select the winner')).toBeVisible()

    // Select only Player 1
    await page.selectOption('#player1', { index: 1 })
    await page.click('button:has-text("Record Game")')

    // Should still show validation for Player 2 and winner
    await expect(page.locator('text=Please select Player 2')).toBeVisible()
    await expect(page.locator('text=Please select the winner')).toBeVisible()
  })

  test('winner dropdown updates based on selected players', async ({ page }) => {
    await expect(page.locator('h2:has-text("Record Game")')).toBeVisible()

    // Initially, winner should be disabled
    await expect(page.locator('#winner')).toBeDisabled()
    await expect(page.locator('#winner option:first-child')).toHaveText('Select both players first')

    // Select Player 1
    await page.selectOption('#player1', { index: 1 })

    // Winner should still be disabled until both players are selected
    await expect(page.locator('#winner')).toBeDisabled()

    // Select Player 2
    await page.selectOption('#player2', { index: 1 })

    // Now winner should be enabled and show both players as options
    await expect(page.locator('#winner')).not.toBeDisabled()

    const winnerOptions = await page.locator('#winner option').allTextContents()
    expect(winnerOptions.length).toBeGreaterThan(1) // At least "Select winner" + player options
    expect(winnerOptions[0]).toBe('Select winner')
  })

  test('player 2 dropdown filters out selected player 1', async ({ page }) => {
    await expect(page.locator('h2:has-text("Record Game")')).toBeVisible()

    // Get initial options for both dropdowns
    const initialPlayer1Options = await page.locator('#player1 option').allTextContents()
    const initialPlayer2Options = await page.locator('#player2 option').allTextContents()

    // Should start with same options
    expect(initialPlayer1Options).toEqual(initialPlayer2Options)

    // Select a player in Player 1 dropdown
    if (initialPlayer1Options.length > 1) {
      await page.selectOption('#player1', { index: 1 })
      const selectedPlayer1Text = await page.locator('#player1 option:checked').textContent()

      // Wait for Player 2 dropdown to update
      await page.waitForTimeout(100)

      // Get updated Player 2 options
      const updatedPlayer2Options = await page.locator('#player2 option').allTextContents()

      // Player 2 should not include the selected Player 1
      expect(updatedPlayer2Options).not.toContain(selectedPlayer1Text)
      expect(updatedPlayer2Options.length).toBe(initialPlayer2Options.length - 1)
    }
  })
})
