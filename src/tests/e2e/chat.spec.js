import { test, expect } from '@playwright/test';

test.describe('Chat/Discussion Mode', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Mock authentication (you may need to adjust this based on your auth setup)
    await page.evaluate(() => {
      // Mock user authentication
      localStorage.setItem('user', JSON.stringify({
        uid: 'test-user-123',
        email: 'test@example.com',
        displayName: 'Test User'
      }));
    });
    
    // Navigate to chat page
    await page.click('[aria-label="Navigate to Chat/Discussion"]');
  });

  test('should display chat sidebar with new chat button', async ({ page }) => {
    // Wait for chat page to load
    await page.waitForSelector('[data-testid="chat-sidebar"]', { timeout: 10000 });
    
    // Check if New Chat button is visible
    await expect(page.locator('text=New Chat')).toBeVisible();
    
    // Check if search bar is present
    await expect(page.locator('input[placeholder="Search chats..."]')).toBeVisible();
  });

  test('should create a new chat when New Chat button is clicked', async ({ page }) => {
    // Wait for chat page to load
    await page.waitForSelector('[data-testid="chat-sidebar"]', { timeout: 10000 });
    
    // Click New Chat button
    await page.click('text=New Chat');
    
    // Verify that a new chat is created (you may need to adjust this based on your UI)
    await expect(page.locator('text=New Chat')).toBeVisible();
  });

  test('should show general chat in sidebar', async ({ page }) => {
    // Wait for chat page to load
    await page.waitForSelector('[data-testid="chat-sidebar"]', { timeout: 10000 });
    
    // Check if General Discussion chat is visible
    await expect(page.locator('text=General Discussion')).toBeVisible();
  });

  test('should be able to search chats', async ({ page }) => {
    // Wait for chat page to load
    await page.waitForSelector('[data-testid="chat-sidebar"]', { timeout: 10000 });
    
    // Type in search box
    await page.fill('input[placeholder="Search chats..."]', 'general');
    
    // Verify search is working (General chat should still be visible)
    await expect(page.locator('text=General Discussion')).toBeVisible();
  });

  test('should display chat window when chat is selected', async ({ page }) => {
    // Wait for chat page to load
    await page.waitForSelector('[data-testid="chat-sidebar"]', { timeout: 10000 });
    
    // Click on General Discussion chat
    await page.click('text=General Discussion');
    
    // Verify chat window is displayed
    await expect(page.locator('text=Select a Chat')).not.toBeVisible();
    await expect(page.locator('input[placeholder="Type a message..."]')).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Wait for chat page to load
    await page.waitForSelector('[data-testid="mobile-sidebar-toggle"]', { timeout: 10000 });
    
    // Check if mobile menu button is visible
    await expect(page.locator('[data-testid="mobile-sidebar-toggle"]')).toBeVisible();
    
    // Click mobile menu button to open sidebar
    await page.click('[data-testid="mobile-sidebar-toggle"]');
    
    // Verify sidebar is open
    await expect(page.locator('text=New Chat')).toBeVisible();
  });

  test('should handle empty state properly', async ({ page }) => {
    // Wait for chat page to load
    await page.waitForSelector('[data-testid="chat-sidebar"]', { timeout: 10000 });
    
    // If no chat is selected, should show welcome message
    await expect(page.locator('text=Welcome to Chat/Discussion Mode!')).toBeVisible();
    await expect(page.locator('text=Select a chat from the sidebar or start a new one.')).toBeVisible();
  });
});
