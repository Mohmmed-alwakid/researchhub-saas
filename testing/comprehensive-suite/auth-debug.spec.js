import { test, expect } from '@playwright/test';
import { TestHelpers } from './utils/test-helpers.js';

test('Authentication Flow Debugging', async ({ page }) => {
  console.log('🔍 Debugging ResearchHub authentication flow...');
  
  const testHelpers = new TestHelpers(page);
  
  // Step 1: Start from landing page
  await page.goto('https://researchhub-saas.vercel.app');
  await page.waitForTimeout(2000);
  
  console.log('📍 Landing page URL:', page.url());
  console.log('📋 Landing page title:', await page.title());
  
  // Step 2: Login as researcher
  console.log('🔐 Starting researcher login...');
  await testHelpers.loginAsResearcher();
  await page.waitForTimeout(3000);
  
  console.log('📍 After login URL:', page.url());
  console.log('📋 After login title:', await page.title());
  
  // Step 3: Check for user role indicators
  const userRoleElement = page.locator('[data-role], [data-user-type], .user-role').first();
  if (await userRoleElement.isVisible()) {
    const roleText = await userRoleElement.textContent();
    console.log('👤 User role detected:', roleText);
  } else {
    console.log('❓ No user role element found');
  }
  
  // Step 4: Check localStorage/sessionStorage for auth data
  const authData = await page.evaluate(() => {
    return {
      localStorage: {
        authToken: localStorage.getItem('authToken'),
        userRole: localStorage.getItem('userRole'),
        userType: localStorage.getItem('userType'),
        user: localStorage.getItem('user')
      },
      sessionStorage: {
        authToken: sessionStorage.getItem('authToken'),
        userRole: sessionStorage.getItem('userRole'),
        userType: sessionStorage.getItem('userType'),
        user: sessionStorage.getItem('user')
      },
      cookies: document.cookie
    };
  });
  
  console.log('💾 Auth data in browser:', JSON.stringify(authData, null, 2));
  
  // Step 5: Try to navigate directly to researcher areas
  const researcherUrls = [
    '/researcher/dashboard',
    '/researcher/studies', 
    '/dashboard',
    '/studies'
  ];
  
  for (const url of researcherUrls) {
    console.log(`🧭 Trying to navigate to: ${url}`);
    await page.goto(`https://researchhub-saas.vercel.app${url}`);
    await page.waitForTimeout(2000);
    
    const currentUrl = page.url();
    const pageTitle = await page.title();
    
    console.log(`📍 Result URL: ${currentUrl}`);
    console.log(`📋 Result title: ${pageTitle}`);
    
    // Check if we're on a proper researcher page
    const isResearcherPage = currentUrl.includes('/researcher/') || currentUrl.includes('/dashboard') || currentUrl.includes('/studies');
    const hasCreateButton = await page.locator('button', { hasText: /create/i }).count() > 0;
    const hasStudiesList = await page.locator('.study-card, .studies-list, [data-testid="studies"]').count() > 0;
    
    console.log(`✅ Is researcher page: ${isResearcherPage}`);
    console.log(`✅ Has create button: ${hasCreateButton}`);
    console.log(`✅ Has studies list: ${hasStudiesList}`);
    
    if (isResearcherPage && (hasCreateButton || hasStudiesList)) {
      console.log(`🎯 Found working researcher page: ${url}`);
      
      // Take screenshot of working page
      await page.screenshot({ path: 'working-researcher-page.png', fullPage: true });
      
      // List all interactive elements
      const buttons = await page.locator('button').all();
      console.log(`🔘 Buttons on this page: ${buttons.length}`);
      
      for (let i = 0; i < Math.min(buttons.length, 5); i++) {
        const text = await buttons[i].textContent().catch(() => 'No text');
        console.log(`   🔘 Button ${i + 1}: "${text}"`);
      }
      
      break;
    }
  }
  
  console.log('✅ Authentication flow debugging completed');
});