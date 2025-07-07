
import { test } from '@playwright/test';
import { expect } from '@playwright/test';

test('ParticipantBlockRenderingDemo_2025-06-30', async ({ page, context }) => {
  
    // Navigate to URL
    await page.goto('http://localhost:5175');

    // Click element
    await page.click('a[href="/login"]');

    // Fill input field
    await page.fill('input[type="email"]', 'abwanwr77+participant@gmail.com');

    // Fill input field
    await page.fill('input[type="password"]', 'Testtest123');

    // Click element
    await page.click('button[type="submit"]');

    // Click element
    await page.click('a[href="/app/discover"]');

    // Click element
    await page.click('text=Browse Studies');

    // Navigate to URL
    await page.goto('http://localhost:5175/app/discover');

    // Click element
    await page.click('text=Apply to Study >> nth=0');

    // Click element
    await page.click('text=Submit Application');

    // Navigate to URL
    await page.goto('http://localhost:5175/app/studies/62184eb3-45c0-45e6-af6d-4cbad96a5a0a/session');

    // Click element
    await page.click('text=Start Study Session');

    // Navigate to URL
    await page.goto('http://localhost:5175/app/studies/62184eb3-45c0-45e6-af6d-4cbad96a5a0a/session');

    // Click element
    await page.click('text=Start Study Session');

    // Click element
    await page.click('text=Get Started');

    // Click element
    await page.click('text=I Understand, Continue');

    // Click element
    await page.click('text=Daily');

    // Click element
    await page.click('text=Continue');

    // Click element
    await page.click('text=Previous');

    // Click element
    await page.click('input[value=\"Daily\"]');

    // Take screenshot
    await page.screenshot({ path: 'participant-block-rendering-demo.png' });
});