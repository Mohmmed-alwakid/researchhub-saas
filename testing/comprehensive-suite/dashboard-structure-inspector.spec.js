import { test, expect } from '@playwright/test';

test('Dashboard Structure After Login', async ({ page }) => {
  console.log('🔍 Analyzing Dashboard Structure After Login...');
  
  // Navigate to dashboard
  await page.goto('https://researchhub-saas.vercel.app/app/dashboard');
  await page.waitForLoadState('networkidle');
  
  console.log('📸 Taking screenshot before login...');
  await page.screenshot({ path: 'before-login.png', fullPage: true });
  
  // Login as researcher
  console.log('🔐 Logging in as Researcher...');
  await page.locator('input[type="email"]').fill('abwanwr77+Researcher@gmail.com');
  await page.locator('input[type="password"]').fill('Testtest123');
  await page.locator('button[type="submit"]').click();
  
  // Wait for navigation after login
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  
  console.log('📸 Taking screenshot after login...');
  await page.screenshot({ path: 'after-login.png', fullPage: true });
  
  // Check current URL after login
  const currentUrl = page.url();
  console.log(`🌐 Current URL after login: ${currentUrl}`);
  
  // Check page title
  const title = await page.title();
  console.log(`📄 Page title: "${title}"`);
  
  // Find ALL clickable elements
  console.log('\n🔍 Finding ALL clickable elements...');
  
  const clickableElements = await page.locator('button, a, [role="button"], [onclick], [data-testid]').all();
  console.log(`Found ${clickableElements.length} clickable elements:`);
  
  for (let i = 0; i < clickableElements.length && i < 30; i++) {
    const text = await clickableElements[i].textContent();
    const tagName = await clickableElements[i].evaluate(el => el.tagName);
    const className = await clickableElements[i].getAttribute('class');
    const role = await clickableElements[i].getAttribute('role');
    const href = await clickableElements[i].getAttribute('href');
    const testId = await clickableElements[i].getAttribute('data-testid');
    const isVisible = await clickableElements[i].isVisible();
    
    console.log(`   ${i + 1}. <${tagName}> "${text?.trim().substring(0, 50)}" class="${className?.substring(0, 30)}" role="${role}" href="${href}" testid="${testId}" (visible: ${isVisible})`);
  }
  
  // Look for navigation elements specifically
  console.log('\n🧭 Looking for navigation elements...');
  
  const navElements = await page.locator('nav, [role="navigation"], .nav, .navigation, .sidebar, .menu').all();
  console.log(`Found ${navElements.length} navigation containers:`);
  
  for (let i = 0; i < navElements.length; i++) {
    const tagName = await navElements[i].evaluate(el => el.tagName);
    const className = await navElements[i].getAttribute('class');
    const isVisible = await navElements[i].isVisible();
    console.log(`   ${i + 1}. <${tagName}> class="${className}" (visible: ${isVisible})`);
    
    // Find buttons/links within this nav container
    const navItems = await navElements[i].locator('button, a').all();
    for (let j = 0; j < navItems.length && j < 10; j++) {
      const text = await navItems[j].textContent();
      const isItemVisible = await navItems[j].isVisible();
      console.log(`      - "${text?.trim()}" (visible: ${isItemVisible})`);
    }
  }
  
  // Look for elements containing "stud" (studies, study, etc.)
  console.log('\n📚 Looking for study-related elements...');
  
  const studyElements = await page.locator('*').filter({ hasText: /stud/i }).all();
  console.log(`Found ${studyElements.length} elements containing "stud":`);
  
  for (let i = 0; i < studyElements.length && i < 15; i++) {
    const text = await studyElements[i].textContent();
    const tagName = await studyElements[i].evaluate(el => el.tagName);
    const isVisible = await studyElements[i].isVisible();
    console.log(`   ${i + 1}. <${tagName}> "${text?.trim().substring(0, 80)}" (visible: ${isVisible})`);
  }
});