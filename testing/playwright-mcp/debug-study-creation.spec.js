import { test, expect } from '@playwright/test';

test.describe('Debug Study Creation Issue', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('Debug what elements are present after login', async ({ page }) => {
    console.log('🔍 Starting authentication process...');
    
    // Navigate to login page first
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    console.log(`🔗 After /login navigation - URL: ${page.url()}`);
    
    // Try to authenticate
    const emailInput = page.locator('input[type="email"]').first();
    if (await emailInput.isVisible()) {
      console.log('📧 Found email input, attempting login...');
      await emailInput.fill('abwanwr77+Researcher@gmail.com');
      await page.locator('input[type="password"]').first().fill('Testtest123');
      await page.locator('button:has-text("Login"), button:has-text("Sign In"), [type="submit"]').first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      
      console.log(`🔗 After login attempt - URL: ${page.url()}`);
    } else {
      console.log('❌ No email input found on login page');
      await page.screenshot({ path: 'testing/reports/debug-no-email-input.png' });
    }

    // Take screenshot for debugging
    await page.screenshot({ path: 'testing/reports/debug-after-login.png', fullPage: true });

    // Check current URL
    const currentUrl = page.url();
    console.log(`🔗 Current URL: ${currentUrl}`);

    // Check page title
    const title = await page.title();
    console.log(`📄 Page title: ${title}`);

    // Check if dashboard is present
    const hasDashboard = await page.locator('[data-testid="dashboard"]').isVisible();
    console.log(`📊 Dashboard visible: ${hasDashboard}`);

    // Check all buttons on the page
    const allButtons = await page.locator('button').all();
    console.log(`🔘 Total buttons found: ${allButtons.length}`);
    
    for (let i = 0; i < Math.min(allButtons.length, 10); i++) {
      const buttonText = await allButtons[i].textContent();
      const buttonVisible = await allButtons[i].isVisible();
      console.log(`  Button ${i + 1}: "${buttonText}" (visible: ${buttonVisible})`);
    }

    // Check all links on the page
    const allLinks = await page.locator('a').all();
    console.log(`🔗 Total links found: ${allLinks.length}`);
    
    for (let i = 0; i < Math.min(allLinks.length, 10); i++) {
      const linkText = await allLinks[i].textContent();
      const linkHref = await allLinks[i].getAttribute('href');
      const linkVisible = await allLinks[i].isVisible();
      console.log(`  Link ${i + 1}: "${linkText}" -> ${linkHref} (visible: ${linkVisible})`);
    }

    // Look specifically for study-related text
    const studyText = await page.getByText('Study', { exact: false }).all();
    console.log(`📚 Elements containing 'Study': ${studyText.length}`);
    
    for (let i = 0; i < Math.min(studyText.length, 5); i++) {
      const text = await studyText[i].textContent();
      const visible = await studyText[i].isVisible();
      console.log(`  Study element ${i + 1}: "${text}" (visible: ${visible})`);
    }

    // Check for specific create buttons
    const createButtons = [
      '[data-testid="create-study"]',
      '[data-testid="create-new-study"]',
      'button:has-text("New Study")',
      'button:has-text("Create New Study")',
      'button:has-text("Create Study")'
    ];

    for (const selector of createButtons) {
      const exists = await page.locator(selector).count();
      const visible = exists > 0 ? await page.locator(selector).first().isVisible() : false;
      console.log(`🎯 ${selector}: exists(${exists}), visible(${visible})`);
    }

    console.log('✅ Debug information collected');
  });
});
