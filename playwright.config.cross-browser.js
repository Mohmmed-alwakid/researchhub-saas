// Cross-Browser Testing Configuration
// Tests all scenarios across Chrome, Firefox, Safari, and Mobile

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Test directory - expanded to include both Phase 2 and Phase 3
  testDir: './testing/comprehensive-suite',
  
  // Global setup for cross-browser testing
  fullyParallel: false, // Sequential for stability
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 2 : 3,
  
  // Timeouts
  timeout: 60 * 1000,
  expect: { timeout: 10000 },
  
  // Output settings
  use: {
    baseURL: 'https://researchhub-saas.vercel.app',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  
  // Reporter configuration
  reporter: [
    ['html', { 
      outputFolder: 'testing/reports/cross-browser-html',
      open: 'never'
    }],
    ['json', { 
      outputFile: 'testing/reports/cross-browser-results.json' 
    }],
    ['list']
  ],
  
  // Projects for different browsers
  projects: [
    // Desktop Chrome
    {
      name: 'Desktop-Chrome',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 }
      },
    },
    
    // Desktop Firefox
    {
      name: 'Desktop-Firefox',
      use: { 
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 }
      },
    },
    
    // Desktop Safari
    {
      name: 'Desktop-Safari',
      use: { 
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 }
      },
    },
    
    // Mobile Chrome
    {
      name: 'Mobile-Chrome',
      use: { 
        ...devices['Pixel 5']
      },
    },
    
    // Mobile Safari
    {
      name: 'Mobile-Safari',
      use: { 
        ...devices['iPhone 12']
      },
    },
    
    // Tablet Chrome
    {
      name: 'Tablet-Chrome',
      use: { 
        ...devices['iPad Pro']
      },
    }
  ],
  
  // Output directory
  outputDir: 'testing/reports/cross-browser-artifacts',
});