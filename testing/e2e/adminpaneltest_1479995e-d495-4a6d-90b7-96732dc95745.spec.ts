
import { test } from '@playwright/test';
import { expect } from '@playwright/test';

test('AdminPanelTest_2025-07-02', async ({ page, context }) => {
  
    // Navigate to URL
    await page.goto('http://localhost:5175');

    // Take screenshot
    await page.screenshot({ path: 'homepage.png' });

    // Fill input field
    await page.fill('input[type="email"]', 'abwanwr77+admin@gmail.com');

    // Click element
    await page.click('text=Sign in');

    // Take screenshot
    await page.screenshot({ path: 'login-page.png' });

    // Fill input field
    await page.fill('input[type="email"]', 'abwanwr77+admin@gmail.com');

    // Fill input field
    await page.fill('input[type="password"]', 'Testtest123');

    // Click element
    await page.click('button[type="submit"]');

    // Take screenshot
    await page.screenshot({ path: 'after-admin-login.png' });

    // Click element
    await page.click('text=User Management');

    // Take screenshot
    await page.screenshot({ path: 'user-management-page.png' });

    // Click element
    await page.click('button:has-text('Admin')');

    // Take screenshot
    await page.screenshot({ path: 'admin-dropdown.png' });

    // Click element
    await page.click('text=Logout');

    // Click element
    await page.click('text=Sign Out');

    // Take screenshot
    await page.screenshot({ path: 'after-admin-logout.png' });

    // Fill input field
    await page.fill('input[type="email"]', 'abwanwr77+researcher@gmail.com');

    // Fill input field
    await page.fill('input[type="password"]', 'Testtest123');

    // Click element
    await page.click('button[type="submit"]');

    // Take screenshot
    await page.screenshot({ path: 'researcher-dashboard.png' });
});