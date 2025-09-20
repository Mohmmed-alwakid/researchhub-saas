import { test, expect } from '@playwright/test';

test('Study Creation Success State Inspector', async ({ page }) => {
  console.log('🎯 Inspecting Study Creation Success State...');
  
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
  
  // Click New Study button
  console.log('🆕 Step 1: Clicking New Study button...');
  const newStudyButton = page.locator('[data-testid="create-study"]');
  await newStudyButton.click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  // Select Usability Study
  console.log('🎯 Step 2: Selecting Usability Study method...');
  const usabilityOption = page.locator('text=Usability Study').first();
  await usabilityOption.click();
  await page.waitForTimeout(1000);
  
  // Click Continue
  console.log('⏭️ Step 3: Clicking Continue to proceed...');
  const continueButton = page.locator('button').filter({ hasText: /continue/i }).first();
  await continueButton.click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  // Fill form
  console.log('📝 Step 4: Filling study details form...');
  await page.locator('#title').fill('Test Study - Success Inspector');
  await page.locator('#description').fill('Testing the success state after study creation.');
  await page.locator('#participants').fill('5');
  
  // Try to find the next/continue button after form
  console.log('🔍 Step 5: Looking for next step buttons...');
  
  const allButtons = await page.locator('button').all();
  console.log(`Found ${allButtons.length} buttons:`);
  
  for (let i = 0; i < allButtons.length; i++) {
    const text = await allButtons[i].textContent();
    const isVisible = await allButtons[i].isVisible();
    const isEnabled = await allButtons[i].isEnabled();
    console.log(`   ${i + 1}. "${text?.trim()}" (visible: ${isVisible}, enabled: ${isEnabled})`);
  }
  
  // Try clicking next/continue
  const nextButton = page.locator('button').filter({ hasText: /next|continue|proceed/i }).first();
  if (await nextButton.isVisible()) {
    console.log('⏭️ Step 6: Clicking next/continue button...');
    await nextButton.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    console.log(`   Current URL: ${page.url()}`);
    console.log('📸 Taking screenshot after next step...');
    await page.screenshot({ path: 'after-continue-step.png', fullPage: true });
    
    // Check what's available in the next step
    console.log('🔍 Analyzing next step...');
    
    const nextStepButtons = await page.locator('button').all();
    console.log(`Found ${nextStepButtons.length} buttons in next step:`);
    
    for (let i = 0; i < nextStepButtons.length && i < 15; i++) {
      const text = await nextStepButtons[i].textContent();
      const isVisible = await nextStepButtons[i].isVisible();
      const isEnabled = await nextStepButtons[i].isEnabled();
      console.log(`   ${i + 1}. "${text?.trim()}" (visible: ${isVisible}, enabled: ${isEnabled})`);
    }
    
    // Look for save/publish/launch buttons
    const saveButton = page.locator('button').filter({ hasText: /save|launch|publish|create.*study|finish/i }).first();
    if (await saveButton.isVisible()) {
      console.log('💾 Step 7: Found save/launch button - clicking...');
      await saveButton.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      
      console.log(`   Final URL: ${page.url()}`);
      console.log('📸 Taking screenshot of final state...');
      await page.screenshot({ path: 'final-success-state.png', fullPage: true });
      
      // Check for success indicators
      console.log('🎉 Checking for success indicators...');
      
      const currentUrl = page.url();
      console.log(`   Current URL: ${currentUrl}`);
      
      const pageTitle = await page.title();
      console.log(`   Page title: "${pageTitle}"`);
      
      // Look for success messages
      const successElements = await page.locator('text=success').or(page.locator('text=created')).or(page.locator('.success')).or(page.locator('.alert-success')).all();
      console.log(`   Found ${successElements.length} success-related elements:`);
      
      for (let i = 0; i < successElements.length; i++) {
        const text = await successElements[i].textContent();
        const isVisible = await successElements[i].isVisible();
        console.log(`     ${i + 1}. "${text?.trim()}" (visible: ${isVisible})`);
      }
      
      // Check if we're in a study management/builder interface
      const studyElements = await page.locator('h1, h2, h3').all();
      console.log(`   Found ${studyElements.length} headings:`);
      
      for (let i = 0; i < studyElements.length && i < 5; i++) {
        const text = await studyElements[i].textContent();
        const isVisible = await studyElements[i].isVisible();
        console.log(`     ${i + 1}. "${text?.trim()}" (visible: ${isVisible})`);
      }
    }
  }
});