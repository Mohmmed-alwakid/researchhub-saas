import { test, expect } from '@playwright/test';

test('Study Creation Flow Inspector', async ({ page }) => {
  console.log('🔍 Inspecting Study Creation Flow...');
  
  // Navigate to dashboard
  await page.goto('https://researchhub-saas.vercel.app/app/dashboard');
  await page.waitForLoadState('networkidle');
  
  // Login as researcher
  console.log('🔐 Logging in as Researcher...');
  await page.locator('input[type="email"]').fill('abwanwr77+Researcher@gmail.com');
  await page.locator('input[type="password"]').fill('Testtest123');
  await page.locator('button[type="submit"]').click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  console.log('📸 Taking screenshot of dashboard...');
  await page.screenshot({ path: 'dashboard-before-create.png', fullPage: true });
  
  // Try clicking "New Study" button
  console.log('🆕 Clicking New Study button...');
  try {
    const newStudyButton = page.locator('[data-testid="create-study"]');
    if (await newStudyButton.isVisible()) {
      console.log('   Found [data-testid="create-study"] - clicking...');
      await newStudyButton.click();
    } else {
      const altButton = page.locator('text=New Study').first();
      console.log('   Trying text=New Study...');
      await altButton.click();
    }
  } catch (error) {
    console.log(`   Error clicking button: ${error.message}`);
    
    // Try the other button
    const createNewStudyButton = page.locator('[data-testid="create-new-study"]');
    if (await createNewStudyButton.isVisible()) {
      console.log('   Trying [data-testid="create-new-study"]...');
      await createNewStudyButton.click();
    }
  }
  
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  
  console.log('📸 Taking screenshot after clicking New Study...');
  await page.screenshot({ path: 'after-new-study-click.png', fullPage: true });
  
  // Check current URL
  const currentUrl = page.url();
  console.log(`🌐 Current URL: ${currentUrl}`);
  
  // Look for all elements on the new page
  console.log('\n🔍 Looking for study creation elements...');
  
  // Check for modals
  const modals = await page.locator('.modal, [role="dialog"], .dialog, .popup').all();
  console.log(`Found ${modals.length} modal/dialog elements:`);
  for (let i = 0; i < modals.length; i++) {
    const isVisible = await modals[i].isVisible();
    const className = await modals[i].getAttribute('class');
    console.log(`   ${i + 1}. Modal class="${className}" (visible: ${isVisible})`);
  }
  
  // Check for form inputs
  const inputs = await page.locator('input, textarea, select').all();
  console.log(`\nFound ${inputs.length} form inputs:`);
  for (let i = 0; i < inputs.length && i < 20; i++) {
    const type = await inputs[i].getAttribute('type');
    const name = await inputs[i].getAttribute('name');
    const placeholder = await inputs[i].getAttribute('placeholder');
    const id = await inputs[i].getAttribute('id');
    const isVisible = await inputs[i].isVisible();
    console.log(`   ${i + 1}. type="${type}" name="${name}" placeholder="${placeholder}" id="${id}" (visible: ${isVisible})`);
  }
  
  // Look for buttons related to study creation
  const studyButtons = await page.locator('button, a').filter({ hasText: /scratch|template|continue|next|create/i }).all();
  console.log(`\nFound ${studyButtons.length} study-related buttons:`);
  for (let i = 0; i < studyButtons.length; i++) {
    const text = await studyButtons[i].textContent();
    const isVisible = await studyButtons[i].isVisible();
    console.log(`   ${i + 1}. "${text?.trim()}" (visible: ${isVisible})`);
  }
  
  // Look for headings/titles
  const headings = await page.locator('h1, h2, h3, h4, .title, .heading').all();
  console.log(`\nFound ${headings.length} headings:`);
  for (let i = 0; i < headings.length && i < 10; i++) {
    const text = await headings[i].textContent();
    const isVisible = await headings[i].isVisible();
    console.log(`   ${i + 1}. "${text?.trim()}" (visible: ${isVisible})`);
  }
});