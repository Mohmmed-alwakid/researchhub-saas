import { test, expect } from '@playwright/test';

test('Complete Study Creation Wizard Steps', async ({ page }) => {
  console.log('🧙‍♂️ Testing Complete Study Creation Wizard Steps...');
  
  // Navigate to dashboard and login
  await page.goto('https://researchhub-saas.vercel.app/app/dashboard');
  await page.waitForLoadState('networkidle');
  
  console.log('🔐 Logging in as Researcher...');
  await page.locator('input[type="email"]').fill('abwanwr77+Researcher@gmail.com');
  await page.locator('input[type="password"]').fill('Testtest123');
  await page.locator('button[type="submit"]').click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  // Step 1: Start study creation
  console.log('🆕 Step 1: Starting study creation...');
  const newStudyButton = page.locator('[data-testid="create-study"]');
  await newStudyButton.click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  // Step 2: Select method (Type step)
  console.log('🎯 Step 2: Selecting Usability Study method...');
  const usabilityOption = page.locator('text=Usability Study').first();
  await usabilityOption.click();
  await page.waitForTimeout(1000);
  
  const continueAfterType = page.locator('button').filter({ hasText: /continue/i }).first();
  await continueAfterType.click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  // Step 3: Fill details
  console.log('📝 Step 3: Filling study details...');
  await page.locator('#title').fill('Complete Wizard Test Study');
  await page.locator('#description').fill('Testing the complete study creation wizard flow.');
  await page.locator('#participants').fill('8');
  
  const continueAfterDetails = page.locator('button').filter({ hasText: /continue/i }).first();
  await continueAfterDetails.click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  
  console.log(`   After Details step URL: ${page.url()}`);
  console.log('📸 Taking screenshot after Details step...');
  await page.screenshot({ path: 'wizard-config-step.png', fullPage: true });
  
  // Step 4: Config step analysis
  console.log('⚙️ Step 4: Analyzing Config step...');
  
  const configButtons = await page.locator('button').all();
  console.log(`Found ${configButtons.length} buttons in Config step:`);
  
  for (let i = 0; i < configButtons.length && i < 20; i++) {
    const text = await configButtons[i].textContent();
    const isVisible = await configButtons[i].isVisible();
    const isEnabled = await configButtons[i].isEnabled();
    console.log(`   ${i + 1}. "${text?.trim()}" (visible: ${isVisible}, enabled: ${isEnabled})`);
  }
  
  // Look for config options/inputs
  const configInputs = await page.locator('input, select, textarea').all();
  console.log(`\nFound ${configInputs.length} config inputs:`);
  
  for (let i = 0; i < configInputs.length && i < 15; i++) {
    const type = await configInputs[i].getAttribute('type');
    const name = await configInputs[i].getAttribute('name');
    const placeholder = await configInputs[i].getAttribute('placeholder');
    const isVisible = await configInputs[i].isVisible();
    console.log(`   ${i + 1}. type="${type}" name="${name}" placeholder="${placeholder}" (visible: ${isVisible})`);
  }
  
  // Continue to Build step
  const continueAfterConfig = page.locator('button').filter({ hasText: /continue/i }).first();
  if (await continueAfterConfig.isVisible() && await continueAfterConfig.isEnabled()) {
    console.log('⏭️ Continuing to Build step...');
    await continueAfterConfig.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    console.log(`   After Config step URL: ${page.url()}`);
    console.log('📸 Taking screenshot of Build step...');
    await page.screenshot({ path: 'wizard-build-step.png', fullPage: true });
    
    // Step 5: Build step analysis
    console.log('🔨 Step 5: Analyzing Build step...');
    
    const buildButtons = await page.locator('button').all();
    console.log(`Found ${buildButtons.length} buttons in Build step:`);
    
    for (let i = 0; i < buildButtons.length && i < 20; i++) {
      const text = await buildButtons[i].textContent();
      const isVisible = await buildButtons[i].isVisible();
      const isEnabled = await buildButtons[i].isEnabled();
      console.log(`   ${i + 1}. "${text?.trim()}" (visible: ${isVisible}, enabled: ${isEnabled})`);
    }
    
    // Continue to Review step
    const continueAfterBuild = page.locator('button').filter({ hasText: /continue/i }).first();
    if (await continueAfterBuild.isVisible() && await continueAfterBuild.isEnabled()) {
      console.log('⏭️ Continuing to Review step...');
      await continueAfterBuild.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      
      console.log(`   After Build step URL: ${page.url()}`);
      console.log('📸 Taking screenshot of Review step...');
      await page.screenshot({ path: 'wizard-review-step.png', fullPage: true });
      
      // Step 6: Review step analysis
      console.log('👀 Step 6: Analyzing Review step...');
      
      const reviewButtons = await page.locator('button').all();
      console.log(`Found ${reviewButtons.length} buttons in Review step:`);
      
      for (let i = 0; i < reviewButtons.length && i < 20; i++) {
        const text = await reviewButtons[i].textContent();
        const isVisible = await reviewButtons[i].isVisible();
        const isEnabled = await reviewButtons[i].isEnabled();
        console.log(`   ${i + 1}. "${text?.trim()}" (visible: ${isVisible}, enabled: ${isEnabled})`);
      }
      
      // Look for final launch/create button
      const launchButton = page.locator('button').filter({ hasText: /launch|create.*study|finish|publish|save/i }).first();
      if (await launchButton.isVisible()) {
        console.log('🚀 Final step: Found launch button - clicking...');
        await launchButton.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        
        console.log(`   Final URL: ${page.url()}`);
        console.log('📸 Taking screenshot of final success state...');
        await page.screenshot({ path: 'wizard-final-success.png', fullPage: true });
        
        // Check success state
        console.log('🎉 Checking final success state...');
        
        const finalUrl = page.url();
        console.log(`   Final URL: ${finalUrl}`);
        
        const pageTitle = await page.title();
        console.log(`   Page title: "${pageTitle}"`);
        
        // Look for success indicators
        const headings = await page.locator('h1, h2, h3').all();
        console.log(`   Found ${headings.length} headings:`);
        
        for (let i = 0; i < headings.length && i < 5; i++) {
          const text = await headings[i].textContent();
          const isVisible = await headings[i].isVisible();
          console.log(`     ${i + 1}. "${text?.trim()}" (visible: ${isVisible})`);
        }
      }
    }
  }
});