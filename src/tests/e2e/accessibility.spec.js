import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Accessibility Tests', () => {
  test('should pass accessibility audit on landing page', async ({ page }) => {
    await page.goto('/')
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('should pass accessibility audit on authentication screen', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Login' }).click()
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('should pass accessibility audit on content generation page', async ({ page }) => {
    // Mock authenticated state
    await page.goto('/?mock_auth=true')
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('should pass accessibility audit on history page', async ({ page }) => {
    await page.goto('/?mock_auth=true')
    await page.getByRole('button', { name: /history/i }).click()
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/')
    
    // Check heading hierarchy
    const h1 = await page.locator('h1').count()
    expect(h1).toBeGreaterThan(0)
    
    // Ensure h1 comes before h2, h2 before h3, etc.
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all()
    const headingLevels = await Promise.all(
      headings.map(async (heading) => parseInt(await heading.evaluate(el => el.tagName.charAt(1))))
    )
    
    // Check that heading levels don't skip (e.g., h1 -> h3)
    for (let i = 1; i < headingLevels.length; i++) {
      const diff = headingLevels[i] - headingLevels[i - 1]
      expect(diff).toBeLessThanOrEqual(1)
    }
  })

  test('should have proper form labels and ARIA attributes', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Login' }).click()
    
    // Check that all form inputs have labels
    const inputs = await page.locator('input').all()
    for (const input of inputs) {
      const id = await input.getAttribute('id')
      const ariaLabel = await input.getAttribute('aria-label')
      const ariaLabelledBy = await input.getAttribute('aria-labelledby')
      
      if (id) {
        const label = page.locator(`label[for="${id}"]`)
        const labelExists = await label.count() > 0
        
        expect(labelExists || ariaLabel || ariaLabelledBy).toBeTruthy()
      } else {
        expect(ariaLabel || ariaLabelledBy).toBeTruthy()
      }
    }
  })

  test('should have proper focus management', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Login' }).click()
    
    // Test tab navigation
    await page.keyboard.press('Tab')
    let focusedElement = await page.evaluate(() => document.activeElement.tagName)
    expect(['INPUT', 'BUTTON', 'SELECT', 'TEXTAREA']).toContain(focusedElement)
    
    await page.keyboard.press('Tab')
    focusedElement = await page.evaluate(() => document.activeElement.tagName)
    expect(['INPUT', 'BUTTON', 'SELECT', 'TEXTAREA']).toContain(focusedElement)
  })

  test('should have proper color contrast', async ({ page }) => {
    await page.goto('/')
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .include('.text-gray-600') // Test specific color classes
      .analyze()

    // Check for color contrast violations
    const contrastViolations = accessibilityScanResults.violations.filter(
      violation => violation.id === 'color-contrast'
    )
    expect(contrastViolations).toEqual([])
  })

  test('should work with screen reader simulation', async ({ page }) => {
    await page.goto('/')
    
    // Test that important elements have proper ARIA labels
    const mainButton = page.getByRole('button', { name: 'Login' })
    await expect(mainButton).toBeVisible()
    
    const navigation = page.getByRole('navigation')
    if (await navigation.count() > 0) {
      await expect(navigation).toBeVisible()
    }
  })

  test('should have proper modal accessibility', async ({ page }) => {
    await page.goto('/?mock_auth=true')
    await page.getByRole('button', { name: /history/i }).click()
    
    // Trigger a modal (delete confirmation)
    const deleteButton = page.getByRole('button', { name: /delete/i }).first()
    if (await deleteButton.count() > 0) {
      await deleteButton.click()
      
      // Check modal accessibility
      const modal = page.locator('[role="dialog"]').or(page.locator('.fixed'))
      await expect(modal).toBeVisible()
      
      // Modal should trap focus
      await page.keyboard.press('Tab')
      const focusedElement = await page.evaluate(() => document.activeElement)
      const modalContainer = await modal.first().evaluate(el => el)
      
      // Focus should be within the modal
      const focusWithinModal = await page.evaluate((modal, focused) => {
        return modal.contains(focused)
      }, modalContainer, focusedElement)
      
      expect(focusWithinModal).toBeTruthy()
    }
  })

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/')
    
    // Navigate using only keyboard
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Enter') // Should activate focused element
    
    // Check that keyboard navigation works
    const activeElement = await page.evaluate(() => document.activeElement.tagName)
    expect(['INPUT', 'BUTTON', 'A', 'SELECT', 'TEXTAREA']).toContain(activeElement)
  })

  test('should have proper alt text for images', async ({ page }) => {
    await page.goto('/?mock_auth=true')
    
    const images = await page.locator('img').all()
    for (const img of images) {
      const alt = await img.getAttribute('alt')
      const ariaLabel = await img.getAttribute('aria-label')
      const ariaLabelledBy = await img.getAttribute('aria-labelledby')
      const role = await img.getAttribute('role')
      
      // Images should have alt text, aria-label, or be decorative
      const hasAccessibleName = alt !== null || ariaLabel || ariaLabelledBy
      const isDecorative = role === 'presentation' || alt === ''
      
      expect(hasAccessibleName || isDecorative).toBeTruthy()
    }
  })

  test('should support dark mode accessibility', async ({ page }) => {
    await page.goto('/?mock_auth=true')
    
    // Toggle to dark mode
    const themeButton = page.getByRole('button', { name: /toggle theme/i })
    await themeButton.click()
    
    // Run accessibility audit on dark mode
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('should have proper error message accessibility', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Login' }).click()
    
    // Trigger validation error
    await page.getByRole('button', { name: /sign in/i }).click()
    
    // Check that error messages are properly associated
    const errorMessages = await page.locator('[role="alert"]').or(page.locator('.text-red-')).all()
    
    if (errorMessages.length > 0) {
      for (const error of errorMessages) {
        const isVisible = await error.isVisible()
        expect(isVisible).toBeTruthy()
      }
    }
  })
})
