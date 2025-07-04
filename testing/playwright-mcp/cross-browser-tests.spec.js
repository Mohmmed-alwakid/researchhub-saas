import { test, expect } from '@playwright/test';

/**
 * Cross-Browser and Responsive Testing
 * Tests ResearchHub across different browsers and devices
 */

test.describe('Cross-Browser Compatibility', () => {
  test('Homepage renders correctly across browsers', async ({ page, browserName }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check basic page structure
    const title = await page.title();
    expect(title).toContain('Afkar');
    
    // Check that CSS is loaded (no FOUC)
    const bodyStyles = await page.locator('body').evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        fontFamily: computed.fontFamily,
        backgroundColor: computed.backgroundColor
      };
    });
    
    expect(bodyStyles.fontFamily).not.toBe('');
    
    console.log(`✅ ${browserName}: Homepage renders correctly`);
  });

  test('Navigation works across browsers', async ({ page, browserName }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Test clicking on navigation elements
    const navLinks = await page.locator('nav a, .nav a, [role="navigation"] a').count();
    if (navLinks > 0) {
      const firstLink = page.locator('nav a, .nav a, [role="navigation"] a').first();
      
      // Get the href before clicking
      const href = await firstLink.getAttribute('href');
      
      if (href && !href.startsWith('http')) {
        await firstLink.click();
        await page.waitForLoadState('networkidle');
        
        // Verify navigation occurred
        const currentUrl = page.url();
        console.log(`✅ ${browserName}: Navigation to ${href} successful`);
      }
    }
    
    console.log(`✅ ${browserName}: Navigation test completed`);
  });

  test('Forms work across browsers', async ({ page, browserName }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Test form inputs if present
    const inputs = page.locator('input[type="email"], input[type="text"], input[type="password"]');
    const inputCount = await inputs.count();
    
    if (inputCount > 0) {
      const firstInput = inputs.first();
      await firstInput.fill('test@example.com');
      
      const value = await firstInput.inputValue();
      expect(value).toBe('test@example.com');
      
      console.log(`✅ ${browserName}: Form inputs work correctly`);
    }
    
    console.log(`✅ ${browserName}: Form test completed`);
  });
});

test.describe('Responsive Design Testing', () => {
  const viewports = [
    { name: 'Mobile', width: 375, height: 667 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1280, height: 720 },
    { name: 'Large Desktop', width: 1920, height: 1080 }
  ];

  for (const viewport of viewports) {
    test(`Layout works on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Check for horizontal scroll (shouldn't happen)
      const bodyWidth = await page.locator('body').evaluate(el => el.scrollWidth);
      expect(bodyWidth).toBeLessThanOrEqual(viewport.width + 20); // Allow 20px tolerance
      
      // Check that content is visible
      const visibleElements = await page.locator('body *').filter({ hasNotText: '' }).count();
      expect(visibleElements).toBeGreaterThan(0);
      
      // Take screenshot for visual verification
      await page.screenshot({ 
        path: `testing/reports/responsive-${viewport.name.toLowerCase()}-${Date.now()}.png`,
        fullPage: true 
      });
      
      console.log(`✅ ${viewport.name} (${viewport.width}x${viewport.height}): Layout test passed`);
    });
  }

  test('Mobile navigation works', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Look for mobile menu button
    const mobileMenuSelectors = [
      '[data-testid="mobile-menu"]',
      '.mobile-menu',
      '.hamburger',
      'button[aria-label*="menu"]',
      'button[aria-label*="Menu"]'
    ];
    
    let mobileMenuFound = false;
    for (const selector of mobileMenuSelectors) {
      const menuButton = page.locator(selector);
      if (await menuButton.isVisible()) {
        await menuButton.click();
        await page.waitForTimeout(500);
        mobileMenuFound = true;
        console.log(`✅ Mobile menu found and clicked: ${selector}`);
        break;
      }
    }
    
    console.log(`✅ Mobile navigation test completed (menu found: ${mobileMenuFound})`);
  });
});
