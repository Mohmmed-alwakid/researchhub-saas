
import { test } from '@playwright/test';
import { expect } from '@playwright/test';

test('CompleteWorkflow_2025-08-09', async ({ page, context }) => {
  
    // Navigate to URL
    await page.goto('http://localhost:5175/dashboard');

    // Take screenshot
    await page.screenshot({ path: 'dashboard-direct-access.png' });

    // Navigate to URL
    await page.goto('http://localhost:5175/dashboard');

    // Take screenshot
    await page.screenshot({ path: 'dashboard-with-mock-auth.png' });

    // Navigate to URL
    await page.goto('http://localhost:5175/studies');

    // Navigate to URL
    await page.goto('http://localhost:5175/study-builder');

    // Take screenshot
    await page.screenshot({ path: 'study-builder-page.png' });

    // Navigate to URL
    await page.goto('http://localhost:5175');

    // Click element
    await page.click('a[href="/register"] button');

    // Take screenshot
    await page.screenshot({ path: 'register-page.png' });

    // Navigate to URL
    await page.goto('http://localhost:5175/app/studies');

    // Take screenshot
    await page.screenshot({ path: 'app-studies-page.png' });

    // Navigate to URL
    await page.goto('http://localhost:5175/login');

    // Fill input field
    await page.fill('input[type="email"]', 'abwanwr77+Researcher@gmail.com');

    // Fill input field
    await page.fill('input[type="password"]', 'Testtest123');

    // Click element
    await page.click('button[type="submit"]');

    // Take screenshot
    await page.screenshot({ path: 'after-login-attempt.png' });

    // Navigate to URL
    await page.goto('http://localhost:5175/login');

    // Fill input field
    await page.fill('input[type="email"]', 'abwanwr77+researcher@gmail.com');

    // Fill input field
    await page.fill('input[type="password"]', 'Testtest123');

    // Click element
    await page.click('button[type="submit"]');

    // Take screenshot
    await page.screenshot({ path: 'login-with-correct-email.png' });

    // Navigate to URL
    await page.goto('http://localhost:5175/app/studies');

    // Take screenshot
    await page.screenshot({ path: 'authenticated-studies-page.png' });

    // Click element
    await page.click('button:has-text("Create Study")');

    // Take screenshot
    await page.screenshot({ path: 'study-creation-started.png' });

    // Click element
    await page.click('div:has-text("Usability Study"):has-text("Test how users interact")');

    // Click element
    await page.click('button:has-text("Continue")');

    // Take screenshot
    await page.screenshot({ path: 'study-details-step.png' });

    // Fill input field
    await page.fill('input[placeholder*="title"], input[name*="title"], input:first-of-type', 'Usability Study');

    // Fill input field
    await page.fill('textarea, input[placeholder*="description"]', 'Test usability study with screening question and 4 blocks for workflow testing');

    // Fill input field
    await page.fill('input[placeholder*="participants"], input[type="number"]', '1');

    // Click element
    await page.click('button:has-text("Continue")');

    // Take screenshot
    await page.screenshot({ path: 'study-config-step.png' });

    // Click element
    await page.click('button:has-text("Add Question"), button:has-text("Add Your First Question")');

    // Take screenshot
    await page.screenshot({ path: 'add-screening-question.png' });

    // Fill input field
    await page.fill('input[placeholder*="Question"], textarea[placeholder*="Question"], input:has-text("Question Text")', 'What is your experience with mobile apps?');

    // Fill input field
    await page.fill('input, textarea', 'What is your experience with mobile apps?');

    // Click element
    await page.click('button:has-text("Add Option")');

    // Fill input field
    await page.fill('input[placeholder*="option"], input[type="text"]:last-of-type', 'Beginner (0-1 years)');

    // Click element
    await page.click('button:has-text("Add Option")');

    // Fill input field
    await page.fill('input[type="text"]:last-of-type', 'Experienced (2+ years)');

    // Click element
    await page.click('button:has-text("Continue to Block Builder")');

    // Take screenshot
    await page.screenshot({ path: 'block-builder-step.png' });

    // Take screenshot
    await page.screenshot({ path: 'first-block-added.png' });

    // Take screenshot
    await page.screenshot({ path: 'all-blocks-added.png' });

    // Click element
    await page.click('button:has-text("Continue")');

    // Click element
    await page.click('div:has-text("Task Instructions"):has-text("Provide specific tasks")');

    // Take screenshot
    await page.screenshot({ path: 'after-clicking-task-instructions.png' });

    // Navigate to URL
    await page.goto('http://localhost:5175/app/study-builder?step=review');

    // Take screenshot
    await page.screenshot({ path: 'review-step-attempt.png' });

    // Navigate to URL
    await page.goto('http://localhost:5175/app/studies');
});