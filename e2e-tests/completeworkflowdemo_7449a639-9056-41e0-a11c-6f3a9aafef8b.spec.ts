
import { test } from '@playwright/test';
import { expect } from '@playwright/test';

test('CompleteWorkflowDemo_2025-06-30', async ({ page, context }) => {
  
    // Navigate to URL
    await page.goto('http://localhost:5175');

    // Click element
    await page.click('a[href="#signin"], .btn-sign-in, .sign-in-btn, button:has-text("Sign in")');

    // Click element
    await page.click('text=Sign in');

    // Fill input field
    await page.fill('input[type="email"], input[name="email"], #email', 'abwanwr77+participant@gmail.com');

    // Fill input field
    await page.fill('input[type="password"], input[name="password"], #password', 'Testtest123');

    // Click element
    await page.click('button:has-text("Sign in"), input[type="submit"]');

    // Click element
    await page.click('text=Discover Studies');

    // Click element
    await page.click('text=Browse Studies');

    // Take screenshot
    await page.screenshot({ path: 'current-page-state.png', { fullPage: true } });
});