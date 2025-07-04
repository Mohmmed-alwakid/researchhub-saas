import { test, expect } from '@playwright/test';

test.describe('Maze-Inspired Study Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:5175');
    
    // Login with researcher account
    await page.fill('[data-testid="email-input"]', 'abwanwr77+Researcher@gmail.com');
    await page.fill('[data-testid="password-input"]', 'Testtest123');
    await page.click('[data-testid="login-button"]');
    
    // Wait for dashboard to load
    await page.waitForSelector('[data-testid="dashboard"]');
  });

  test('should open Maze-inspired modal when clicking New Study', async ({ page }) => {
    // Click the "New Study" button
    await page.click('button:has-text("New Study")');
    
    // Verify the new modal opens
    await expect(page.locator('[data-testid="maze-inspired-modal"]')).toBeVisible();
    
    // Check that the simplified study type selector is visible
    await expect(page.locator('[data-testid="study-type-selector"]')).toBeVisible();
    
    // Verify study type cards are present
    await expect(page.locator('[data-testid="study-type-card"]')).toHaveCount(3);
  });

  test('should navigate through study type selection to template gallery', async ({ page }) => {
    // Open the modal
    await page.click('button:has-text("New Study")');
    
    // Select a study type
    await page.click('[data-testid="study-type-usability"]');
    
    // Verify template gallery is shown
    await expect(page.locator('[data-testid="template-gallery"]')).toBeVisible();
    
    // Check category tabs are present
    await expect(page.locator('[data-testid="category-tab"]')).toHaveCount(5);
      // Verify templates are displayed
    const templateCards = page.locator('[data-testid="template-card"]');
    await expect(templateCards.first()).toBeVisible();
  });

  test('should open template preview modal', async ({ page }) => {
    // Navigate to template gallery
    await page.click('button:has-text("New Study")');
    await page.click('[data-testid="study-type-usability"]');
    
    // Click on a template
    await page.click('[data-testid="template-card"]:first-child');
    
    // Verify preview modal opens
    await expect(page.locator('[data-testid="template-preview-modal"]')).toBeVisible();
    
    // Check tabs are present
    await expect(page.locator('[data-testid="preview-tab-overview"]')).toBeVisible();
    await expect(page.locator('[data-testid="preview-tab-preview"]')).toBeVisible();
    await expect(page.locator('[data-testid="preview-tab-customize"]')).toBeVisible();
  });

  test('should allow variable customization in template preview', async ({ page }) => {
    // Navigate to template preview
    await page.click('button:has-text("New Study")');
    await page.click('[data-testid="study-type-usability"]');
    await page.click('[data-testid="template-card"]:first-child');
    
    // Switch to customize tab
    await page.click('[data-testid="preview-tab-customize"]');
    
    // Fill in variables
    await page.fill('[data-testid="variable-productName"]', 'My Awesome Product');
    await page.fill('[data-testid="variable-companyName"]', 'My Company');
    
    // Use the template
    await page.click('button:has-text("Use This Template")');
    
    // Should navigate to study builder
    await expect(page).toHaveURL(/\/app\/studies\/template-preview/);
  });

  test('should allow starting from scratch', async ({ page }) => {
    // Navigate to template gallery
    await page.click('button:has-text("New Study")');
    await page.click('[data-testid="study-type-usability"]');
    
    // Click "Start from Scratch"
    await page.click('button:has-text("Start from Scratch")');
    
    // Should navigate to study builder
    await expect(page).toHaveURL(/\/app\/studies\/create/);
  });
});
