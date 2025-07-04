
import { test } from '@playwright/test';
import { expect } from '@playwright/test';

test('CompleteWorkflowContinuation_2025-06-24', async ({ page, context }) => {
  
    // Navigate to URL
    await page.goto('http://localhost:5175');

    // Click element
    await page.click('button:has-text("Login")');

    // Fill input field
    await page.fill('input[type="email"]', 'abwanwr77+Researcher@gmail.com');

    // Fill input field
    await page.fill('input[type="password"]', 'Testtest123');

    // Click element
    await page.click('button[type="submit"]');

    // Take screenshot
    await page.screenshot({ path: 'login-issue-check.png' });

    // Navigate to URL
    await page.goto('http://localhost:5175/login');

    // Take screenshot
    await page.screenshot({ path: 'login-page-direct.png' });

    // Navigate to URL
    await page.goto('http://localhost:5175', { waitUntil: 'networkidle' });
});