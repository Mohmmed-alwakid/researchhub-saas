import { test, expect } from '@playwright/test';

test.describe('Performance & Load Testing Suite', () => {
  const RESEARCH_EMAIL = 'abwanwr77+Researcher@gmail.com';
  const RESEARCH_PASSWORD = 'Testtest123';

  test('Quick Performance Baseline (5 min)', async ({ page }) => {
    console.log('⚡ Quick Performance Baseline Test');
    
    const startTime = Date.now();
    await page.goto('https://researchhub-saas.vercel.app');
    const loadTime = Date.now() - startTime;
    
    console.log(`📊 Page Load Time: ${loadTime}ms`);
    console.log(`✅ Performance baseline established`);
    
    expect(loadTime).toBeLessThan(10000); // 10 second threshold
  });

  test('Login Performance Validation (3 min)', async ({ page }) => {
    console.log('🔐 Login Performance Validation');
    
    await page.goto('https://researchhub-saas.vercel.app/auth/login');
    
    const loginStart = Date.now();
    await page.fill('input[type="email"]', RESEARCH_EMAIL);
    await page.fill('input[type="password"]', RESEARCH_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/app/**');
    const loginTime = Date.now() - loginStart;
    
    console.log(`🔑 Login Time: ${loginTime}ms`);
    console.log(`✅ Login performance validated`);
    
    expect(loginTime).toBeLessThan(15000); // 15 second threshold
  });

  test('Study Creation Performance (5 min)', async ({ page }) => {
    console.log('📝 Study Creation Performance');
    
    // Login first
    await page.goto('https://researchhub-saas.vercel.app/auth/login');
    await page.fill('input[type="email"]', RESEARCH_EMAIL);
    await page.fill('input[type="password"]', RESEARCH_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/app/**');
    
    // Test study creation performance
    const studyStart = Date.now();
    await page.click('[data-testid="create-study"]');
    await page.waitForLoadState('networkidle');
    const studyTime = Date.now() - studyStart;
    
    console.log(`📋 Study Creation Navigation: ${studyTime}ms`);
    console.log(`✅ Study creation performance validated`);
    
    expect(studyTime).toBeLessThan(8000); // 8 second threshold
  });
});