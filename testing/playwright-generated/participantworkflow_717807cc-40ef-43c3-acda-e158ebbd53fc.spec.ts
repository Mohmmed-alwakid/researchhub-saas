
import { test } from '@playwright/test';
import { expect } from '@playwright/test';

test('ParticipantWorkflow_2025-08-09', async ({ page, context }) => {
  
    // Navigate to URL
    await page.goto('http://localhost:5175/login');

    // Fill input field
    await page.fill('input[type="email"]', 'abwanwr77+participant@gmail.com');

    // Fill input field
    await page.fill('input[type="password"]', 'Testtest123');

    // Click element
    await page.click('button[type="submit"]');

    // Take screenshot
    await page.screenshot({ path: 'participant-login.png' });

    // Navigate to URL
    await page.goto('http://localhost:5175/app/discover');

    // Take screenshot
    await page.screenshot({ path: 'participant-discover-page.png' });

    // Click element
    await page.click('button:has-text("Apply Now"):first');

    // Click element
    await page.click('button:has-text("Apply Now")');

    // Take screenshot
    await page.screenshot({ path: 'study-application-page.png' });

    // Fill input field
    await page.fill('textarea[placeholder*="interested"], textarea:first-of-type', 'I'm interested in mobile app usability and want to help improve user experience');

    // Fill input field
    await page.fill('textarea:nth-of-type(2)', 'I have 3 years of experience using mobile apps and have worked in UI design');

    // Fill input field
    await page.fill('textarea[placeholder*="experience"], textarea[placeholder*="background"]', 'I have 3 years of experience using mobile apps and have worked in UI design');

    // Click element
    await page.click('select, option:has-text("25-34")');

    // Select option
    await page.selectOption('select', '25-34');

    // Click element
    await page.click('button:has-text("Submit Application")');

    // Take screenshot
    await page.screenshot({ path: 'application-form-state.png' });

    // Click element
    await page.click('button:has-text("Cancel"), button:has-text("✕")');
});