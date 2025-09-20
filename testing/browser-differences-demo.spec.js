// Cross-Browser Demo: Shows actual differences between browsers
const { test, expect } = require('@playwright/test');

// This test will run on Chromium, Firefox, and WebKit
test.describe('Browser Differences Demo', () => {
  
  test('Browser Feature Detection', async ({ page, browserName }) => {
    console.log(`\n🌐 === Testing on ${browserName.toUpperCase()} ===`);
    
    // Go to production site
    await page.goto('https://researchhub-saas.vercel.app');
    
    // 1. Browser User Agent Detection
    const userAgent = await page.evaluate(() => navigator.userAgent);
    console.log(`📱 User Agent: ${userAgent.split(' ')[0]}...`);
    
    // 2. CSS Feature Support
    const cssSupport = await page.evaluate(() => {
      return {
        grid: CSS.supports('display', 'grid'),
        flexbox: CSS.supports('display', 'flex'),
        customProperties: CSS.supports('--test', 'value'),
        backdropFilter: CSS.supports('backdrop-filter', 'blur(10px)')
      };
    });
    console.log(`🎨 CSS Support:`, cssSupport);
    
    // 3. JavaScript Engine Differences
    const jsFeatures = await page.evaluate(() => {
      return {
        webGL: !!window.WebGLRenderingContext,
        webWorkers: typeof Worker !== 'undefined',
        localStorage: typeof Storage !== 'undefined',
        fetch: typeof fetch === 'function'
      };
    });
    console.log(`⚡ JS Features:`, jsFeatures);
    
    // 4. Performance Timing (browser-specific)
    const timing = await page.evaluate(() => {
      if (performance.timing) {
        const t = performance.timing;
        return {
          domLoaded: t.domContentLoadedEventEnd - t.navigationStart,
          pageLoaded: t.loadEventEnd - t.navigationStart
        };
      }
      return null;
    });
    console.log(`⏱️ Performance:`, timing);
    
    // 5. Form Behavior Testing
    const loginButton = page.getByRole('button', { name: /sign in|login/i }).first();
    if (await loginButton.isVisible()) {
      const buttonRect = await loginButton.boundingBox();
      console.log(`📏 Button Size: ${Math.round(buttonRect?.width || 0)}x${Math.round(buttonRect?.height || 0)}`);
    }
    
    console.log(`✅ ${browserName} test completed\n`);
  });
});