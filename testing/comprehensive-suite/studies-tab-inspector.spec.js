import { test, expect } from '@playwright/test';

test('Studies Tab Content Inspector', async ({ page }) => {
  console.log('🔍 Inspecting Studies Tab Content...');
  
  // Navigate to dashboard
  await page.goto('https://researchhub-saas.vercel.app/app/dashboard');
  await page.waitForLoadState('networkidle');
  
  // Login as researcher
  console.log('🔐 Logging in as Researcher...');
  await page.locator('input[type="email"]').fill('abwanwr77+Researcher@gmail.com');
  await page.locator('input[type="password"]').fill('Testtest123');
  await page.locator('button[type="submit"]').click();
  await page.waitForLoadState('networkidle');
  
  // Click Studies tab
  console.log('📚 Clicking Studies tab...');
  const studiesTab = page.locator('button, a').filter({ hasText: /studies/i }).first();
  await studiesTab.click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  // Take screenshot of Studies page
  await page.screenshot({ path: 'studies-page-content.png', fullPage: true });
  console.log('📸 Screenshot saved: studies-page-content.png');
  
  // Find all buttons on Studies page
  const allButtons = await page.locator('button').all();
  console.log(`\n🔘 Found ${allButtons.length} buttons on Studies page:`);
  
  for (let i = 0; i < allButtons.length && i < 20; i++) {
    const text = await allButtons[i].textContent();
    const isVisible = await allButtons[i].isVisible();
    console.log(`   ${i + 1}. "${text?.trim()}" (visible: ${isVisible})`);
  }
  
  // Find all links on Studies page
  const allLinks = await page.locator('a').all();
  console.log(`\n🔗 Found ${allLinks.length} links on Studies page:`);
  
  for (let i = 0; i < allLinks.length && i < 10; i++) {
    const text = await allLinks[i].textContent();
    const href = await allLinks[i].getAttribute('href');
    const isVisible = await allLinks[i].isVisible();
    console.log(`   ${i + 1}. "${text?.trim()}" -> ${href} (visible: ${isVisible})`);
  }
  
  // Look for create/new study elements
  console.log('\n🔍 Looking for Create/New Study elements...');
  
  const createElements = await page.locator('button, a, div').filter({ 
    hasText: /create|new|add.*study|start.*study|\+/i 
  }).all();
  
  console.log(`Found ${createElements.length} potential create elements:`);
  for (let i = 0; i < createElements.length; i++) {
    const text = await createElements[i].textContent();
    const tagName = await createElements[i].evaluate(el => el.tagName);
    const isVisible = await createElements[i].isVisible();
    console.log(`   ${i + 1}. <${tagName}> "${text?.trim()}" (visible: ${isVisible})`);
  }
  
  // Look for form inputs
  console.log('\n📝 Looking for form inputs...');
  
  const inputs = await page.locator('input, textarea, select').all();
  console.log(`Found ${inputs.length} form inputs:`);
  for (let i = 0; i < inputs.length && i < 10; i++) {
    const type = await inputs[i].getAttribute('type');
    const name = await inputs[i].getAttribute('name');
    const placeholder = await inputs[i].getAttribute('placeholder');
    const isVisible = await inputs[i].isVisible();
    console.log(`   ${i + 1}. type="${type}" name="${name}" placeholder="${placeholder}" (visible: ${isVisible})`);
  }
  
  // Check current URL
  const currentUrl = page.url();
  console.log(`\n🌐 Current URL: ${currentUrl}`);
  
  // Check page title
  const title = await page.title();
  console.log(`📄 Page title: "${title}"`);
});