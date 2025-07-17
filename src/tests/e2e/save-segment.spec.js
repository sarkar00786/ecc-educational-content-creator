import { test, expect } from '@playwright/test'

test.describe('Save Segment Navigation Feature', () => {
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

  test('should navigate to chat page and show selection interface', async ({ page }) => {
    // Navigate to chat page
    await page.getByRole('button', { name: /chat/i }).click()
    
    await expect(page.getByRole('heading', { name: /chat/i })).toBeVisible()
    await expect(page.getByText(/select a chat/i)).toBeVisible()
  })

  test('should create new chat and send messages', async ({ page }) => {
    // Navigate to chat page
    await page.getByRole('button', { name: /chat/i }).click()
    
    // Mock Firestore operations
    await page.route('**/firestore/**', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'test-chat-123',
            success: true
          })
        })
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            documents: []
          })
        })
      }
    })
    
    // Create new chat
    await page.getByRole('button', { name: /new chat/i }).click()
    
    // Type a message
    const messageInput = page.getByPlaceholder(/type a message/i)
    await messageInput.fill('What is photosynthesis?')
    
    // Mock AI response
    await page.route('**/.netlify/functions/generate-content', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          generatedContent: 'Photosynthesis is the process by which plants convert light energy into chemical energy.'
        })
      })
    })
    
    // Send message
    await page.getByRole('button', { name: /send/i }).click()
    
    // Check for messages
    await expect(page.getByText(/what is photosynthesis/i)).toBeVisible()
    await expect(page.getByText(/photosynthesis is the process/i)).toBeVisible()
  })

  test('should enable selection mode and select messages', async ({ page }) => {
    // Navigate to chat page
    await page.getByRole('button', { name: /chat/i }).click()
    
    // Mock existing chat with messages
    await page.evaluate(() => {
      window.__mock_chat_messages = [
        { role: 'user', text: 'What is photosynthesis?', timestamp: new Date() },
        { role: 'model', text: 'Photosynthesis is the process by which plants convert light energy into chemical energy.', timestamp: new Date() }
      ]
    })
    
    // Click selection mode button
    await page.getByRole('button', { name: /select/i }).click()
    
    // Should show selection interface
    await expect(page.getByText(/cancel/i)).toBeVisible()
    
    // Check for selection checkboxes
    const checkboxes = page.getByRole('button').filter({ hasText: /select message/i })
    await expect(checkboxes.first()).toBeVisible()
    
    // Select first message
    await checkboxes.first().click()
    
    // Should show action bar
    await expect(page.getByText(/1 message selected/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /save segment/i })).toBeVisible()
  })

  test('should open save segment modal and show content options', async ({ page }) => {
    // Navigate to chat page
    await page.getByRole('button', { name: /chat/i }).click()
    
    // Mock existing chat with messages
    await page.evaluate(() => {
      window.__mock_chat_messages = [
        { role: 'user', text: 'What is photosynthesis?', timestamp: new Date() },
        { role: 'model', text: 'Photosynthesis is the process by which plants convert light energy into chemical energy.', timestamp: new Date() }
      ]
    })
    
    // Enable selection mode
    await page.getByRole('button', { name: /select/i }).click()
    
    // Select a message
    const checkbox = page.getByRole('button').filter({ hasText: /select message/i }).first()
    await checkbox.click()
    
    // Open save segment modal
    await page.getByRole('button', { name: /save segment/i }).click()
    
    // Check modal content
    await expect(page.getByText(/save chat segment/i)).toBeVisible()
    await expect(page.getByText(/save as content/i)).toBeVisible()
    await expect(page.getByText(/save as note/i)).toBeVisible()
    
    // Check preview
    await expect(page.getByText(/1 message selected/i)).toBeVisible()
  })

  test('should save segment as content and navigate to content generation', async ({ page }) => {
    // Navigate to chat page
    await page.getByRole('button', { name: /chat/i }).click()
    
    // Mock existing chat with messages
    await page.evaluate(() => {
      window.__mock_chat_messages = [
        { role: 'user', text: 'What is photosynthesis?', timestamp: new Date() },
        { role: 'model', text: 'Photosynthesis is the process by which plants convert light energy into chemical energy. It occurs in chloroplasts.', timestamp: new Date() }
      ]
    })
    
    // Enable selection mode
    await page.getByRole('button', { name: /select/i }).click()
    
    // Select AI response message
    const checkboxes = page.getByRole('button').filter({ hasText: /select message/i })
    await checkboxes.nth(1).click()
    
    // Open save segment modal
    await page.getByRole('button', { name: /save segment/i }).click()
    
    // Select "Save as Content" tab (should be default)
    await expect(page.getByRole('button', { name: /save as content/i })).toBeVisible()
    
    // Click save as content
    await page.getByRole('button', { name: /save as content/i }).click()
    
    // Should navigate to content generation page
    await expect(page.getByText(/content generation/i)).toBeVisible()
    
    // Check that content is pre-filled
    const contentTextarea = page.getByLabel(/book content/i)
    await expect(contentTextarea).toHaveValue(/photosynthesis is the process/)
    
    // Check for success message
    await expect(page.getByText(/content saved to content generation/i)).toBeVisible()
  })

  test('should save segment as note with custom title', async ({ page }) => {
    // Navigate to chat page
    await page.getByRole('button', { name: /chat/i }).click()
    
    // Mock existing chat with messages
    await page.evaluate(() => {
      window.__mock_chat_messages = [
        { role: 'user', text: 'What is photosynthesis?', timestamp: new Date() },
        { role: 'model', text: 'Photosynthesis is the process by which plants convert light energy into chemical energy.', timestamp: new Date() }
      ]
    })
    
    // Enable selection mode
    await page.getByRole('button', { name: /select/i }).click()
    
    // Select a message
    const checkbox = page.getByRole('button').filter({ hasText: /select message/i }).first()
    await checkbox.click()
    
    // Open save segment modal
    await page.getByRole('button', { name: /save segment/i }).click()
    
    // Switch to "Save as Note" tab
    await page.getByRole('button', { name: /save as note/i }).click()
    
    // Enter custom title
    const titleInput = page.getByLabel(/note title/i)
    await titleInput.fill('Photosynthesis Notes')
    
    // Mock Firestore save operation
    await page.route('**/firestore/**', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'note-123',
            success: true
          })
        })
      }
    })
    
    // Save as note
    await page.getByRole('button', { name: /save as note/i }).click()
    
    // Check for success message
    await expect(page.getByText(/note saved successfully/i)).toBeVisible()
  })

  test('should handle multiple message selection', async ({ page }) => {
    // Navigate to chat page
    await page.getByRole('button', { name: /chat/i }).click()
    
    // Mock existing chat with multiple messages
    await page.evaluate(() => {
      window.__mock_chat_messages = [
        { role: 'user', text: 'What is photosynthesis?', timestamp: new Date() },
        { role: 'model', text: 'Photosynthesis is the process by which plants convert light energy.', timestamp: new Date() },
        { role: 'user', text: 'How does it work?', timestamp: new Date() },
        { role: 'model', text: 'It works through chloroplasts in plant cells.', timestamp: new Date() }
      ]
    })
    
    // Enable selection mode
    await page.getByRole('button', { name: /select/i }).click()
    
    // Select multiple messages
    const checkboxes = page.getByRole('button').filter({ hasText: /select message/i })
    await checkboxes.nth(0).click()
    await checkboxes.nth(1).click()
    await checkboxes.nth(2).click()
    
    // Should show correct count
    await expect(page.getByText(/3 messages selected/i)).toBeVisible()
    
    // Open save segment modal
    await page.getByRole('button', { name: /save segment/i }).click()
    
    // Preview should show all selected messages
    await expect(page.getByText(/3 messages selected/i)).toBeVisible()
    
    // Content should be concatenated
    await expect(page.getByText(/what is photosynthesis/i)).toBeVisible()
    await expect(page.getByText(/photosynthesis is the process/i)).toBeVisible()
    await expect(page.getByText(/how does it work/i)).toBeVisible()
  })

  test('should clear selection when cancel is clicked', async ({ page }) => {
    // Navigate to chat page
    await page.getByRole('button', { name: /chat/i }).click()
    
    // Mock existing chat with messages
    await page.evaluate(() => {
      window.__mock_chat_messages = [
        { role: 'user', text: 'What is photosynthesis?', timestamp: new Date() },
        { role: 'model', text: 'Photosynthesis is the process by which plants convert light energy.', timestamp: new Date() }
      ]
    })
    
    // Enable selection mode
    await page.getByRole('button', { name: /select/i }).click()
    
    // Select a message
    const checkbox = page.getByRole('button').filter({ hasText: /select message/i }).first()
    await checkbox.click()
    
    // Should show selection
    await expect(page.getByText(/1 message selected/i)).toBeVisible()
    
    // Clear selection
    await page.getByRole('button', { name: /clear/i }).click()
    
    // Selection should be cleared
    await expect(page.getByText(/1 message selected/i)).not.toBeVisible()
  })

  test('should exit selection mode when cancel is clicked', async ({ page }) => {
    // Navigate to chat page
    await page.getByRole('button', { name: /chat/i }).click()
    
    // Mock existing chat with messages
    await page.evaluate(() => {
      window.__mock_chat_messages = [
        { role: 'user', text: 'What is photosynthesis?', timestamp: new Date() },
        { role: 'model', text: 'Photosynthesis is the process by which plants convert light energy.', timestamp: new Date() }
      ]
    })
    
    // Enable selection mode
    await page.getByRole('button', { name: /select/i }).click()
    
    // Should show cancel button
    await expect(page.getByRole('button', { name: /cancel/i })).toBeVisible()
    
    // Exit selection mode
    await page.getByRole('button', { name: /cancel/i }).click()
    
    // Should be back to normal mode
    await expect(page.getByRole('button', { name: /select/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /cancel/i })).not.toBeVisible()
  })

  test('should validate that at least one message is selected', async ({ page }) => {
    // Navigate to chat page
    await page.getByRole('button', { name: /chat/i }).click()
    
    // Mock existing chat with messages
    await page.evaluate(() => {
      window.__mock_chat_messages = [
        { role: 'user', text: 'What is photosynthesis?', timestamp: new Date() },
        { role: 'model', text: 'Photosynthesis is the process by which plants convert light energy.', timestamp: new Date() }
      ]
    })
    
    // Enable selection mode
    await page.getByRole('button', { name: /select/i }).click()
    
    // Try to save without selecting any messages
    await page.getByRole('button', { name: /save segment/i }).click()
    
    // Should show error message
    await expect(page.getByText(/please select at least one message/i)).toBeVisible()
  })

  test('should handle voice feedback for navigation', async ({ page }) => {
    // Navigate to chat page
    await page.getByRole('button', { name: /chat/i }).click()
    
    // Mock existing chat with messages
    await page.evaluate(() => {
      window.__mock_chat_messages = [
        { role: 'user', text: 'What is photosynthesis?', timestamp: new Date() },
        { role: 'model', text: 'Photosynthesis is the process by which plants convert light energy.', timestamp: new Date() }
      ]
    })
    
    // Enable selection mode
    await page.getByRole('button', { name: /select/i }).click()
    
    // Select a message
    const checkbox = page.getByRole('button').filter({ hasText: /select message/i }).first()
    await checkbox.click()
    
    // Open save segment modal
    await page.getByRole('button', { name: /save segment/i }).click()
    
    // Click save as content
    await page.getByRole('button', { name: /save as content/i }).click()
    
    // Should show voice feedback
    await expect(page.getByText(/navigating to content generation/i)).toBeVisible()
  })

  test('should be responsive on mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Navigate to chat page
    await page.getByRole('button', { name: /chat/i }).click()
    
    // Mock existing chat with messages
    await page.evaluate(() => {
      window.__mock_chat_messages = [
        { role: 'user', text: 'What is photosynthesis?', timestamp: new Date() },
        { role: 'model', text: 'Photosynthesis is the process by which plants convert light energy.', timestamp: new Date() }
      ]
    })
    
    // Enable selection mode
    await page.getByRole('button', { name: /select/i }).click()
    
    // Select a message
    const checkbox = page.getByRole('button').filter({ hasText: /select message/i }).first()
    await checkbox.click()
    
    // Open save segment modal
    await page.getByRole('button', { name: /save segment/i }).click()
    
    // Modal should be responsive
    await expect(page.getByText(/save chat segment/i)).toBeVisible()
    await expect(page.getByText(/save as content/i)).toBeVisible()
    
    // Content should be scrollable
    const modal = page.getByRole('dialog')
    await expect(modal).toBeVisible()
  })

  test('should handle errors gracefully during save operations', async ({ page }) => {
    // Navigate to chat page
    await page.getByRole('button', { name: /chat/i }).click()
    
    // Mock existing chat with messages
    await page.evaluate(() => {
      window.__mock_chat_messages = [
        { role: 'user', text: 'What is photosynthesis?', timestamp: new Date() },
        { role: 'model', text: 'Photosynthesis is the process by which plants convert light energy.', timestamp: new Date() }
      ]
    })
    
    // Enable selection mode
    await page.getByRole('button', { name: /select/i }).click()
    
    // Select a message
    const checkbox = page.getByRole('button').filter({ hasText: /select message/i }).first()
    await checkbox.click()
    
    // Open save segment modal
    await page.getByRole('button', { name: /save segment/i }).click()
    
    // Switch to note tab
    await page.getByRole('button', { name: /save as note/i }).click()
    
    // Enter title
    const titleInput = page.getByLabel(/note title/i)
    await titleInput.fill('Test Note')
    
    // Mock Firestore error
    await page.route('**/firestore/**', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Internal server error'
        })
      })
    })
    
    // Try to save as note
    await page.getByRole('button', { name: /save as note/i }).click()
    
    // Should show error message
    await expect(page.getByText(/failed to save note/i)).toBeVisible()
  })
})
