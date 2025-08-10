
import { test } from '@playwright/test';
import { expect } from '@playwright/test';

test('ParticipantWorkflow_2025-08-08', async ({ page, context }) => {
  
    // Navigate to URL
    await page.goto('http://localhost:5175/login');

    // Fill input field
    await page.fill('input[type="email"]', 'abwanwr77+researcher@gmail.com');

    // Fill input field
    await page.fill('input[type="password"]', 'Testtest123');

    // Navigate to URL
    await page.goto('http://localhost:5175/app/studies');

    // Take screenshot
    await page.screenshot({ path: 'researcher-studies-page.png' });

    // Navigate to URL
    await page.goto('http://localhost:5175/app/studies');

    // Navigate to URL
    await page.goto('http://localhost:5175/logout');

    // Navigate to URL
    await page.goto('http://localhost:5175/login');

    // Fill input field
    await page.fill('input[type="email"]', 'abwanwr77+participant@gmail.com');

    // Fill input field
    await page.fill('input[type="password"]', 'Testtest123');

    // Navigate to URL
    await page.goto('http://localhost:5175/app/studies');

    // Take screenshot
    await page.screenshot({ path: 'participant-studies-page.png' });
});