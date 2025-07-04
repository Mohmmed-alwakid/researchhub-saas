
import { test } from '@playwright/test';
import { expect } from '@playwright/test';

test('ParticipantApplicationAndResearcherAcceptance_2025-06-24', async ({ page, context }) => {
  
    // Navigate to URL
    await page.goto('http://localhost:5175');

    // Take screenshot
    await page.screenshot({ path: '01-homepage-start.png' });

    // Navigate to URL
    await page.goto('http://localhost:5175/login');

    // Fill input field
    await page.fill('input[type="email"]', 'abwanwr77+participant@gmail.com');

    // Fill input field
    await page.fill('input[type="password"]', 'Testtest123');

    // Take screenshot
    await page.screenshot({ path: '02-participant-login-success.png' });

    // Navigate to URL
    await page.goto('http://localhost:5175/app/discover');

    // Take screenshot
    await page.screenshot({ path: '03-discover-studies-page.png' });

    // Click element
    await page.click('button:has-text("Apply to Study")');

    // Click element
    await page.click('a:has-text("Apply to Study")');

    // Take screenshot
    await page.screenshot({ path: '04-study-application-page.png' });

    // Navigate to URL
    await page.goto('http://localhost:5175/logout');

    // Navigate to URL
    await page.goto('http://localhost:5175/login');

    // Fill input field
    await page.fill('input[type="email"]', 'abwanwr77+Researcher@gmail.com');

    // Fill input field
    await page.fill('input[type="password"]', 'Testtest123');

    // Take screenshot
    await page.screenshot({ path: '05-researcher-login-success.png' });

    // Navigate to URL
    await page.goto('http://localhost:5175/app/studies');

    // Take screenshot
    await page.screenshot({ path: '06-researcher-studies-page.png' });

    // Navigate to URL
    await page.goto('http://localhost:5175/app/studies/6a9957f2-cbab-4013-a149-f02232b3ee9f/applications');

    // Take screenshot
    await page.screenshot({ path: '07-study-applications-page.png' });
});