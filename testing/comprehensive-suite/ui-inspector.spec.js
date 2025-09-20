import { test, expect } from '@playwright/test';
import { TestHelpers } from './utils/test-helpers.js';

test('UI Inspector: Find Study Creation Elements', async ({ page }) => {
  console.log('🔍 Inspecting ResearchHub UI for study creation elements...');
  
  const testHelpers = new TestHelpers(page);
  await testHelpers.loginAsResearcher();
  
  // Navigate to studies page
  await page.goto('https://researchhub-saas.vercel.app/researcher/studies');
  await page.waitForTimeout(3000);
  
  console.log('📍 Current URL:', page.url());
  console.log('📋 Page title:', await page.title());
  
  // Take screenshot for visual reference
  await page.screenshot({ path: 'ui-inspection-studies-page.png', fullPage: true });
  
  // Find all buttons on the page
  const buttons = await page.locator('button').all();
  console.log(`🔘 Found ${buttons.length} buttons on the page`);
  
  for (let i = 0; i < Math.min(buttons.length, 10); i++) {
    const button = buttons[i];
    const text = await button.textContent().catch(() => 'No text');
    const ariaLabel = await button.getAttribute('aria-label').catch(() => null);
    const dataTestId = await button.getAttribute('data-testid').catch(() => null);
    const className = await button.getAttribute('class').catch(() => null);
    
    console.log(`🔘 Button ${i + 1}: "${text}" | aria-label: ${ariaLabel} | data-testid: ${dataTestId}`);
    if (className) console.log(`   Classes: ${className}`);
  }
  
  // Find all links
  const links = await page.locator('a').all();
  console.log(`🔗 Found ${links.length} links on the page`);
  
  for (let i = 0; i < Math.min(links.length, 10); i++) {
    const link = links[i];
    const text = await link.textContent().catch(() => 'No text');
    const href = await link.getAttribute('href').catch(() => null);
    
    console.log(`🔗 Link ${i + 1}: "${text}" | href: ${href}`);
  }
  
  // Look for specific text patterns
  const textPatterns = ['create', 'new', 'add', 'start', 'begin', 'study'];
  for (const pattern of textPatterns) {
    const elements = await page.locator(`text=${pattern}`).all();
    console.log(`📝 Elements containing "${pattern}": ${elements.length}`);
  }
  
  // Check for common UI frameworks/components
  const frameworks = [
    { name: 'Material-UI', selector: '[class*="Mui"]' },
    { name: 'Ant Design', selector: '[class*="ant-"]' },
    { name: 'Chakra UI', selector: '[class*="chakra"]' },
    { name: 'Tailwind', selector: '[class*="bg-"], [class*="text-"], [class*="p-"]' }
  ];
  
  for (const framework of frameworks) {
    const elements = await page.locator(framework.selector).count();
    if (elements > 0) {
      console.log(`🎨 ${framework.name} detected: ${elements} elements`);
    }
  }
  
  console.log('✅ UI inspection completed - check console output and screenshot');
});