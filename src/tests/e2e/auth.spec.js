import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display landing page for unauthenticated users', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('ECC App')
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign Up' })).toBeVisible()
  })

  test('should navigate to login form when Login button is clicked', async ({ page }) => {
    await page.getByRole('button', { name: 'Login' }).click()
    
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible()
  })

  test('should navigate to signup form when Sign Up button is clicked', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign Up' }).click()
    
    await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Create Account' })).toBeVisible()
  })

  test('should show validation errors for invalid email', async ({ page }) => {
    await page.getByRole('button', { name: 'Login' }).click()
    
    await page.getByLabel('Email').fill('invalid-email')
    await page.getByLabel('Password').fill('password123')
    await page.getByRole('button', { name: 'Sign In' }).click()
    
    await expect(page.getByText(/invalid email/i)).toBeVisible()
  })

  test('should show validation errors for short password', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign Up' }).click()
    
    await page.getByLabel('Email').fill('test@example.com')
    await page.getByLabel('Password').fill('123')
    await page.getByRole('button', { name: 'Create Account' }).click()
    
    await expect(page.getByText(/password should be at least 6 characters/i)).toBeVisible()
  })

  test('should toggle between login and signup forms', async ({ page }) => {
    await page.getByRole('button', { name: 'Login' }).click()
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible()
    
    await page.getByText('Sign Up').click()
    await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible()
    
    await page.getByText('Sign In').click()
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible()
  })

  test('should show loading state during authentication', async ({ page }) => {
    await page.getByRole('button', { name: 'Login' }).click()
    
    await page.getByLabel('Email').fill('test@example.com')
    await page.getByLabel('Password').fill('password123')
    
    // Mock network delay to test loading state
    await page.route('**/auth/**', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      await route.continue()
    })
    
    const signInButton = page.getByRole('button', { name: 'Sign In' })
    await signInButton.click()
    
    await expect(signInButton).toBeDisabled()
    await expect(page.getByText(/signing in/i)).toBeVisible()
  })

  test('should have proper accessibility attributes', async ({ page }) => {
    await page.getByRole('button', { name: 'Login' }).click()
    
    const emailInput = page.getByLabel('Email')
    const passwordInput = page.getByLabel('Password')
    
    await expect(emailInput).toHaveAttribute('type', 'email')
    await expect(emailInput).toHaveAttribute('required')
    await expect(passwordInput).toHaveAttribute('type', 'password')
    await expect(passwordInput).toHaveAttribute('required')
  })

  test('should focus management work correctly', async ({ page }) => {
    await page.getByRole('button', { name: 'Login' }).click()
    
    // Tab navigation should work
    await page.keyboard.press('Tab')
    await expect(page.getByLabel('Email')).toBeFocused()
    
    await page.keyboard.press('Tab')
    await expect(page.getByLabel('Password')).toBeFocused()
    
    await page.keyboard.press('Tab')
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeFocused()
  })

  test('should work on mobile viewports', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    
    await page.getByRole('button', { name: 'Login' }).click()
    
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    
    // Form should be responsive
    const form = page.locator('form').first()
    const boundingBox = await form.boundingBox()
    expect(boundingBox.width).toBeLessThanOrEqual(375)
  })
})
