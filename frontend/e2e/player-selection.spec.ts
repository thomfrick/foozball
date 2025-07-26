// ABOUTME: End-to-end tests for player selection and winner validation
// ABOUTME: Tests the interactive behavior of player dropdowns and winner selection logic

import { expect, test } from '@playwright/test'

test.describe('Player Selection and Winner Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')

    // Ensure we're on a page with the game recording form
    await expect(page.locator('h2:has-text("Record Game")')).toBeVisible()
  })

  test('player dropdowns populate with available players', async ({ page }) => {
    // Check Player 1 dropdown
    const player1Select = page.locator('#player1')
    await expect(player1Select).toBeVisible()

    const player1Options = await player1Select
      .locator('option')
      .allTextContents()
    expect(player1Options.length).toBeGreaterThan(1) // Should have default + player options
    expect(player1Options[0]).toBe('Select Player 1')

    // Check Player 2 dropdown
    const player2Select = page.locator('#player2')
    await expect(player2Select).toBeVisible()

    const player2Options = await player2Select
      .locator('option')
      .allTextContents()
    expect(player2Options.length).toBeGreaterThan(1)
    expect(player2Options[0]).toBe('Select Player 2')

    // Both dropdowns should have the same number of player options initially
    expect(player1Options.length).toBe(player2Options.length)
  })

  test('selecting player 1 filters player 2 options', async ({ page }) => {
    const player1Select = page.locator('#player1')
    const player2Select = page.locator('#player2')

    // Get initial options for both dropdowns
    const initialPlayer1Options = await player1Select
      .locator('option')
      .allTextContents()
    const initialPlayer2Options = await player2Select
      .locator('option')
      .allTextContents()

    // Verify they start with the same options
    expect(initialPlayer1Options).toEqual(initialPlayer2Options)

    // Select a player in Player 1 dropdown
    if (initialPlayer1Options.length > 1) {
      await player1Select.selectOption({ index: 1 })
      const selectedPlayer1Text = await player1Select
        .locator('option:checked')
        .textContent()

      // Wait for Player 2 dropdown to update
      await page.waitForTimeout(100)

      // Get updated Player 2 options
      const updatedPlayer2Options = await player2Select
        .locator('option')
        .allTextContents()

      // Player 2 should not include the selected Player 1
      expect(updatedPlayer2Options).not.toContain(selectedPlayer1Text)
      expect(updatedPlayer2Options.length).toBe(
        initialPlayer2Options.length - 1
      )
    }
  })

  test('winner dropdown is disabled until both players are selected', async ({
    page,
  }) => {
    const player1Select = page.locator('#player1')
    const player2Select = page.locator('#player2')
    const winnerSelect = page.locator('#winner')

    // Initially, winner should be disabled
    await expect(winnerSelect).toBeDisabled()
    await expect(winnerSelect.locator('option:first-child')).toHaveText(
      'Select both players first'
    )

    // Select Player 1 only
    await player1Select.selectOption({ index: 1 })
    await page.waitForTimeout(100)

    // Winner should still be disabled
    await expect(winnerSelect).toBeDisabled()

    // Select Player 2
    await player2Select.selectOption({ index: 1 })
    await page.waitForTimeout(100)

    // Now winner should be enabled
    await expect(winnerSelect).not.toBeDisabled()
    await expect(winnerSelect.locator('option:first-child')).toHaveText(
      'Select winner'
    )
  })

  test('winner dropdown only shows selected players as options', async ({
    page,
  }) => {
    const player1Select = page.locator('#player1')
    const player2Select = page.locator('#player2')
    const winnerSelect = page.locator('#winner')

    // Select both players
    await player1Select.selectOption({ index: 1 })
    await player2Select.selectOption({ index: 1 })
    await page.waitForTimeout(100)

    // Get selected player names
    const selectedPlayer1 = await player1Select
      .locator('option:checked')
      .textContent()
    const selectedPlayer2 = await player2Select
      .locator('option:checked')
      .textContent()

    // Get winner options
    const winnerOptions = await winnerSelect.locator('option').allTextContents()

    // Winner should have exactly 3 options: default + 2 players
    expect(winnerOptions.length).toBe(3)
    expect(winnerOptions[0]).toBe('Select winner')
    expect(winnerOptions).toContain(selectedPlayer1)
    expect(winnerOptions).toContain(selectedPlayer2)
  })

  test('changing player selection updates winner options dynamically', async ({
    page,
  }) => {
    const player1Select = page.locator('#player1')
    const player2Select = page.locator('#player2')
    const winnerSelect = page.locator('#winner')

    // Select initial players
    await player1Select.selectOption({ index: 1 })
    await player2Select.selectOption({ index: 1 })
    await page.waitForTimeout(100)

    // Select a winner
    await winnerSelect.selectOption({ index: 1 })
    const initialWinner = await winnerSelect.inputValue()

    // Change Player 1 to a different option
    await player1Select.selectOption({ index: 2 })
    await page.waitForTimeout(100)

    // Winner should be cleared if it's no longer valid
    const newWinnerValue = await winnerSelect.inputValue()

    // If the winner was the changed player, it should be reset to default
    if (
      initialWinner ===
      (await player1Select.locator('option:nth-child(2)').getAttribute('value'))
    ) {
      expect(newWinnerValue).toBe('0')
    }

    // Winner options should update to reflect new player selection
    const updatedWinnerOptions = await winnerSelect
      .locator('option')
      .allTextContents()
    expect(updatedWinnerOptions.length).toBe(3)
  })

  test('form validation prevents submission with invalid player combinations', async ({
    page,
  }) => {
    const submitButton = page.locator('button:has-text("Record Game")')

    // Test 1: Submit with no selections
    await submitButton.click()
    await expect(page.locator('text=Please select Player 1')).toBeVisible()
    await expect(page.locator('text=Please select Player 2')).toBeVisible()
    await expect(page.locator('text=Please select the winner')).toBeVisible()

    // Test 2: Submit with only Player 1 selected
    await page.locator('#player1').selectOption({ index: 1 })
    await submitButton.click()
    await expect(page.locator('text=Please select Player 2')).toBeVisible()
    await expect(page.locator('text=Please select the winner')).toBeVisible()

    // Test 3: Submit with both players but no winner
    await page.locator('#player2').selectOption({ index: 1 })
    await page.waitForTimeout(100)
    await submitButton.click()
    await expect(page.locator('text=Please select the winner')).toBeVisible()
  })

  test('form clears validation errors when user makes corrections', async ({
    page,
  }) => {
    const submitButton = page.locator('button:has-text("Record Game")')

    // Trigger validation errors
    await submitButton.click()
    await expect(page.locator('text=Please select Player 1')).toBeVisible()

    // Start selecting Player 1
    await page.locator('#player1').selectOption({ index: 1 })

    // Player 1 error should clear
    await expect(page.locator('text=Please select Player 1')).not.toBeVisible()

    // Other errors should still be visible
    await expect(page.locator('text=Please select Player 2')).toBeVisible()

    // Select Player 2
    await page.locator('#player2').selectOption({ index: 1 })
    await page.waitForTimeout(100)

    // Player 2 error should clear
    await expect(page.locator('text=Please select Player 2')).not.toBeVisible()

    // Select winner
    await page.locator('#winner').selectOption({ index: 1 })

    // All errors should be cleared
    await expect(
      page.locator('text=Please select the winner')
    ).not.toBeVisible()
  })

  test('handles edge case with insufficient players gracefully', async ({
    page,
  }) => {
    // This test checks behavior when there are fewer than 2 active players
    // In a real scenario, this might show a different UI

    const player1Select = page.locator('#player1')
    const player1Options = await player1Select
      .locator('option')
      .allTextContents()

    if (player1Options.length <= 2) {
      // Only default option + 1 player or less
      // Should show insufficient players warning
      const warningMessage = page.locator(
        '[data-testid="insufficient-players-warning"]'
      )

      if (await warningMessage.isVisible()) {
        await expect(warningMessage).toContainText(/at least 2.*players/i)

        // Form should be disabled or hidden
        const gameForm = page.locator('form')
        const isFormDisabled = await gameForm.evaluate((form) => {
          const inputs = form.querySelectorAll('select, button[type="submit"]')
          return Array.from(inputs).some((input) =>
            (input as HTMLElement).hasAttribute('disabled')
          )
        })

        expect(isFormDisabled).toBe(true)
      }
    }
  })

  test('maintains accessibility for keyboard navigation', async ({ page }) => {
    // Test tab navigation through form elements
    await page.keyboard.press('Tab')
    await expect(page.locator('#player1')).toBeFocused()

    await page.keyboard.press('Tab')
    await expect(page.locator('#player2')).toBeFocused()

    await page.keyboard.press('Tab')
    await expect(page.locator('#winner')).toBeFocused()

    await page.keyboard.press('Tab')
    await expect(page.locator('button:has-text("Record Game")')).toBeFocused()

    // Test keyboard selection in dropdowns
    await page.locator('#player1').focus()
    await page.keyboard.press('ArrowDown') // Open dropdown
    await page.keyboard.press('ArrowDown') // Select first player
    await page.keyboard.press('Enter') // Confirm selection

    const selectedValue = await page.locator('#player1').inputValue()
    expect(selectedValue).not.toBe('0')
  })
})
