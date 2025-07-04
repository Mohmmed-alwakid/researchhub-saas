// Visual Regression Testing Suite
// Tests for UI consistency across different browsers and screen sizes

import { test, expect } from '@playwright/test';
import { testingConfig } from '../config/testing.config.js';

class VisualRegressionSuite {
  constructor() {
    this.config = testingConfig;
    this.baseUrl = this.config.environments.local.baseUrl;
    this.viewports = [
      { width: 320, height: 568, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1920, height: 1080, name: 'desktop' }
    ];
  }

  // Test homepage visual consistency
  async testHomepageVisuals() {
    const testCases = this.viewports.map(viewport => ({
      name: `Homepage - ${viewport.name}`,
      url: this.baseUrl,
      viewport,
      selector: 'body',
      mask: ['.dynamic-content', '.timestamp'] // Elements to mask (hide from comparison)
    }));

    return testCases;
  }

  // Test dashboard visual consistency
  async testDashboardVisuals() {
    const testCases = this.viewports.map(viewport => ({
      name: `Dashboard - ${viewport.name}`,
      url: `${this.baseUrl}/dashboard`,
      viewport,
      selector: 'body',
      mask: ['.user-avatar', '.last-login', '.notification-count']
    }));

    return testCases;
  }

  // Test study creation visual consistency
  async testStudyCreationVisuals() {
    const testCases = this.viewports.map(viewport => ({
      name: `Study Creation - ${viewport.name}`,
      url: `${this.baseUrl}/create-study`,
      viewport,
      selector: 'body',
      mask: ['.study-id', '.created-date']
    }));

    return testCases;
  }

  // Test form components visual consistency
  async testFormComponentVisuals() {
    const components = [
      { name: 'Login Form', url: `${this.baseUrl}/login`, selector: '.login-form' },
      { name: 'Registration Form', url: `${this.baseUrl}/register`, selector: '.register-form' },
      { name: 'Study Settings Form', url: `${this.baseUrl}/create-study`, selector: '.study-form' }
    ];

    const testCases = [];
    
    for (const component of components) {
      for (const viewport of this.viewports) {
        testCases.push({
          name: `${component.name} - ${viewport.name}`,
          url: component.url,
          viewport,
          selector: component.selector,
          mask: []
        });
      }
    }

    return testCases;
  }

  // Test button component variations
  async testButtonComponentVisuals() {
    const testCases = [{
      name: 'Button Components',
      url: `${this.baseUrl}/component-library`, // Would be a dedicated component showcase page
      viewport: { width: 1920, height: 1080 },
      selector: '.button-showcase',
      mask: []
    }];

    return testCases;
  }

  // Generate all visual test cases
  async generateVisualTestCases() {
    const allTestCases = [
      ...(await this.testHomepageVisuals()),
      ...(await this.testDashboardVisuals()),
      ...(await this.testStudyCreationVisuals()),
      ...(await this.testFormComponentVisuals()),
      ...(await this.testButtonComponentVisuals())
    ];

    return allTestCases;
  }
}

// Playwright visual regression tests
test.describe('Visual Regression Tests', () => {
  const visualSuite = new VisualRegressionSuite();

  test.beforeEach(async ({ page }) => {
    // Login as researcher for authenticated pages
    await page.goto(`${visualSuite.baseUrl}/login`);
    await page.fill('[data-testid="email"]', visualSuite.config.testAccounts.researcher.email);
    await page.fill('[data-testid="password"]', visualSuite.config.testAccounts.researcher.password);
    await page.click('[data-testid="login-submit"]');
    await page.waitForURL('**/dashboard');
  });

  test('Homepage Visual Consistency', async ({ page, browserName }) => {
    const testCases = await visualSuite.testHomepageVisuals();
    
    for (const testCase of testCases) {
      await page.setViewportSize(testCase.viewport);
      await page.goto(testCase.url);
      await page.waitForLoadState('networkidle');
      
      // Take screenshot and compare
      await expect(page.locator(testCase.selector)).toHaveScreenshot(
        `${testCase.name}-${browserName}.png`,
        {
          mask: testCase.mask.map(selector => page.locator(selector)),
          fullPage: true
        }
      );
    }
  });

  test('Dashboard Visual Consistency', async ({ page, browserName }) => {
    const testCases = await visualSuite.testDashboardVisuals();
    
    for (const testCase of testCases) {
      await page.setViewportSize(testCase.viewport);
      await page.goto(testCase.url);
      await page.waitForLoadState('networkidle');
      
      await expect(page.locator(testCase.selector)).toHaveScreenshot(
        `${testCase.name}-${browserName}.png`,
        {
          mask: testCase.mask.map(selector => page.locator(selector)),
          fullPage: true
        }
      );
    }
  });

  test('Study Creation Visual Consistency', async ({ page, browserName }) => {
    const testCases = await visualSuite.testStudyCreationVisuals();
    
    for (const testCase of testCases) {
      await page.setViewportSize(testCase.viewport);
      await page.goto(testCase.url);
      await page.waitForLoadState('networkidle');
      
      await expect(page.locator(testCase.selector)).toHaveScreenshot(
        `${testCase.name}-${browserName}.png`,
        {
          mask: testCase.mask.map(selector => page.locator(selector)),
          fullPage: true
        }
      );
    }
  });

  test('Form Components Visual Consistency', async ({ page, browserName }) => {
    const testCases = await visualSuite.testFormComponentVisuals();
    
    for (const testCase of testCases) {
      await page.setViewportSize(testCase.viewport);
      await page.goto(testCase.url);
      await page.waitForLoadState('networkidle');
      
      if (await page.locator(testCase.selector).count() > 0) {
        await expect(page.locator(testCase.selector)).toHaveScreenshot(
          `${testCase.name}-${browserName}.png`,
          {
            mask: testCase.mask.map(selector => page.locator(selector))
          }
        );
      }
    }
  });

  test('Cross-Browser Compatibility', async ({ page, browserName }) => {
    // Test key pages across different browsers
    const pages = [
      { name: 'Homepage', url: visualSuite.baseUrl },
      { name: 'Dashboard', url: `${visualSuite.baseUrl}/dashboard` },
      { name: 'Study Creation', url: `${visualSuite.baseUrl}/create-study` }
    ];

    for (const pageInfo of pages) {
      await page.goto(pageInfo.url);
      await page.waitForLoadState('networkidle');
      
      // Take full page screenshot
      await expect(page).toHaveScreenshot(
        `${pageInfo.name}-cross-browser-${browserName}.png`,
        {
          fullPage: true,
          mask: [
            page.locator('.dynamic-content'),
            page.locator('.timestamp'),
            page.locator('.user-avatar')
          ]
        }
      );
    }
  });

  test('Mobile Responsiveness', async ({ page }) => {
    const mobileViewport = { width: 375, height: 667 };
    await page.setViewportSize(mobileViewport);
    
    const pages = [
      { name: 'Mobile Homepage', url: visualSuite.baseUrl },
      { name: 'Mobile Dashboard', url: `${visualSuite.baseUrl}/dashboard` },
      { name: 'Mobile Study Creation', url: `${visualSuite.baseUrl}/create-study` }
    ];

    for (const pageInfo of pages) {
      await page.goto(pageInfo.url);
      await page.waitForLoadState('networkidle');
      
      // Test mobile-specific interactions
      await page.tap('[data-testid="mobile-menu"]', { force: true });
      await page.waitForTimeout(500);
      
      await expect(page).toHaveScreenshot(
        `${pageInfo.name}-mobile-responsive.png`,
        {
          fullPage: true,
          mask: [
            page.locator('.dynamic-content'),
            page.locator('.timestamp')
          ]
        }
      );
    }
  });

  test('Dark Mode Consistency', async ({ page }) => {
    // Test dark mode if implemented
    await page.goto(`${visualSuite.baseUrl}/dashboard`);
    await page.waitForLoadState('networkidle');
    
    // Toggle dark mode
    await page.click('[data-testid="theme-toggle"]', { force: true });
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('dashboard-dark-mode.png', {
      fullPage: true,
      mask: [
        page.locator('.dynamic-content'),
        page.locator('.timestamp'),
        page.locator('.user-avatar')
      ]
    });
  });

  test('Component State Variations', async ({ page }) => {
    // Test different component states
    await page.goto(`${visualSuite.baseUrl}/create-study`);
    await page.waitForLoadState('networkidle');
    
    // Test form validation states
    await page.click('[data-testid="submit-button"]');
    await page.waitForTimeout(500);
    
    await expect(page.locator('.study-form')).toHaveScreenshot('form-validation-errors.png');
    
    // Test loading states
    await page.fill('[data-testid="study-title"]', 'Test Study');
    await page.click('[data-testid="submit-button"]');
    await page.waitForTimeout(100); // Catch loading state
    
    await expect(page.locator('.study-form')).toHaveScreenshot('form-loading-state.png');
  });
});

export default VisualRegressionSuite;
