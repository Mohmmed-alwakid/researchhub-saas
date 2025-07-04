import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for ResearchHub MCP Testing
 * Optimized for comprehensive automated testing
 */

export default defineConfig({
  // Test directory
  testDir: './testing/playwright-mcp',
  
  // Parallel testing
  fullyParallel: true,
  
  // Fail build on CI if accidentally left test.only
  forbidOnly: !!process.env.CI,
  
  // Retry configuration
  retries: process.env.CI ? 2 : 0,
  
  // Test timeout
  timeout: 30 * 1000,
  
  // Expect timeout
  expect: {
    timeout: 5000,
  },
  
  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'testing/reports/playwright-html' }],
    ['json', { outputFile: 'testing/reports/playwright-results.json' }],
    ['junit', { outputFile: 'testing/reports/playwright-junit.xml' }]
  ],
  
  // Global setup
  use: {
    // Base URL for tests
    baseURL: 'http://localhost:5175',
    
    // Browser context options
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Viewport
    viewport: { width: 1280, height: 720 },
  },

  // Test projects for different browsers
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
  ],

  // Web server for tests (optional - for CI)
  webServer: process.env.CI ? {
    command: 'npm run dev:fullstack',
    port: 5175,
    reuseExistingServer: false,
    timeout: 120 * 1000,
  } : undefined,
});
