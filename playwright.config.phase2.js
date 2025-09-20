import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './testing/comprehensive-suite',
  fullyParallel: false,
  retries: 0,
  timeout: 60 * 1000,
  expect: { timeout: 5000 },
  reporter: 'line',
  use: {
    baseURL: 'https://researchhub-saas.vercel.app',
    trace: 'on-first-retry',
    headless: true,
  },
  projects: [{
    name: 'chromium',
    use: { ...devices['Desktop Chrome'] },
  }],
});