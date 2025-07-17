import { test, expect } from '@playwright/test'

test.describe('Content Generation and History Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication state
    await page.goto('/')
    
    // Mock Firebase auth and simulate logged-in state
    await page.addInitScript(() => {
      window.__mock_user = {
        uid: 'test-user-123',
        email: 'test@example.com',
        displayName: 'Test User'
      }
    })
    
    // Navigate directly to the app (simulating authenticated state)
    await page.goto('/?mock_auth=true')
  })

  test('should display content generation form for authenticated users', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /content generator/i })).toBeVisible()
    await expect(page.getByLabel(/book content/i)).toBeVisible()
    await expect(page.getByLabel(/audience class/i)).toBeVisible()
    await expect(page.getByLabel(/audience age/i)).toBeVisible()
    await expect(page.getByLabel(/audience region/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /generate content/i })).toBeVisible()
  })

  test('should validate required fields before content generation', async ({ page }) => {
    const generateButton = page.getByRole('button', { name: /generate content/i })
    await generateButton.click()
    
    await expect(page.getByText(/please fill in all core fields/i)).toBeVisible()
  })

  test('should generate content when all fields are filled', async ({ page }) => {
    // Fill out the form
    await page.getByLabel(/book content/i).fill('This is a test book about space exploration and the solar system.')
    await page.getByLabel(/audience class/i).fill('Grade 5')
    await page.getByLabel(/audience age/i).fill('10-11')
    await page.getByLabel(/audience region/i).fill('United States')
    
    // Mock the API response
    await page.route('**/.netlify/functions/generate-content', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          generatedContent: 'This is a mock generated content about space exploration for 5th grade students.'
        })
      })
    })
    
    const generateButton = page.getByRole('button', { name: /generate content/i })
    await generateButton.click()
    
    // Check loading state
    await expect(generateButton).toBeDisabled()
    await expect(page.getByText(/generating/i)).toBeVisible()
    
    // Check for generated content
    await expect(page.getByText(/mock generated content about space/i)).toBeVisible({ timeout: 10000 })
  })

  test('should navigate to history page and display generated content', async ({ page }) => {
    // Navigate to history
    await page.getByRole('button', { name: /history/i }).click()
    
    await expect(page.getByRole('heading', { name: /content history/i })).toBeVisible()
    await expect(page.getByPlaceholder(/search history/i)).toBeVisible()
  })

  test('should search through content history', async ({ page }) => {
    await page.getByRole('button', { name: /history/i }).click()
    
    const searchInput = page.getByPlaceholder(/search history/i)
    await searchInput.fill('space')
    
    // Results should filter based on search term
    await expect(page.getByText(/space/i)).toBeVisible()
  })

  test('should open content detail view when history card is clicked', async ({ page }) => {
    await page.getByRole('button', { name: /history/i }).click()
    
    // Mock history data
    await page.evaluate(() => {
      window.__mock_content_history = [{
        id: 'content-1',
        name: 'Test Content',
        generatedContent: 'This is test content about space.',
        audienceClass: 'Grade 5',
        audienceAge: '10-11',
        audienceRegion: 'United States',
        timestamp: new Date()
      }]
    })
    
    // Click on a history card
    const historyCard = page.getByText('Test Content').first()
    await historyCard.click()
    
    // Should open detail view
    await expect(page.getByText(/this is test content about space/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /edit/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /copy to clipboard/i })).toBeVisible()
  })

  test('should toggle full-screen mode in content detail view', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 })
    await page.getByRole('button', { name: /history/i }).click()
    
    const historyCard = page.getByText('Test Content').first()
    await historyCard.click()
    
    // Click full-screen button
    const fullScreenButton = page.getByRole('button', { name: /full screen/i })
    await fullScreenButton.click()
    
    // Should be in full-screen mode
    await expect(page.getByRole('button', { name: /exit full screen/i })).toBeVisible()
  })

  test('should edit content in detail view', async ({ page }) => {
    await page.getByRole('button', { name: /history/i }).click()
    
    const historyCard = page.getByText('Test Content').first()
    await historyCard.click()
    
    // Click edit button
    await page.getByRole('button', { name: /edit/i }).click()
    
    // Should show textarea for editing
    const editTextarea = page.getByRole('textbox')
    await expect(editTextarea).toBeVisible()
    await expect(editTextarea).toBeEditable()
    
    // Edit the content
    await editTextarea.fill('This is edited content about space exploration.')
    
    // Save changes
    await page.getByRole('button', { name: /save/i }).click()
    
    await expect(page.getByText(/this is edited content about space/i)).toBeVisible()
  })

  test('should delete content with confirmation', async ({ page }) => {
    await page.getByRole('button', { name: /history/i }).click()
    
    // Click delete button on history card
    const deleteButton = page.getByRole('button', { name: /delete/i }).first()
    await deleteButton.click()
    
    // Should show confirmation modal
    await expect(page.getByText(/are you sure you want to delete/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /delete/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /cancel/i })).toBeVisible()
    
    // Confirm deletion
    await page.getByRole('button', { name: /delete/i }).last().click()
    
    await expect(page.getByText(/content deleted successfully/i)).toBeVisible()
  })

  test('should copy content to clipboard', async ({ page }) => {
    await page.getByRole('button', { name: /history/i }).click()
    
    const historyCard = page.getByText('Test Content').first()
    await historyCard.click()
    
    // Mock clipboard API
    await page.evaluate(() => {
      navigator.clipboard = {
        writeText: async (text) => {
          window.__clipboard_text = text
        }
      }
    })
    
    // Click copy button
    await page.getByRole('button', { name: /copy to clipboard/i }).click()
    
    // Check that content was copied
    const clipboardText = await page.evaluate(() => window.__clipboard_text)
    expect(clipboardText).toContain('space')
  })

  test('should be responsive on mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Content generation form should be responsive
    await expect(page.getByLabel(/book content/i)).toBeVisible()
    await expect(page.getByLabel(/audience class/i)).toBeVisible()
    
    // Navigate to history
    await page.getByRole('button', { name: /history/i }).click()
    
    // History cards should be visible on mobile
    await expect(page.getByPlaceholder(/search history/i)).toBeVisible()
    
    // Content detail should open in full-screen on mobile
    const historyCard = page.getByText('Test Content').first()
    await historyCard.click()
    
    // On mobile, detail view should be full-screen by default
    await expect(page.getByText(/this is test content about space/i)).toBeVisible()
  })

  test('should maintain theme preference across pages', async ({ page }) => {
    // Set dark theme
    await page.getByRole('button', { name: /toggle theme/i }).click()
    
    // Navigate to history
    await page.getByRole('button', { name: /history/i }).click()
    
    // Theme should persist
    const body = page.locator('body')
    await expect(body).toHaveClass(/dark/)
    
    // Navigate back to generator
    await page.getByRole('button', { name: /content generator/i }).click()
    
    // Theme should still be dark
    await expect(body).toHaveClass(/dark/)
  })

  test('should handle network errors gracefully', async ({ page }) => {
    // Fill out the form
    await page.getByLabel(/book content/i).fill('Test content')
    await page.getByLabel(/audience class/i).fill('Grade 5')
    await page.getByLabel(/audience age/i).fill('10-11')
    await page.getByLabel(/audience region/i).fill('United States')
    
    // Mock network error
    await page.route('**/.netlify/functions/generate-content', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Internal server error'
        })
      })
    })
    
    const generateButton = page.getByRole('button', { name: /generate content/i })
    await generateButton.click()
    
    // Should show error message
    await expect(page.getByText(/failed to generate content/i)).toBeVisible()
    await expect(generateButton).toBeEnabled()
  })
})
