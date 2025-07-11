import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for UAT Testing
 * Specific configuration for User Acceptance Testing
 */

export default defineConfig({
  // Test directory for UAT tests
  testDir: './',
  
  // Test file patterns - include .js files for UAT
  testMatch: [
    '**/researcher-uat.js',
    '**/participant-uat.js'
  ],
  
  // Parallel testing
  fullyParallel: true,
  
  // Retry configuration
  retries: 1,
  
  // Test timeout (increased for UAT scenarios)
  timeout: 60 * 1000,
  
  // Expect timeout
  expect: {
    timeout: 10000,
  },
  
  // Reporter configuration for UAT
  reporter: [
    ['html', { outputFolder: 'testing/reports/uat-playwright-html' }],
    ['json', { outputFile: 'testing/reports/uat-playwright-results.json' }],
    ['junit', { outputFile: 'testing/reports/uat-playwright-junit.xml' }]
  ],
  
  // Global setup for UAT
  use: {
    // Base URL for tests
    baseURL: 'http://localhost:5175',
    
    // Browser context options
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Viewport
    viewport: { width: 1280, height: 720 },
    
    // UAT specific settings
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },

  // Test projects for UAT (focus on Chromium for speed)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Development server configuration (optional - can be started manually)
  // webServer: {
  //   command: 'npm run dev:frontend',
  //   port: 5175,
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 120 * 1000,
  // },
});
