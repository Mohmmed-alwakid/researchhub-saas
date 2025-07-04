
import { test } from '@playwright/test';
import { expect } from '@playwright/test';

test('StudyFlowDebug_2025-06-25', async ({ page, context }) => {
  
    // Navigate to URL
    await page.goto('http://localhost:5175');

    // Click element
    await page.click('a:has-text("Sign in")');

    // Fill input field
    await page.fill('input[type="email"]', 'abwanwr77+Researcher@gmail.com');

    // Fill input field
    await page.fill('input[type="password"]', 'Testtest123');

    // Click element
    await page.click('button:has-text("Sign in")');

    // Click element
    await page.click('button:has-text("New Study")');

    // Click element
    await page.click('div:has-text("Unmoderated Study")');

    // Click element
    await page.click('div.bg-white.rounded-2xl:has-text("Unmoderated Study")');

    // Click element
    await page.click('button:has-text("Start from Scratch")');
});