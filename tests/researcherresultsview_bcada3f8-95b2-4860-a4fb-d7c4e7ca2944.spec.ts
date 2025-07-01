
import { test } from '@playwright/test';
import { expect } from '@playwright/test';

test('ResearcherResultsView_2025-07-01', async ({ page, context }) => {
  
    // Navigate to URL
    await page.goto('http://localhost:5175/login');

    // Fill input field
    await page.fill('input[type="email"]', 'abwanwr77+Researcher@gmail.com');

    // Fill input field
    await page.fill('input[type="password"]', 'Testtest123');

    // Click element
    await page.click('button[type="submit"]');

    // Navigate to URL
    await page.goto('http://localhost:5175/app/studies');

    // Take screenshot
    await page.screenshot({ path: 'researcher-studies-page.png' });

    // Click element
    await page.click('div:first-child .flex.items-center.space-x-4 a:has-text('Results')');

    // Click element
    await page.click('text=Results');

    // Navigate to URL
    await page.goto('http://localhost:5175/app/studies/62184eb3-45c0-45e6-af6d-4cbad96a5a0a/results');

    // Take screenshot
    await page.screenshot({ path: 'study-results-page-view.png' });

    // Navigate to URL
    await page.goto('http://localhost:5175/app/studies');

    // Click element
    await page.click('.bg-white.rounded-lg.shadow-sm.border.border-gray-200:first-child');

    // Take screenshot
    await page.screenshot({ path: 'after-study-card-click.png' });
});