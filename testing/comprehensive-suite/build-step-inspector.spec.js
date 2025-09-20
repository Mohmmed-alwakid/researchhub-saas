import { test, expect } from '@playwright/test';

test('Build Step Requirements Inspector', async ({ page }) => {
  console.log('🔨 Inspecting Build Step Requirements...');
  
  // Navigate and setup
  await page.goto('https://researchhub-saas.vercel.app/app/dashboard');
  await page.waitForLoadState('networkidle');
  
  console.log('🔐 Logging in as Researcher...');
  await page.locator('input[type="email"]').fill('abwanwr77+Researcher@gmail.com');
  await page.locator('input[type="password"]').fill('Testtest123');
  await page.locator('button[type="submit"]').click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  // Go through wizard to Build step
  console.log('🆕 Starting wizard...');
  const newStudyButton = page.locator('[data-testid="create-study"]');
  await newStudyButton.click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  console.log('🎯 Selecting Usability Study...');
  const usabilityOption = page.locator('text=Usability Study').first();
  await usabilityOption.click();
  await page.waitForTimeout(1000);
  
  const continueAfterType = page.locator('button').filter({ hasText: /continue/i }).first();
  await continueAfterType.click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  console.log('📝 Filling details...');
  await page.locator('#title').fill('Build Step Test Study');
  await page.locator('#description').fill('Testing what is required in the Build step.');
  await page.locator('#participants').fill('5');
  
  const continueAfterDetails = page.locator('button').filter({ hasText: /continue/i }).first();
  await continueAfterDetails.click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  console.log('⚙️ Config step...');
  const continueAfterConfig = page.locator('button').filter({ hasText: /continue/i }).first();
  await continueAfterConfig.click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  
  // Now in Build step - analyze requirements
  console.log('🔨 Analyzing Build Step Requirements...');
  
  console.log('📸 Taking Build step screenshot...');
  await page.screenshot({ path: 'build-step-analysis.png', fullPage: true });
  
  // Check Continue button status
  const continueButton = page.locator('button').filter({ hasText: /continue/i }).first();
  const isEnabled = await continueButton.isEnabled();
  const isVisible = await continueButton.isVisible();
  console.log(`   Continue button - Visible: ${isVisible}, Enabled: ${isEnabled}`);
  
  // Look for form elements or requirements
  console.log('\n🔍 Looking for Build step requirements...');
  
  // Check for headings/instructions
  const headings = await page.locator('h1, h2, h3, h4').all();
  console.log(`Found ${headings.length} headings:`);
  for (let i = 0; i < headings.length && i < 10; i++) {
    const text = await headings[i].textContent();
    const isVisible = await headings[i].isVisible();
    console.log(`   ${i + 1}. "${text?.trim()}" (visible: ${isVisible})`);
  }
  
  // Check for blocks/components to add
  const blockElements = await page.locator('div, button').filter({ hasText: /block|component|add|welcome|question|screen/i }).all();
  console.log(`\nFound ${blockElements.length} block-related elements:`);
  for (let i = 0; i < blockElements.length && i < 15; i++) {
    const text = await blockElements[i].textContent();
    const tagName = await blockElements[i].evaluate(el => el.tagName);
    const isVisible = await blockElements[i].isVisible();
    const className = await blockElements[i].getAttribute('class');
    console.log(`   ${i + 1}. <${tagName}> "${text?.trim().substring(0, 50)}" class="${className?.substring(0, 30)}" (visible: ${isVisible})`);
  }
  
  // Look for add buttons
  const addButtons = await page.locator('button').filter({ hasText: /add|create|\+/i }).all();
  console.log(`\nFound ${addButtons.length} add/create buttons:`);
  for (let i = 0; i < addButtons.length; i++) {
    const text = await addButtons[i].textContent();
    const isVisible = await addButtons[i].isVisible();
    const isEnabled = await addButtons[i].isEnabled();
    console.log(`   ${i + 1}. "${text?.trim()}" (visible: ${isVisible}, enabled: ${isEnabled})`);
  }
  
  // Try to add a basic block to enable Continue
  console.log('\n🎯 Attempting to add a block to enable Continue...');
  
  // Look for common block types
  const welcomeBlock = page.locator('text=Welcome').or(page.locator('text=Welcome Screen')).first();
  if (await welcomeBlock.isVisible()) {
    console.log('   Found Welcome block - clicking...');
    await welcomeBlock.click();
    await page.waitForTimeout(2000);
  }
  
  // Try clicking any visible add button
  const firstAddButton = addButtons.find(async (button) => {
    return await button.isVisible() && await button.isEnabled();
  });
  
  if (firstAddButton && await firstAddButton.isVisible()) {
    const buttonText = await firstAddButton.textContent();
    console.log(`   Found enabled add button: "${buttonText?.trim()}" - clicking...`);
    await firstAddButton.click();
    await page.waitForTimeout(2000);
    
    // Check if Continue is now enabled
    const continueAfterAdd = page.locator('button').filter({ hasText: /continue/i }).first();
    const isEnabledAfterAdd = await continueAfterAdd.isEnabled();
    console.log(`   Continue button after adding: Enabled: ${isEnabledAfterAdd}`);
  }
  
  // Look for drag-drop or block library
  console.log('\n📚 Looking for block library or drag-drop area...');
  
  const dragElements = await page.locator('[draggable], .draggable, .drag, .block-library, .components').all();
  console.log(`Found ${dragElements.length} drag/drop elements:`);
  for (let i = 0; i < dragElements.length; i++) {
    const className = await dragElements[i].getAttribute('class');
    const isDraggable = await dragElements[i].getAttribute('draggable');
    const isVisible = await dragElements[i].isVisible();
    console.log(`   ${i + 1}. class="${className}" draggable="${isDraggable}" (visible: ${isVisible})`);
  }
});