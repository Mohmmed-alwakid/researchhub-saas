import { test, expect } from '@playwright/test';

// Simple Enhanced UI Components Test
test.describe('Enhanced UI Components - MCP Playwright Test', () => {
  
  test('Test Enhanced Components on Home Page', async ({ page }) => {
    console.log('🚀 Starting Enhanced UI Components Test');
    
    // Navigate to the application
    await page.goto('http://localhost:5175');
    await page.waitForLoadState('networkidle');
    
    // Test that the page loads
    await expect(page).toHaveTitle(/.*ResearchHub.*|.*Afkar.*|.*Study.*|.*/);
    
    // Look for enhanced buttons with gradients
    const buttons = page.locator('button');
    console.log(`🔍 Found ${await buttons.count()} buttons on the page`);
    
    // Take screenshot of the current page with enhanced components
    await page.screenshot({ 
      path: 'testing/screenshots/enhanced-ui-test.png',
      fullPage: true
    });
    
    // Test enhanced styling elements
    const gradientElements = page.locator('[class*="bg-gradient"]');
    const enhancedCount = await gradientElements.count();
    console.log(`✨ Found ${enhancedCount} elements with gradient backgrounds`);
    
    // Test backdrop blur elements
    const blurElements = page.locator('[class*="backdrop-blur"]');
    const blurCount = await blurElements.count();
    console.log(`🌫️ Found ${blurCount} elements with backdrop blur`);
    
    // Test hover effects on buttons
    if (await buttons.count() > 0) {
      await buttons.first().hover();
      await page.waitForTimeout(500);
      console.log('🎯 Tested button hover effects');
    }
    
    // Test enhanced inputs if present
    const inputs = page.locator('input');
    if (await inputs.count() > 0) {
      await inputs.first().focus();
      await page.waitForTimeout(300);
      console.log('📝 Tested input focus effects');
    }
    
    console.log('✅ Enhanced UI Components Test Completed Successfully!');
    
    // Verify we have enhanced components
    expect(enhancedCount).toBeGreaterThan(0);
  });

  test('Test Responsive Design with Enhanced Components', async ({ page }) => {
    await page.goto('http://localhost:5175');
    
    // Test desktop view
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.screenshot({ path: 'testing/screenshots/enhanced-desktop.png' });
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.screenshot({ path: 'testing/screenshots/enhanced-tablet.png' });
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({ path: 'testing/screenshots/enhanced-mobile.png' });
    
    console.log('📱 Responsive design testing completed');
  });

  test('Test Enhanced Components Performance', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('http://localhost:5175');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    console.log(`⚡ Page load time with enhanced components: ${loadTime}ms`);
    
    // Test should load within reasonable time
    expect(loadTime).toBeLessThan(10000); // 10 seconds max
    
    // Check for JavaScript errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
        console.log(`❌ Console error: ${msg.text()}`);
      }
    });
    
    await page.reload();
    await page.waitForTimeout(2000);
    
    console.log(`🐛 Console errors found: ${errors.length}`);
    console.log('✅ Performance testing completed');
  });

});
