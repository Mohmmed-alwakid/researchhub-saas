
import { test } from '@playwright/test';
import { expect } from '@playwright/test';

test('CompleteUsabilityStudyWorkflow_2025-06-24', async ({ page, context }) => {
  
    // Navigate to URL
    await page.goto('http://localhost:5175');

    // Take screenshot
    await page.screenshot({ path: '01-researchhub-homepage.png', { fullPage: true } });

    // Click element
    await page.click('button:has-text("Login"), .login-button, [data-testid="login-button"], a[href*="login"]');

    // Take screenshot
    await page.screenshot({ path: '02-login-page.png' });

    // Fill input field
    await page.fill('input[type="email"], #email, [name="email"]', 'abwanwr77+Researcher@gmail.com');

    // Fill input field
    await page.fill('input[type="password"], #password, [name="password"]', 'Testtest123');

    // Click element
    await page.click('button[type="submit"], .login-submit, button:has-text("Login"), button:has-text("Sign in")');

    // Take screenshot
    await page.screenshot({ path: '03-researcher-dashboard.png' });

    // Click element
    await page.click('a:has-text("Create Study"), button:has-text("Create Study"), [href*="create"], [href*="new"], .create-study-button');

    // Click element
    await page.click('a:has-text("Studies"), [href*="studies"], .nav-studies');

    // Click element
    await page.click('button:has-text("Create New Study"), .quick-actions button');

    // Take screenshot
    await page.screenshot({ path: '04-study-creation-page.png' });

    // Click element
    await page.click('button:has-text("Unmoderated Study"), .study-type:has-text("Unmoderated Study")');

    // Click element
    await page.click('[data-testid="unmoderated-study"], .card:has-text("Unmoderated Study")');

    // Navigate to URL
    await page.goto('http://localhost:5175/app/studies/new');

    // Take screenshot
    await page.screenshot({ path: '05-study-creation-direct-url.png' });

    // Fill input field
    await page.fill('input[placeholder*="title"], #title, [name="title"]', 'E-commerce Checkout Flow Usability Study');

    // Fill input field
    await page.fill('textarea[placeholder*="description"], #description, [name="description"]', 'Test the new checkout process for usability issues. Participants will navigate through our e-commerce site and complete a purchase flow while we track their interactions and gather feedback to improve user experience.');

    // Fill input field
    await page.fill('textarea', 'Test the new checkout process for usability issues. Participants will navigate through our e-commerce site and complete a purchase flow while we track their interactions and gather feedback to improve user experience.');

    // Click element
    await page.click('button:has-text("Add Block")');

    // Take screenshot
    await page.screenshot({ path: '06-add-block-modal.png' });

    // Click element
    await page.click('button:has-text("Add Block"):first-of-type, .welcome-screen button:has-text("Add Block")');

    // Take screenshot
    await page.screenshot({ path: '07-welcome-block-added.png' });

    // Take screenshot
    await page.screenshot({ path: '08-blocks-added-to-study.png' });

    // Click element
    await page.click('body');

    // Take screenshot
    await page.screenshot({ path: '09-modal-closed-study-ready.png' });

    // Click element
    await page.click('button:has-text("Create Study")');

    // Take screenshot
    await page.screenshot({ path: '10-study-created-success.png' });

    // Navigate to URL
    await page.goto('http://localhost:5175/app/studies');

    // Take screenshot
    await page.screenshot({ path: '11-studies-list-page.png' });

    // Click element
    await page.click('[data-study*="E-commerce"], .study-card:has-text("E-commerce Checkout Flow Testing")');

    // Click element
    await page.click('[data-testid="user-menu"], .user-avatar, button:has-text("Rt")');

    // Click element
    await page.click('button:has-text("Logout"), a:has-text("Logout"), [data-action="logout"]');

    // Take screenshot
    await page.screenshot({ path: '12-logged-out-login-page.png' });

    // Fill input field
    await page.fill('input[type="email"], #email, [name="email"]', 'abwanwr77+participant@gmail.com');

    // Click element
    await page.click('button:has-text("Sign in"), a:has-text("Sign in")');

    // Take screenshot
    await page.screenshot({ path: '13-participant-login-page.png' });

    // Fill input field
    await page.fill('input[type="email"], #email, [name="email"]', 'abwanwr77+participant@gmail.com');

    // Fill input field
    await page.fill('input[type="password"], #password, [name="password"]', 'Testtest123');

    // Click element
    await page.click('button[type="submit"], .login-submit, button:has-text("Login"), button:has-text("Sign in")');

    // Take screenshot
    await page.screenshot({ path: '14-participant-dashboard.png' });

    // Click element
    await page.click('a:has-text("Discover Studies"), button:has-text("Discover Studies")');

    // Click element
    await page.click('button:has-text("Browse Studies")');

    // Take screenshot
    await page.screenshot({ path: '15-discover-studies-page.png' });

    // Navigate to URL
    await page.goto('http://localhost:5175/app/discover');

    // Take screenshot
    await page.screenshot({ path: '16-discover-studies-loaded.png' });

    // Click element
    await page.click('button:has-text("Apply to Study")');

    // Take screenshot
    await page.screenshot({ path: '17-study-application-page.png' });

    // Take screenshot
    await page.screenshot({ path: '18-application-page-after-wait.png' });
});