import { test, expect } from '@playwright/test';

test('Build Step Continue Enable Inspector', async ({ page }) => {
  console.log('🔨 Checking Build Step Continue Button Requirements...');
  
  // Setup and reach Build step
  await page.goto('https://researchhub-saas.vercel.app/app/dashboard');
  await page.waitForLoadState('networkidle');
  
  console.log('🔐 Logging in as Researcher...');
  await page.locator('input[type="email"]').fill('abwanwr77+Researcher@gmail.com');
  await page.locator('input[type="password"]').fill('Testtest123');
  await page.locator('button[type="submit"]').click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  // Navigate to Build step
  const newStudyButton = page.locator('[data-testid="create-study"]');
  await newStudyButton.click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  const usabilityOption = page.locator('text=Usability Study').first();
  await usabilityOption.click();
  await page.waitForTimeout(1000);
  
  const continueAfterType = page.locator('button').filter({ hasText: /continue/i }).first();
  await continueAfterType.click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  await page.locator('#title').fill('Continue Enable Test');
  await page.locator('#description').fill('Testing Continue enable requirements.');
  await page.locator('#participants').fill('3');
  
  const continueAfterDetails = page.locator('button').filter({ hasText: /continue/i }).first();
  await continueAfterDetails.click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  const continueAfterConfig = page.locator('button').filter({ hasText: /continue/i }).first();
  await continueAfterConfig.click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  
  // Now in Build step - check current state
  console.log('🔨 Analyzing Build Step Current State...');
  
  const continueButton = page.locator('button').filter({ hasText: /continue/i }).first();
  let isEnabled = await continueButton.isEnabled();
  console.log(`   Initial Continue button enabled: ${isEnabled}`);
  
  if (isEnabled) {
    console.log('✅ Continue is already enabled! Proceeding...');
    await continueButton.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    console.log(`   Proceeded to: ${page.url()}`);
    return;
  }
  
  // Check how many blocks are in the study flow
  console.log('📊 Checking study flow blocks...');
  
  const studyFlowBlocks = await page.locator('.block, .study-block, [data-block]').all();
  console.log(`   Found ${studyFlowBlocks.length} blocks in study flow`);
  
  // Look for block count text
  const blockCountText = await page.locator('text=/\\d+ blocks?/i').first().textContent().catch(() => 'not found');
  console.log(`   Block count text: "${blockCountText}"`);
  
  // Wait a bit more in case it's a timing issue
  console.log('⏳ Waiting additional time for UI to settle...');
  await page.waitForTimeout(5000);
  
  isEnabled = await continueButton.isEnabled();
  console.log(`   Continue button enabled after wait: ${isEnabled}`);
  
  if (isEnabled) {
    console.log('✅ Continue enabled after wait! Proceeding...');
    await continueButton.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    console.log(`   Proceeded to: ${page.url()}`);
    return;
  }
  
  // Try different approach - look for specific block addition
  console.log('🎯 Attempting to add a block using alternative method...');
  
  // Try clicking on block library items directly
  const blockLibraryItems = await page.locator('.block-library .item, .block-item, button').filter({ hasText: /welcome|screen|question/i }).all();
  console.log(`   Found ${blockLibraryItems.length} block library items`);
  
  for (let i = 0; i < blockLibraryItems.length && i < 3; i++) {
    const text = await blockLibraryItems[i].textContent();
    const isVisible = await blockLibraryItems[i].isVisible();
    console.log(`     ${i + 1}. "${text?.trim()}" (visible: ${isVisible})`);
    
    if (isVisible && text?.toLowerCase().includes('welcome')) {
      console.log(`     Trying to click Welcome block...`);
      try {
        await blockLibraryItems[i].click({ force: true });
        await page.waitForTimeout(2000);
        
        isEnabled = await continueButton.isEnabled();
        console.log(`     Continue enabled after clicking Welcome: ${isEnabled}`);
        
        if (isEnabled) {
          console.log('✅ Continue enabled after adding Welcome block!');
          await continueButton.click();
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(2000);
          console.log(`     Proceeded to: ${page.url()}`);
          return;
        }
      } catch (error) {
        console.log(`     Error clicking Welcome block: ${error.message}`);
      }
    }
  }
  
  // Try force clicking the Add Block button
  console.log('🔄 Trying to force click Add Block button...');
  try {
    const addBlockButton = page.locator('text=Add Block Here').first();
    await addBlockButton.click({ force: true });
    await page.waitForTimeout(2000);
    
    isEnabled = await continueButton.isEnabled();
    console.log(`   Continue enabled after force click: ${isEnabled}`);
  } catch (error) {
    console.log(`   Error force clicking Add Block: ${error.message}`);
  }
  
  // Final status
  isEnabled = await continueButton.isEnabled();
  console.log(`🏁 Final Continue button status: ${isEnabled}`);
  
  if (isEnabled) {
    console.log('✅ Continue finally enabled! Proceeding...');
    await continueButton.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    console.log(`   Final URL: ${page.url()}`);
  } else {
    console.log('❌ Continue button still disabled after all attempts');
    
    // Take final screenshot for debugging
    await page.screenshot({ path: 'build-step-continue-disabled.png', fullPage: true });
    console.log('📸 Screenshot saved: build-step-continue-disabled.png');
  }
});