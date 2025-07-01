
import { test } from '@playwright/test';
import { expect } from '@playwright/test';

test('FinishStudyFlowDemo_2025-07-01', async ({ page, context }) => {
  
    // Navigate to URL
    await page.goto('http://localhost:5175');

    // Click element
    await page.click('text=Sign In');

    // Fill input field
    await page.fill('input[type="email"]', 'abwanwr77+participant@gmail.com');

    // Fill input field
    await page.fill('input[type="password"]', 'Testtest123');

    // Click element
    await page.click('button[type="submit"]');

    // Click element
    await page.click('text=Browse Studies');
});