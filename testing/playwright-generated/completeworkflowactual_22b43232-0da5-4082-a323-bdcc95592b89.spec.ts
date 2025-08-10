
import { test } from '@playwright/test';
import { expect } from '@playwright/test';

test('CompleteWorkflowActual_2025-08-09', async ({ page, context }) => {
  
    // Navigate to URL
    await page.goto('http://localhost:5175/login');

    // Fill input field
    await page.fill('input[type="email"]', 'abwanwr77+researcher@gmail.com');

    // Fill input field
    await page.fill('input[type="password"]', 'Testtest123');

    // Click element
    await page.click('button[type="submit"]');

    // Navigate to URL
    await page.goto('http://localhost:5175/app/studies');

    // Take screenshot
    await page.screenshot({ path: 'researcher-studies-page.png' });

    // Click element
    await page.click('button:has-text("Create Study")');

    // Click element
    await page.click('div:has-text("Usability Study")');

    // Click element
    await page.click('button:has-text("Continue")');

    // Fill input field
    await page.fill('input[type="text"]:first', 'Complete Workflow Test Study');

    // Fill input field
    await page.fill('input[type="text"]', 'Complete Workflow Test Study');

    // Fill input field
    await page.fill('textarea', 'This is a real test study to validate the complete participant workflow from application to completion');

    // Fill input field
    await page.fill('input[type="number"]', '1');

    // Click element
    await page.click('button:has-text("Continue")');

    // Click element
    await page.click('button:has-text("Add Question"), button:has-text("Add Your First Question")');

    // Fill input field
    await page.fill('input, textarea', 'Are you available for a 15-minute usability test?');

    // Click element
    await page.click('button:has-text("Add Option")');

    // Fill input field
    await page.fill('input[type="text"]:last-of-type', 'Yes, I'm available');

    // Click element
    await page.click('button:has-text("Add Option")');

    // Fill input field
    await page.fill('input[type="text"]:last-of-type', 'No, not available');

    // Click element
    await page.click('button:has-text("Continue to Block Builder")');

    // Take screenshot
    await page.screenshot({ path: 'block-builder-with-blocks.png' });

    // Click element
    await page.click('button:has-text("Review"), div:has-text("Review")');

    // Take screenshot
    await page.screenshot({ path: 'study-review-step.png' });

    // Click element
    await page.click('div:has-text("Launch"):not(:has-text("Review"))');

    // Click element
    await page.click('button:has-text("Continue")');

    // Take screenshot
    await page.screenshot({ path: 'study-launch-step.png' });

    // Click element
    await page.click('button:has-text("🚀 Launch Study Now"), button:has-text("Launch Study Now")');

    // Take screenshot
    await page.screenshot({ path: 'study-launched-success.png' });

    // Navigate to URL
    await page.goto('http://localhost:5175/login');

    // Fill input field
    await page.fill('input[type="email"]', 'abwanwr77+participant@gmail.com');

    // Fill input field
    await page.fill('input[type="password"]', 'Testtest123');

    // Click element
    await page.click('button[type="submit"]');

    // Navigate to URL
    await page.goto('http://localhost:5175/app/discover');

    // Take screenshot
    await page.screenshot({ path: 'participant-discover-studies.png' });

    // Click element
    await page.click('button:has-text("Refresh")');

    // Take screenshot
    await page.screenshot({ path: 'studies-after-refresh.png' });

    // Click element
    await page.click('button:has-text("Apply Now")');

    // Take screenshot
    await page.screenshot({ path: 'application-modal-opened.png' });

    // Click element
    await page.click('input[type="checkbox"]');

    // Fill input field
    await page.fill('textarea:nth-of-type(1)"', 'I'm interested in helping improve mobile app user experience and have experience with testing apps');

    // Fill input field
    await page.fill('textarea:nth-of-type(1)', 'I'm interested in helping improve mobile app user experience and have experience with testing apps');

    // Fill input field
    await page.fill('textarea:nth-of-type(2)', 'I have 5 years of experience using mobile apps daily and work in tech support');

    // Fill input field
    await page.fill('textarea:last-of-type', 'I have 5 years of experience using mobile apps daily and work in tech support');

    // Select option
    await page.selectOption('select:nth-of-type(1)', '25-34');

    // Click element
    await page.click('button:has-text("Submit Application")');

    // Take screenshot
    await page.screenshot({ path: 'application-submitted.png' });

    // Click element
    await page.click('a:has-text("My Applications")');

    // Navigate to URL
    await page.goto('http://localhost:5175/app/participant-dashboard');

    // Take screenshot
    await page.screenshot({ path: 'participant-dashboard.png' });
});