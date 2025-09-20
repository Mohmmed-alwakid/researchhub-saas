// Playwright configuration for ResearchHub comprehensive testing
import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.test' });

export default defineConfig({
  testDir: './testing/comprehensive-suite',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'testing/reports/playwright-html' }],
    ['json', { outputFile: 'testing/reports/results.json' }],
    ['junit', { outputFile: 'testing/reports/junit.xml' }]
  ],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'https://researchhub-saas.vercel.app',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    timeout: 30000,
    actionTimeout: 10000,
    navigationTimeout: 30000
  },
  expect: {
    timeout: 10000
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    }
  ],
  webServer: {
    command: process.env.CI ? undefined : 'npm run dev:fullstack',
    port: 5175,
    reuseExistingServer: !process.env.CI,
    timeout: 60000
  }
});