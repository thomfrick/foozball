// ABOUTME: End-to-end tests for player management workflow
// ABOUTME: Tests complete user journeys from browser interactions to database changes

import { test, expect } from '@playwright/test'

test.describe('Player Management E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the players page
    await page.goto('/players')

    // Wait for page to load
    await expect(page.getByText('Player Management')).toBeVisible()
  })

  test('should load and display existing players', async ({ page }) => {
    // Wait for players to load (should have some default players from migrations/seed)
    await expect(page.getByText('Players')).toBeVisible()

    // Should show the player table
    const table = page.locator('table')
    await expect(table).toBeVisible()

    // Should have table headers
    await expect(page.getByText('Name')).toBeVisible()
    await expect(page.getByText('Email')).toBeVisible()
    await expect(page.getByText('Rating')).toBeVisible()
    await expect(page.getByText('Games')).toBeVisible()
  })

  test('should create a new player through the UI', async ({ page }) => {
    const testPlayerName = `E2E Test Player ${Date.now()}`
    const testPlayerEmail = `e2e-${Date.now()}@test.com`

    // Click the "Add New Player" button
    await page.getByRole('button', { name: /add.*player/i }).click()

    // Wait for modal to open
    await expect(page.getByText('Add New Player')).toBeVisible()

    // Fill out the form
    await page.getByLabel(/name/i).fill(testPlayerName)
    await page.getByLabel(/email/i).fill(testPlayerEmail)

    // Submit the form
    await page.getByRole('button', { name: /create player/i }).click()

    // Wait for modal to close
    await expect(page.getByText('Add New Player')).not.toBeVisible()

    // Verify the new player appears in the list
    await expect(page.getByText(testPlayerName)).toBeVisible()
    await expect(page.getByText(testPlayerEmail)).toBeVisible()

    // Verify player has default TrueSkill values
    const playerRow = page.locator(`tr:has-text("${testPlayerName}")`)
    await expect(playerRow.getByText('25.0')).toBeVisible() // Default mu
    await expect(playerRow.getByText('0 games')).toBeVisible() // Default games played
  })

  test('should edit an existing player', async ({ page }) => {
    // First create a player to edit
    const originalName = `Original Player ${Date.now()}`
    const updatedName = `Updated Player ${Date.now()}`

    // Create player
    await page.getByRole('button', { name: /add.*player/i }).click()
    await page.getByLabel(/name/i).fill(originalName)
    await page.getByRole('button', { name: /create player/i }).click()
    await expect(page.getByText('Add New Player')).not.toBeVisible()

    // Find the player row and click edit
    const playerRow = page.locator(`tr:has-text("${originalName}")`)
    await playerRow.getByLabel(/edit/i).click()

    // Wait for edit modal
    await expect(page.getByText('Edit Player')).toBeVisible()

    // Update the name
    const nameInput = page.getByLabel(/name/i)
    await nameInput.clear()
    await nameInput.fill(updatedName)

    // Save changes
    await page.getByRole('button', { name: /save changes/i }).click()

    // Wait for modal to close
    await expect(page.getByText('Edit Player')).not.toBeVisible()

    // Verify the updated name appears
    await expect(page.getByText(updatedName)).toBeVisible()
    await expect(page.getByText(originalName)).not.toBeVisible()
  })

  test('should delete a player (soft delete)', async ({ page }) => {
    // First create a player to delete
    const playerName = `Delete Me ${Date.now()}`

    // Create player
    await page.getByRole('button', { name: /add.*player/i }).click()
    await page.getByLabel(/name/i).fill(playerName)
    await page.getByRole('button', { name: /create player/i }).click()
    await expect(page.getByText('Add New Player')).not.toBeVisible()

    // Find the player row and click delete
    const playerRow = page.locator(`tr:has-text("${playerName}")`)
    await playerRow.getByLabel(/delete/i).click()

    // Wait for delete confirmation modal
    await expect(page.getByText('Delete Player')).toBeVisible()

    // Confirm deletion
    await page.getByRole('button', { name: /delete/i }).click()

    // Wait for modal to close
    await expect(page.getByText('Delete Player')).not.toBeVisible()

    // Verify the player is no longer visible in the list
    await expect(page.getByText(playerName)).not.toBeVisible()
  })

  test('should search for players', async ({ page }) => {
    // Create a player with a unique name to search for
    const searchableName = `Searchable ${Date.now()}`

    // Create player
    await page.getByRole('button', { name: /add.*player/i }).click()
    await page.getByLabel(/name/i).fill(searchableName)
    await page.getByRole('button', { name: /create player/i }).click()
    await expect(page.getByText('Add New Player')).not.toBeVisible()

    // Use the search functionality
    const searchInput = page.getByPlaceholder(/search players/i)
    await searchInput.fill('Searchable')

    // Wait for search results (debounced)
    await page.waitForTimeout(500)

    // Should show the matching player
    await expect(page.getByText(searchableName)).toBeVisible()

    // Clear search
    await searchInput.clear()
    await page.waitForTimeout(500)

    // Should show all players again
    await expect(page.getByText(searchableName)).toBeVisible()
  })

  test('should handle form validation errors', async ({ page }) => {
    // Click add player
    await page.getByRole('button', { name: /add.*player/i }).click()

    // Try to submit without filling required fields
    await page.getByRole('button', { name: /create player/i }).click()

    // Should show validation error
    await expect(page.getByText(/name is required/i)).toBeVisible()

    // Fill name but make it too short
    await page.getByLabel(/name/i).fill('A')
    await page.getByRole('button', { name: /create player/i }).click()

    // Should show length validation error
    await expect(page.getByText(/name must be at least 2 characters/i)).toBeVisible()
  })

  test('should handle duplicate player name error', async ({ page }) => {
    const duplicateName = `Duplicate ${Date.now()}`

    // Create first player
    await page.getByRole('button', { name: /add.*player/i }).click()
    await page.getByLabel(/name/i).fill(duplicateName)
    await page.getByRole('button', { name: /create player/i }).click()
    await expect(page.getByText('Add New Player')).not.toBeVisible()

    // Try to create another player with same name
    await page.getByRole('button', { name: /add.*player/i }).click()
    await page.getByLabel(/name/i).fill(duplicateName)
    await page.getByRole('button', { name: /create player/i }).click()

    // Should show duplicate name error
    await expect(page.getByText(/name already exists/i)).toBeVisible()
  })

  test('should navigate between pages correctly', async ({ page }) => {
    // Should start on players page
    await expect(page.getByText('Player Management')).toBeVisible()

    // Navigate to home
    await page.getByRole('link', { name: /home/i }).click()
    await expect(page.getByText('Welcome to Foosball Tracker')).toBeVisible()

    // Navigate back to players
    await page.getByRole('link', { name: /players/i }).click()
    await expect(page.getByText('Player Management')).toBeVisible()

    // Navigate to about
    await page.getByRole('link', { name: /about/i }).click()
    await expect(page.getByText('About Foosball Tracker')).toBeVisible()
  })
})
