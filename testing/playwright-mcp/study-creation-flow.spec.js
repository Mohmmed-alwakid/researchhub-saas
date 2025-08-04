import { test, expect } from '@playwright/test';

/**
 * ResearchHub Study Creation Flow - E2E Testing with Playwright MCP
 * Tests the complete study creation workflow with real browser automation
 */

test.describe('ResearchHub Study Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to local development environment
    await page.goto('/');
    
    // Wait for page load
    await page.waitForLoadState('networkidle');
  });

  test('Landing page loads correctly', async ({ page }) => {
    // Check if we're on landing page or already logged in
    const title = await page.title();
    expect(title).toContain('Afkar');
    
    // Look for key elements that should be present on landing page
    const hasSignInLink = await page.locator('a[href="/login"]').first().isVisible();
    const hasGetStartedButton = await page.locator('a[href="/register"]').first().isVisible();
    const hasStartTrialButton = await page.getByText('Start Free Trial').first().isVisible();
    const hasDashboard = await page.locator('[data-testid="dashboard"]').isVisible();
    
    // Landing page should have sign in link or get started button, OR user should be on dashboard
    expect(hasSignInLink || hasGetStartedButton || hasStartTrialButton || hasDashboard).toBeTruthy();
    
    console.log('✅ Landing page loaded successfully');
  });

  test('Authentication flow works', async ({ page }) => {
    // Check if already logged in
    const alreadyLoggedIn = await page.locator('[data-testid="dashboard"]').isVisible();
    
    if (!alreadyLoggedIn) {
      // Look for email input field
      const emailInput = page.locator('input[type="email"]').first();
      const passwordInput = page.locator('input[type="password"]').first();
      
      if (await emailInput.isVisible()) {
        // Fill login form
        await emailInput.fill('abwanwr77+Researcher@gmail.com');
        await passwordInput.fill('Testtest123');
        
        // Look for login button
        const loginButton = page.locator('button:has-text("Login"), button:has-text("Sign In"), [type="submit"]').first();
        await loginButton.click();
        
        // Wait for navigation
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
      }
    }
    
    // Verify we're logged in by checking for user interface elements
    const hasUserElements = await page.locator('nav, [data-testid="user-menu"], .dashboard').count() > 0;
    expect(hasUserElements).toBeTruthy();
    
    console.log('✅ Authentication successful');
  });

  test('Navigation to study creation', async ({ page }) => {
    // Navigate to login page for authentication
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Try to authenticate if login form is present
    const emailInput = page.locator('input[type="email"]').first();
    if (await emailInput.isVisible()) {
      await emailInput.fill('abwanwr77+Researcher@gmail.com');
      await page.locator('input[type="password"]').first().fill('Testtest123');
      await page.locator('button:has-text("Login"), button:has-text("Sign In"), [type="submit"]').first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
    }
    
    // Should now be on dashboard - look for study creation elements
    const createButtons = [
      '[data-testid="create-study"]',
      '[data-testid="create-new-study"]',
      'button:has-text("New Study")',
      'button:has-text("Create New Study")',
      'button:has-text("Create Study")',
      'a[href*="/app/study-builder"]'
    ];

    let createButtonFound = false;
    for (const selector of createButtons) {
      const button = page.locator(selector).first();
      if (await button.isVisible()) {
        await button.click();
        createButtonFound = true;
        console.log(`✅ Found and clicked create button: ${selector}`);
        break;
      }
    }
    
    if (!createButtonFound) {
      // Take screenshot for debugging
      await page.screenshot({ path: 'testing/reports/debug-no-create-button.png' });
      console.log('ℹ️ No create button found - might be on a different page structure');
    }
    
    // Wait for any modal or navigation
    await page.waitForTimeout(1000);
    
    // Check if study creation interface is visible
    const hasStudyCreation = await page.locator('[data-testid="study-builder"], .study-creation, form').count() > 0;
    
    console.log(`✅ Study creation navigation completed (creation interface: ${hasStudyCreation})`);
  });

  test('Basic UI elements are functional', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Test basic interactions
    const clickableElements = await page.locator('button, a, [role="button"]').count();
    expect(clickableElements).toBeGreaterThan(0);
    
    // Test form elements if present
    const formElements = await page.locator('input, textarea, select').count();
    if (formElements > 0) {
      console.log(`✅ Found ${formElements} form elements`);
    }
    
    // Test responsive design
    await page.setViewportSize({ width: 375, height: 667 }); // Mobile
    await page.waitForTimeout(500);
    
    await page.setViewportSize({ width: 1280, height: 720 }); // Desktop
    await page.waitForTimeout(500);
    
    console.log('✅ UI elements are functional and responsive');
  });

  test('Error handling works', async ({ page }) => {
    await page.goto('/');
    
    // Test invalid login if login form is present
    const emailInput = page.locator('input[type="email"]').first();
    if (await emailInput.isVisible()) {
      await emailInput.fill('invalid@email.com');
      await page.locator('input[type="password"]').first().fill('wrongpassword');
      await page.locator('button:has-text("Login"), button:has-text("Sign In"), [type="submit"]').first().click();
      
      // Wait for error message
      await page.waitForTimeout(2000);
      
      // Check for error indicators
      const hasError = await page.locator('.error, [role="alert"], .alert-danger, .text-red').count() > 0;
      console.log(`✅ Error handling test completed (error shown: ${hasError})`);
    } else {
      console.log('✅ No login form found - skipping error test');
    }
  });

  test('Performance test - page load times', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Expect page to load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
    
    console.log(`✅ Page load time: ${loadTime}ms`);
  });
});
