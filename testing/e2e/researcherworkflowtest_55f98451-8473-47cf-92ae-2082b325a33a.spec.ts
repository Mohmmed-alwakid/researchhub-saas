
import { test } from '@playwright/test';
import { expect } from '@playwright/test';

test('ResearcherWorkflowTest_2025-06-30', async ({ page, context }) => {
  
    // Navigate to URL
    await page.goto('http://localhost:5175');

    // Click element
    await page.click('text=Sign In');

    // Fill input field
    await page.fill('input[type="email"]', 'abwanwr77+Researcher@gmail.com');

    // Fill input field
    await page.fill('input[type="password"]', 'Testtest123');

    // Click element
    await page.click('button:has-text("Sign In")');

    // Click element
    await page.click('text=Studies');

    // Click element
    await page.click('a[href="/app/studies"]');

    // Navigate to URL
    await page.goto('http://localhost:5175/app/studies');

    // Click element
    await page.click('text=Applications >> nth=0');

    // Navigate to URL
    await page.goto('http://localhost:5175/app/studies');

    // Click element
    await page.click('a[href*="/app/studies/"][href*="/applications"]');

    // Navigate to URL
    await page.goto('http://localhost:5175/app/studies/a1e559aa-260b-4dbd-b3d5-98ce8ac48e78/applications');
});