
import { test } from '@playwright/test';
import { expect } from '@playwright/test';

test('ErrorTesting_2025-07-05', async ({ page, context }) => {
  
    // Navigate to URL
    await page.goto('https://researchhub-saas.vercel.app');

    // Take screenshot
    await page.screenshot({ path: 'homepage-initial.png', { fullPage: true } });

    // Click element
    await page.click('a[href="/login"]');

    // Take screenshot
    await page.screenshot({ path: 'login-page.png', { fullPage: true } });

    // Fill input field
    await page.fill('input[type="email"]', 'abwanwr77+Researcher@gmail.com');

    // Fill input field
    await page.fill('input[type="password"]', 'Testtest123');

    // Click element
    await page.click('button[type="submit"]');

    // Take screenshot
    await page.screenshot({ path: 'dashboard-with-errors.png', { fullPage: true } });

    // Click element
    await page.click('a[href="/app/studies"]');

    // Navigate to URL
    await page.goto('https://researchhub-saas.vercel.app/app/studies');

    // Take screenshot
    await page.screenshot({ path: 'studies-page-errors.png', { fullPage: true } });

    // Navigate to URL
    await page.goto('https://researchhub-saas.vercel.app/app/dashboard');

    // Navigate to URL
    await page.goto('https://researchhub-saas.vercel.app/app/organizations');

    // Navigate to URL
    await page.goto('https://researchhub-saas.vercel.app/app/participants');

    // Navigate to URL
    await page.goto('https://researchhub-saas.vercel.app/app/analytics');

    // Navigate to URL
    await page.goto('https://researchhub-saas.vercel.app/app/settings');

    // Navigate to URL
    await page.goto('https://researchhub-saas.vercel.app/login');

    // Fill input field
    await page.fill('input[type="email"]', 'abwanwr77+admin@gmail.com');

    // Take screenshot
    await page.screenshot({ path: 'login-page-current-state.png', { fullPage: true } });
});