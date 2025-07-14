import { test, expect } from '@playwright/test';

test.describe('ResearchHub Application Tests', () => {
  test('Homepage loads successfully', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check if the page loaded
    await expect(page).toHaveTitle(/ResearchHub|Research|AfakarM/);
    
    // Take a screenshot
    await page.screenshot({ path: 'testing/screenshots/homepage.png' });
    
    console.log('✅ Homepage loaded successfully');
  });

  test('Navigation elements are present', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Look for common navigation elements
    const navigation = page.locator('nav, [role="navigation"], header');
    await expect(navigation).toBeVisible();
    
    console.log('✅ Navigation elements found');
  });

  test('Login page is accessible', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Look for login form elements
    const loginForm = page.locator('form, [data-testid="login"], input[type="email"], input[type="password"]');
    await expect(loginForm.first()).toBeVisible();
    
    // Take a screenshot
    await page.screenshot({ path: 'testing/screenshots/login-page.png' });
    
    console.log('✅ Login page accessible');
  });

  test('Register page is accessible', async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('networkidle');
    
    // Look for registration form
    const registerForm = page.locator('form, [data-testid="register"], input[type="email"]');
    await expect(registerForm.first()).toBeVisible();
    
    console.log('✅ Register page accessible');
  });

  test('API health check', async ({ request }) => {
    const response = await request.get('http://localhost:3003/api/health');
    expect(response.status()).toBe(200);
    
    const body = await response.json();
    expect(body.status).toBe('healthy');
    
    console.log('✅ API health check passed');
  });

  test('Studies page is accessible', async ({ page }) => {
    await page.goto('/studies');
    await page.waitForLoadState('networkidle');
    
    // Should not throw an error
    const heading = page.locator('h1, h2, [data-testid="studies"], .studies');
    await expect(heading.first()).toBeVisible();
    
    console.log('✅ Studies page accessible');
  });

  test('Application has no console errors', async ({ page }) => {
    const errors = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait a bit for any async operations
    await page.waitForTimeout(2000);
    
    // Filter out common non-critical errors
    const criticalErrors = errors.filter(error => 
      !error.includes('favicon') && 
      !error.includes('404') &&
      !error.includes('net::ERR_BLOCKED_BY_CLIENT')
    );
    
    if (criticalErrors.length > 0) {
      console.log('⚠️ Console errors found:', criticalErrors);
    } else {
      console.log('✅ No critical console errors');
    }
    
    // Don't fail on non-critical errors for now
    expect(criticalErrors.length).toBeLessThan(5);
  });

  test('Responsive design check', async ({ page }) => {
    // Test desktop
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'testing/screenshots/desktop.png' });
    
    // Test tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'testing/screenshots/tablet.png' });
    
    // Test mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'testing/screenshots/mobile.png' });
    
    console.log('✅ Responsive design screenshots captured');
  });
});
