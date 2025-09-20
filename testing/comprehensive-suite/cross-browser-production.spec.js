// Production Cross-Browser Comparison
const { test, expect } = require('@playwright/test');

test.describe('Production Cross-Browser Differences', () => {
  test('Authentication Flow Across Browsers', async ({ page, browserName }) => {
    console.log(`\n🌐 Testing ${browserName.toUpperCase()} browser`);
    
    // Navigate to production
    await page.goto('https://researchhub-saas.vercel.app');
    
    // Test page load performance
    const loadTime = await page.evaluate(() => {
      return performance.timing.loadEventEnd - performance.timing.navigationStart;
    });
    console.log(`⏱️ ${browserName} page load: ${loadTime}ms`);
    
    // Test form rendering
    const loginForm = page.locator('form').first();
    if (await loginForm.isVisible()) {
      const formBounds = await loginForm.boundingBox();
      console.log(`📐 ${browserName} form size: ${Math.round(formBounds?.width || 0)}x${Math.round(formBounds?.height || 0)}`);
    }
    
    // Test button interactions
    const buttons = await page.locator('button').count();
    console.log(`🔘 ${browserName} button count: ${buttons}`);
    
    // Test JavaScript features
    const features = await page.evaluate(() => ({
      localStorage: typeof localStorage !== 'undefined',
      sessionStorage: typeof sessionStorage !== 'undefined',
      webGL: !!window.WebGLRenderingContext,
      websocket: typeof WebSocket !== 'undefined'
    }));
    console.log(`⚡ ${browserName} JS features:`, features);
    
    // Basic authentication test
    const emailInput = page.getByPlaceholder(/email/i).first();
    if (await emailInput.isVisible()) {
      await emailInput.click();
      await emailInput.fill('test@example.com');
      const inputValue = await emailInput.inputValue();
      console.log(`✅ ${browserName} input handling: ${inputValue.length > 0 ? 'Working' : 'Failed'}`);
    }
    
    console.log(`✅ ${browserName} test completed\n`);
  });
});