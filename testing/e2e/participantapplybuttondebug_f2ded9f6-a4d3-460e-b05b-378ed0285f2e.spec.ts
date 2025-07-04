
import { test } from '@playwright/test';
import { expect } from '@playwright/test';

test('ParticipantApplyButtonDebug_2025-06-30', async ({ page, context }) => {
  
    // Navigate to URL
    await page.goto('http://localhost:5175');

    // Fill input field
    await page.fill('input[name="email"]', 'abwanwr77+participant@gmail.com');

    // Click element
    await page.click('text=Sign in');

    // Fill input field
    await page.fill('input[name="email"]', 'abwanwr77+participant@gmail.com');

    // Fill input field
    await page.fill('input[name="password"]', 'Testtest123');

    // Click element
    await page.click('button[type="submit"]');

    // Navigate to URL
    await page.goto('http://localhost:5175/app/study-discovery');

    // Take screenshot
    await page.screenshot({ path: 'study_discovery_page_debug.png' });

    // Navigate to URL
    await page.goto('http://localhost:5175/app/participant-dashboard');

    // Click element
    await page.click('a[href="/app/discover"]');

    // Navigate to URL
    await page.goto('http://localhost:5175/app/discover');

    // Click element
    await page.click('text=Apply to Study');
});