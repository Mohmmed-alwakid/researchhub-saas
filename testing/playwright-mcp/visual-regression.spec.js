import { test, expect } from '@playwright/test';

/**
 * Visual Regression Testing
 * Captures screenshots and compares them for UI consistency
 */

test.describe('Visual Regression Testing', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure consistent font loading
    await page.addInitScript(() => {
      // Ensure fonts are loaded before taking screenshots
      document.fonts.ready.then(() => {
        document.body.classList.add('fonts-loaded');
      });
    });
  });

  test('Homepage visual consistency', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait for fonts and images to load
    await page.waitForTimeout(2000);
    
    // Take full page screenshot
    await expect(page).toHaveScreenshot('homepage-full.png', {
      fullPage: true,
      animations: 'disabled'
    });
    
    console.log('✅ Homepage visual regression test completed');
  });

  test('Login form visual consistency', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Find and screenshot login form if present
    const loginForm = page.locator('form, .login-form, [data-testid="login-form"]').first();
    
    if (await loginForm.isVisible()) {
      await expect(loginForm).toHaveScreenshot('login-form.png', {
        animations: 'disabled'
      });
      console.log('✅ Login form visual test completed');
    } else {
      // Take screenshot of main content area
      await expect(page.locator('main, .main-content, body > div').first()).toHaveScreenshot('main-content.png', {
        animations: 'disabled'
      });
      console.log('✅ Main content visual test completed');
    }
  });

  test('Navigation visual consistency', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Screenshot navigation area
    const nav = page.locator('nav, .navigation, header').first();
    
    if (await nav.isVisible()) {
      await expect(nav).toHaveScreenshot('navigation.png', {
        animations: 'disabled'
      });
      console.log('✅ Navigation visual test completed');
    } else {
      console.log('ℹ️ No navigation element found to test');
    }
  });

  test('Mobile layout visual consistency', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Take mobile screenshot
    await expect(page).toHaveScreenshot('mobile-layout.png', {
      fullPage: true,
      animations: 'disabled'
    });
    
    console.log('✅ Mobile layout visual test completed');
  });

  test('Button states visual consistency', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Find buttons and test different states
    const buttons = page.locator('button').first();
    
    if (await buttons.isVisible()) {
      // Normal state
      await expect(buttons).toHaveScreenshot('button-normal.png');
      
      // Hover state
      await buttons.hover();
      await page.waitForTimeout(200);
      await expect(buttons).toHaveScreenshot('button-hover.png');
      
      // Focus state (if focusable)
      await buttons.focus();
      await page.waitForTimeout(200);
      await expect(buttons).toHaveScreenshot('button-focus.png');
      
      console.log('✅ Button states visual test completed');
    } else {
      console.log('ℹ️ No buttons found to test');
    }
  });

  test('Dark mode visual consistency', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Try to enable dark mode if toggle exists
    const darkModeSelectors = [
      '[data-testid="dark-mode-toggle"]',
      '.dark-mode-toggle',
      'button[aria-label*="dark"]',
      'button[aria-label*="Dark"]'
    ];
    
    let darkModeToggled = false;
    for (const selector of darkModeSelectors) {
      const toggle = page.locator(selector);
      if (await toggle.isVisible()) {
        await toggle.click();
        await page.waitForTimeout(1000);
        darkModeToggled = true;
        break;
      }
    }
    
    if (darkModeToggled) {
      await expect(page).toHaveScreenshot('dark-mode.png', {
        fullPage: true,
        animations: 'disabled'
      });
      console.log('✅ Dark mode visual test completed');
    } else {
      console.log('ℹ️ No dark mode toggle found');
    }
  });

  test('Error states visual consistency', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Try to trigger an error state with invalid login
    const emailInput = page.locator('input[type="email"]').first();
    
    if (await emailInput.isVisible()) {
      await emailInput.fill('invalid-email');
      await page.locator('input[type="password"]').first().fill('wrong');
      await page.locator('button[type="submit"], button:has-text("Login")').first().click();
      
      // Wait for error to appear
      await page.waitForTimeout(2000);
      
      // Screenshot the form with error
      const form = page.locator('form').first();
      await expect(form).toHaveScreenshot('error-state.png', {
        animations: 'disabled'
      });
      
      console.log('✅ Error state visual test completed');
    } else {
      console.log('ℹ️ No login form found to test error states');
    }
  });
});
