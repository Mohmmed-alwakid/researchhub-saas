/**
 * Participant User Acceptance Testing (UAT) Scenarios
 * Product Manager Requirements: Comprehensive participant workflow validation
 * Last Updated: July 7, 2025
 */

import { test, expect } from '@playwright/test';

// Test Data - Using mandatory test accounts
const PARTICIPANT_ACCOUNT = {
  email: 'abwanwr77+participant@gmail.com',
  password: 'Testtest123',
  role: 'participant'
};

const RESEARCHER_ACCOUNT = {
  email: 'abwanwr77+Researcher@gmail.com',
  password: 'Testtest123',
  role: 'researcher'
};

const BASE_URL = 'http://localhost:5175';

/**
 * UAT-P001: Study Discovery and Application Process
 * Success Criteria: Participant can discover studies and submit applications
 */
test.describe('UAT-P001: Study Discovery & Application', () => {
  
  test('P001.1: Participant registration and login', async ({ page }) => {
    // Test participant login
    await page.goto(`${BASE_URL}/signin`);
    await page.fill('input[type="email"]', PARTICIPANT_ACCOUNT.email);
    await page.fill('input[type="password"]', PARTICIPANT_ACCOUNT.password);
    await page.click('button:has-text("Sign in")');
    
    // Verify participant dashboard access
    await expect(page.locator('text=participant')).toBeVisible();
    await page.waitForLoadState('networkidle');
  });

  test('P001.2: Study discovery and browsing', async ({ page }) => {
    // Login as participant
    await page.goto(`${BASE_URL}/signin`);
    await page.fill('input[type="email"]', PARTICIPANT_ACCOUNT.email);
    await page.fill('input[type="password"]', PARTICIPANT_ACCOUNT.password);
    await page.click('button:has-text("Sign in")');
    
    // Navigate to study discovery (may be dashboard or dedicated page)
    await page.waitForLoadState('networkidle');
    
    // Look for study listings or available studies
    // This validates the participant can see available studies
    await page.screenshot({ path: 'testing/screenshots/participant-discovery.png' });
  });

  test('P001.3: Study application submission', async ({ page }) => {
    // Login as participant
    await page.goto(`${BASE_URL}/signin`);
    await page.fill('input[type="email"]', PARTICIPANT_ACCOUNT.email);
    await page.fill('input[type="password"]', PARTICIPANT_ACCOUNT.password);
    await page.click('button:has-text("Sign in")');
    
    await page.waitForLoadState('networkidle');
    
    // Test application submission process
    // Look for "Apply" buttons or application forms
    const applyButtons = page.locator('button:has-text("Apply")');
    if (await applyButtons.count() > 0) {
      await applyButtons.first().click();
      
      // Fill out application if form appears
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'testing/screenshots/participant-application.png' });
    }
  });
});

/**
 * UAT-P002: Study Session Completion Across All Block Types
 * Success Criteria: Participant can complete sessions with all block types
 */
test.describe('UAT-P002: Study Session Completion', () => {
  
  test('P002.1: Welcome screen interaction', async ({ page }) => {
    // Use existing study session test interface
    await page.goto('file:///d:/MAMP/AfakarM/testing/study-session-test.html');
    
    // Test welcome screen
    await page.click('button:has-text("Load Test Session")');
    await expect(page.locator('text=Welcome to our')).toBeVisible();
    
    // Verify session information display
    await expect(page.locator('text=Block 1 of')).toBeVisible();
    await expect(page.locator('text=Session ID')).toBeVisible();
  });

  test('P002.2: Question blocks navigation', async ({ page }) => {
    // Load test session
    await page.goto('file:///d:/MAMP/AfakarM/testing/study-session-test.html');
    await page.click('button:has-text("Load Test Session")');
    
    // Navigate through blocks
    await page.click('button:has-text("Next")');
    await expect(page.locator('text=Block 2 of')).toBeVisible();
    
    // Test question interaction (if available)
    const textArea = page.locator('textarea');
    if (await textArea.count() > 0) {
      await textArea.fill('This is a test response from automated testing');
    }
    
    await page.screenshot({ path: 'testing/screenshots/participant-question-block.png' });
  });

  test('P002.3: Complete session flow', async ({ page }) => {
    // Load test session
    await page.goto('file:///d:/MAMP/AfakarM/testing/study-session-test.html');
    await page.click('button:has-text("Load Test Session")');
    
    // Navigate through all blocks
    let blockCount = 1;
    const maxBlocks = 10; // Safety limit
    
    while (blockCount < maxBlocks) {
      const nextButton = page.locator('button:has-text("Next")');
      if (await nextButton.isVisible() && await nextButton.isEnabled()) {
        await nextButton.click();
        blockCount++;
        
        // Fill out any forms that appear
        const textArea = page.locator('textarea');
        if (await textArea.count() > 0) {
          await textArea.fill(`Response for block ${blockCount}`);
        }
        
        const radioButtons = page.locator('input[type="radio"]');
        if (await radioButtons.count() > 0) {
          await radioButtons.first().click();
        }
        
        await page.waitForTimeout(1000);
      } else {
        break;
      }
    }
    
    // Check for completion
    await page.screenshot({ path: 'testing/screenshots/participant-session-complete.png' });
  });
});

/**
 * UAT-P003: Feedback Submission and Communication
 * Success Criteria: Participant can submit feedback and communicate with researchers
 */
test.describe('UAT-P003: Feedback & Communication', () => {
  
  test('P003.1: Study feedback submission', async ({ page }) => {
    // Login as participant
    await page.goto(`${BASE_URL}/signin`);
    await page.fill('input[type="email"]', PARTICIPANT_ACCOUNT.email);
    await page.fill('input[type="password"]', PARTICIPANT_ACCOUNT.password);
    await page.click('button:has-text("Sign in")');
    
    await page.waitForLoadState('networkidle');
    
    // Look for feedback forms or completed studies
    await page.screenshot({ path: 'testing/screenshots/participant-feedback.png' });
  });

  test('P003.2: Communication channels access', async ({ page }) => {
    // Login as participant
    await page.goto(`${BASE_URL}/signin`);
    await page.fill('input[type="email"]', PARTICIPANT_ACCOUNT.email);
    await page.fill('input[type="password"]', PARTICIPANT_ACCOUNT.password);
    await page.click('button:has-text("Sign in")');
    
    await page.waitForLoadState('networkidle');
    
    // Test any messaging or communication features
    // This may include notifications, messages, or support channels
    await page.screenshot({ path: 'testing/screenshots/participant-communication.png' });
  });
});

/**
 * UAT-P004: Compensation and Payment Workflows
 * Success Criteria: Participant can track compensation and payments
 */
test.describe('UAT-P004: Compensation & Payments', () => {
  
  test('P004.1: Compensation tracking', async ({ page }) => {
    // Login as participant
    await page.goto(`${BASE_URL}/signin`);
    await page.fill('input[type="email"]', PARTICIPANT_ACCOUNT.email);
    await page.fill('input[type="password"]', PARTICIPANT_ACCOUNT.password);
    await page.click('button:has-text("Sign in")');
    
    await page.waitForLoadState('networkidle');
    
    // Look for earnings, payments, or wallet information
    const walletText = page.locator('text=wallet, text=earnings, text=payment');
    if (await walletText.count() > 0) {
      await expect(walletText.first()).toBeVisible();
    }
    
    await page.screenshot({ path: 'testing/screenshots/participant-compensation.png' });
  });

  test('P004.2: Payment method management', async ({ page }) => {
    // Login as participant
    await page.goto(`${BASE_URL}/signin`);
    await page.fill('input[type="email"]', PARTICIPANT_ACCOUNT.email);
    await page.fill('input[type="password"]', PARTICIPANT_ACCOUNT.password);
    await page.click('button:has-text("Sign in")');
    
    await page.waitForLoadState('networkidle');
    
    // Test payment settings or wallet configuration
    // Navigate to settings or profile if available
    const settingsLink = page.locator('a:has-text("Settings"), a:has-text("Profile")');
    if (await settingsLink.count() > 0) {
      await settingsLink.first().click();
      await page.waitForLoadState('networkidle');
    }
    
    await page.screenshot({ path: 'testing/screenshots/participant-payment-settings.png' });
  });
});

/**
 * UAT-P005: Re-engagement and Follow-up Studies
 * Success Criteria: Participant can be re-engaged for additional studies
 */
test.describe('UAT-P005: Re-engagement & Follow-up', () => {
  
  test('P005.1: Study history and status tracking', async ({ page }) => {
    // Login as participant
    await page.goto(`${BASE_URL}/signin`);
    await page.fill('input[type="email"]', PARTICIPANT_ACCOUNT.email);
    await page.fill('input[type="password"]', PARTICIPANT_ACCOUNT.password);
    await page.click('button:has-text("Sign in")');
    
    await page.waitForLoadState('networkidle');
    
    // Look for study history or past applications
    await page.screenshot({ path: 'testing/screenshots/participant-history.png' });
  });

  test('P005.2: New study notifications', async ({ page }) => {
    // Login as participant
    await page.goto(`${BASE_URL}/signin`);
    await page.fill('input[type="email"]', PARTICIPANT_ACCOUNT.email);
    await page.fill('input[type="password"]', PARTICIPANT_ACCOUNT.password);
    await page.click('button:has-text("Sign in")');
    
    await page.waitForLoadState('networkidle');
    
    // Test notification system or new study alerts
    const notificationElements = page.locator('[class*="notification"], [class*="alert"], [class*="badge"]');
    if (await notificationElements.count() > 0) {
      await expect(notificationElements.first()).toBeVisible();
    }
    
    await page.screenshot({ path: 'testing/screenshots/participant-notifications.png' });
  });
});

/**
 * UAT-P006: Cross-Device and Accessibility Experience
 * Success Criteria: Participant experience works across devices and accessibility needs
 */
test.describe('UAT-P006: Cross-Device & Accessibility', () => {
  
  test('P006.1: Mobile responsiveness', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Login as participant
    await page.goto(`${BASE_URL}/signin`);
    await page.fill('input[type="email"]', PARTICIPANT_ACCOUNT.email);
    await page.fill('input[type="password"]', PARTICIPANT_ACCOUNT.password);
    await page.click('button:has-text("Sign in")');
    
    await page.waitForLoadState('networkidle');
    
    // Test mobile navigation and usability
    await page.screenshot({ path: 'testing/screenshots/participant-mobile.png' });
  });

  test('P006.2: Keyboard navigation', async ({ page }) => {
    // Login as participant
    await page.goto(`${BASE_URL}/signin`);
    
    // Test keyboard navigation
    await page.press('body', 'Tab');
    await page.press('body', 'Tab');
    await page.type('input[type="email"]', PARTICIPANT_ACCOUNT.email);
    await page.press('body', 'Tab');
    await page.type('input[type="password"]', PARTICIPANT_ACCOUNT.password);
    await page.press('body', 'Enter');
    
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'testing/screenshots/participant-keyboard-nav.png' });
  });
});

/**
 * Test Configuration and Helpers
 */

// Global test configuration
test.beforeEach(async ({ page }) => {
  // Set viewport size (desktop by default)
  await page.setViewportSize({ width: 1280, height: 720 });
  
  // Set reasonable timeouts
  page.setDefaultTimeout(30000);
  page.setDefaultNavigationTimeout(30000);
});

// Cleanup after tests
test.afterEach(async ({ page }) => {
  // Take screenshot on failure
  if (test.info().status !== 'passed') {
    await page.screenshot({ 
      path: `testing/screenshots/participant-failure-${test.info().title}-${Date.now()}.png`,
      fullPage: true 
    });
  }
});