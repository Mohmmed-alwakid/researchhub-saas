
import { test } from '@playwright/test';
import { expect } from '@playwright/test';

test('LoginTest_2025-08-04', async ({ page, context }) => {
  
    // Navigate to URL
    await page.goto('http://localhost:5175');

    // Take screenshot
    await page.screenshot({ path: 'local-homepage.png' });

    // Click element
    await page.click('text=Sign in');

    // Take screenshot
    await page.screenshot({ path: 'local-login-page.png' });

    // Fill input field
    await page.fill('#email', 'abwanwr77+Researcher@gmail.com');

    // Fill input field
    await page.fill('#password', 'Testtest123');

    // Take screenshot
    await page.screenshot({ path: 'local-login-form-filled.png' });

    // Click element
    await page.click('button[type="submit"]');

    // Take screenshot
    await page.screenshot({ path: 'local-login-result.png' });

    // Fill input field
    await page.fill('#email', 'abwanwr77+Researcher@gmail.com');

    // Fill input field
    await page.fill('#password', 'Testtest123');

    // Wait for response
    const login-requestResponse = page.waitForResponse('**/api/auth**');

    // Click element
    await page.click('button[type="submit"]');

    // Assert response
    expect(login-requestResponse.ok()).toBeTruthy();

    // Navigate to URL
    await page.goto('https://afkar.vercel.app');

    // Take screenshot
    await page.screenshot({ path: 'live-homepage.png' });

    // Navigate to URL
    await page.goto('https://researchhub-saas.vercel.app');

    // Take screenshot
    await page.screenshot({ path: 'live-researchhub-homepage.png' });

    // Click element
    await page.click('a[href="/sign-in"], [href="/signin"], button:has-text("Sign in")');

    // Click element
    await page.click('a[href="/login"]');

    // Take screenshot
    await page.screenshot({ path: 'live-login-page.png' });

    // Fill input field
    await page.fill('#email', 'abwanwr77+Researcher@gmail.com');

    // Fill input field
    await page.fill('#password', 'Testtest123');

    // Take screenshot
    await page.screenshot({ path: 'live-login-filled.png' });

    // Wait for response
    const live-login-requestResponse = page.waitForResponse('**/api/**');

    // Click element
    await page.click('button[type="submit"]');

    // Assert response
    expect(live-login-requestResponse.ok()).toBeTruthy();

    // Click element
    await page.click('a:has-text("Create account")');

    // Take screenshot
    await page.screenshot({ path: 'live-register-page.png' });

    // Fill input field
    await page.fill('#firstName', 'MCP');

    // Fill input field
    await page.fill('#lastName', 'Playwright');

    // Fill input field
    await page.fill('#email', 'mcpplaywright.test@gmail.com');

    // Fill input field
    await page.fill('#company', 'MCP Testing Corp');

    // Click element
    await page.click('#role-researcher');

    // Fill input field
    await page.fill('#password', 'MCPTest123!');

    // Fill input field
    await page.fill('#confirmPassword', 'MCPTest123!');

    // Click element
    await page.click('#acceptTerms');

    // Take screenshot
    await page.screenshot({ path: 'live-registration-filled.png' });

    // Wait for response
    const live-registration-requestResponse = page.waitForResponse('**/api/**');

    // Click element
    await page.click('button[type="submit"]');

    // Assert response
    expect(live-registration-requestResponse.ok()).toBeTruthy();
});