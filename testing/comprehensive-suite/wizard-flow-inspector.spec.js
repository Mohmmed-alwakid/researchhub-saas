import { test, expect } from '@playwright/test';

test('Complete Study Creation Wizard Flow', async ({ page }) => {
  console.log('🧙‍♂️ Testing Complete Study Creation Wizard Flow...');
  
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
  
  console.log(`   Current URL: ${page.url()}`);
  console.log('📸 Taking screenshot of Step 1...');
  await page.screenshot({ path: 'wizard-step1-method-selection.png', fullPage: true });
  
  // Step 1: Choose research method
  console.log('\n📊 Step 1 Analysis: Research Method Selection');
  
  // Find all study type options
  const studyTypes = await page.locator('.card, .option, .study-type, div[role="button"], div[onclick]').all();
  console.log(`Found ${studyTypes.length} potential study type cards:`);
  
  for (let i = 0; i < studyTypes.length && i < 10; i++) {
    const text = await studyTypes[i].textContent();
    const isVisible = await studyTypes[i].isVisible();
    const className = await studyTypes[i].getAttribute('class');
    console.log(`   ${i + 1}. "${text?.trim().substring(0, 50)}" class="${className?.substring(0, 30)}" (visible: ${isVisible})`);
  }
  
  // Try to select Usability Study
  console.log('\n🎯 Selecting Usability Study...');
  const usabilityOption = page.locator('text=Usability Study').or(page.locator('[data-study-type="usability"]')).first();
  if (await usabilityOption.isVisible()) {
    await usabilityOption.click();
    console.log('   ✅ Usability Study selected');
  } else {
    console.log('   ❌ Usability Study not found, trying first clickable option...');
    // Try clicking the first clickable div/card
    const firstCard = page.locator('div').filter({ hasText: /usability|study/i }).first();
    if (await firstCard.isVisible()) {
      await firstCard.click();
    }
  }
  
  await page.waitForTimeout(1000);
  
  // Look for Continue button and click it
  console.log('\n⏭️ Looking for Continue button...');
  const continueButton = page.locator('button').filter({ hasText: /continue|next|proceed/i }).first();
  if (await continueButton.isVisible()) {
    console.log('   Found Continue button - clicking...');
    await continueButton.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  }
  
  console.log(`   Current URL after continue: ${page.url()}`);
  console.log('📸 Taking screenshot of Step 2...');
  await page.screenshot({ path: 'wizard-step2.png', fullPage: true });
  
  // Step 2: Analyze what comes next
  console.log('\n📋 Step 2 Analysis: Next Stage');
  
  // Check for templates vs from scratch options
  const scratchOptions = await page.locator('text=scratch').or(page.locator('text=template')).all();
  console.log(`Found ${scratchOptions.length} scratch/template options:`);
  
  for (let i = 0; i < scratchOptions.length; i++) {
    const text = await scratchOptions[i].textContent();
    const isVisible = await scratchOptions[i].isVisible();
    console.log(`   ${i + 1}. "${text?.trim()}" (visible: ${isVisible})`);
  }
  
  // Check for form inputs in current step
  const currentInputs = await page.locator('input, textarea, select').all();
  console.log(`\nFound ${currentInputs.length} form inputs in current step:`);
  for (let i = 0; i < currentInputs.length && i < 10; i++) {
    const type = await currentInputs[i].getAttribute('type');
    const name = await currentInputs[i].getAttribute('name');
    const placeholder = await currentInputs[i].getAttribute('placeholder');
    const id = await currentInputs[i].getAttribute('id');
    const isVisible = await currentInputs[i].isVisible();
    console.log(`   ${i + 1}. type="${type}" name="${name}" placeholder="${placeholder}" id="${id}" (visible: ${isVisible})`);
  }
  
  // Look for next step buttons
  const nextButtons = await page.locator('button').filter({ hasText: /continue|next|create|save|finish/i }).all();
  console.log(`\nFound ${nextButtons.length} navigation buttons:`);
  for (let i = 0; i < nextButtons.length; i++) {
    const text = await nextButtons[i].textContent();
    const isVisible = await nextButtons[i].isVisible();
    console.log(`   ${i + 1}. "${text?.trim()}" (visible: ${isVisible})`);
  }
  
  // Try "Start from Scratch" if available
  console.log('\n🎨 Looking for Start from Scratch option...');
  const scratchOption = page.locator('text=Start from Scratch').or(page.locator('text=From Scratch')).or(page.locator('[data-option="scratch"]')).first();
  if (await scratchOption.isVisible()) {
    console.log('   Found Start from Scratch - clicking...');
    await scratchOption.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log(`   Current URL after scratch selection: ${page.url()}`);
    console.log('📸 Taking screenshot of Step 3...');
    await page.screenshot({ path: 'wizard-step3-form.png', fullPage: true });
    
    // Check for study details form
    console.log('\n📝 Step 3 Analysis: Study Details Form');
    
    const formInputs = await page.locator('input, textarea, select').all();
    console.log(`Found ${formInputs.length} form inputs:`);
    for (let i = 0; i < formInputs.length; i++) {
      const type = await formInputs[i].getAttribute('type');
      const name = await formInputs[i].getAttribute('name');
      const placeholder = await formInputs[i].getAttribute('placeholder');
      const id = await formInputs[i].getAttribute('id');
      const isVisible = await formInputs[i].isVisible();
      console.log(`   ${i + 1}. type="${type}" name="${name}" placeholder="${placeholder}" id="${id}" (visible: ${isVisible})`);
    }
  }
});