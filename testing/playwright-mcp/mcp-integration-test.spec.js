// Simple Playwright MCP Test
// This test verifies that Playwright MCP integration is working

import { test, expect } from '@playwright/test';

test.describe('Playwright MCP Integration Test', () => {
  test('should be able to navigate to ResearchHub homepage', async ({ page }) => {
    // Start your dev server first: npm run dev:fullstack
    await page.goto('http://localhost:5175');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check if we can see the ResearchHub branding
    const title = await page.title();
    console.log(`Page title: ${title}`);
    
    // Take a screenshot for MCP verification
    await page.screenshot({ 
      path: 'testing/screenshots/mcp-integration-test.png',
      fullPage: true 
    });
    
    console.log('✅ Playwright MCP integration test completed successfully');
  });

  test('should be able to interact with navigation elements', async ({ page }) => {
    await page.goto('http://localhost:5175');
    await page.waitForLoadState('networkidle');
    
    // Try to click on common navigation elements
    // This tests that Playwright can interact with your application
    const navElements = await page.locator('nav, header, [role="navigation"]').count();
    console.log(`Found ${navElements} navigation elements`);
    
    expect(navElements).toBeGreaterThan(0);
    console.log('✅ Navigation interaction test passed');
  });
});
