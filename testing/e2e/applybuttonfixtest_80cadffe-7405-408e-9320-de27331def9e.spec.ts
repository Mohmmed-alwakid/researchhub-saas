
import { test } from '@playwright/test';
import { expect } from '@playwright/test';

test('ApplyButtonFixTest_2025-06-30', async ({ page, context }) => {
  
    // Navigate to URL
    await page.goto('http://localhost:5175');

    // Click element
    await page.click('text=Sign in');

    // Fill input field
    await page.fill('input[name="email"]', 'abwanwr77+participant@gmail.com');

    // Fill input field
    await page.fill('input[name="password"]', 'Testtest123');

    // Click element
    await page.click('button[type="submit"]');

    // Navigate to URL
    await page.goto('http://localhost:5175/app/discover');

    // Take screenshot
    await page.screenshot({ path: 'apply_page_working.png' });

    // Click element
    await page.click('text=Submit Application');
});