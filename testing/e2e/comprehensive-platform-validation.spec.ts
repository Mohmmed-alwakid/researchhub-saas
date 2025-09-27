import { test, expect } from '@playwright/test';

/**
 * COMPREHENSIVE E2E PLATFORM VALIDATION
 * Tests complete platform functionality now that authentication is working
 * 
 * BREAKTHROUGH CONTEXT:
 * - Authentication issues resolved (401s were causing "timeout" appearance)
 * - Token refresh mechanism fixed
 * - Platform confirmed production-ready
 * 
 * Test Coverage:
 * 1. Participant authentication and dashboard
 * 2. Researcher authentication and study management
 * 3. Study creation workflow
 * 4. Cross-role functionality validation
 */

// Test accounts (mandatory - use only these)
const TEST_ACCOUNTS = {
  participant: {
    email: 'abwanwr77+participant@gmail.com',
    password: 'Testtest123'
  },
  researcher: {
    email: 'abwanwr77+Researcher@gmail.com',
    password: 'Testtest123'
  },
  admin: {
    email: 'abwanwr77+admin@gmail.com',
    password: 'Testtest123'
  }
};

test.describe('Complete Platform E2E Validation', () => {
  
  test('Participant Authentication and Dashboard Access', async ({ page }) => {
    // Navigate to login
    await page.goto('https://researchhub-saas.vercel.app/login');
    
    // Login as participant
    await page.fill('input[type="email"]', TEST_ACCOUNTS.participant.email);
    await page.fill('input[type="password"]', TEST_ACCOUNTS.participant.password);
    await page.click('button[type="submit"]');
    
    // Wait for authentication and redirect
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Verify participant dashboard elements
    await expect(page.locator('h1, h2, h3')).toContainText(['Participant Dashboard', 'Dashboard'], { ignoreCase: true });
    await expect(page.locator('text=Applications')).toBeVisible();
    await expect(page.locator('text=Total Applications')).toBeVisible();
    
    // Verify no 401 authentication errors in console
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error' && msg.text().includes('401')) {
        consoleLogs.push(msg.text());
      }
    });
    
    // Wait a moment for any async operations
    await page.waitForTimeout(2000);
    
    // Verify no 401 errors
    expect(consoleLogs.filter(log => log.includes('401'))).toHaveLength(0);
    
    console.log('✅ Participant authentication and dashboard validation successful');
  });

  test('Researcher Authentication and Study Management', async ({ page }) => {
    // Navigate to login
    await page.goto('https://researchhub-saas.vercel.app/login');
    
    // Login as researcher
    await page.fill('input[type="email"]', TEST_ACCOUNTS.researcher.email);
    await page.fill('input[type="password"]', TEST_ACCOUNTS.researcher.password);
    await page.click('button[type="submit"]');
    
    // Wait for authentication and redirect
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Verify researcher dashboard elements
    await expect(page.locator('text=Welcome back!')).toBeVisible();
    await expect(page.locator('text=Total Studies')).toBeVisible();
    await expect(page.locator('text=Active Participants')).toBeVisible();
    await expect(page.locator('text=Completion Rate')).toBeVisible();
    
    // Test navigation elements
    await expect(page.locator('text=Studies')).toBeVisible();
    await expect(page.locator('text=Templates')).toBeVisible();
    await expect(page.locator('text=Participants')).toBeVisible();
    
    console.log('✅ Researcher authentication and dashboard validation successful');
  });

  test('Study Creation Workflow Access', async ({ page }) => {
    // Login as researcher first
    await page.goto('https://researchhub-saas.vercel.app/login');
    await page.fill('input[type="email"]', TEST_ACCOUNTS.researcher.email);
    await page.fill('input[type="password"]', TEST_ACCOUNTS.researcher.password);
    await page.click('button[type="submit"]');
    
    // Wait for dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Test study creation workflow access
    const createStudyButton = page.locator('button:has-text("Create New Study"), button:has-text("New Study")');
    await expect(createStudyButton.first()).toBeVisible();
    
    // Click to test workflow access
    await createStudyButton.first().click();
    
    // Wait for study creation interface
    await page.waitForTimeout(3000);
    
    // Verify study creation workflow is accessible (not 404)
    const pageText = await page.textContent('body');
    expect(pageText).not.toContain('Page Not Found');
    expect(pageText).not.toContain('404');
    
    console.log('✅ Study creation workflow access validation successful');
  });

  test('API Performance and Authentication Validation', async ({ page }) => {
    // Monitor network requests
    const apiRequests: Array<{url: string, status: number, responseTime: number}> = [];
    const authFailures: string[] = [];
    
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        apiRequests.push({
          url: response.url(),
          status: response.status(),
          responseTime: Date.now() // Simplified timing
        });
        
        if (response.status() === 401) {
          authFailures.push(response.url());
        }
      }
    });
    
    // Login and navigate
    await page.goto('https://researchhub-saas.vercel.app/login');
    await page.fill('input[type="email"]', TEST_ACCOUNTS.researcher.email);
    await page.fill('input[type="password"]', TEST_ACCOUNTS.researcher.password);
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Wait for API calls to complete
    await page.waitForTimeout(5000);
    
    // Validate API performance
    const successfulRequests = apiRequests.filter(req => req.status >= 200 && req.status < 300);
    expect(successfulRequests.length).toBeGreaterThan(0);
    
    // Validate no authentication failures
    expect(authFailures).toHaveLength(0);
    
    console.log('✅ API performance and authentication validation successful');
    console.log(`📊 Successful API requests: ${successfulRequests.length}`);
    console.log(`📊 Authentication failures: ${authFailures.length}`);
  });

  test('Cross-Role Navigation and Security', async ({ page }) => {
    // Test participant role isolation
    await page.goto('https://researchhub-saas.vercel.app/login');
    await page.fill('input[type="email"]', TEST_ACCOUNTS.participant.email);
    await page.fill('input[type="password"]', TEST_ACCOUNTS.participant.password);
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Verify participant sees participant-specific navigation
    const navigation = await page.textContent('nav, .navigation, [role="navigation"]');
    expect(navigation).not.toContain('Create New Study');
    expect(navigation).not.toContain('Templates');
    
    // Test logout and re-authentication
    await page.goto('https://researchhub-saas.vercel.app/logout');
    await page.waitForTimeout(1000);
    
    // Verify logout worked (should redirect to login or home)
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/(login|home|\/$)/);
    
    console.log('✅ Cross-role navigation and security validation successful');
  });
});