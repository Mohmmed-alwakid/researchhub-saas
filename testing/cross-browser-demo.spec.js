// Cross-Browser Compatibility Demo Test
// Demonstrates potential differences across browsers

const { test, expect } = require('@playwright/test');

test.describe('Cross-Browser Compatibility Demo', () => {
  test('Browser Detection and Basic Feature Test', async ({ page, browserName }) => {
    console.log(`🌐 Testing on: ${browserName.toUpperCase()}`);
    
    // Navigate to production site
    await page.goto('https://researchhub-saas.vercel.app');
    
    // Test basic page load
    await expect(page).toHaveTitle(/ResearchHub/);
    console.log(`✅ ${browserName}: Page title loaded correctly`);
    
    // Test JavaScript execution
    const userAgent = await page.evaluate(() => navigator.userAgent);
    console.log(`🔍 ${browserName}: User Agent - ${userAgent.substring(0, 50)}...`);
    
    // Test CSS rendering (button styles)
    const loginButton = page.getByRole('button', { name: /sign in|login/i }).first();
    if (await loginButton.isVisible()) {
      const buttonStyles = await loginButton.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          backgroundColor: computed.backgroundColor,
          borderRadius: computed.borderRadius,
          fontFamily: computed.fontFamily
        };
      });
      console.log(`🎨 ${browserName}: Button styles -`, buttonStyles);
    }
    
    // Test form interactions
    const emailInput = page.getByPlaceholder(/email/i).first();
    if (await emailInput.isVisible()) {
      await emailInput.click();
      await emailInput.fill('test@example.com');
      const value = await emailInput.inputValue();
      console.log(`📝 ${browserName}: Form input works - ${value}`);
    }
    
    // Test local storage
    await page.evaluate(() => {
      try {
        localStorage.setItem('test_key', 'test_value');
        const retrieved = localStorage.getItem('test_key');
        console.log(`💾 Storage test: ${retrieved}`);
        localStorage.removeItem('test_key');
      } catch (e) {
        console.log(`❌ Storage error: ${e.message}`);
      }
    });
    
    console.log(`✅ ${browserName}: Cross-browser test completed`);
  });
});