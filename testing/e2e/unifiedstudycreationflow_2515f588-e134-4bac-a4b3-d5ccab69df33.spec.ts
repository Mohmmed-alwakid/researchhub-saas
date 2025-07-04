
import { test } from '@playwright/test';
import { expect } from '@playwright/test';

test('UnifiedStudyCreationFlow_2025-06-25', async ({ page, context }) => {
  
    // Navigate to URL
    await page.goto('http://localhost:5175');

    // Click element
    await page.click('a[href*="sign-in"], button:has-text("Sign in")');

    // Click element
    await page.click('a[href="/login"]');

    // Fill input field
    await page.fill('input[type="email"], input[name="email"]', 'abwanwr77+Researcher@gmail.com');

    // Fill input field
    await page.fill('input[type="password"], input[name="password"]', 'Testtest123');

    // Click element
    await page.click('button:has-text("Sign in")');

    // Click element
    await page.click('button:has-text("New Study")');

    // Click element
    await page.click('div:has-text("Unmoderated Study")');

    // Click element
    await page.click('button:has-text("Unmoderated Study")');

    // Click element
    await page.click('div:has-text("Set up surveys and usability tests")');

    // Click element
    await page.click('button[data-testid="close-modal-button"]');

    // Click element
    await page.click('a[href="/app/studies"]');

    // Click element
    await page.click('nav a:has-text("Studies")');

    // Navigate to URL
    await page.goto('http://localhost:5175/app/studies');

    // Click element
    await page.click('button:has-text("New Study")');

    // Click element
    await page.click('div:has-text("Unmoderated Study")');

    // Click element
    await page.click('div.bg-white.rounded-2xl:has-text("Unmoderated Study")');

    // Click element
    await page.click('button:has-text("Start from Scratch")');
});